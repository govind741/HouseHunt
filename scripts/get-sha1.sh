#!/bin/bash

echo "🔑 Getting SHA-1 fingerprint for Google Sign-In setup..."
echo "=================================================="

cd android

echo "📋 Running Gradle signing report..."
./gradlew signingReport

echo ""
echo "=================================================="
echo "📝 Instructions:"
echo "1. Look for 'Variant: debug' section above"
echo "2. Copy the SHA1 fingerprint (40 characters)"
echo "3. Add this SHA1 to your Google Cloud Console:"
echo "   - Go to APIs & Services > Credentials"
echo "   - Edit your Android OAuth 2.0 Client ID"
echo "   - Add the SHA1 fingerprint"
echo ""
echo "🔧 Package name for Google Console: com.agentapp"
echo "=================================================="
