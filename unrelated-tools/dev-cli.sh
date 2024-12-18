#!/usr/bin/env bash

# This script provides three main commands:
# 1. context
#    - Shows the full repository snapshot (tracked files only, respecting .gitignore)
#    - Outputs in a structured, LLM-friendly format
#    - Copies output to clipboard
#
# 2. changes --after <commit>
#    - Shows the changes (diffs) after a specified commit, not including that commit
#    - Includes committed changes since <commit>
#    - Includes staged and unstaged changes
#    - Copies output to clipboard
#
# 3. branch [branch-name]
#    - Shows all changes in a given branch compared to main/master
#    - Includes both committed changes and local staged/unstaged changes if on that branch
#    - Copies output to clipboard
#
# Common requirements:
# - Automatically copy output to clipboard (pbcopy, xclip, or clip.exe depending on OS)
# - Format output cleanly and consistently
# - Respect .gitignore
# - Handle errors gracefully
# - Show both staged and unstaged changes where appropriate
#
# Usage:
#   ./llm-context.sh context
#   ./llm-context.sh changes --after <commit>
#   ./llm-context.sh branch [branch-name]

set -euo pipefail

# Detect clipboard command
copy_to_clipboard() {
    if command -v pbcopy &>/dev/null; then
        pbcopy
    elif command -v xclip &>/dev/null; then
        xclip -selection clipboard
    elif command -v clip.exe &>/dev/null; then
        clip.exe
    else
        # If no clipboard command, just cat output
        cat
    fi
}

# Check if we are in a git repository
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "Error: Not inside a Git repository." >&2
    exit 1
fi

# Find main or master branch for reference
find_main_branch() {
    if git show-ref --verify --quiet refs/heads/main; then
        echo "main"
    elif git show-ref --verify --quiet refs/heads/master; then
        echo "master"
    else
        # fallback if neither main nor master is found
        # This is a heuristic; adjust as needed.
        echo "main"
    fi
}

cmd="${1:-}"

if [[ "$cmd" == "context" ]]; then
    # Show full repository snapshot
    # We use 'git ls-files' for tracked files and display their contents.
    # Respect .gitignore automatically by only showing tracked files.
    # Format:
    # ### FULL REPOSITORY CONTEXT START ###
    # --- BEGIN FILE: filename ---
    # <file contents>
    # --- END FILE: filename ---
    # ### FULL REPOSITORY CONTEXT END ###

    # Collect output in a variable
    output=$(mktemp)
    {
        echo "### FULL REPOSITORY CONTEXT START ###"
        # List all tracked files
        files=$(git ls-files)
        for f in $files; do
            echo "--- BEGIN FILE: $f ---"
            if [ -f "$f" ]; then
                cat "$f"
            else
                # File might be deleted or renamed, handle gracefully
                echo "(File not found in working directory)"
            fi
            echo "--- END FILE: $f ---"
        done
        echo "### FULL REPOSITORY CONTEXT END ###"
    } > "$output"

    cat "$output" | copy_to_clipboard

    rm -f "$output"
    exit 0

elif [[ "$cmd" == "changes" ]]; then
    # changes --after <commit>
    # Show changes since a given commit, not including that commit.
    # This means `git diff <commit>..HEAD` for committed changes,
    # plus staged and unstaged changes since HEAD.
    # Format similarly with clear headers.

    shift
    if [[ "$1" != "--after" ]]; then
        echo "Usage: $0 changes --after <commit>" >&2
        exit 1
    fi
    shift
    commit="${1:-}"
    if [[ -z "$commit" ]]; then
        echo "Usage: $0 changes --after <commit>" >&2
        exit 1
    fi

    # Verify commit exists
    if ! git rev-parse "$commit" &>/dev/null; then
        echo "Error: Commit '$commit' not found." >&2
        exit 1
    fi

    # Committed changes since <commit>
    # <commit>..HEAD shows changes from the commit after <commit> to HEAD
    committed_diff=$(git diff "${commit}..HEAD" || true)

    # Staged changes (not yet committed)
    staged_diff=$(git diff --cached || true)

    # Unstaged changes
    unstaged_diff=$(git diff || true)

    output=$(mktemp)
    {
        echo "### CHANGES AFTER COMMIT: $commit START ###"
        if [[ -n "$committed_diff" ]]; then
            echo "--- BEGIN COMMITTED CHANGES (after $commit) ---"
            echo "$committed_diff"
            echo "--- END COMMITTED CHANGES ---"
        else
            echo "--- NO COMMITTED CHANGES AFTER $commit ---"
        fi

        if [[ -n "$staged_diff" ]]; then
            echo "--- BEGIN STAGED CHANGES ---"
            echo "$staged_diff"
            echo "--- END STAGED CHANGES ---"
        else
            echo "--- NO STAGED CHANGES ---"
        fi

        if [[ -n "$unstaged_diff" ]]; then
            echo "--- BEGIN UNSTAGED CHANGES ---"
            echo "$unstaged_diff"
            echo "--- END UNSTAGED CHANGES ---"
        else
            echo "--- NO UNSTAGED CHANGES ---"
        fi

        echo "### CHANGES AFTER COMMIT: $commit END ###"
    } > "$output"

    cat "$output" | copy_to_clipboard
    rm -f "$output"
    exit 0

elif [[ "$cmd" == "branch" ]]; then
    # branch [branch-name]
    # Show all changes in a branch compared to main/master
    # If branch-name is not given, use current branch.
    # If we're on that branch, include staged and unstaged changes.
    # If we specify a branch different from the current one, just show committed diffs.

    shift
    requested_branch="${1:-}"

    main_branch=$(find_main_branch)

    # If no branch specified, use current branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ -z "$requested_branch" ]]; then
        branch_to_compare="$current_branch"
    else
        branch_to_compare="$requested_branch"
    fi

    # Verify main branch exists
    if ! git rev-parse --verify "$main_branch" &>/dev/null; then
        echo "Error: Could not find '$main_branch' branch." >&2
        exit 1
    fi

    # Get committed changes between main and the specified/current branch
    # If we're on that branch, we can also show local changes
    if [[ "$branch_to_compare" == "$current_branch" ]]; then
        # We are on the target branch, so we can show local changes easily.
        # `git diff main` shows differences from main to current branch including local changes.
        full_diff=$(git diff "$main_branch" || true)
        staged_diff=$(git diff --cached || true)
        # (Note: `git diff main_branch` while on the branch includes both committed and uncommitted changes.)
    else
        # If not on that branch, just show committed differences.
        # `git diff main..branch_to_compare` shows only committed differences.
        full_diff=$(git diff "${main_branch}..${branch_to_compare}" || true)
        staged_diff=""
    fi

    output=$(mktemp)
    {
        echo "### BRANCH DIFF AGAINST $main_branch START ###"
        echo "Branch compared: $branch_to_compare"
        if [[ -n "$full_diff" ]]; then
            echo "--- BEGIN BRANCH CHANGES (committed and possibly local) ---"
            echo "$full_diff"
            echo "--- END BRANCH CHANGES ---"
        else
            echo "--- NO DIFFERENCES FROM $main_branch TO $branch_to_compare ---"
        fi

        # If we're on the branch, we already included local changes in `git diff main`.
        # But `git diff main` doesn't separate staged vs unstaged. It's a combined view.
        # To be thorough, we can also show staged separately if we want:
        if [[ "$branch_to_compare" == "$current_branch" && -n "$staged_diff" ]]; then
            echo "--- BEGIN STAGED CHANGES ---"
            echo "$staged_diff"
            echo "--- END STAGED CHANGES ---"
        fi

        echo "### BRANCH DIFF AGAINST $main_branch END ###"
    } > "$output"

    cat "$output" | copy_to_clipboard
    rm -f "$output"
    exit 0

else
    # Show usage
    echo "Usage:"
    echo "  $0 context"
    echo "  $0 changes --after <commit>"
    echo "  $0 branch [branch-name]"
    exit 1
fi
