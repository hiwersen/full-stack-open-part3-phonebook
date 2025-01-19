#!/usr/bin/env bash

read -p "Confirm: populate database? (y/N) " confirm

if [ "$confirm" != "y" ]; then
    exit 0
fi

read -p "Enter MongoDB connection string: " URI

node ./scripts/populateDB.js "$URI"