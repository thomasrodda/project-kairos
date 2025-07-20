#!/bin/bash

# Update the current date in CLAUDE.md
# This script updates the "Current Date:" line at the top of CLAUDE.md

CLAUDE_MD_PATH="/mnt/c/Users/thoma/Project Kairos/CLAUDE.md"

# Get current date in DD/MM/YYYY format
CURRENT_DATE=$(date +"%d/%m/%Y")

# Check if CLAUDE.md exists
if [ ! -f "$CLAUDE_MD_PATH" ]; then
    echo "Error: CLAUDE.md not found at $CLAUDE_MD_PATH"
    exit 1
fi

# Check if the Current Date line exists
if grep -q "^Current Date:" "$CLAUDE_MD_PATH"; then
    # Update existing date line
    sed -i "s/^Current Date:.*/Current Date: $CURRENT_DATE/" "$CLAUDE_MD_PATH"
    echo "Updated date to: $CURRENT_DATE"
else
    # Add date line at the very top of the file
    # Create a temp file with the new content
    echo "Current Date: $CURRENT_DATE" > "$CLAUDE_MD_PATH.tmp"
    echo "" >> "$CLAUDE_MD_PATH.tmp"
    cat "$CLAUDE_MD_PATH" >> "$CLAUDE_MD_PATH.tmp"
    mv "$CLAUDE_MD_PATH.tmp" "$CLAUDE_MD_PATH"
    echo "Added date line: $CURRENT_DATE"
fi