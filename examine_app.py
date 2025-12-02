# Read key application files to understand the structure
import os

def read_file(filepath):
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except Exception as e:
        return f"Error reading {filepath}: {e}"

# Web app files
print("=== WEB APP ROOT COMPONENT ===")
web_root = read_file('create-anything/apps/web/src/app/root.tsx')
print(web_root[:1000] + "..." if len(web_root) > 1000 else web_root)

print("\n" + "="*50 + "\n")

print("=== MOBILE APP ROOT COMPONENT ===")
mobile_root = read_file('create-anything/apps/mobile/App.tsx')
print(mobile_root[:1000] + "..." if len(mobile_root) > 1000 else mobile_root)

print("\n" + "="*50 + "\n")

print("=== WEB AUTH UTILITY ===")
web_auth = read_file('create-anything/apps/web/src/utils/useAuth.js')
print(web_auth[:500] + "..." if len(web_auth) > 500 else web_auth)

print("\n" + "="*50 + "\n")

print("=== MOBILE AUTH UTILITY ===")
mobile_auth = read_file('create-anything/apps/mobile/src/utils/auth/useAuth.js')
print(mobile_auth[:500] + "..." if len(mobile_auth) > 500 else mobile_auth)