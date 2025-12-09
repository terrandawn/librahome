# Fix iOS Distribution Certificate Validation Error

## Problem
```
Distribution Certificate is not validated for non-interactive builds.
Failed to set up credentials.
```

This error occurs when EAS Build cannot validate iOS certificates for non-interactive builds, typically in CI/CD environments or when using `--non-interactive` flag.

## Solutions (Choose one)

### Solution 1: Use EAS Managed Credentials (Recommended)

Update your `eas.json` to use remote credentials managed by EAS:

```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "environment": "production",
      "ios": {
        "credentialsSource": "remote"
      }
    }
  }
}
```

### Solution 2: Skip Credentials Validation (For Development/Internal Builds)

Add `withoutCredentials: true` for internal builds:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "ios": {
        "withoutCredentials": true
      }
    }
  }
}
```

### Solution 3: Use Local Credentials with Proper Setup

1. Generate credentials locally:
```bash
eas credentials
```

2. Update `eas.json`:
```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "environment": "production",
      "ios": {
        "credentialsSource": "local"
      }
    }
  }
}
```

### Solution 4: Remove --non-interactive Flag

Remove the `--non-interactive` flag from your build command:
```bash
# Instead of this:
eas build --profile production --platform ios --non-interactive

# Use this:
eas build --profile production --platform ios
```

## Recommended Configuration

For most projects, use this configuration:

```json
{
  "cli": {
    "version": ">= 15.0.15",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "environment": "development",
      "ios": {
        "withoutCredentials": true
      }
    },
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "ios": {
        "withoutCredentials": true
      }
    },
    "production": {
      "autoIncrement": true,
      "environment": "production",
      "ios": {
        "credentialsSource": "remote"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Additional Steps

### For Production Builds:
1. Set up Apple Developer account
2. Create App Store Connect API key
3. Configure credentials in EAS dashboard
4. Use `credentialsSource: "remote"`

### For Development/Internal Builds:
1. Use `withoutCredentials: true`
2. Or set up local credentials with `eas credentials`

## Verification

Test your configuration:
```bash
# Test preview build
eas build --profile preview --platform ios

# Test production build (if set up)
eas build --profile production --platform ios
```

## Common Issues

- **Certificate Expired**: Update your certificates in Apple Developer Portal
- **Missing Provisioning Profile**: Create proper provisioning profiles
- **API Key Issues**: Generate new App Store Connect API key
- **Team ID Mismatch**: Ensure correct Apple Team ID in configuration