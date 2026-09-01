#!/bin/bash

wrangler pages secret bulk .env
cd app/server/cron
wrangler secret bulk ../../../.env
npm run deploy
npm run deploy cron