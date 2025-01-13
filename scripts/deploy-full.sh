#!/usr/bin/env bash

# scripts/deploy-full.sh
npm run build:ui
git add .
git commit -m "uibuild updated"
git push
git show --stat HEAD
npm run deploy
fly scale show