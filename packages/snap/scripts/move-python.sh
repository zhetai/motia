#!/bin/bash

# Copy Python files to both CJS and ESM directories
cp src/builder/python-builder.py dist/cjs/src/builder/python-builder.py
cp src/builder/python-builder.py dist/esm/src/builder/python-builder.py