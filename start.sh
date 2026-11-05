#!/bin/bash
set -e

echo "=========================================================="
echo " Starting AI Customer Support & Contact Center System"
echo " Zero Docker • Pure Python (FastAPI) & TypeScript (Vite)"
echo " Strict Privacy & Synthetic Test Entities"
echo "=========================================================="

# Check and activate Python backend
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
    cd ..
fi

echo "Starting Backend (FastAPI on http://localhost:8000)..."
(cd backend && ./venv/bin/python run.py) &
BACKEND_PID=$!

echo "Starting Frontend (Vite on http://localhost:5173)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "echo 'Shutting down services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait

