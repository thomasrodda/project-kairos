#!/bin/bash
# Fix permissions for WSL
find . -type f -name "*.sh" -exec chmod +x {} \;
chmod -R 755 node_modules/.bin 2>/dev/null || true