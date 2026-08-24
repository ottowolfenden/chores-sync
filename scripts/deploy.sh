#!/bin/bash

if [[ $1 == cron ]]; then
    cd app/server/cron
    wrangler deploy
else
    npm run build
    wrangler pages deploy --cwd app/server ../client/dist
fi