// Platform env vars replace __VAR__ placeholders at build time
// Fallback values used if no placeholder replacement occurs
export const environment = {
  production: true,
  apiUrl: '__API_URL__',
  appVersion: '__APP_VERSION__',
  enableAnalytics: ('__ENABLE_ANALYTICS__' as string) === 'true',
  featureFlags: {
    darkMode: ('__FEATURE_DARK_MODE__' as string) === 'true',
    newDashboard: ('__FEATURE_NEW_DASHBOARD__' as string) === 'true',
  }
};
