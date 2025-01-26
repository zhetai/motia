#!/bin/bash

# Define source and destination directories
SRC_DIR="$(dirname "$0")/../src/create/templates"
DEST_DIR="$(dirname "$0")/../dist/src/create/templates"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy all .txt files while preserving the directory structure
find "$SRC_DIR" -type f -name "*.txt" | while read -r file; do
  # Get the relative path of the file
  rel_path="${file#$SRC_DIR/}"
  # Create the destination directory for the file
  mkdir -p "$DEST_DIR/$(dirname "$rel_path")"
  # Copy the file to the destination directory
  cp "$file" "$DEST_DIR/$rel_path"
done

echo "All .txt files have been copied successfully."