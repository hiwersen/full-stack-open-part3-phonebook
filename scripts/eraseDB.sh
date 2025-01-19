#!/usr/bin/env bash

read -p "Confirm: erase database? (y/N) " confirm

if [ "$confirm" != "y" ]; then
    exit 0
fi

read -p "Enter MongoDB connection string: " URI

node ./scripts/eraseDB.js "$URI"