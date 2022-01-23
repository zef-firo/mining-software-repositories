#!/bin/sh

for d in games/*/ ; do
    cd "$d" && git pull && cd "../../"
done