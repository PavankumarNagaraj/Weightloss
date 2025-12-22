import React, { useState, useEffect } from 'react';
import { Settings, Mail, Clock, Save, Bell, Database, Trash2, AlertTriangle } from 'lucide-react';
import { getSettings, saveSettings, clearAllCafeData } from '../../services/cafeService';

const CafeSettings = ({ showToast }) => {
  const [cronTime, setCronTime] = useState('23:55');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [isClearing, setIsClearing] = useState(false);

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

  const handleClearAllData = async () => {
    if (!clearPassword) {
      showToast('⚠️ Please enter password');
      return;
    }

    setIsClearing(true);

    try {
      await clearAllCafeData(clearPassword);
      showToast('✅ All cafe data cleared successfully!');
      setShowClearModal(false);
      setClearPassword('');
      
      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      showToast('❌ ' + error.message);
      setClearPassword('');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-semibold mt-1">Configure cron jobs and email notifications</p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
      </div>

      {/* Important Notice */}

      {/* Settings Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-100 p-4 sm:p-8">
        <div className="space-y-6 sm:space-y-8">
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
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


          {/* Database Info */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t-2 border-gray-100">
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-rose-700 transition shadow-lg hover:shadow-xl"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </button>
            
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Clear All Data Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900">Clear All Data</h3>
                <p className="text-sm text-gray-600">This action cannot be undone!</p>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Warning: This will permanently delete:</p>
              <ul className="text-xs text-red-700 space-y-1 ml-4">
                <li>• All orders</li>
                <li>• All menu items</li>
                <li>• All inventory</li>
                <li>• All purchases</li>
                <li>• All expenses</li>
                <li>• All investments</li>
                <li>• All weekly meal plans</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Enter Password to Confirm
              </label>
              <input
                type="password"
                value={clearPassword}
                onChange={(e) => setClearPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none font-semibold"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">Password: cafe2024</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setClearPassword('');
                }}
                disabled={isClearing}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                disabled={isClearing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-rose-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Clearing...
                  </div>
                ) : (
                  'Clear All Data'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeSettings;
