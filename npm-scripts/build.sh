#!/bin/bash


rm -rf app/dist
mkdir -p app/dist
npx esbuild app/src/**/*.ts --outdir=app/dist --bundle --format=esm --target=esnext
cp -r app/src/*.html app/src/assets app/src/styles app/dist

node --no-warnings update-icon-link.js

touch functions/.reload
(sleep 0.1 && rm -f functions/.reload) &