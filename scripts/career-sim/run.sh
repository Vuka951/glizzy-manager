#!/bin/zsh
# Headless league simulation: ./scripts/career-sim/run.sh [years] [runs] > out.json
DIR=$(cd "$(dirname "$0")" && pwd)
cd "$DIR/../.."
node --no-warnings --import "data:text/javascript,import { register } from 'node:module'; register('file://$DIR/loader.mjs');" "$DIR/simulate.ts" ${1:-20} ${2:-300}
