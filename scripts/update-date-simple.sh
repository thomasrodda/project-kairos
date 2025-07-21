#!/bin/sh
# POSIX-compliant script to update date in CLAUDE.md

CLAUDE_MD_PATH="/mnt/c/Users/thoma/Project Kairos/CLAUDE.md"
CURRENT_DATE=$(date +"%d/%m/%Y")

if [ -f "$CLAUDE_MD_PATH" ]; then
    # Use a temporary file for the update
    if grep -q "^Current Date:" "$CLAUDE_MD_PATH"; then
        # Update existing date line
        awk -v date="$CURRENT_DATE" '{
            if ($0 ~ /^Current Date:/) {
                print "Current Date: " date
            } else {
                print $0
            }
        }' "$CLAUDE_MD_PATH" > "$CLAUDE_MD_PATH.tmp" && mv "$CLAUDE_MD_PATH.tmp" "$CLAUDE_MD_PATH"
        echo "Updated date to: $CURRENT_DATE"
    else
        # Add date at top
        echo "Current Date: $CURRENT_DATE" > "$CLAUDE_MD_PATH.tmp"
        echo "" >> "$CLAUDE_MD_PATH.tmp"
        cat "$CLAUDE_MD_PATH" >> "$CLAUDE_MD_PATH.tmp"
        mv "$CLAUDE_MD_PATH.tmp" "$CLAUDE_MD_PATH"
        echo "Added date line: $CURRENT_DATE"
    fi
else
    echo "Error: CLAUDE.md not found"
    exit 1
fi