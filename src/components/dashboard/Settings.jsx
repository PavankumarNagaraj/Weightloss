import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, CheckCircle, Save } from 'lucide-react';

const Settings = ({ batches }) => {
  const [activeBatchId, setActiveBatchId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load active batch from localStorage
    const savedActiveBatch = localStorage.getItem('activeBatchId');
    if (savedActiveBatch) {
      setActiveBatchId(savedActiveBatch);
    } else if (batches.length > 0) {
      // Default to first active batch
      const firstActive = batches.find(b => b.status === 'active');
      if (firstActive) {
        setActiveBatchId(firstActive.id);
      }
    }
  }, [batches]);

  const handleSave = () => {
    localStorage.setItem('activeBatchId', activeBatchId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Reload to apply changes
    window.location.reload();
  };

  const activeBatch = batches.find(b => b.id === activeBatchId);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Configure system preferences</p>
      </div>

      <div className="max-w-3xl">
        {/* Active Batch Setting */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Active Batch</h2>
              <p className="text-gray-600 text-sm">
                Select the default batch for dashboard and reports. Only data from the active batch will be displayed.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Active Batch
              </label>
              <select
                value={activeBatchId}
                onChange={(e) => setActiveBatchId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">No Active Batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} ({batch.status}) - {new Date(batch.startDate).toLocaleDateString()} to {new Date(batch.endDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {activeBatch && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Currently Active: {activeBatch.name}</p>
                    <p className="text-sm text-blue-700 mt-1">{activeBatch.description}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      Status: <span className="font-medium">{activeBatch.status}</span> | 
                      Duration: {new Date(activeBatch.startDate).toLocaleDateString()} - {new Date(activeBatch.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 text-sm font-medium">Settings saved successfully!</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Important Information</h3>
          <ul className="space-y-1 text-sm text-yellow-800">
            <li>• Dashboard statistics will only show data from the active batch</li>
            <li>• Reports will be filtered to include only active batch members</li>
            <li>• Users not in the active batch will still be accessible but won't appear in main views</li>
            <li>• You can change the active batch at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
