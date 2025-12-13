# Adding Email Button to All Cafe Tabs

## Components Created:
1. ✅ `EmailReportModal.jsx` - Modal for email input
2. ✅ `withEmailButton.jsx` - HOC and standalone button component
3. ✅ `CafeTabHeader.jsx` - Reusable header component

## How to Add Email Button to Each Tab:

### Option 1: Add Standalone Button (Recommended)

For each cafe component, add these imports:
```javascript
import { Mail } from 'lucide-react';
import EmailReportModal from './EmailReportModal';
```

Add state:
```javascript
const [showEmailModal, setShowEmailModal] = useState(false);
```

In the header section, add the email button alongside existing buttons:
```javascript
<div className="flex items-center gap-3">
  <button
    onClick={() => setShowEmailModal(true)}
    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    title="Send Daily Report via Email"
  >
    <Mail className="w-5 h-5" />
    Email Report
  </button>
  {/* Other buttons */}
</div>
```

Add modal at the end of the return statement:
```javascript
{showEmailModal && (
  <EmailReportModal
    showToast={showToast}
    onClose={() => setShowEmailModal(false)}
  />
)}
```

## Components to Update:
- [x] CafeDashboard (already has email button)
- [ ] CafeOrders
- [ ] CafeMenu
- [ ] CafeInventory
- [ ] CafePurchases
- [ ] CafeExpenses
- [ ] CafeReports
- [ ] CafeSalesAnalytics
- [ ] CafeProfitLoss
- [ ] CafeSubscriptionOrders
- [ ] CafeInvestments

## Testing:
1. Click "Email Report" button on any tab
2. Modal should appear asking for email address
3. Enter email and click "Send Report"
4. Daily report should be sent to the specified email
5. Modal should close after successful send
