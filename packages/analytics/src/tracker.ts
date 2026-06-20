export class AnalyticsTracker {
  trackPageView(url: string) {
    console.log(`[Analytics] Tracked page view: ${url}`);
  }
}
