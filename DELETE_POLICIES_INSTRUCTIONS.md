# Clear All Data - Delete Policies Setup

## Issue
The "Clear All Data" button is not deleting records because Supabase RLS (Row Level Security) policies are blocking DELETE operations on the cafe tables.

## Solution
You need to add DELETE policies to all cafe tables in Supabase.

## Steps to Fix

### Option 1: Run SQL Migration (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Migration**
   - Copy the contents of `supabase_migrations/add_delete_policies.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Success**
   - You should see a success message
   - The Clear All Data button will now work

### Option 2: Manual Policy Creation

If you prefer to add policies manually through the UI:

1. Go to **Authentication** → **Policies** in Supabase Dashboard
2. For each table below, add a DELETE policy:
   - `cafe_orders`
   - `cafe_menu`
   - `cafe_inventory`
   - `cafe_purchases`
   - `cafe_expenses`
   - `cafe_investments`
   - `cafe_settings`

3. Policy settings for each:
   - **Policy name**: "Enable delete access for all users"
   - **Allowed operation**: DELETE
   - **Policy definition**: `true`
   - **WITH CHECK expression**: (leave empty)

## After Setup

Once the DELETE policies are added:

1. Go to Cafe Management → Settings
2. Click "Clear All Data" button
3. Enter password: `cafe2024`
4. Click "Clear All Data"
5. All records will be deleted successfully

## Security Note

The DELETE policies allow all authenticated users to delete data. If you need more restrictive access:
- Modify the policy to check for specific user roles
- Add authentication requirements
- Use custom claims or JWT tokens

Example restrictive policy:
```sql
CREATE POLICY "Enable delete for admin only" ON public.cafe_orders
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

## Troubleshooting

If Clear All Data still doesn't work after adding policies:

1. **Check RLS is enabled**: 
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename LIKE 'cafe_%';
   ```

2. **Verify policies exist**:
   ```sql
   SELECT schemaname, tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename LIKE 'cafe_%';
   ```

3. **Test delete manually**:
   ```sql
   DELETE FROM cafe_orders WHERE id > 0;
   ```

4. **Check browser console** for error messages when clicking Clear All Data

## Contact
If issues persist, check the Supabase logs in the Dashboard under "Logs" → "Postgres Logs"
