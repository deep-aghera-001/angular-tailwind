// Vercel-style: process.env available during ng build (via Dockerfile ARG+ENV)
export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://api.example.com',
  appVersion: process.env['APP_VERSION'] || '1.0.0',
  enableAnalytics: process.env['ENABLE_ANALYTICS'] === 'true',
  featureFlags: {
    darkMode: process.env['FEATURE_DARK_MODE'] === 'true',
    newDashboard: process.env['FEATURE_NEW_DASHBOARD'] === 'true',
  }
};
