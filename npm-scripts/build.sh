#!/bin/bash

npx tsc -p app/tsconfig.json
cp -r app/src/*.html app/src/assets app/src/styles app/dist

touch functions/.reload
(sleep 0.1 && rm -f functions/.reload) &