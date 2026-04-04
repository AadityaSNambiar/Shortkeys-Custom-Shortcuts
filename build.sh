
# Extract the version number directly from manifest.json (assumes "version": "x.x")
VERSION=$(grep -oP '"version":\s*"\K[0-9.]+' manifest.json)
ZIP_NAME="Shortkeys_v${VERSION}.zip"

echo "Packaging extension into ${ZIP_NAME}..."

# Remove an old build of the exact same version if it's sitting there
rm -f "$ZIP_NAME"

# Zip all contents but explicitly EXCLUDE development metadata & hidden stuff
zip -r "$ZIP_NAME" . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "build.sh" \
  -x "README.md" \
  -x "*.zip" \
  -x "node_modules/*" \
  -x "package*.json"

echo ""
echo "✅ Build complete! You can confidently upload $ZIP_NAME to the Add-on Developer Hub."
