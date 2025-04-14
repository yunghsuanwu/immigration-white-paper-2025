from dotenv import load_dotenv
import app
import base64 

load_dotenv()

# You need to record your own test file to test
with open("./PIPs.m4a", "rb") as audio_temp:
    audio_bytes = audio_temp.read()
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

# Now call process_audio_file with the encoded string and content type
result = app.process_audio_file(audio_b64, "audio/m4a")
print(result)