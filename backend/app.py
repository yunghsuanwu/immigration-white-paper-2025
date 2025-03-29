import anthropic
from chalice import Chalice, Response
from dotenv import load_dotenv
import json
import boto3
import os
import base64
from botocore.exceptions import ClientError
from datetime import datetime
from openai import OpenAI
from chalicelib.prompt import EMAIL_GENERATION_PROMPT

load_dotenv()

AWS_AUDIO_BUCKET = os.getenv("AWS_AUDIO_BUCKET", "")
AWS_TRANSCRIPT_BUCKET = os.getenv("AWS_TRANSCRIPT_BUCKET", "")
AWS_EMAIL_BUCKET = os.getenv("AWS_EMAIL_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "eu-west-2")

app = Chalice(app_name="green-pathways-backend")
app.lambda_function(name="green-pathways-backend-dev").environment_variables = {
    "AWS_AUDIO_BUCKET": AWS_AUDIO_BUCKET,
    "AWS_TRANSCRIPT_BUCKET": AWS_TRANSCRIPT_BUCKET,
    "AWS_EMAIL_BUCKET": AWS_EMAIL_BUCKET,
    "AWS_REGION": AWS_REGION,
}

s3 = boto3.client('s3', region_name=AWS_REGION)
openai_client = OpenAI()
anthropic_client = anthropic.Anthropic()


@app.route("/upload", methods=["POST"], cors=True)
def upload():
    try:
        data = json.loads(app.current_request.raw_body)
        audio_file = data["audio_file"]  # Expecting base64 encoded audio
        
        # Decode base64 audio
        audio_data = base64.b64decode(audio_file)
        
        # Generate filename using current datetime
        filename = f"audio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        
        # Upload to S3
        bucket_name = os.getenv("AWS_AUDIO_BUCKET")
        if not bucket_name:
            return Response(
                body={"error": "AWS_AUDIO_BUCKET not configured"},
                status_code=500
            )
            
        s3.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=audio_data,
            ContentType='audio/wav'
        )
        
        return {
            "message": "Audio uploaded successfully",
            "filename": filename,
        }
        
    except ClientError as e:
        return Response(
            body={"error": f"S3 error: {str(e)}"},
            status_code=500
        )
    except Exception as e:
        return Response(
            body={"error": str(e)},
            status_code=500
        )


@app.on_s3_event(bucket=AWS_AUDIO_BUCKET)
def on_audio_upload(event):
    temp_file_path = f"/tmp/{event.key}"
    try:
        # Get the audio file from S3
        audio_obj = s3.get_object(Bucket=event.bucket, Key=event.key)
        audio_data = audio_obj['Body'].read()
        
        # Create a temporary file to store the audio data
        with open(temp_file_path, "wb") as f:
            f.write(audio_data)
        
        # Open the temporary file for Whisper API
        with open(temp_file_path, "rb") as audio_file:
            transcription = openai_client.audio.transcriptions.create(
                model="gpt-4o-transcribe", 
                file=audio_file
            )

        # Store the transcription back in S3
        transcript_key = f"{os.path.splitext(event.key)[0]}_transcript.txt"
        s3.put_object(
            Bucket=AWS_TRANSCRIPT_BUCKET,
            Key=transcript_key,
            Body=transcription.text.strip(),
            ContentType='text/plain'
        )

        print(f"Successfully transcribed {event.key} to {transcript_key}")
        return {
            "statusCode": 200,
            "body": {
                "message": "Audio transcribed successfully",
                "audio_file": event.key,
                "transcript_file": transcript_key
            }
        }

    except Exception as e:
        print(f"Error processing {event.key}: {str(e)}")
        return {
            "statusCode": 500,
            "body": {"error": str(e)}
        }
    finally:
        # Clean up the temporary file
        try:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception as e:
            print(f"Warning: Failed to clean up temporary file {temp_file_path}: {str(e)}")


@app.on_s3_event(bucket=AWS_TRANSCRIPT_BUCKET)
def on_transcript_upload(event):
    try:
        # Get the transcript file from S3
        transcript_obj = s3.get_object(Bucket=event.bucket, Key=event.key)
        transcript_data = transcript_obj['Body'].read()
        
        response = anthropic_client.messages.create(
            model="claude-3.7-sonnet",
            max_tokens=8192,
            temperature=0.6,
            messages=[
                {
                    "role": "system",
                    "content": EMAIL_GENERATION_PROMPT
                },
                {
                    "role": "user",
                    "content": transcript_data
                }
            ]
        )
        email_output = response.content[0].text.strip()
        email_key = f"{os.path.splitext(event.key)[0]}_email.txt"
        s3.put_object(
            Bucket=AWS_EMAIL_BUCKET,
            Key=email_key,
            Body=email_output,
            ContentType='text/plain'
        )


        return {
            "email_output": email_output
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": {"error": str(e)}
        }



