# green-pathways

Audio upload and parse project

# Architecture

A Python server built with Chalice, meant to run on AWS Lambda. Frontend built with Vite.

# Running locally

You must have Python 3.12.9 (the latest version supported by AWS) installed on a Unix-like system.

You will need a `backend/.env` file with `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` set to our API keys.

Then:

```bash
cd backend
pyenv local 3.12.9
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
chalice local
```

This will create a server at http://127.0.0.1:8000

Use `python test.py <path-to-audio-file>` to test against a local server.

For running the frontend:

```bash
cd frontend
npm install
npm run dev
```

This will create a frontend at http://localhost:5173

# Deploying

You need AWS CLI installed. You must have a `~/.aws/credentials` file set up as follows:

```
[profile green_pathways]
aws_access_key_id=<our access key>
aws_secret_access_key=<our secret key>
region=eu-west-2
```

Log into the AWS console to get the values for these keys.

Please only deploy code that is merged to the `main` branch.

## Deploying

You will need a `frontend/.env.production.local` file with the `VITE_BACKEND_URL` variable set to the output of `chalice url`, which you can run after the `deploy.py` command below.

```bash
cd backend
pyenv local 3.12.9
source .venv/bin/activate
python deploy.py
cd ../frontend
./deploy.sh
```
