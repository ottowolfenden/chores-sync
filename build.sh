#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"
cd functions/api; tsc
cd ../../pages; tsc
cd ..