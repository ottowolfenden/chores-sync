#!/bin/bash

wrangler pages secret bulk .env
cd app/server/cron
wrangler secret bulk ../../../.env

if [[ $1 == "deploy" ]]; then
    npm run deploy
    npm run deploy cron
fi