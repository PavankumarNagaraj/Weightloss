import React, { useState, useEffect } from 'react';
import { Activity, Check, X, RefreshCw } from 'lucide-react';
import { isGoogleLinked, getGoogleAccount, unlinkGoogleAccount } from '../services/userAuthService';
import { syncTodaySteps, initGoogleAuth } from '../services/googleFitService';

const GoogleFitConnect = ({ userId }) => {
  const [isLinked, setIsLinked] = useState(false);
  const [googleAccount, setGoogleAccount] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [todaySteps, setTodaySteps] = useState(null);

  useEffect(() => {
    checkGoogleLink();
  }, [userId]);

  const checkGoogleLink = () => {
    const linked = isGoogleLinked(userId);
    setIsLinked(linked);
    
    if (linked) {
      const account = getGoogleAccount(userId);
      setGoogleAccount(account);
    }
  };

  const handleConnect = () => {
    // TODO: Implement Google OAuth flow
    alert('Google Fit integration coming soon!\n\nThis will allow automatic step count tracking from your Google Fit app.');
    
    // Future implementation:
    // initGoogleAuth();
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const steps = await syncTodaySteps(userId);
      setTodaySteps(steps);
      setLastSync(new Date());
      alert(`Synced ${steps} steps from Google Fit!`);
    } catch (error) {
      alert('Failed to sync steps. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Google Fit?')) {
      unlinkGoogleAccount(userId);
      setIsLinked(false);
      setGoogleAccount(null);
      setTodaySteps(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${isLinked ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Activity className={`w-6 h-6 ${isLinked ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Google Fit Integration</h3>
            <p className="text-sm text-gray-600">
              {isLinked ? 'Connected' : 'Auto-sync your step count'}
            </p>
          </div>
        </div>
        
        {isLinked ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            <Check className="w-4 h-4" />
            Connected
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            <X className="w-4 h-4" />
            Not Connected
          </div>
        )}
      </div>

      {isLinked ? (
        <div className="space-y-4">
          {/* Google Account Info */}
          {googleAccount && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {googleAccount.picture && (
                <img 
                  src={googleAccount.picture} 
                  alt={googleAccount.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{googleAccount.name}</p>
                <p className="text-sm text-gray-600">{googleAccount.email}</p>
              </div>
            </div>
          )}

          {/* Today's Steps */}
          {todaySteps !== null && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Today's Steps</div>
              <div className="text-3xl font-bold text-blue-600">{todaySteps.toLocaleString()}</div>
              {lastSync && (
                <div className="text-xs text-gray-500 mt-1">
                  Last synced: {lastSync.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
            >
              Disconnect
            </button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">📱 Automatic Sync</p>
            <p>Your step count will be automatically synced from Google Fit when you log your daily weight.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Automatic step count tracking</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Sync activity data from your phone</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Better insights into your fitness journey</span>
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Connect Google Fit
          </button>

          {/* Privacy Note */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">🔒 Privacy & Security</p>
            <p>We only access your step count and activity data. You can disconnect anytime.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleFitConnect;
