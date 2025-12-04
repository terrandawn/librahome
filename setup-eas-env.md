# Fix EAS Environment Variables Issue

## Problem
The error "No environment variables with visibility 'Plain text' and 'Sensitive' found for the 'production' environment on EAS" occurs because EAS Build expects at least one environment variable to be configured for the production environment.

## Solution Steps

### 1. Create Environment Variables on EAS Dashboard

You need to create environment variables on the EAS dashboard. Here are the essential ones:

#### Basic Environment Variables (Required):
1. **APP_VARIANT** (Plain text)
   - Value: `production`
   - Environment: `production`
   - Visibility: `Plain text`

2. **EXPO_PUBLIC_API_URL** (Plain text) - if your app uses an API
   - Value: `https://your-api-url.com`
   - Environment: `production`
   - Visibility: `Plain text`

#### Optional but Recommended:
- **NODE_ENV** (Plain text)
  - Value: `production`
  - Environment: `production`
  - Visibility: `Plain text`

### 2. How to Create Environment Variables:

#### Option A: Using EAS Dashboard (Recommended)
1. Go to: https://expo.dev/accounts/[your-account]/projects/[your-project]/environment-variables
2. Click "Create variable"
3. Fill in the details:
   - Name: `APP_VARIANT`
   - Value: `production`
   - Environments: Check `production`
   - Visibility: `Plain text`
4. Click "Create"

#### Option B: Using EAS CLI
```bash
# Create APP_VARIANT for production
eas env:create APP_VARIANT --environment production --value "production" --visibility plain-text

# Create NODE_ENV for production  
eas env:create NODE_ENV --environment production --value "production" --visibility plain-text
```

### 3. Updated Configuration

I've already updated your `eas.json` to explicitly specify environments:
- Development builds use `development` environment
- Preview builds use `preview` environment  
- Production builds use `production` environment

### 4. Verify Setup

After creating the environment variables, you can verify:

```bash
# List environment variables for production
eas env:list --environment production

# Pull environment variables locally (optional)
eas env:pull --environment production
```

### 5. Build Again

Once environment variables are set up, your build should work:

```bash
eas build --platform ios --profile production
# or
eas build --platform android --profile production
```

## Notes

- **Plain text** variables are visible in logs and CLI - use for non-sensitive data
- **Sensitive** variables are obfuscated in logs - use for API keys, tokens
- **Secret** variables are not readable outside EAS servers - use for build secrets only

The minimum requirement is at least one "Plain text" or "Sensitive" variable for the production environment to resolve this error.