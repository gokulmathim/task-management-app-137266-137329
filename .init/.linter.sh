#!/bin/bash
cd /home/kavia/workspace/code-generation/task-management-app-137266-137329/TaskManagementAppMonolith
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

