#!/bin/zsh
# Save slot checks: migration of the old single save, independent slots,
# delete, corrupt slots, blocked storage
DIR=$(cd "$(dirname "$0")" && pwd)
cd "$DIR/../.."
node --no-warnings --import "data:text/javascript,import { register } from 'node:module'; register('file://$DIR/loader.mjs');" "$DIR/slots-check.ts"
