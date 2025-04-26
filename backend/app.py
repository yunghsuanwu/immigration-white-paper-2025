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
import traceback

load_dotenv()

AWS_BUCKET = os.getenv("AWS_BUCKET", "")
AWS_REGION = os.getenv("AWS_REGION", "eu-west-2")
BACKUP = os.getenv("BACKUP", None)
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
        with open(filename, type) as f:
            f.write(data)
        print(f"{filename} written")


@app.route("/upload", methods=["POST"], cors=True)
def upload():
    print("Got here")
    try:
        data = json.loads(app.current_request.raw_body)
        audio_file = data["audio_file"]  # Expecting base64 encoded audio
        content_type = data.get("content_type", "audio/webm")  # Default to webm

        print(f"Got data: {len(audio_file)} characters")

        return process_audio_file(audio_file, content_type)

    except Exception as e:
        print(e)
        return Response(
            body={"error": str(e)},
            status_code=500
        )

def process_audio_file(audio_file, content_type):
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_file)
        
        # Generate filename prefix using current datetime
        file_key = datetime.now().strftime('%Y%m%d_%H%M%S')
        extension = content_type.split("/")[1]
        
        backup(f"audio/{file_key}.{extension}", audio_bytes, content_type)

        transcription_text = ""        
        try:
            
            os.makedirs("/tmp/audio", exist_ok=True)
            temp_file_path = f"/tmp/audio/{file_key}.{extension}"
            # Write audio data to temporary file
            with open(temp_file_path, "wb") as f:
                f.write(audio_bytes)
            
            # Process with Whisper API
            with open(temp_file_path, "rb") as audio_temp:
                print("Contacting OpenAI")
                try:
                    transcription = openai_client.audio.transcriptions.create(
                        model="gpt-4o-transcribe", 
                        file=audio_temp
                    )
                except Exception as api_error:
                    print(f"OpenAI error: {str(api_error)}")
                    raise api_error
            print(f"Transcript")
            transcription_text = transcription.text.strip()

            backup(f"transcript/{file_key}.txt", transcription_text, "text/plain")
        finally:
            # Clean up the temporary file
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
            except Exception as e:
                print(f"Warning: Failed to clean up temporary file {temp_file_path}: {str(e)}")
        greenpaper_output = apply_prompt_to_transcript(GREENPAPER_PROMPT, transcription_text)
        mp_output = apply_prompt_to_transcript(MP_PROMPT, transcription_text)
        

        backup(f"email/{file_key}.txt", greenpaper_output + "\n\n" + mp_output, "text/plain")
        return {
            "greenpaper_output": greenpaper_output,
            "mp_output": mp_output
        }
    except Exception as e:
        print(e, flush=True)
        traceback.print_exc()
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

