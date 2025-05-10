import anthropic
from chalice import Chalice, Response
from dotenv import load_dotenv
import os
from openai import OpenAI
from chalicelib.prompt import GREENPAPER_PROMPT, MP_PROMPT
import uuid
import logging 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "eu-west-2")
if not os.getenv("OPENAI_API_KEY"):
    raise Exception("OPENAI_API_KEY not set in environment")
if not os.getenv("ANTHROPIC_API_KEY"):
    raise Exception("ANTHROPIC_API_KEY not set in environment")

app = Chalice(app_name="green-pathways-backend")

openai_client = OpenAI()
anthropic_client = anthropic.Anthropic()

SUPPORTED_CONTENT_TYPES = ["audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", 
                           "audio/aac", "audio/flac","application/octet-stream"]

@app.route("/transcribe", methods=["POST"], cors=True, content_types=SUPPORTED_CONTENT_TYPES)
def transcribe():
    submission_id = str(uuid.uuid4())
    audio_file = app.current_request.raw_body
    content_type = app.current_request.headers.get('content-type', 'audio/webm')
    extension = content_type.split('/')[-1]
    temp_file_path = f"/tmp/audio/{submission_id}.{extension}"

    try:
        logging.info(f"Got data: {len(audio_file)/1024} kb")

        # Write audio data to temporary file
        with open(temp_file_path, "wb") as f:
            f.write(audio_file)
        
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

        return transcription_text
    except Exception as e:
        logging.error(e)
        return Response(
            body={"error": str(e)},
            status_code=500
        )
    finally:
        # Clean up the temporary file
        try:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception as e:
            logging.info(f"Warning: Failed to clean up temporary file {temp_file_path}: {str(e)}")

@app.route("/greenpaper", methods=["POST"], cors=True)
def greenpaper():
   return apply_prompt_to_transcript(GREENPAPER_PROMPT)

@app.route("/mpemail", methods=["POST"], cors=True)
def mpemail():
    return apply_prompt_to_transcript(MP_PROMPT)
        
def apply_prompt_to_transcript(prompt):
    try:
        # Get the transcript from the request body
        transcript = app.current_request.json_body.get('transcript')
        if not transcript:
            return Response(
                body={"error": "No transcript provided"},
                status_code=400
            )
        logging.info(f"Got transcript: length {len(transcript)}")
        message_content = prompt.replace("{{TRANSCRIPT}}", transcript)
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
    except Exception as e:
        logging.error(e)
        return Response(
            status_code=500,
            body={"error": str(e)},
            headers={"Content-Type": "application/json"}
        )

