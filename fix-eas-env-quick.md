# Quick Fix for EAS Environment Variables Error

## The Problem
```
No environment variables with visibility "Plain text" and "Sensitive" found for the "production" environment on EAS.
```

## Immediate Solution (2 Minutes)

### Step 1: Go to EAS Dashboard
Visit: https://expo.dev/accounts/your-account/projects/7bfa6018-e8d2-4160-a8cb-fc036d196ee6/environment-variables

### Step 2: Create Required Environment Variable
Click "Create variable" and add:

**Variable 1:**
- Name: `APP_VARIANT`
- Value: `production`
- Environments: Check ☑️ `production`
- Visibility: `Plain text`
- Click "Create"

**Variable 2 (Optional but recommended):**
- Name: `NODE_ENV`
- Value: `production`
- Environments: Check ☑️ `production`
- Visibility: `Plain text`
- Click "Create"

### Step 3: Verify
- You should see the variables listed on the page
- The production environment now has Plain text variables

### Step 4: Run Your Build Again
```bash
eas build --platform android --profile production
# or
eas build --platform ios --profile production
```

## That's It! ✅

The error will be resolved once you create at least one "Plain text" or "Sensitive" environment variable for the production environment.

## Alternative: Use EAS CLI (if you have it locally)
```bash
# Create the required environment variable
eas env:create APP_VARIANT --environment production --value "production" --visibility plain-text

# Verify it was created
eas env:list --environment production
```

## Why This Works
EAS Build requires at least one environment variable with "Plain text" or "Sensitive" visibility to be configured for each environment you're using. The `APP_VARIANT=production` variable satisfies this requirement.