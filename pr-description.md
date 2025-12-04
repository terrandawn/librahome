## Problem
The error "Unknown option 'fileMapCacheDirectory'" was occurring because in Metro 0.82+, the fileMapCacheDirectory option was moved from the root configuration to the serializer section.

## Solution
Updated the metro.config.js file to move the fileMapCacheDirectory configuration to the correct location in the serializer section.

## Changes Made
- Moved config.fileMapCacheDirectory = cacheDir;
- To config.serializer.fileMapCacheDirectory = cacheDir;
- This fixes the compatibility issue with Metro 0.82+

## Testing
- Metro configuration now loads without the "Unknown option" error
- The configuration follows the new Metro 0.82+ structure