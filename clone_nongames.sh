#!/bin/sh

mkdir "nongames"
while IFS="," read -r name path folder; do
    git clone $path "nongames/$name"
done < nongame-repo.csv