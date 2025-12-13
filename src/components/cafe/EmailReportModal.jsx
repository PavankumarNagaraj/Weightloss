import React, { useState, useEffect } from 'react';
import { Mail, X, Send } from 'lucide-react';
import { sendDailyReport, getEmailSettings, saveEmailSettings } from '../../services/emailService';

const EmailReportModal = ({ showToast, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);

  useEffect(() => {
    // Load saved email settings
    const settings = getEmailSettings();
    if (settings) {
      setEmail(settings.email || '');
      setName(settings.name || '');
    }
  }, []);

  const handleSendEmail = async () => {
    if (!email) {
      showToast('⚠️ Please enter an email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('⚠️ Please enter a valid email address');
      return;
    }

    setSending(true);

    try {
      // Save email settings if remember is checked
      if (rememberEmail) {
        saveEmailSettings({ email, name: name || 'Cafe Manager', autoSend: false });
      }

      // Send the daily report
      const result = await sendDailyReport(email, name || 'Cafe Manager');

      if (result.success) {
        showToast(`✅ Daily report sent successfully to ${email}`);
        onClose();
      } else {
        showToast(`❌ Failed to send email: ${result.error}`);
      }
    } catch (error) {
      showToast(`❌ Error sending email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Send Daily Report</h3>
              <p className="text-sm text-gray-600">Email today's cafe report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cafe Manager"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
              disabled={sending}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberEmail"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={sending}
            />
            <label htmlFor="rememberEmail" className="text-sm text-gray-700">
              Remember email for next time
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Report includes:</strong> Today's orders, revenue, expenses, low stock items, and credit orders.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-200 rounded-xl transition"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={sending}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailReportModal;
