# Android Keystore Setup for EAS Build

## Problem
You're encountering the error: "Generating a new Keystore is not supported in --non-interactive mode" when trying to build your Android app with EAS Build.

## Root Cause
This error occurs because:
1. EAS Build is running in non-interactive mode (CI/CD environment)
2. No Android keystore exists on EAS servers for your project
3. EAS cannot generate a new keystore without user interaction in non-interactive mode

## Solution Options

### Option 1: Use EAS Managed Credentials (Recommended)
EAS can manage your Android keystore automatically, but you need to set it up interactively first.

#### Steps:
1. **Set up credentials interactively (one-time setup):**
   ```bash
   cd librahome/create-anything/apps/mobile
   eas credentials
   ```
   
2. **Follow the prompts:**
   - Select `Android` for platform
   - Select the profile (production, preview, etc.)
   - Choose `Generate new keystore` when prompted
   - Follow the interactive setup to create and upload the keystore

3. **After setup, your builds will work in CI/CD:**
   ```bash
   eas build --platform android --profile production
   ```

### Option 2: Use Local Keystore
If you prefer to manage your own keystore:

#### Steps:
1. **Generate a local keystore:**
   ```bash
   cd librahome/create-anything/apps/mobile
   mkdir -p android/keystores
   
   keytool -genkey -v \
     -storetype JKS \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000 \
     -keystore android/keystores/release.keystore \
     -alias your-key-alias \
     -dname "CN=com.booklibrary.app, OU=, O=, L=, S=, C=US"
   ```

2. **Create credentials.json:**
   ```json
   {
     "android": {
       "keystore": {
         "keystorePath": "android/keystores/release.keystore",
         "keystorePassword": "YOUR_KEYSTORE_PASSWORD",
         "keyAlias": "your-key-alias",
         "keyPassword": "YOUR_KEY_PASSWORD"
       }
     }
   }
   ```

3. **Update eas.json for local credentials:**
   ```json
   {
     "build": {
       "production": {
         "android": {
           "credentialsSource": "local"
         }
       }
     }
   }
   ```

4. **Add to .gitignore:**
   ```
   android/keystores/release.keystore
   credentials.json
   ```

### Option 3: Interactive Build First
Run an interactive build first to let EAS generate the keystore:

```bash
eas build --platform android --profile production --interactive
```

After the first interactive build succeeds, subsequent non-interactive builds will work.

## Current Configuration
Your `eas.json` has been updated to use remote credentials for all environments:
- Development: `android.credentialsSource: "remote"`
- Preview: `android.credentialsSource: "remote"`
- Production: `android.credentialsSource: "remote"`

This means EAS will expect to find the keystore on its servers.

## Recommended Next Steps
1. **First-time setup:** Run `eas credentials` interactively to generate and upload a keystore
2. **CI/CD builds:** After initial setup, your automated builds will work
3. **Security:** Ensure your keystore is properly backed up and secure

## Verification
After setup, you can verify your credentials:
```bash
eas credentials:list
```

This will show all credentials stored on EAS servers for your project.