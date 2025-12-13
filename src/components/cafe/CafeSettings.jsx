import React, { useState, useEffect } from 'react';
import { Settings, Mail, Clock, Save, Bell, Database } from 'lucide-react';
import { getSettings, saveSettings } from '../../services/cafeService';

const CafeSettings = ({ showToast }) => {
  const [cronTime, setCronTime] = useState('23:55');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setCronTime(settings.cron_time || '23:55');
    setRecipientEmail(settings.recipient_email || '');
    setRecipientName(settings.recipient_name || '');
    setAutoSendEnabled(settings.auto_send_enabled !== false);
  };

  const handleSaveSettings = async () => {
    if (!recipientEmail) {
      showToast('⚠️ Please enter a recipient email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      showToast('⚠️ Please enter a valid email address');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(cronTime)) {
      showToast('⚠️ Please enter a valid time (HH:MM)');
      return;
    }

    setSaving(true);

    try {
      const settingsData = {
        cronTime,
        recipientEmail,
        recipientName,
        autoSendEnabled,
      };

      await saveSettings(settingsData);

      showToast('✅ Settings saved successfully!');
      setTimeout(() => {
        showToast(`📧 Daily reports will be sent to ${recipientEmail} at ${cronTime} IST`);
      }, 1000);
    } catch (error) {
      showToast('❌ Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const convertToUTC = (istTime) => {
    const [hours, minutes] = istTime.split(':').map(Number);
    let utcHours = hours - 5;
    let utcMinutes = minutes - 30;
    
    if (utcMinutes < 0) {
      utcMinutes += 60;
      utcHours -= 1;
    }
    
    if (utcHours < 0) {
      utcHours += 24;
    }
    
    return `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-gray-600 font-semibold mt-1">Configure cron jobs and email notifications</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
          <Settings className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
        <div className="space-y-8">
          {/* Email Configuration Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Email Configuration</h3>
            </div>

            <div className="space-y-4 ml-11">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="manager@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Daily reports will be sent to this email</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Cafe Manager"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cron Schedule Section */}
          <div className="border-t-2 border-gray-100 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cron Schedule</h3>
            </div>

            <div className="space-y-4 ml-11">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily Report Time (IST) *
                </label>
                <input
                  type="time"
                  value={cronTime}
                  onChange={(e) => setCronTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Reports will be sent daily at this time (Indian Standard Time)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  UTC Time: {convertToUTC(cronTime)} (for Supabase cron configuration)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoSendEnabled"
                  checked={autoSendEnabled}
                  onChange={(e) => setAutoSendEnabled(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="autoSendEnabled" className="text-sm font-semibold text-gray-700">
                  Enable automatic daily reports
                </label>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Bell className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900 mb-2">How it works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Daily reports are sent automatically via Supabase Edge Functions</li>
                  <li>• Reports include: orders, revenue, expenses, low stock items, and credit orders</li>
                  <li>• Email is sent using Brevo API for reliable delivery</li>
                  <li>• You can also manually send reports from any tab using the "Email Report" button</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Database className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-green-900 mb-2">Supabase Cron Configuration</h4>
                <p className="text-sm text-green-800 mb-2">
                  To update the cron schedule in Supabase, run this SQL command:
                </p>
                <pre className="bg-white/50 border border-green-300 rounded-lg p-3 text-xs font-mono text-green-900 overflow-x-auto">
{`SELECT cron.schedule(
  'daily-email-report',
  '${convertToUTC(cronTime).split(':')[1]} ${convertToUTC(cronTime).split(':')[0]} * * *',
  $$
  SELECT net.http_post(
    url:='https://capvowxxembnycdonghv.supabase.co/functions/v1/daily-email-cron',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);`}
                </pre>
                <p className="text-xs text-green-700 mt-2">
                  Note: Cron schedule uses UTC time. The command above is already converted from IST.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeSettings;
