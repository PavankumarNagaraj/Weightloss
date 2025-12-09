import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Footprints,
  Flame,
  Clock,
  Moon,
  TrendingUp,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  isGoogleFitConnected,
  connectGoogleFit,
  disconnectGoogleFit,
  getTodayStats,
  getWeeklySummary,
  autoSyncGoogleFit,
} from '../services/googleFit';

const GoogleFitDashboard = ({ userId }) => {
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [userId]);

  useEffect(() => {
    if (connected) {
      loadData();
    }
  }, [connected, userId]);

  const checkConnection = async () => {
    try {
      const status = await isGoogleFitConnected(userId);
      setConnected(status.connected);
      setLastSync(status.lastSync);
      setLoading(false);
    } catch (error) {
      console.error('Error checking connection:', error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [today, weekly] = await Promise.all([
        getTodayStats(userId),
        getWeeklySummary(userId),
      ]);
      setTodayStats(today);
      setWeeklySummary(weekly);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleConnect = async () => {
    try {
      await connectGoogleFit();
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Failed to connect Google Fit. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Fit?')) {
      return;
    }

    try {
      await disconnectGoogleFit();
      setConnected(false);
      setTodayStats(null);
      setWeeklySummary(null);
      alert('Google Fit disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect Google Fit');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await autoSyncGoogleFit(userId);
      if (result.success) {
        await loadData();
        await checkConnection();
        alert('Data synced successfully!');
      } else {
        alert('Failed to sync data: ' + (result.message || result.error));
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Google Fit
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Sync your fitness data from Google Fit to track your progress automatically.
            We'll import steps, calories, heart rate, sleep, and more.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <h4 className="font-semibold text-gray-900 mb-2">What we'll access:</h4>
            <ul className="text-sm text-gray-700 space-y-1 text-left">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Activity data (steps, distance, calories)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Heart rate data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Sleep data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Body measurements
              </li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 text-left">
                <strong>Read-only access:</strong> We can only read your data. We cannot
                modify or delete anything from your Google Fit account.
              </p>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <LinkIcon className="w-5 h-5" />
            Connect Google Fit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Google Fit Connected</h3>
            <p className="text-blue-100 text-sm">
              Last synced: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Unlink className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      {todayStats && (
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">Today's Activity</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Footprints className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {todayStats.steps?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Steps</div>
              <div className="mt-2 text-xs text-gray-500">
                {((todayStats.distance || 0) / 1000).toFixed(2)} km
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {todayStats.calories_burned || 0}
              </div>
              <div className="text-sm text-gray-600">Calories Burned</div>
              <div className="mt-2 text-xs text-gray-500">
                {todayStats.active_minutes || 0} active mins
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {todayStats.heart_rate_avg || 0}
              </div>
              <div className="text-sm text-gray-600">Avg Heart Rate</div>
              <div className="mt-2 text-xs text-gray-500">
                {todayStats.heart_rate_min || 0} - {todayStats.heart_rate_max || 0} bpm
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {weeklySummary && (
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Last 7 Days Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Footprints className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Total Steps</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {weeklySummary.totalSteps.toLocaleString()}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Avg: {Math.round(weeklySummary.totalSteps / 7).toLocaleString()}/day
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-semibold text-orange-900">
                  Total Calories
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {weeklySummary.totalCalories.toLocaleString()}
              </div>
              <div className="text-xs text-orange-700 mt-1">
                Avg: {Math.round(weeklySummary.totalCalories / 7)}/day
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">
                  Active Time
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {weeklySummary.totalActiveMinutes} min
              </div>
              <div className="text-xs text-green-700 mt-1">
                Avg: {Math.round(weeklySummary.totalActiveMinutes / 7)} min/day
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Moon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Sleep</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {Math.round(weeklySummary.totalSleep / 60)}h
              </div>
              <div className="text-xs text-purple-700 mt-1">
                Avg: {Math.round(weeklySummary.totalSleep / 7 / 60)}h/night
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleFitDashboard;
