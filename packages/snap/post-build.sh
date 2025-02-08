# Replacing TSX to JS for dist bundling
if [[ "$OSTYPE" == "darwin"* ]]; then # Mac OS X
  sed -i '' 's/@motiadev\/workbench\/middleware/@motiadev\/workbench\/dist\/middleware/g' dist/src/dev.js
else # Linux and others
  sed -i 's/@motiadev\/workbench\/middleware/@motiadev\/workbench\/dist\/middleware/g' dist/src/dev.js
fi