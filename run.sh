#!/bin/bash
echo "================================================================"
echo "       🧠 CogniStudy AI - Learning & Study Assistant"
echo "================================================================"
echo ""
echo "Launching CogniStudy AI..."

if command -v python3 &>/dev/null; then
    echo "Starting Python local server on http://localhost:8000"
    python3 -m http.server 8000 &
    sleep 1
    if command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:8000
    elif command -v open &>/dev/null; then
        open http://localhost:8000
    fi
else
    if command -v xdg-open &>/dev/null; then
        xdg-open index.html
    elif command -v open &>/dev/null; then
        open index.html
    fi
fi
