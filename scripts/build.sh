#!/bin/bash

set -e

node fetch-material-symbols.mjs
rm -rf app/client/dist
mkdir -p app/client/dist/assets

cp app/client/src/*.html app/client/src/robots.txt app/client/dist 2>/dev/null || true
cp app/client/src/assets/* app/client/dist/assets 2>/dev/null || true
cp -r app/client/src/assets/icons app/client/dist/assets

tsc -p app/client/tsconfig.json --noEmit
tsc -p app/server/tsconfig.json --noEmit
esbuild 'app/client/src/**/*.ts' 'app/client/src/**/*.css' \
    --outdir=app/client/dist \
    --asset-names=assets/fonts/[name] \
    --bundle --format=esm --target=esnext \
    --minify --loader:.woff2=file --log-level=warning

touch app/server/functions/.reload
(sleep 0.1 && rm -f app/server/functions/.reload) &