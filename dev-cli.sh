#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a file should be ignored
should_ignore() {
    local file="$1"
    
    # Check against .gitignore if it exists
    if [ -f .gitignore ]; then
        if git check-ignore -q "$file"; then
            return 0
        fi
    fi
    
    # Default ignore patterns
    local ignore_patterns=(
        "node_modules/"
        ".git/"
        "dist/"
        "build/"
        "*.log"
        ".DS_Store"
    )
    
    for pattern in "${ignore_patterns[@]}"; do
        if [[ "$file" == $pattern ]]; then
            return 0
        fi
    done
    
    return 1
}

# Function to create initial context
create_context() {
    local temp_file=$(mktemp)
    
    echo -e "${BLUE}Generating repository context...${NC}"
    
    # Add git info if available
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Repository Info:" >> "$temp_file"
        echo "Branch: $(git branch --show-current)" >> "$temp_file"
        echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'No remote')" >> "$temp_file"
        echo -e "\n---\n" >> "$temp_file"
    fi
    
    # Add directory structure and file contents
    echo "Repository Structure:" >> "$temp_file"
    
    find . -type f ! -path '*/\.*' -print0 | while IFS= read -r -d '' file; do
        # Remove leading ./
        file="${file#./}"
        
        if ! should_ignore "$file"; then
            echo -e "\nFile: $file" >> "$temp_file"
            echo "Content:" >> "$temp_file"
            cat "$file" >> "$temp_file"
            echo -e "\n---\n" >> "$temp_file"
        fi
    done
    
    # Copy to clipboard based on OS
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        cat "$temp_file" | pbcopy
    elif [ -x "$(command -v xclip)" ]; then
        # Linux with xclip
        cat "$temp_file" | xclip -selection clipboard
    elif [ -x "$(command -v clip.exe)" ]; then
        # Windows
        cat "$temp_file" | clip.exe
    else
        echo -e "${RED}Couldn't find clipboard command. Content saved to .context-snapshot.txt${NC}"
        cp "$temp_file" .context-snapshot.txt
    fi
    
    rm "$temp_file"
    echo -e "${GREEN}Context copied to clipboard!${NC}"
    echo -e "${BLUE}Paste this into Claude to bootstrap the context.${NC}"
}

# Function to track changes
track_changes() {
    echo -e "${BLUE}Tracking changes...${NC}"
    
    # Check if git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Not a git repository${NC}"
        exit 1
    fi
    
    local temp_file=$(mktemp)
    echo "Recent Changes:" >> "$temp_file"
    
    # Get modified files
    git status --porcelain | while read -r line; do
        status="${line:0:2}"
        file="${line:3}"
        
        if ! should_ignore "$file"; then
            echo -e "\nFile: $file (Status: $status)" >> "$temp_file"
            echo "Content:" >> "$temp_file"
            cat "$file" 2>/dev/null >> "$temp_file"
            echo -e "\n---\n" >> "$temp_file"
        fi
    done
    
    # Copy to clipboard based on OS
    if [ "$(uname)" == "Darwin" ]; then
        cat "$temp_file" | pbcopy
    elif [ -x "$(command -v xclip)" ]; then
        cat "$temp_file" | xclip -selection clipboard
    elif [ -x "$(command -v clip.exe)" ]; then
        cat "$temp_file" | clip.exe
    else
        echo -e "${RED}Couldn't find clipboard command. Content saved to .changes-snapshot.txt${NC}"
        cp "$temp_file" .changes-snapshot.txt
    fi
    
    rm "$temp_file"
    echo -e "${GREEN}Changes copied to clipboard!${NC}"
    echo -e "${BLUE}Paste this into Claude to update the context.${NC}"
}

# Main script
case "$1" in
    "init")
        create_context
        ;;
    "update")
        track_changes
        ;;
    *)
        echo "Usage:"
        echo "  $0 init   - Create initial context snapshot"
        echo "  $0 update - Track recent changes"
        exit 1
        ;;
esac