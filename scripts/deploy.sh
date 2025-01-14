#!/usr/bin/env bash

confirmDeployment() {
    read -p "Confirm deployment? (y/N) " confirm
}

confirmDeployment
    
if [ "$confirm" != 'y' ]; then
    echo "Aborted!"
    echo "The application will not be deployed"
    echo "The changes have been committed and pushed:"
    git show --stat HEAD
    git status
else
    #fly deploy
    #fly scale show
    echo "Deploy..."
    echo "Showing scale..."
fi