import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Upload,
  Zap,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Filter,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Flame
} from 'lucide-react';

const AttendanceNew = ({ users }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('today'); // 'today', 'calendar', 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrainer, setFilterTrainer] = useState('all');
  const [undoStack, setUndoStack] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [localUsers, setLocalUsers] = useState(users);

  // Filter by active batch
  const activeBatchId = localStorage.getItem('activeBatchId');
  const batchFilteredUsers = activeBatchId
    ? localUsers.filter(user => user.batchId === activeBatchId)
    : localUsers;

  // Get unique trainers
  const trainers = ['all', ...new Set(batchFilteredUsers.map(u => u.trainer).filter(Boolean))];

  // Filter users
  const filteredUsers = batchFilteredUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrainer = filterTrainer === 'all' || user.trainer === filterTrainer;
    return matchesSearch && matchesTrainer;
  });

  // Sync with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
      setLocalUsers(updated);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get today's date string
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Get attendance for a specific date
  const getAttendanceForDate = useCallback((dateStr) => {
    return filteredUsers.map(user => {
      const log = user.logs?.find(log => log.date.split('T')[0] === dateStr);
      return {
        userId: user.id,
        userName: user.name,
        trainer: user.trainer,
        programType: user.programType,
        attended: log?.attended || false,
        hasLog: !!log,
      };
    });
  }, [filteredUsers]);

  // Toggle attendance (with undo support)
  const toggleAttendance = useCallback((userId, dateStr, setToAttended) => {
    const allUsers = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const user = allUsers[userIndex];
    const logIndex = user.logs?.findIndex(log => log.date.split('T')[0] === dateStr);

    // Save state for undo
    const previousState = JSON.stringify(user.logs);

    if (logIndex !== -1 && logIndex !== undefined) {
      user.logs[logIndex].attended = setToAttended;
    } else {
      if (!user.logs) user.logs = [];
      user.logs.push({
        date: new Date(dateStr).toISOString(),
        attended: setToAttended,
        weight: user.logs[user.logs.length - 1]?.weight || 0,
        bmi: user.bmi || 0,
        meals: { breakfast: '', lunch: '', dinner: '' },
        foodIntake: [],
        totalCalories: 0,
      });
    }

    allUsers[userIndex] = user;
    localStorage.setItem('weightloss_users', JSON.stringify(allUsers));

    // Add to undo stack
    setUndoStack(prev => [...prev, {
      userId,
      dateStr,
      previousState,
      action: 'toggle'
    }]);

    // Update local state
    setLocalUsers(allUsers);
  }, []);

  // Bulk mark attendance
  const bulkMarkAttendance = useCallback((userIds, dateStr, setToAttended) => {
    const allUsers = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
    const previousStates = [];

    userIds.forEach(userId => {
      const userIndex = allUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) return;

      const user = allUsers[userIndex];
      previousStates.push({ userId, state: JSON.stringify(user.logs) });

      const logIndex = user.logs?.findIndex(log => log.date.split('T')[0] === dateStr);

      if (logIndex !== -1 && logIndex !== undefined) {
        user.logs[logIndex].attended = setToAttended;
      } else {
        if (!user.logs) user.logs = [];
        user.logs.push({
          date: new Date(dateStr).toISOString(),
          attended: setToAttended,
          weight: user.logs[user.logs.length - 1]?.weight || 0,
          bmi: user.bmi || 0,
          meals: { breakfast: '', lunch: '', dinner: '' },
          foodIntake: [],
          totalCalories: 0,
        });
      }

      allUsers[userIndex] = user;
    });

    localStorage.setItem('weightloss_users', JSON.stringify(allUsers));

    // Add to undo stack
    setUndoStack(prev => [...prev, {
      type: 'bulk',
      dateStr,
      previousStates,
      action: 'bulk_mark'
    }]);

    setLocalUsers(allUsers);
  }, []);

  // Undo last action
  const undoLastAction = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    const allUsers = JSON.parse(localStorage.getItem('weightloss_users') || '[]');

    if (lastAction.type === 'bulk') {
      lastAction.previousStates.forEach(({ userId, state }) => {
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          allUsers[userIndex].logs = JSON.parse(state);
        }
      });
    } else {
      const userIndex = allUsers.findIndex(u => u.id === lastAction.userId);
      if (userIndex !== -1) {
        allUsers[userIndex].logs = JSON.parse(lastAction.previousState);
      }
    }

    localStorage.setItem('weightloss_users', JSON.stringify(allUsers));
    setLocalUsers(allUsers);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack]);

  // Calculate attendance statistics
  const getAttendanceStats = useCallback((dateStr) => {
    const attendance = getAttendanceForDate(dateStr);
    const total = attendance.length;
    const attended = attendance.filter(a => a.attended && a.hasLog).length;
    const absent = attendance.filter(a => !a.attended && a.hasLog).length;
    const noLog = attendance.filter(a => !a.hasLog).length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return { total, attended, absent, noLog, percentage };
  }, [getAttendanceForDate]);

  // Get attendance streak for a user
  const getAttendanceStreak = useCallback((userId) => {
    const user = localUsers.find(u => u.id === userId);
    if (!user || !user.logs) return 0;

    const sortedLogs = [...user.logs]
      .filter(log => log.attended)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let streak = 0;
    let currentDate = new Date();

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    return streak;
  }, [localUsers]);

  // Export attendance data
  const exportAttendance = useCallback(() => {
    const data = filteredUsers.map(user => {
      const logs = user.logs || [];
      const attendedCount = logs.filter(l => l.attended).length;
      const totalLogs = logs.length;
      const percentage = totalLogs > 0 ? Math.round((attendedCount / totalLogs) * 100) : 0;

      return {
        Name: user.name,
        Trainer: user.trainer,
        Program: user.programType,
        'Total Days': totalLogs,
        'Days Attended': attendedCount,
        'Days Absent': totalLogs - attendedCount,
        'Attendance %': percentage,
        Streak: getAttendanceStreak(user.id)
      };
    });

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [filteredUsers, getAttendanceStreak]);

  // Render Today's Attendance View
  const renderTodayView = () => {
    const todayStr = getTodayStr();
    const attendance = getAttendanceForDate(todayStr);
    const stats = getAttendanceStats(todayStr);

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-blue-900">{stats.total}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-900">{stats.attended}</span>
            </div>
            <p className="text-sm font-medium text-green-700">Present Today</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-red-900">{stats.absent}</span>
            </div>
            <p className="text-sm font-medium text-red-700">Absent Today</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-900">{stats.percentage}%</span>
            </div>
            <p className="text-sm font-medium text-purple-700">Attendance Rate</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
            {undoStack.length > 0 && (
              <button
                onClick={undoLastAction}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium text-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                Undo Last Action
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => bulkMarkAttendance(filteredUsers.map(u => u.id), todayStr, true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
            >
              <Check className="w-5 h-5" />
              Mark All Present
            </button>
            <button
              onClick={() => bulkMarkAttendance(filteredUsers.map(u => u.id), todayStr, false)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
            >
              <X className="w-5 h-5" />
              Mark All Absent
            </button>
            <button
              onClick={exportAttendance}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Mark Attendance ({attendance.length} users)</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>
              <select
                value={filterTrainer}
                onChange={(e) => setFilterTrainer(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              >
                {trainers.map(trainer => (
                  <option key={trainer} value={trainer}>
                    {trainer === 'all' ? 'All Trainers' : trainer}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {attendance.map(user => {
              const streak = getAttendanceStreak(user.userId);
              return (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-4 h-4 rounded-full ${user.attended && user.hasLog ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{user.userName}</p>
                        {streak > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 rounded-full">
                            <Flame className="w-3 h-3 text-orange-600" />
                            <span className="text-xs font-bold text-orange-700">{streak} day streak</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.trainer} • {user.programType}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAttendance(user.userId, todayStr, true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        user.attended && user.hasLog
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleAttendance(user.userId, todayStr, false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        !user.attended || !user.hasLog
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
        <p className="text-gray-600 mt-2">Smart attendance tracking with bulk operations and analytics</p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('today')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            viewMode === 'today'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          Today's Attendance
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            viewMode === 'calendar'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          Calendar View
        </button>
        <button
          onClick={() => setViewMode('analytics')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            viewMode === 'analytics'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Analytics
        </button>
      </div>

      {/* Content */}
      {viewMode === 'today' && renderTodayView()}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">Calendar view coming soon...</p>
        </div>
      )}
      {viewMode === 'analytics' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">Analytics view coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceNew;
