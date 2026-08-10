#!/bin/bash

adb reverse tcp:8788 tcp:8788
concurrently \
    'npm run build; chokidar "app/src/**/*" -c "npm run build"' \
    'wrangler pages dev app/dist --live-reload'

