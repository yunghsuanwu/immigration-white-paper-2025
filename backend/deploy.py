import os
from dotenv import load_dotenv
import subprocess
import json

# Load environment variables from .env file
load_dotenv()

PROFILE="green_pathways"

# Deploy Chalice app
deploy_result = subprocess.run(["chalice", "deploy", "--profile", PROFILE], capture_output=True, text=True)

# Check the deploy result
if deploy_result.returncode == 0:
    print("Successfully deployed Chalice app.")
else:
    print("Failed to deploy Chalice app.")
    print(deploy_result.stderr)

env_vars = {"Variables": {}}
env_var_names = ["AWS_BUCKET", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"]
for var_name in env_var_names:
    env_vars["Variables"][var_name] = os.getenv(var_name)
env_vars["Variables"]["BACKUP"] = "S3"

# Define the AWS CLI command to set environment variables
command = [
    "aws",
    "lambda",
    "update-function-configuration",
    "--profile", 
    PROFILE,
    "--function-name",
    "green-pathways-backend-dev",
    "--environment",
    json.dumps(env_vars)
]

# Run the command
result = subprocess.run(command, capture_output=True, text=True)

# Check the result
if result.returncode == 0:
    print("Successfully updated environment variables.")
else:
    print("Failed to update environment variables.")
    print(result.stderr)
