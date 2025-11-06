# Android App Shell (Capacitor)

## Prereqs

- Node 18+
- Android Studio + SDKs, Java 17
- Google AdMob account (use test IDs while developing)

## Steps

1. Build your Angular app at repo root:
   - `npm i` (in your Angular project)
   - `npm run build` (ensure output goes to `../dist/...`)
2. From this folder:
   - `npm i`
   - `npm run build`
   - `npm run open` (opens Android Studio)
3. In Android Studio:
   - Set min/target SDK as prompted
   - Run on emulator/device

### Wiring your Angular app

Your Angular code can call Capacitor bridges via `Capacitor.isNativePlatform()` checks and invoking endpoints you expose (e.g., using `window` globals or an Angular service). Easiest: write an Angular service that uses `Plugins` or direct imports from these files (bundle them into Angular via a shared library if desired).

### Ads

- Replace test `adId` with your real AdMob unit IDs before release.
- Comply with Google policies (content, privacy, consent).

### Local Data

We use `@capacitor/preferences` for simple, private storage.
