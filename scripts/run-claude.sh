#!/bin/bash

# --- CONFIGURATION ---
# IMPORTANT: Update this path to point to YOUR notify.sh script
NOTIFY_SCRIPT="$HOME/notify.sh"


# --- SCRIPT LOGIC (No need to edit below here) ---

# First, check that your notification script can be found
if [ ! -x "$NOTIFY_SCRIPT" ]; then
    echo "ERROR: Notification script not found or not executable at '$NOTIFY_SCRIPT'"
    echo "Please update the NOTIFY_SCRIPT variable in this file."
    exit 1
fi

echo "--- Starting Claude with real-time notifications ---"

# This is the magic command:
# 1. 'stdbuf' forces claude to output line-by-line (no buffering).
# 2. 'claude "$@"' runs the actual claude command with all your arguments.
# 3. '2>&1' merges error messages and regular output so we see everything.
# 4. The '| while read' loop processes the output line by line.
stdbuf -oL -eL claude "$@" 2>&1 | while IFS= read -r line; do
    # This prints Claude's output to your screen as normal
    echo "$line"

    # This checks if the line contains a typical question pattern
    # You can add more patterns here with '||' (which means OR)
    if [[ "$line" == *"[Y/n]"* || "$line" == *"(y/n)"* || "$line" == *"[y/N]"* || "$line" == *"?"* ]]; then
        # If it's a question, call your script with the "question" argument
        # The '&' runs the sound in the background so it doesn't pause anything
        "$NOTIFY_SCRIPT" question &
    fi
done

# This code will only run AFTER the 'claude' command has completely finished
echo "--- Claude process finished. ---"
"$NOTIFY_SCRIPT" complete &