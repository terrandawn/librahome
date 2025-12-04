## Problem
The error "No environment variables with visibility 'Plain text' and 'Sensitive' found for the 'production' environment on EAS" was occurring because EAS Build expects at least one environment variable to be configured for the production environment.

## Solution
Updated the EAS configuration and provided comprehensive setup instructions:

### Changes Made:
1. **Updated eas.json**: Explicitly specified environments for each build profile
   - Development builds use `development` environment
   - Preview builds use `preview` environment  
   - Production builds use `production` environment

2. **Added setup guide**: Created comprehensive instructions for setting up EAS environment variables

3. **Created example files**: Added `.env.production.example` with required environment variables

### Required Action:
You need to create environment variables on the EAS dashboard. The minimum required variable is:
- `APP_VARIANT=production` (Plain text, production environment)

### Quick Fix Steps:
1. Go to your EAS project environment variables page
2. Create `APP_VARIANT` with value `production` for production environment
3. Set visibility to "Plain text"

This will resolve the EAS build error and allow your production builds to proceed.