#!/bin/bash


rm -rf app/dist
mkdir -p app/dist
npx esbuild app/src/**/*.ts --outdir=app/dist --bundle --format=esm --target=esnext
cp -r app/src/*.html app/src/assets app/src/styles app/dist
npx esbuild app/src/**/*.ts app/src/styles/*.css app/src/styles/**/*.css \
    --outdir=app/dist --bundle --format=esm --target=esnext --minify --loader:.woff2=file

touch functions/.reload
(sleep 0.1 && rm -f functions/.reload) &