# Add this to your ~/.bashrc or ~/.zshrc to auto-update date

# Function to update date before certain commands
update_claude_date() {
    /mnt/c/Users/thoma/Project Kairos/scripts/update-date.sh >/dev/null 2>&1
}

# Update before entering the project directory
cd() {
    builtin cd "$@"
    if [[ "$PWD" == "/mnt/c/Users/thoma/Project Kairos"* ]]; then
        update_claude_date
    fi
}

# Update before running yarn dev
yarn() {
    if [[ "$1" == "dev" ]] && [[ "$PWD" == "/mnt/c/Users/thoma/Project Kairos"* ]]; then
        update_claude_date
    fi
    command yarn "$@"
}
