# 🔍 Test Google Fit Data Directly

The aggregated data is empty. Let's query the raw data sources directly.

## Test in Browser Console:

```javascript
// Get session token
import('http://localhost:5173/src/config/supabaseClient.js').then(async module => {
  const supabase = module.default;
  const { data: { session } } = await supabase.auth.getSession();
  const token = session.provider_token;
  
  // Get today's timestamps
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTimeMillis = startOfDay.getTime();
  const endTimeMillis = now.getTime();
  
  console.log('Time range:', {
    start: new Date(startTimeMillis),
    end: new Date(endTimeMillis)
  });
  
  // Try querying the merge_step_deltas data source directly
  const dataSourceId = 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas';
  
  const response = await fetch(
    `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets/${startTimeMillis}000000-${endTimeMillis}000000`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  console.log('Direct query result:', data);
  
  // Calculate total steps
  let totalSteps = 0;
  if (data.point) {
    data.point.forEach(p => {
      totalSteps += p.value[0].intVal;
    });
  }
  
  console.log('Total steps:', totalSteps);
});
```

Run this in the console and tell me what you see!
