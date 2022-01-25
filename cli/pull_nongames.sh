#!/bin/sh

for d in nongames/*/ ; do
    cd "$d" && git pull && cd "../../"
done