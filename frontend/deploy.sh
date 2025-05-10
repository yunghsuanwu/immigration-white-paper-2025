#!/bin/bash

export AWS_PROFILE=green_pathways
export AWS_BUCKET=green-pathways-frontend
export AWS_REGION=eu-west-2
npm run build
aws s3 sync dist/ s3://$AWS_BUCKET
