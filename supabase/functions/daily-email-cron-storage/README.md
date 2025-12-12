# Daily Email Cron Job (Storage Version)

This Supabase Edge Function automatically sends a daily cafe report email at 11:55pm IST every day using data from Supabase Storage.

## How It Works

1. **Data Storage**: Frontend syncs localStorage data to Supabase Storage as JSON files
2. **Cron Trigger**: Function runs automatically at 11:55pm IST (18:25 UTC) daily
3. **Data Fetch**: Reads JSON files from Supabase Storage bucket
4. **Report Generation**: Creates daily report with orders, expenses, inventory
5. **Email Send**: Sends formatted HTML email via Brevo API

## Setup Instructions

### Step 1: Create Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `cafe-data`
3. Set it to **public** (or configure appropriate policies)

### Step 2: Update Frontend to Sync Data

Add this service to sync localStorage to Supabase Storage:

```javascript
// src/services/storageSync.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const syncToStorage = async () => {
  try {
    // Get data from localStorage
    const orders = JSON.parse(localStorage.getItem('cafe_orders') || '[]');
    const inventory = JSON.parse(localStorage.getItem('cafe_inventory') || '[]');
    const expenses = JSON.parse(localStorage.getItem('cafe_expenses') || '[]');
    const purchases = JSON.parse(localStorage.getItem('cafe_purchases') || '[]');

    // Upload to Supabase Storage
    await Promise.all([
      supabase.storage.from('cafe-data').upload('orders.json', JSON.stringify(orders), { upsert: true }),
      supabase.storage.from('cafe-data').upload('inventory.json', JSON.stringify(inventory), { upsert: true }),
      supabase.storage.from('cafe-data').upload('expenses.json', JSON.stringify(expenses), { upsert: true }),
      supabase.storage.from('cafe-data').upload('purchases.json', JSON.stringify(purchases), { upsert: true }),
    ]);

    console.log('Data synced to Supabase Storage');
  } catch (error) {
    console.error('Error syncing to storage:', error);
  }
};
```

Then call `syncToStorage()` whenever data changes (after creating orders, adding inventory, etc.).

### Step 3: Deploy the Edge Function

```bash
# Deploy the function
supabase functions deploy daily-email-cron-storage

# Set environment variables
supabase secrets set BREVO_API_KEY=your_brevo_api_key
```

### Step 4: Verify Cron Schedule

The function will automatically run at 11:55pm IST (18:25 UTC) daily based on the `cron.yaml` configuration.

## Testing

### Manual Test via CLI
```bash
supabase functions invoke daily-email-cron-storage
```

### Test via HTTP
```bash
curl -X POST https://your-project.supabase.co/functions/v1/daily-email-cron-storage \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test Data Sync
```javascript
// In browser console
import { syncToStorage } from './services/storageSync';
await syncToStorage();
```

## Monitoring

1. **View Logs**: Supabase Dashboard → Edge Functions → daily-email-cron-storage → Logs
2. **Check Storage**: Supabase Dashboard → Storage → cafe-data bucket
3. **Email Delivery**: Check Brevo dashboard for sent emails

## Schedule Details

- **Time**: 11:55pm IST (6:25pm UTC)
- **Frequency**: Daily
- **Cron Expression**: `25 18 * * *`
- **Format**: minute hour day month weekday

## Troubleshooting

### Email Not Sending
- Check `BREVO_API_KEY` is set correctly
- Verify API key has email sending permissions
- Check function logs for errors

### No Data in Report
- Ensure storage bucket `cafe-data` exists
- Verify JSON files are uploaded (orders.json, inventory.json, etc.)
- Check file permissions (should be public or have proper RLS policies)
- Test data sync manually

### Wrong Time
- Verify timezone conversion (IST = UTC+5:30)
- Adjust cron schedule in `cron.yaml` if needed
- Current: `25 18 * * *` = 6:25pm UTC = 11:55pm IST

### Function Not Running
- Check function is deployed: `supabase functions list`
- Verify cron.yaml is included in deployment
- Check Supabase project has cron enabled

## File Structure

```
supabase/functions/daily-email-cron-storage/
├── index.ts          # Main function code
├── cron.yaml         # Cron schedule configuration
└── README.md         # This file
```

## Storage Bucket Structure

```
cafe-data/
├── orders.json       # All orders data
├── inventory.json    # All inventory items
├── expenses.json     # All expenses
└── purchases.json    # All purchases
```

## Benefits

✅ No database migration needed
✅ Works with existing localStorage implementation
✅ Simple JSON file storage
✅ Automatic daily emails
✅ No manual intervention required
✅ Reliable server-side execution

## Next Steps

1. Deploy the function
2. Create storage bucket
3. Add sync service to frontend
4. Call sync after data changes
5. Test manually
6. Monitor logs

The cron job will automatically start running at 11:55pm IST every day!
