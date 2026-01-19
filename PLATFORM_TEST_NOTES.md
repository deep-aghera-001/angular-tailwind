# Angular Tailwind - Platform Environment Testing

## Project Info
- **Name**: angular-tailwind
- **Angular Version**: Latest (from package.json)
- **Build Command**: `ng build`
- **Build Output**: `dist/angular-tailwind/browser/` (Angular 17+ pattern)

## Environment Variable Test Scenarios

### ✅ Scenario 1: Build WITHOUT Runtime Env Vars (Default Behavior)
**Status**: Should work out of the box

**How It Works**:
- Angular uses `fileReplacements` in angular.json
- During build, `environment.ts` → `environment.prod.ts`
- Values compiled into JavaScript bundle at **build time**
- No runtime env vars needed

**Expected Behavior**:
```typescript
// After build, bundle contains:
environment = {
  production: true,
  apiUrl: 'https://api.example.com',  // ← Hardcoded in bundle
  appVersion: '1.0.0',
  enableAnalytics: true,
  featureFlags: { darkMode: true, newDashboard: true }
}
```

**Platform Test**:
1. Push to platform WITHOUT setting any env vars
2. Platform builds with `npm run build`
3. Angular CLI replaces environment.ts with environment.prod.ts
4. App should work with hardcoded production values

---

### ⚠️ Scenario 2: Build WITH Runtime Env Vars (Current Limitation)
**Status**: Will NOT work - Angular limitation, not platform

**What Users Might Try**:
- Set platform env vars: `API_URL=https://custom-api.com`
- Expect Angular to use it at runtime

**Why It Fails**:
```typescript
// This WILL NOT WORK in Angular:
export const environment = {
  apiUrl: process.env['API_URL']  // ❌ Undefined in browser
}
```

**Root Cause**:
- Angular is a **frontend framework** (runs in browser)
- `process.env` doesn't exist in browser
- Environment values must be **compiled into bundle** at build time

**Workarounds**:
1. **Option A**: Use fileReplacements (recommended) - hardcode values in `environment.prod.ts`
2. **Option B**: Use build-time injection (requires platform changes)
3. **Option C**: Runtime config file (load from `/assets/config.json`)

---

### 🔧 Scenario 3: Build-Time Env Injection (Future Enhancement)
**Status**: Requires platform Dockerfile changes

**How It Would Work**:
```dockerfile
# Modified Dockerfile would need:
ARG API_URL
ARG ENABLE_ANALYTICS

# Before build, replace placeholders:
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts
RUN npm run build
```

**Platform Changes Needed**:
1. Jenkins passes env vars to Kaniko as `--build-arg`
2. Angular Dockerfile accepts ARG directives
3. Pre-build script replaces placeholders in environment.prod.ts

**Benefits**:
- Users can customize API URLs per environment
- No code changes needed in environment files
- True separation of config from code

---

## Testing Plan

### Test 1: Default Build (No Env Vars)
```bash
# Deploy without setting any platform env vars
# Expected: Works with values from environment.prod.ts
```

### Test 2: With Unused Env Vars
```bash
# Deploy with platform env vars set
# ENV: API_URL=https://test.com
# Expected: Build succeeds, but env var is IGNORED
# App uses hardcoded environment.prod.ts values
```

### Test 3: Verify Build Output
```bash
# After deployment, check built files:
# 1. Verify dist/angular-tailwind/browser/index.html exists
# 2. Check main.*.js contains hardcoded environment values
# 3. Confirm apiUrl is NOT "https://test.com" from env var
```

---

## Current Environment Configuration

### environment.prod.ts (Production - Compiled into Bundle)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  appVersion: '1.0.0',
  enableAnalytics: true,
  featureFlags: {
    darkMode: true,
    newDashboard: true,
  }
};
```

### environment.ts (Development - NOT used in production build)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200',
  appVersion: '1.0.0-dev',
  enableAnalytics: false,
  featureFlags: {
    darkMode: true,
    newDashboard: false,
  }
};
```

---

## Key Findings

### ✅ What Works
- Angular fileReplacements (build-time config)
- Hardcoded production values in environment.prod.ts
- Platform Dockerfile detection (dist/angular-tailwind/browser/)

### ❌ What Doesn't Work (By Design)
- Runtime environment variable injection
- `process.env` access in Angular components
- Dynamic API URLs without build-time injection

### 🔧 What Needs Implementation
- Build-time env var injection via Dockerfile ARG
- Jenkins to Kaniko `--build-arg` passing
- Template placeholder replacement in environment files

---

## Next Steps

1. **Test Now**: Deploy with current Dockerfile (no env vars)
   - Should work ✅
   - Uses hardcoded environment.prod.ts values

2. **Test With Env Vars**: Deploy with platform env vars set
   - Should work ✅ (but ignores env vars)
   - Verify env vars don't break build

3. **Future**: Implement build-time env injection
   - Modify Angular Dockerfile to accept ARG
   - Update Jenkins to pass `--build-arg` to Kaniko
   - Add placeholder replacement script

---

## Build Output Structure (Angular 17+)

```
dist/
└── angular-tailwind/          ← PROJECT_DIR
    └── browser/               ← browser subfolder (Angular 17+)
        ├── index.html
        ├── main.*.js          ← Contains compiled environment values
        ├── polyfills.*.js
        └── styles.*.css
```

**Platform Detection Logic**:
1. Check `dist/angular-tailwind/index.html` → ❌ Not found
2. Check `dist/angular-tailwind/browser/index.html` → ✅ Found
3. Copy from `dist/angular-tailwind/browser/*` → `/app/dist/`
4. Serve from `/app/dist/` via nginx/serve
