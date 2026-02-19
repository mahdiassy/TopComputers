# 🔒 SSL/HTTPS Setup for topcomputerslb.com

## Issue
Your custom domain `topcomputerslb.com` shows as "Not Secure" because it needs proper SSL certificate configuration.

## Solution - Configure Custom Domain in Firebase

### Step 1: Add Custom Domain in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/topcomputers-69b82/hosting)
2. Navigate to **Hosting** → **Add custom domain**
3. Enter your domain: `topcomputerslb.com`
4. Click **Continue**

### Step 2: Verify Domain Ownership

Firebase will provide a TXT record. Add it to your domain's DNS settings:

1. Log in to your domain registrar (where you bought topcomputerslb.com)
2. Go to DNS Settings
3. Add the TXT record provided by Firebase
4. Wait for DNS propagation (can take up to 24 hours)
5. Return to Firebase Console and click **Verify**

### Step 3: Configure DNS Records

After verification, Firebase will provide A records. Update your DNS:

**Remove any existing A records for your domain, then add these:**

```
Type: A
Name: @
Value: 151.101.1.195

Type: A
Name: @
Value: 151.101.65.195
```

**For www subdomain (optional):**
```
Type: A
Name: www
Value: 151.101.1.195

Type: A
Name: www
Value: 151.101.65.195
```

### Step 4: Wait for SSL Certificate

- Firebase automatically provisions a FREE SSL certificate from Let's Encrypt
- This process takes 15 minutes to 24 hours
- Once complete, your site will automatically redirect to HTTPS

## What I've Already Configured

✅ **HTTPS Enforcement** - All HTTP requests redirect to HTTPS
✅ **HSTS Header** - Tells browsers to always use HTTPS
✅ **Content Security Policy** - Upgrades all insecure requests
✅ **Security Headers** - XSS protection, frame protection, etc.

## Verification

After setup is complete, test your site:

1. Visit: `https://topcomputerslb.com`
2. Check for the padlock 🔒 icon in the browser
3. Click the padlock to verify the SSL certificate

## Alternative: Use Firebase Default Domain

If you want immediate HTTPS without domain setup:

Your Firebase hosting URL is already secure: **https://topcomputers-69b82.web.app**

This URL:
- ✅ Has valid SSL certificate
- ✅ Always uses HTTPS
- ✅ Is already working

## Need Help?

If you're having trouble:
1. Make sure you have access to your domain registrar account
2. DNS changes can take 24-48 hours to fully propagate
3. Check Firebase Console for status updates
4. Contact Firebase Support if verification fails

---

**Current Status:** Security headers configured ✅  
**Next Step:** Configure custom domain in Firebase Console
