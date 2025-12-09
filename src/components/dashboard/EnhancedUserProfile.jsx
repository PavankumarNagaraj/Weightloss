import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingDown, 
  Target, 
  Activity,
  MessageCircle,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Flame
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getUserJourneyStage, getStageInfo, getEngagementScore } from '../../services/prioritiesService';
import { Line } from 'react-chartjs-2';

const EnhancedUserProfile = ({ user, onClose, onUpdateUser, showToast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState(user.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const stage = getUserJourneyStage(user);
  const stageInfo = getStageInfo(stage);
  const engagementScore = getEngagementScore(user);

  // Calculate stats
  const daysInProgram = user.startDate 
    ? differenceInDays(new Date(), parseISO(user.startDate))
    : 0;
  
  const weightLost = user.startWeight && user.currentWeight
    ? (user.startWeight - user.currentWeight).toFixed(1)
    : 0;
  
  const progressPercent = user.startWeight && user.goalWeight
    ? ((user.startWeight - user.currentWeight) / (user.startWeight - user.goalWeight)) * 100
    : 0;

  const daysRemaining = user.endDate
    ? differenceInDays(parseISO(user.endDate), new Date())
    : 0;

  // Get last log
  const lastLog = user.logs && user.logs.length > 0
    ? [...user.logs].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  const daysSinceLastLog = lastLog
    ? differenceInDays(new Date(), parseISO(lastLog.date))
    : null;

  // Prepare chart data
  const chartData = {
    labels: user.logs?.slice(-10).map(log => format(parseISO(log.date), 'MMM dd')) || [],
    datasets: [
      {
        label: 'Weight (kg)',
        data: user.logs?.slice(-10).map(log => log.weight) || [],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => value + 'kg'
        }
      }
    }
  };

  const handleWhatsAppMessage = (template) => {
    const phone = user.phone?.replace(/\D/g, ''); // Remove non-digits
    if (!phone) {
      showToast?.('Phone number not available', 'error');
      return;
    }

    let message = '';
    switch (template) {
      case 'reminder':
        message = `Hi ${user.name}, haven't seen your log in ${daysSinceLastLog} days. Everything okay? Let's keep the momentum going! 💪`;
        break;
      case 'milestone':
        message = `Congratulations ${user.name}! You've lost ${weightLost}kg! Amazing progress! Keep it up! 🎉`;
        break;
      case 'checkin':
        message = `Hi ${user.name}, time for your weekly check-in! How are you feeling? Any challenges I can help with?`;
        break;
      case 'motivation':
        message = `Hey ${user.name}! Just checking in to say you're doing great! ${progressPercent.toFixed(0)}% to your goal. Keep pushing! 🔥`;
        break;
      default:
        message = `Hi ${user.name}, `;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await onUpdateUser({ ...user, notes });
      showToast?.('Notes saved successfully', 'success');
    } catch (error) {
      showToast?.('Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-white/90">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Journey Stage Banner */}
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stageInfo.icon}</span>
            <div>
              <p className="font-bold text-gray-800">{stageInfo.name} Stage</p>
              <p className="text-sm text-gray-600">{stageInfo.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Engagement Score</p>
            <p className="text-2xl font-bold text-primary">{engagementScore}/100</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 border-b">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="w-5 h-5 text-green-500" />
              <p className="text-sm text-gray-600">Weight Lost</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weightLost}kg</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-gray-600">Progress</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{Math.round(progressPercent)}%</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-purple-500" />
              <p className="text-sm text-gray-600">Days In</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{daysInProgram}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-gray-600">Last Active</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {daysSinceLastLog !== null ? `${daysSinceLastLog}d` : 'Never'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Start: {user.startWeight}kg</span>
            <span>Current: {user.currentWeight}kg</span>
            <span>Goal: {user.goalWeight}kg</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all flex items-center justify-end pr-2"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            >
              {progressPercent > 10 && (
                <span className="text-xs text-white font-bold">
                  {Math.round(progressPercent)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{daysInProgram} days completed</span>
            <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Program ended'}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 bg-white border-b">
          <p className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleWhatsAppMessage('reminder')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Send Reminder
            </button>
            <button
              onClick={() => handleWhatsAppMessage('checkin')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
            >
              <Phone className="w-4 h-4" />
              Schedule Check-in
            </button>
            <button
              onClick={() => handleWhatsAppMessage('milestone')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
            >
              <Flame className="w-4 h-4" />
              Celebrate
            </button>
            <button
              onClick={() => handleWhatsAppMessage('motivation')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
            >
              <Target className="w-4 h-4" />
              Motivate
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {['overview', 'logs', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Weight Chart */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Weight Progress</h3>
                <div className="h-64 bg-gray-50 rounded-lg p-4">
                  {user.logs && user.logs.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No weight data available
                    </div>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Program Type</p>
                  <p className="font-semibold text-gray-800">{user.programType || 'Not set'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Trainer</p>
                  <p className="font-semibold text-gray-800">{user.trainer || 'Not assigned'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Batch</p>
                  <p className="font-semibold text-gray-800">{user.batchName || 'Not assigned'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className={`font-semibold ${
                    user.paymentStatus === 'paid' ? 'text-green-600' :
                    user.paymentStatus === 'pending' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {user.paymentStatus || 'Not set'}
                  </p>
                </div>
              </div>

              {/* Alerts */}
              {daysSinceLastLog !== null && daysSinceLastLog >= 3 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Inactive User</p>
                    <p className="text-sm text-red-600">
                      No activity for {daysSinceLastLog} days. Consider reaching out.
                    </p>
                  </div>
                </div>
              )}

              {progressPercent >= 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Goal Achieved!</p>
                    <p className="text-sm text-green-600">
                      User has reached their goal weight. Time to celebrate! 🎉
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 mb-4">Recent Logs</h3>
              {user.logs && user.logs.length > 0 ? (
                [...user.logs]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 20)
                  .map((log, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-800">
                          {format(parseISO(log.date), 'MMMM dd, yyyy')}
                        </p>
                        <span className="text-sm font-bold text-primary">
                          {log.weight}kg
                        </span>
                      </div>
                      {log.breakfast && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Breakfast:</span> {log.breakfast}
                        </p>
                      )}
                      {log.lunch && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Lunch:</span> {log.lunch}
                        </p>
                      )}
                      {log.dinner && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Dinner:</span> {log.dinner}
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{log.notes}</p>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center text-gray-400 py-12">
                  No logs available
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Trainer Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this user..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserProfile;
