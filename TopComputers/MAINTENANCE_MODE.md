# 🔧 Maintenance Mode Feature

## Overview

The maintenance mode feature allows you to temporarily close your site to customers while performing updates, maintenance, or other administrative tasks. Admin users can still access the admin panel even when maintenance mode is enabled.

## How to Enable/Disable Maintenance Mode

### Step 1: Access Admin Settings
1. Log in to your admin panel at `/admin/login`
2. Navigate to **Settings** from the sidebar
3. Click **Show Advanced** button at the top

### Step 2: Configure Maintenance Mode
1. Scroll down to the **Maintenance Mode** section
2. Toggle the **Enable Maintenance Mode** switch
3. Customize the maintenance message:
   - **Maintenance Title**: The main heading (default: "🔧 We'll Be Right Back!")
   - **Maintenance Message**: Detailed message to show users
4. Click **Save Changes**

### Step 3: Preview
When maintenance mode is enabled, you'll see a live preview of what customers will see.

## Features

### ✨ What Happens When Enabled
- **Customers**: See a professional maintenance page with your custom message
- **Admin Users**: Can still access the admin panel normally
- **Auto-refresh**: The page automatically refreshes every 30 seconds to check if maintenance is over
- **Contact Options**: Users can still reach you via email or WhatsApp

### 🎨 Professional Design
- Beautiful animated UI with emoji support
- Dark mode support
- Responsive design for all devices
- Animated loading indicators
- Professional status indicators

### 🔒 Security
- Only admin users can enable/disable maintenance mode
- Admin routes remain accessible during maintenance
- Settings are stored securely in Firebase

## Customization Tips

### Using Emojis
Make your maintenance message friendly and professional with emojis:
- 🔧 🛠️ ✨ for maintenance work
- ⚡ 🚀 💡 for upgrades and improvements
- 💙 💚 ❤️ for showing appreciation
- ⏰ 🕐 ⌛ for time-related messages

### Example Messages

**Short Maintenance:**
```
Title: 🔧 Quick Update in Progress
Message: We're making some quick improvements! We'll be back in about 15 minutes. Thank you for your patience! ⚡
```

**Scheduled Maintenance:**
```
Title: 🛠️ Scheduled Maintenance
Message: We're performing scheduled maintenance to improve your shopping experience. Our store will be back online at 2:00 PM today. Thank you for your understanding! 💙
```

**Major Update:**
```
Title: 🚀 Exciting Updates Coming!
Message: We're upgrading our systems with amazing new features! We'll be back shortly with an even better shopping experience. Stay tuned! ✨
```

**Emergency Maintenance:**
```
Title: ⚠️ Temporary Service Interruption
Message: We're addressing a technical issue to ensure the best experience for you. We'll be back online as soon as possible. Thank you for your patience! 🙏
```

## Technical Details

### Files Modified
- `src/types/catalog.ts` - Added maintenance mode to SiteSettings type
- `src/pages/AdminSettings.tsx` - Added maintenance mode UI controls
- `src/components/MaintenanceMode.tsx` - New maintenance page component
- `src/App.tsx` - Added maintenance mode checking logic

### Database Structure
The maintenance settings are stored in Firebase under the `siteSettings` collection:

```typescript
{
  maintenance: {
    enabled: boolean,
    title: string,
    message: string
  }
}
```

### How It Works
1. When a user visits the site, the app checks `siteSettings.maintenance.enabled`
2. If enabled and user is not an admin, show `MaintenanceMode` component
3. Admin users and admin routes bypass maintenance mode
4. The page auto-refreshes every 30 seconds to check if maintenance is complete

## Best Practices

### Before Enabling Maintenance Mode
1. ✅ Announce maintenance in advance if possible
2. ✅ Choose low-traffic times
3. ✅ Customize the message to be specific about timing
4. ✅ Test that admin access still works
5. ✅ Have contact methods available

### During Maintenance
1. ✅ Work efficiently to minimize downtime
2. ✅ Monitor contact channels (email, WhatsApp)
3. ✅ Update the message if it takes longer than expected

### After Maintenance
1. ✅ Test the site thoroughly before disabling maintenance mode
2. ✅ Disable maintenance mode in admin settings
3. ✅ Verify customers can access the site
4. ✅ Monitor for any issues

## Troubleshooting

### I Can't Access Admin Panel
- Clear your browser cache and cookies
- Make sure you're accessing `/admin/login` directly
- Verify you're logged in as an admin user

### Customers Can Still Access the Site
- Check that maintenance mode is enabled in Settings
- Click Save Changes after enabling
- Check browser console for errors
- Verify Firebase connection is working

### Maintenance Page Not Showing Custom Message
- Ensure you clicked Save Changes
- Refresh the page (clear cache if needed)
- Check that the message fields are not empty

### Auto-refresh Not Working
- This is a browser feature - some browsers may block auto-refresh
- Users can manually refresh the page
- The feature works in most modern browsers

## Need Help?

If you encounter any issues with maintenance mode:
1. Check the browser console for errors
2. Verify Firebase connection
3. Make sure you have admin permissions
4. Contact your development team

---

**Pro Tip:** Test maintenance mode in a staging environment first before using it in production!
