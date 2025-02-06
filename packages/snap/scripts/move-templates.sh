#!/bin/bash

copy_templates() {
    local src_dir="$1"
    local dest_dir="$2"

    # Create the destination directory if it doesn't exist
    mkdir -p "$dest_dir"

    # Copy all .txt files while preserving the directory structure
    find "$src_dir" -type f -name "*.txt" | while read -r file; do
        # Get the relative path of the file
        rel_path="${file#$src_dir/}"
        # Create the destination directory for the file
        mkdir -p "$dest_dir/$(dirname "$rel_path")"
        # Copy the file to the destination directory
        cp "$file" "$dest_dir/$rel_path"
    done

    echo "All .txt files from $src_dir have been copied successfully to $dest_dir."
}

# Define source and destination directories
CREATE_TEMPLATES_SRC_DIR="$(dirname "$0")/../src/create/templates"
CREATE_TEMPLATES_DEST_DIR="$(dirname "$0")/../dist/src/create/templates"

# Call the function with the directories
copy_templates "$CREATE_TEMPLATES_SRC_DIR" "$CREATE_TEMPLATES_DEST_DIR"

CREATE_STEP_TEMPLATES_SRC_DIR="$(dirname "$0")/../src/create-step/templates"
CREATE_STEP_TEMPLATES_DEST_DIR="$(dirname "$0")/../dist/src/create-step/templates"

# Call the function with the directories
copy_templates "$CREATE_STEP_TEMPLATES_SRC_DIR" "$CREATE_STEP_TEMPLATES_DEST_DIR"
