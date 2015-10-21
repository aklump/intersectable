#!/bin/bash
# 
# @file
# Copy distribution files to /dist
# 
test -d "$7/dist" || mkdir -p "$7/dist"
cp "$7/__MOdule.js" "$7/dist/"
cp "$7/__MOdule.min.js" "$7/dist/"
