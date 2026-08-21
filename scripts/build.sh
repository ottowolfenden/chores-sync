#!/bin/bash

node fetch-material-symbols.js --no-warnings
rm -rf app/client/dist
mkdir -p app/client/dist/assets

cp app/client/src/* app/client/dist
cp app/client/src/assets/site.webmanifest app/client/dist/assets
cp -r app/client/src/assets/icons app/client/dist/assets

npx esbuild 'app/client/src/**/*.ts' 'app/client/src/**/*.css' \
    --outdir=app/client/dist \
    --asset-names=assets/fonts/[name] \
    --bundle --format=esm --target=esnext --minify --loader:.woff2=file

touch app/server/functions/.reload
(sleep 0.1 && rm -f app/server/functions/.reload) &