#!/bin/bash

npm run build
wrangler pages deploy --cwd app/server ../client/dist