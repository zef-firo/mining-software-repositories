#!/bin/sh

while IFS="," read -r name path folder; do
    git clone $path "games/$name"
done < game-repo.csv