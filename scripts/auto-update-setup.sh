#!/bin/bash

# Setup script for automatic date updates in CLAUDE.md
# This creates multiple trigger points for the update-date.sh script

SCRIPT_DIR="/mnt/c/Users/thoma/Project Kairos/scripts"
PROJECT_DIR="/mnt/c/Users/thoma/Project Kairos"

echo "Setting up automatic date updates for CLAUDE.md..."

# 1. Git hook - Update on every commit
echo "Setting up git pre-commit hook..."
cat > "$PROJECT_DIR/.git/hooks/pre-commit" << 'EOF'
#!/bin/bash
# Update CLAUDE.md date before every commit
/mnt/c/Users/thoma/Project Kairos/scripts/update-date.sh

# Add the updated CLAUDE.md to the commit if it was changed
if git diff --cached --name-only | grep -q "CLAUDE.md"; then
    git add CLAUDE.md
fi
EOF
chmod +x "$PROJECT_DIR/.git/hooks/pre-commit"

# 2. Create a bash alias for common commands that trigger the update
echo "Creating shell integration..."
cat > "$SCRIPT_DIR/shell-integration.sh" << 'EOF'
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
EOF

# 3. Create a VS Code task (if using VS Code)
mkdir -p "$PROJECT_DIR/.vscode"
cat > "$PROJECT_DIR/.vscode/tasks.json" << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Update CLAUDE.md Date",
            "type": "shell",
            "command": "/mnt/c/Users/thoma/Project Kairos/scripts/update-date.sh",
            "runOptions": {
                "runOn": "folderOpen"
            },
            "presentation": {
                "reveal": "silent",
                "close": true
            }
        }
    ]
}
EOF

echo "Setup complete! Date will be updated automatically via:"
echo "1. Git pre-commit hook (every commit)"
echo "2. Shell integration (add 'source $SCRIPT_DIR/shell-integration.sh' to ~/.bashrc)"
echo "3. VS Code task (runs when project folder opens)"
echo ""
echo "You can also run manually: $SCRIPT_DIR/update-date.sh"