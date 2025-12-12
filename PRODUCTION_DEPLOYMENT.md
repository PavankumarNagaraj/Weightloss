# Production Deployment Guide - Cafe Management System

## Overview
This guide will help you deploy the production-ready cafe management system using Supabase database tables instead of localStorage.

## Prerequisites
- Supabase account and project
- Supabase CLI installed (`npm install -g supabase`)
- Node.js and npm installed

## Step 1: Database Setup

### 1.1 Run Database Migration

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run the migration to create all tables
supabase db push
```

This will create the following tables:
- `cafe_menu` - Menu items with customer/trainer pricing
- `cafe_inventory` - Inventory management
- `cafe_purchases` - Purchase orders
- `cafe_expenses` - All expenses
- `cafe_orders` - Customer orders
- `cafe_investments` - Capital investments

### 1.2 Verify Tables

Go to Supabase Dashboard → Database → Tables and verify all tables are created.

## Step 2: Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
Supabase Dashboard → Settings → API

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 4: Replace cafeService.js

```bash
# Backup old service
mv src/services/cafeService.js src/services/cafeService.old.js

# Use new production service
mv src/services/cafeService.new.js src/services/cafeService.js
```

## Step 5: Deploy Edge Function for Cron Job

### 5.1 Set Environment Variables

```bash
# Set Brevo API key for email sending
supabase secrets set BREVO_API_KEY=your_brevo_api_key

# Verify secrets
supabase secrets list
```

### 5.2 Deploy the Function

```bash
# Deploy the database-based cron function
supabase functions deploy daily-email-cron

# Verify deployment
supabase functions list
```

### 5.3 Test the Function

```bash
# Manual test
supabase functions invoke daily-email-cron

# Check logs
supabase functions logs daily-email-cron
```

## Step 6: Update Frontend Components

The new cafeService.js is async, so components need to be updated to use `await`:

### Example Updates:

**Before (localStorage):**
```javascript
const items = getMenuItems();
```

**After (Supabase):**
```javascript
const items = await getMenuItems();
```

All data fetching functions are now async and return Promises.

## Step 7: Data Migration (Optional)

If you have existing localStorage data to migrate:

### 7.1 Export localStorage Data

```javascript
// Run in browser console
const data = {
  orders: JSON.parse(localStorage.getItem('cafe_orders') || '[]'),
  menu: JSON.parse(localStorage.getItem('cafe_menu') || '[]'),
  inventory: JSON.parse(localStorage.getItem('cafe_inventory') || '[]'),
  purchases: JSON.parse(localStorage.getItem('cafe_purchases') || '[]'),
  expenses: JSON.parse(localStorage.getItem('cafe_expenses') || '[]'),
};

console.log(JSON.stringify(data));
// Copy the output
```

### 7.2 Create Migration Script

Create `scripts/migrate-data.js`:

```javascript
import { supabase } from '../src/config/supabase.js';
import data from './exported-data.json';

async function migrateData() {
  // Migrate menu items
  for (const item of data.menu) {
    await supabase.from('cafe_menu').insert({
      name: item.name,
      category: item.category,
      customer_price: item.customerPrice || item.price,
      trainer_price: item.trainerPrice || item.price,
      description: item.description,
      is_veg: item.isVeg,
      raw_materials: item.rawMaterials || [],
    });
  }

  // Migrate inventory
  for (const item of data.inventory) {
    await supabase.from('cafe_inventory').insert({
      name: item.name,
      current_stock: item.currentStock,
      min_stock: item.minStock,
      unit: item.unit,
      category: item.category,
      price_per_unit: item.pricePerUnit,
    });
  }

  // Continue for other tables...
  console.log('Migration complete!');
}

migrateData();
```

## Step 8: Verify Cron Schedule

The cron job is configured to run at **11:55pm IST (18:25 UTC)** daily.

Verify in `supabase/functions/daily-email-cron/cron.yaml`:
```yaml
schedule: '25 18 * * *'
```

## Step 9: Testing

### 9.1 Test Database Operations

```javascript
// Test creating an order
import { createOrder } from './src/services/cafeService';

const testOrder = await createOrder({
  customerName: 'Test Customer',
  customerType: 'customer',
  items: [{ id: 'item-id', name: 'Test Item', price: 100, quantity: 1 }],
  subtotal: 100,
  totalAmount: 100,
});

console.log('Order created:', testOrder);
```

### 9.2 Test Email Cron

```bash
# Manually trigger the cron job
supabase functions invoke daily-email-cron

# Check if email was sent
# Check Brevo dashboard for sent emails
```

## Step 10: Monitoring

### Database Monitoring
- Supabase Dashboard → Database → Query Performance
- Monitor table sizes and query times

### Function Monitoring
- Supabase Dashboard → Edge Functions → daily-email-cron
- View logs and execution history

### Email Monitoring
- Brevo Dashboard → Email Activity
- Track delivery rates and opens

## Architecture

```
Frontend (React)
    ↓
Supabase Client
    ↓
Supabase Database (PostgreSQL)
    ↓
Edge Function (Cron)
    ↓
Brevo API (Email)
```

## Database Schema

### cafe_menu
- Menu items with dual pricing (customer/trainer)
- Raw materials as JSONB

### cafe_inventory
- Stock management
- Automatic triggers for last_updated

### cafe_orders
- Customer orders
- Automatic inventory deduction
- Payment tracking

### cafe_purchases
- Purchase orders with PO numbers
- Automatic expense entry creation
- Inventory stock updates

### cafe_expenses
- All expenses including purchases
- Linked to purchases via foreign key

## Security

### Row Level Security (RLS)
All tables have RLS enabled with public policies. For production, update policies:

```sql
-- Example: Restrict to authenticated users
DROP POLICY "Allow all operations on cafe_orders" ON cafe_orders;

CREATE POLICY "Authenticated users can manage orders" ON cafe_orders
  FOR ALL USING (auth.role() = 'authenticated');
```

### API Keys
- Never commit `.env` file
- Use environment variables in production
- Rotate keys regularly

## Troubleshooting

### Issue: Tables not created
**Solution:** Run `supabase db push` again and check migration logs

### Issue: RLS blocking queries
**Solution:** Temporarily disable RLS or update policies
```sql
ALTER TABLE cafe_orders DISABLE ROW LEVEL SECURITY;
```

### Issue: Cron not running
**Solution:** Check function logs and verify cron.yaml is deployed

### Issue: Email not sending
**Solution:** Verify BREVO_API_KEY is set correctly

## Performance Optimization

### Indexes
All tables have indexes on frequently queried columns:
- `date` columns for filtering
- `order_number` for lookups
- `category` for grouping

### Query Optimization
Use Supabase's built-in query optimization:
```javascript
// Good: Select only needed columns
const { data } = await supabase
  .from('cafe_orders')
  .select('id, order_number, total_amount')
  .eq('date', today);

// Avoid: Select all columns when not needed
```

## Backup Strategy

### Automated Backups
Supabase provides automatic daily backups (Pro plan)

### Manual Backup
```bash
# Export all data
supabase db dump -f backup.sql

# Restore
supabase db reset --db-url postgresql://...
```

## Production Checklist

- [ ] Database tables created
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] cafeService.js replaced
- [ ] Edge function deployed
- [ ] Cron schedule verified
- [ ] Email sending tested
- [ ] RLS policies configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

## Support

For issues:
1. Check Supabase logs
2. Check function logs
3. Verify environment variables
4. Test database connectivity

## Next Steps

1. Deploy to production
2. Monitor for 24 hours
3. Verify cron runs at 11:55pm
4. Check email delivery
5. Optimize queries as needed

---

**Production-Ready ✅**
- No localStorage
- Proper database tables
- Automated cron jobs
- Professional architecture
- Scalable and maintainable
