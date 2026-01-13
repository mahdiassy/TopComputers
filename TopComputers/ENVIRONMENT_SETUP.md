# Multi-Environment Setup Guide

This project supports three separate environments: **Development**, **Staging**, and **Production**. Each environment uses its own Firebase project with isolated databases, storage, and authentication.

## 🏗️ Environment Structure

- **Development**: For local development and testing
- **Staging**: For pre-production testing and QA
- **Production**: Live production environment

## 📋 Setup Steps

### 1. Create Firebase Projects

Create three separate Firebase projects in the [Firebase Console](https://console.firebase.google.com/):

1. **Development Project** (e.g., `topcomputers-dev`)
2. **Staging Project** (e.g., `topcomputers-staging`)  
3. **Production Project** (already exists: `topcomputers-69b82`)

For each project:
- Enable Authentication (Email/Password, Google, etc.)
- Create Firestore Database
- Enable Storage
- Copy the Firebase configuration from Project Settings

### 2. Configure Environment Variables

Update the `.env` files with your Firebase project credentials:

#### `.env.development`
```bash
VITE_DEV_FIREBASE_API_KEY=your-dev-api-key
VITE_DEV_FIREBASE_AUTH_DOMAIN=topcomputers-dev.firebaseapp.com
VITE_DEV_FIREBASE_PROJECT_ID=topcomputers-dev
VITE_DEV_FIREBASE_STORAGE_BUCKET=topcomputers-dev.appspot.com
VITE_DEV_FIREBASE_MESSAGING_SENDER_ID=your-dev-sender-id
VITE_DEV_FIREBASE_APP_ID=your-dev-app-id
VITE_DEV_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### `.env.staging`
```bash
VITE_STAGING_FIREBASE_API_KEY=your-staging-api-key
VITE_STAGING_FIREBASE_AUTH_DOMAIN=topcomputers-staging.firebaseapp.com
VITE_STAGING_FIREBASE_PROJECT_ID=topcomputers-staging
VITE_STAGING_FIREBASE_STORAGE_BUCKET=topcomputers-staging.appspot.com
VITE_STAGING_FIREBASE_MESSAGING_SENDER_ID=your-staging-sender-id
VITE_STAGING_FIREBASE_APP_ID=your-staging-app-id
VITE_STAGING_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### `.env.production`
```bash
VITE_PROD_FIREBASE_API_KEY=your-production-api-key
VITE_PROD_FIREBASE_AUTH_DOMAIN=topcomputers-69b82.firebaseapp.com
VITE_PROD_FIREBASE_PROJECT_ID=topcomputers-69b82
VITE_PROD_FIREBASE_STORAGE_BUCKET=topcomputers-69b82.appspot.com
VITE_PROD_FIREBASE_MESSAGING_SENDER_ID=your-production-sender-id
VITE_PROD_FIREBASE_APP_ID=your-production-app-id
VITE_PROD_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Update Firebase Project Aliases

Update `.firebaserc` with your actual project IDs:

```json
{
  "projects": {
    "default": "topcomputers-69b82",
    "development": "topcomputers-dev",
    "staging": "topcomputers-staging",
    "production": "topcomputers-69b82"
  }
}
```

### 4. Initialize Firebase CLI

Make sure you're logged in to Firebase:

```bash
firebase login
```

List your projects to verify:

```bash
firebase projects:list
```

## 🚀 Usage

### Development

Run the app locally with development Firebase project:

```bash
npm run dev
```

This uses `.env.development` and connects to your dev Firebase project.

### Staging

Run the app with staging environment:

```bash
npm run dev:staging
```

Build for staging:

```bash
npm run build:staging
```

Deploy to staging:

```bash
npm run deploy:staging
```

### Production

Build for production:

```bash
npm run build:prod
```

Deploy to production:

```bash
npm run deploy:prod
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (development environment) |
| `npm run dev:staging` | Start dev server (staging environment) |
| `npm run build:dev` | Build for development |
| `npm run build:staging` | Build for staging |
| `npm run build:prod` | Build for production |
| `npm run preview:dev` | Preview development build |
| `npm run preview:staging` | Preview staging build |
| `npm run deploy:dev` | Deploy to development Firebase project |
| `npm run deploy:staging` | Deploy to staging Firebase project |
| `npm run deploy:prod` | Deploy to production Firebase project |

## 🔄 Workflow Example

### Making Changes

1. **Develop**: Make changes and test locally
   ```bash
   npm run dev
   ```

2. **Test on Staging**: Deploy to staging for QA
   ```bash
   npm run deploy:staging
   ```

3. **Go Live**: Deploy to production after testing
   ```bash
   npm run deploy:prod
   ```

## 🔐 Security Notes

- **Never commit** `.env.development`, `.env.staging`, or `.env.production` files
- Only commit `.env.example` as a template
- Keep Firebase API keys secure but note they're meant to be public (security is handled by Firebase Security Rules)
- Review and update Firestore and Storage rules for each environment

## 📊 Database Management

### Seeding Data

To seed data in different environments:

```bash
# Development
firebase use development
npm run seed

# Staging
firebase use staging
npm run seed

# Production (be careful!)
firebase use production
npm run seed
```

### Firestore Rules

Deploy rules to specific environment:

```bash
# Development
firebase deploy --only firestore:rules --project development

# Staging
firebase deploy --only firestore:rules --project staging

# Production
firebase deploy --only firestore:rules --project production
```

## 🧪 Testing Strategy

1. **Development**: Rapid development and debugging
   - Test new features
   - Experiment with database changes
   - No data constraints

2. **Staging**: Pre-production validation
   - QA testing
   - User acceptance testing
   - Mirror production data structure
   - Test migrations and updates

3. **Production**: Live environment
   - Stable, tested code only
   - Real user data
   - Monitored and backed up

## 🆘 Troubleshooting

### Wrong Environment Connected

Check which Firebase project is active:

```bash
firebase use
```

Switch projects:

```bash
firebase use development
firebase use staging
firebase use production
```

### Environment Variables Not Loading

1. Restart dev server after changing `.env` files
2. Verify file names match exactly (`.env.development`, `.env.staging`, `.env.production`)
3. Check that values don't have quotes around them

### Build Errors

Clear cache and rebuild:

```bash
rm -rf node_modules dist .firebase
npm install
npm run build:dev
```

## 📱 Environment Indicator

The app automatically detects which environment it's running in. You can add a visual indicator in your UI by checking:

```typescript
const environment = import.meta.env.MODE; // 'development', 'staging', or 'production'
```

Consider adding a banner in dev/staging environments to clearly show users which environment they're in.

## ✅ Checklist

Before going live, ensure:

- [ ] All three Firebase projects are created
- [ ] Environment variables are configured
- [ ] `.firebaserc` has correct project IDs
- [ ] Firestore security rules are deployed to all environments
- [ ] Storage security rules are deployed to all environments
- [ ] Authentication providers are enabled in all projects
- [ ] Tested deployment to staging successfully
- [ ] Verified staging environment works correctly
- [ ] Backed up production database before major updates

---

**Need Help?** Check the [Firebase Documentation](https://firebase.google.com/docs) or ask your team lead.
