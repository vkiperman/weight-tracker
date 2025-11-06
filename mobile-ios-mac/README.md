# iOS + Mac Catalyst App Shell (Capacitor)

## Prereqs

- macOS with Xcode 15+
- Node 18+
- Apple Developer account (to sign/runs on devices & Mac Catalyst)
- Google AdMob account (use test IDs while developing)

## Steps

1. Build your Angular app at repo root:
   - `npm i` (in your Angular project)
   - `npm run build`
2. From this folder:
   - `npm i`
   - `npm run build`
   - `npm run open` (opens Xcode)
3. In Xcode:
   - Enable **Mac Catalyst** under the iOS target’s “General” → “Deployment Info”
   - Select “My Mac (Designed for iPad)” or the Catalyst target
   - Run

### Ads

- Replace test IDs with real AdMob iOS unit IDs.
- Ensure ATT / tracking consent flows as required.

### Local Data

- Uses `@capacitor/preferences` (Keychain/UserDefaults under the hood).

### AI

- TF.js runs on-device for a small linear regression used to project goals.
