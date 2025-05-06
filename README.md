# green-pathways
Audio upload and parse project

# Architecture

A Python server built with Chalice, meant to run on AWS Lambda. Frontend built with Vite.

# Running locally

You must have Python3 installed on a Unix-like system. AWS doesn't support past 3.12, so be sure to use that version.

Then:

```bash
cd backend
pyenv local 3.12.9
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
chalice local --port 5000
```

This will create a server at http://127.0.0.1:5000

For running the frontend:

```bash
cd frontend
npm install
npm run dev
```

This will create a frontend at http://127.0.0.1:5173


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

## Deploying the backend

```bash
cd backend
pyenv local 3.12.9
source .venv/bin/activate
python deploy.py
```