#!/bin/bash

# $1 = name
# $2 = api key

curl -u :$2 \
  -d "name=$1&plan=turtle&region=amazon-web-services::us-east-1" \
  https://customer.elephantsql.com/api/instances
