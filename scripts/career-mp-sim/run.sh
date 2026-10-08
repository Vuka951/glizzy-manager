#!/bin/zsh
# Multiplayer smoke test: ./scripts/career-mp-sim/run.sh [coaches] [years]
DIR=$(cd "$(dirname "$0")" && pwd)
cd "$DIR/../.."
node --no-warnings --import "data:text/javascript,import { register } from 'node:module'; register('file://$DIR/loader.mjs');" "$DIR/smoke.ts" ${1:-8} ${2:-20}
