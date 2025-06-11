#!/bin/bash

# Audio notification script for WSL
# Usage: ./scripts/notify.sh [question|complete|error]

notification_type=${1:-complete}

# First emit terminal bell
echo -e "\a"

# Then play Windows system sound
case "$notification_type" in
    "question")
        # Play Windows question sound (preferred)
        powershell.exe -c "[System.Media.SystemSounds]::Question.Play()"
        ;;
    "complete")
        # Play Windows beep sound
        powershell.exe -c "[System.Media.SystemSounds]::Beep.Play()"
        ;;
    "error")
        # Play Windows error sound
        powershell.exe -c "[System.Media.SystemSounds]::Hand.Play()"
        ;;
    *)
        # Default to question sound
        powershell.exe -c "[System.Media.SystemSounds]::Question.Play()"
        ;;
esac