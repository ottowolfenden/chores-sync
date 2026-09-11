#!/bin/bash

set -e

tsc -p app/client/tsconfig.json --noEmit
tsc -p app/server/tsconfig.json --noEmit

node scripts/fetch-material-symbols.mjs

rm -rf app/client/dist
mkdir -p app/client/dist/assets

cp app/client/src/*.html app/client/src/robots.txt app/client/dist 2>/dev/null || true
cp app/client/src/assets/* app/client/dist/assets 2>/dev/null || true
cp -r app/client/src/assets/icons app/client/dist/assets

esbuildopts=(
    --outdir=app/client/dist
    --bundle
    --asset-names=assets/fonts/[name]
    --format=esm
    --target=esnext
    --loader:.woff2=file
)

if [[ $1 == "--deploy-mode" ]]; then
    esbuildopts+=(--minify)
else
    esbuildopts+=(--log-level=warning)
fi

esbuild 'app/client/src/**/*.ts' 'app/client/src/**/*.css' "${esbuildopts[@]}"

touch app/server/functions/.reload
(sleep 0.1 && rm -f app/server/functions/.reload) &