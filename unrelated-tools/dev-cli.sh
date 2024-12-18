#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to track changes
track_changes() {
    local since_commit=""
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --since)
                since_commit="$2"
                shift 2
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done
    
    echo -e "${BLUE}Tracking changes...${NC}"
    
    # Check if git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Not a git repository${NC}"
        exit 1
    fi
    
    local temp_file=$(mktemp)
    echo "Recent Changes:" >> "$temp_file"
    
    if [ -n "$since_commit" ]; then
        # Verify the commit reference is valid
        if ! git rev-parse --verify "$since_commit" >/dev/null 2>&1; then
            echo -e "${RED}Invalid commit reference: $since_commit${NC}"
            exit 1
        fi
        
        echo -e "\nChanges since commit: $(git rev-parse --short "$since_commit")" >> "$temp_file"
        echo -e "Commit message: $(git log -1 --format=%B "$since_commit")" >> "$temp_file"
        echo -e "---\n" >> "$temp_file"
        
        # Get both committed and uncommitted changes since the specified commit
        {
            # Get list of changed files from git diff
            git diff --name-status "$since_commit"
            
            # Add uncommitted changes
            git status --porcelain
        } | sort -u | while read -r line; do
            # Extract status and filename
            status="${line:0:2}"
            file="${line:2}"
            file="${file# }" # Remove leading space
            
            if [ -f "$file" ]; then
                # File exists (modified or new)
                echo -e "\nFile: $file (Status: $status)" >> "$temp_file"
                echo "Content:" >> "$temp_file"
                cat "$file" 2>/dev/null >> "$temp_file"
                echo -e "\n---\n" >> "$temp_file"
            else
                # File was deleted - show its content from the specified commit
                echo -e "\nFile: $file (Status: $status - Deleted)" >> "$temp_file"
                echo "Previous content at $since_commit:" >> "$temp_file"
                git show "$since_commit:$file" 2>/dev/null >> "$temp_file" || echo "(File not found in commit)"
                echo -e "\n---\n" >> "$temp_file"
            fi
        }
    else
        # Original behavior - just show current uncommitted changes
        git status --porcelain | while read -r line; do
            status="${line:0:2}"
            file="${line:2}"
            file="${file# }" # Remove leading space
            
            if [ -f "$file" ]; then
                echo -e "\nFile: $file (Status: $status)" >> "$temp_file"
                echo "Content:" >> "$temp_file"
                cat "$file" 2>/dev/null >> "$temp_file"
                echo -e "\n---\n" >> "$temp_file"
            else
                echo -e "\nFile: $file (Status: $status - Deleted)" >> "$temp_file"
                echo -e "---\n" >> "$temp_file"
            fi
        }
    fi
    
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

[Previous functions remain the same...]

# Main script
case "$1" in
    "init")
        create_context
        ;;
    "update")
        shift
        track_changes "$@"
        ;;
    *)
        echo "Usage:"
        echo "  $0 init                     - Create initial context snapshot"
        echo "  $0 update                   - Track uncommitted changes"
        echo "  $0 update --since <commit>  - Track all changes since specified commit"
        echo
        echo "Examples:"
        echo "  $0 update --since HEAD~3    - Show changes since 3 commits ago"
        echo "  $0 update --since abc123f   - Show changes since specific commit"
        echo "  $0 update --since main      - Show changes since main branch"
        exit 1
        ;;
esac