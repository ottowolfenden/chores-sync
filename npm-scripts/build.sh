#!/bin/bash


node --no-warnings fetch-material-symbols.js
rm -rf app/dist
mkdir -p app/dist
cp -r app/src/*.html app/src/assets app/src/styles app/dist
npx esbuild app/src/**/*.ts app/src/styles/*.css app/src/styles/**/*.css \
    --outdir=app/dist --bundle --format=esm --target=esnext --minify --loader:.woff2=file

touch functions/.reload
(sleep 0.1 && rm -f functions/.reload) &