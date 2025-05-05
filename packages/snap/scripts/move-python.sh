#!/bin/bash

# Copy Python files to both CJS and ESM directories
cp src/builder/python-builder.py dist/cjs/builder/python-builder.py
cp src/builder/python-builder.py dist/esm/builder/python-builder.py

# Copy core requirements.txt
cp ../core/requirements.txt dist/requirements-core.txt
cp requirements.txt dist/requirements-snap.txt