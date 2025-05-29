#!/bin/bash

# Kill processes using common development ports
echo "Checking for processes on ports 3000-3003..."

for port in 3000 3001 3002 3003; do
  PID=$(lsof -ti :$port)
  if [ ! -z "$PID" ]; then
    echo "Killing process $PID on port $port"
    kill -9 $PID
  else
    echo "Port $port is free"
  fi
done

echo "All ports cleared!"