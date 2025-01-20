#!/bin/bash

# Ensure a symbol argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <symbol>"
  exit 1
fi

# Assign the symbol argument
symbol=$1

./shortcuts/"$symbol".sh