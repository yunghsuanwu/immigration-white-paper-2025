import anthropic
from chalice import Chalice, Response
from dotenv import load_dotenv
import json
import boto3
import os
import base64
from datetime import datetime
from openai import OpenAI
from chalicelib.prompt import GREENPAPER_PROMPT, MP_PROMPT
import threading
import logging 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

AWS_BUCKET = os.getenv("AWS_BUCKET", "")
AWS_REGION = os.getenv("AWS_REGION", "eu-west-2")
BACKUP = os.getenv("BACKUP", None)
CHALICE_LOCAL=os.getenv("CHALICE_LOCAL", "False").lower() == "true"
if not os.getenv("OPENAI_API_KEY"):
    raise Exception("OPENAI_API_KEY not set in environment")
if not os.getenv("ANTHROPIC_API_KEY"):
    raise Exception("ANTHROPIC_API_KEY not set in environment")

app = Chalice(app_name="green-pathways-backend")
app.lambda_function(name="green-pathways-backend-dev").environment_variables = {
    "AWS_BUCKET": AWS_BUCKET,
    "AWS_REGION": AWS_REGION,
    "BACKUP": None
}

if BACKUP == "S3":
    s3 = boto3.client('s3', region_name=AWS_REGION)
lambda_client = boto3.client('lambda', region_name=AWS_REGION)
openai_client = OpenAI()
anthropic_client = anthropic.Anthropic()

def backup(filename, data, content_type):
    if not BACKUP:
        return
    if BACKUP == "S3":
        bucket_name = os.getenv("AWS_BUCKET")
        if not bucket_name:
            raise Exception("AWS_BUCKET not configured")
            
        s3.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=data,
            ContentType=content_type
        )
        return
    if BACKUP == "local":
        type = "w" if content_type=="text/plain" else "wb"
        path=f"/tmp/{filename}"
        with open(path, type) as f:
            f.write(data)
        logging.info(f"{path} written")


SUPPORTED_CONTENT_TYPES = ["audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", 
                           "audio/aac", "audio/flac","application/octet-stream"]

@app.route("/upload/{submission_id}", methods=["POST"], cors=True, content_types=SUPPORTED_CONTENT_TYPES)
def upload(submission_id):
    logging.info(f"Processing {submission_id}")
    try:
        audio_file = app.current_request.raw_body
        content_type = app.current_request.headers.get('content-type', 'audio/webm')

        logging.info(f"Got data: {len(audio_file)/1024} kb")

        audio_b64 = base64.b64encode(audio_file).decode('utf-8')
        logging.info(f"CHALICE_LOCAL: {CHALICE_LOCAL}")
        if CHALICE_LOCAL == True:
            threading.Thread(target=process_audio_files,
                             args=(submission_id, audio_b64, content_type),
                             daemon=True).start()
        else:
            logging.info("Running lambda")
            lambda_client.invoke(
                FunctionName='green-pathways-backend-dev',
                InvocationType='Event',  # async invocation
                Payload=json.dumps({
                    'submission_id': submission_id,
                    'audio_b64': audio_b64,
                    'content_type': content_type
                })
            )

        return {
            "submission_id": submission_id,
            "status": "processing"
        }

    except Exception as e:
        logging.error(e)
        return Response(
            body={"error": str(e)},
            status_code=500
        )

def process_audio_files(submission_id, audio_b64, content_type):
    try:
        
        extension = content_type.split("/")[1]
        audio_bytes = base64.b64decode(audio_b64)
        logging.info(f"Processing audio: content_type {content_type}")

        transcription_text = ""        
        try:
            
            os.makedirs("/tmp/audio", exist_ok=True)
            temp_file_path = f"/tmp/audio/{submission_id}.{extension}"
            # Write audio data to temporary file
            with open(temp_file_path, "wb") as f:
                f.write(audio_bytes)
            
            # Process with Whisper API
            with open(temp_file_path, "rb") as audio_temp:
                logging.info("Contacting OpenAI")
                try:
                    transcription = openai_client.audio.transcriptions.create(
                        model="gpt-4o-transcribe", 
                        file=audio_temp
                    )
                except Exception as api_error:
                    logging.info(f"OpenAI error: {str(api_error)}")
                    raise api_error
            logging.info(f"Transcript")
            transcription_text = transcription.text.strip()

            backup(f"transcript/{submission_id}.txt", transcription_text, "text/plain")
        finally:
            # Clean up the temporary file
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
            except Exception as e:
                logging.info(f"Warning: Failed to clean up temporary file {temp_file_path}: {str(e)}")
        greenpaper_output = apply_prompt_to_transcript(GREENPAPER_PROMPT, transcription_text)
        mp_output = apply_prompt_to_transcript(MP_PROMPT, transcription_text)
        

        backup(f"email/{submission_id}.txt", greenpaper_output + "\n\n" + mp_output, "text/plain")
        return {
            "greenpaper_output": greenpaper_output,
            "mp_output": mp_output
        }
    except Exception as e:
        logging.error(e)
        return Response(
            status_code=500,
            body={"error": str(e)},
            headers={"Content-Type": "application/json"}
        )


def apply_prompt_to_transcript(prompt, transcription_text):
        message_content = prompt.replace("{{TRANSCRIPT}}", transcription_text)
        response = anthropic_client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=8192,
            temperature=0.6,
            messages=[
                {
                    "role": "user",
                    "content": message_content
                },
            ]
        )
        return response.content[0].text.strip()

@app.route("/status/{submission_id}", methods=["GET"], cors=True)
def get_status(submission_id):
    try:
        # Here you would check your storage (e.g. DynamoDB/S3) for results
        # For now, let's assume we store results in S3 with the submission ID
        try:
            result = s3.get_object(
                Bucket=AWS_BUCKET,
                Key=f"results/{submission_id}.json"
            )
            data = json.loads(result['Body'].read())
            return {
                "status": "completed",
                "greenpaper_output": data.get("greenpaper_output"),
                "mp_output": data.get("mp_output")
            }
        except s3.exceptions.NoSuchKey:
            # Still processing
            return {
                "status": "processing"
            }

    except Exception as e:
        logging.error(e)
        return Response(
            body={"error": str(e)},
            status_code=500
        )