import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

let initialized = false;

export async function initAds() {
  if (initialized) return;
  await AdMob.initialize({
    requestTrackingAuthorization: true,
    initializeForTesting: true,
  });
  initialized = true;
}

export async function showBanner(adUnitId: string) {
  await initAds();
  await AdMob.showBanner({
    adId: adUnitId,
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
  });
}

export async function hideBanner() {
  await AdMob.removeBanner();
}

export async function showInterstitial(adUnitId: string) {
  await initAds();
  await AdMob.prepareInterstitial({ adId: adUnitId });
  await AdMob.showInterstitial();
}
