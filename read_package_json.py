import json

# Read web app package.json
with open('create-anything/apps/web/package.json', 'r') as f:
    web_package = json.load(f)
    print("=== WEB APP PACKAGE.JSON ===")
    print(json.dumps(web_package, indent=2))

print("\n" + "="*50 + "\n")

# Read mobile app package.json
with open('create-anything/apps/mobile/package.json', 'r') as f:
    mobile_package = json.load(f)
    print("=== MOBILE APP PACKAGE.JSON ===")
    print(json.dumps(mobile_package, indent=2))