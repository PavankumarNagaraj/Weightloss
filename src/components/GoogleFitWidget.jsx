import React, { useState, useEffect } from 'react';
import { Activity, Heart, Footprints, Flame, Moon, RefreshCw, ChevronLeft, ChevronRight, Database, Cloud, Calendar } from 'lucide-react';
import { isConnected } from '../services/googleFitClient';
import { getFitnessData, syncFitnessDataForDate } from '../services/googleFitSync';
import { getRangeStats } from '../services/googleFitRanges';
import { useAuth } from '../contexts/AuthContext';

const GoogleFitWidget = () => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'range'
  const [selectedRange, setSelectedRange] = useState('today');

  useEffect(() => {
    checkConnectionAndLoadData();
  }, [selectedDate, selectedRange, viewMode]);

  const checkConnectionAndLoadData = async () => {
    try {
      setLoading(true);
      const isGoogleConnected = await isConnected();
      setConnected(isGoogleConnected);

      if (isGoogleConnected && user) {
        if (viewMode === 'range') {
          // Fetch range stats
          const data = await getRangeStats(user.id, selectedRange);
          setStats(data);
        } else {
          // Fetch single day
          const data = await getFitnessData(user.id, selectedDate);
          setStats(data);
        }
      }
    } catch (err) {
      console.error('Error loading Google Fit data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      // Force sync from Google Fit
      const data = await syncFitnessDataForDate(user.id, selectedDate);
      setStats({ ...data, fromCache: false });
    } catch (err) {
      console.error('Error syncing:', err);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading Google Fit data...</span>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Activity className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Google Fit Not Connected
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Connect Google Fit to automatically track activity, heart rate, and sleep data.
            </p>
            <button
              onClick={() => window.location.href = '/weightloss/auth'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Connect Google Fit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">Error loading fitness data: {error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const rangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'currentMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            {viewMode === 'range' ? stats?.period || 'Activity' : 'Today\'s Activity'}
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={syncing}
          className="p-2 hover:bg-white/50 rounded-lg transition disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Range Selector */}
      <div className="mb-4">
        <select
          value={selectedRange}
          onChange={(e) => {
            setSelectedRange(e.target.value);
            setViewMode('range');
          }}
          className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {rangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Steps */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Footprints className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-gray-600 font-medium">Steps</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(viewMode === 'range' ? stats.totalSteps : stats.steps)?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {viewMode === 'range' 
              ? `Avg: ${stats.avgSteps?.toLocaleString() || 0}/day`
              : `${((stats.distance || 0) / 1000).toFixed(2)} km`
            }
          </div>
        </div>

        {/* Calories */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="text-xs text-gray-600 font-medium">Calories</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(viewMode === 'range' ? stats.totalCalories : stats.calories_burned || stats.calories) || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {viewMode === 'range'
              ? `Avg: ${stats.avgCalories || 0}/day`
              : `${stats.active_minutes || stats.activeMinutes || 0} active mins`
            }
          </div>
        </div>

        {/* Heart Rate */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="text-xs text-gray-600 font-medium">Heart Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.heartRate?.avg || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.heartRate?.min || 0} - {stats.heartRate?.max || 0} bpm
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-gray-600 font-medium">Sleep</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.sleep?.hours || 0}h
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last night
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stats.fromCache ? (
            <>
              <Database className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Cached ({stats.cacheAge || 0} min ago)
              </span>
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">
                Live from Google Fit
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {new Date(stats.synced_at || stats.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default GoogleFitWidget;
