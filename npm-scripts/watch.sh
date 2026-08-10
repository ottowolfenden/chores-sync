#!/bin/bash

concurrently \
    "npm run build; chokidar \"app/src/**/*\" -c \"npm run build\"" \
    "wrangler pages dev app/dist --live-reload"

