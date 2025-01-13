#!/usr/bin/env bash

# build-ui.sh
rm -rf dist
cd ../../part2/phonebook
npm run build
cp -r dist ../../part3/full-stack-open-part3-phonebook