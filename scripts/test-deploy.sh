#!/bin/sh

# Define the environment for local testing
ENV=${ENV:-test}

# Based on the environment variable, choose the base .env file
case "$ENV" in
  dev)
    BASE_ENV_FILE="./.env.dev"
    ;;
  test)
    BASE_ENV_FILE="./.env.test"
    ;;
  production)
    BASE_ENV_FILE="./.env.production"
    ;;
  *)
    echo "Unknown environment: $ENV"
    exit 1
    ;;
esac

# Target .env file path
ENV_FILENAME="./.env.kkk"

# 1. Copy the base .env file to the target location
cp $BASE_ENV_FILE $ENV_FILENAME

# 2. Iterate through all environment variables and update or append to .env file
env | while IFS='=' read -r var value; do
  # Create variable with the prefix VITE_
  prefixed_var="VITE_${var}"
  
  # Check if the variable with the VITE_ prefix exists in the .env file
  exists=0
  while IFS= read -r line; do
    if [ "${line%%=*}" = "$prefixed_var" ]; then
      exists=1
      break
    fi
  done < "$ENV_FILENAME"
  
  # Update the variable if it exists, otherwise append
  if [ "$exists" -eq 1 ]; then
    # Create a new temp file and replace the existing variable
    temp_file=$(mktemp)
    while IFS= read -r line; do
      if [ "${line%%=*}" = "$prefixed_var" ]; then
        echo "$prefixed_var=$value" >> "$temp_file"
      else
        echo "$line" >> "$temp_file"
      fi
    done < "$ENV_FILENAME"
    mv "$temp_file" "$ENV_FILENAME"
  else
    # Append the variable if it doesn't exist
    echo "$prefixed_var=$value" >> "$ENV_FILENAME"
  fi
done
