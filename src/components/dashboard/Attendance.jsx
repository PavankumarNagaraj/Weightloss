import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

const Attendance = ({ users }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'individual'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrainer, setFilterTrainer] = useState('all');

  // Filter by active batch first
  const activeBatchId = localStorage.getItem('activeBatchId');
  const batchFilteredUsers = activeBatchId 
    ? users.filter(user => user.batchId === activeBatchId)
    : users;

  // Get unique trainers from batch-filtered users
  const trainers = ['all', ...new Set(batchFilteredUsers.map(u => u.trainer).filter(Boolean))];

  // Filter users based on search and trainer
  const filteredUsers = batchFilteredUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrainer = filterTrainer === 'all' || user.trainer === filterTrainer;
    return matchesSearch && matchesTrainer;
  });

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // Get attendance for a specific date
  const getAttendanceForDate = (day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    
    if (viewMode === 'all') {
      return filteredUsers.map(user => {
        const log = user.logs?.find(log => log.date.split('T')[0] === dateStr);
        return {
          userId: user.id,
          userName: user.name,
          trainer: user.trainer,
          attended: log?.attended || false,
          hasLog: !!log,
        };
      });
    } else if (selectedUser) {
      const log = selectedUser.logs?.find(log => log.date.split('T')[0] === dateStr);
      return {
        attended: log?.attended || false,
        hasLog: !!log,
      };
    }
    return [];
  };

  // Get date status for calendar
  const getDateStatus = (day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (dateStr > today) return null;

    if (viewMode === 'all') {
      const attendance = getAttendanceForDate(day);
      const attendedCount = attendance.filter(a => a.attended && a.hasLog).length;
      const totalWithLogs = attendance.filter(a => a.hasLog).length;
      
      if (totalWithLogs === 0) return null;
      
      const percentage = (attendedCount / totalWithLogs) * 100;
      if (percentage === 100) return 'full';
      if (percentage >= 50) return 'partial';
      return 'low';
    } else if (selectedUser) {
      const attendance = getAttendanceForDate(day);
      if (!attendance.hasLog) return null;
      return attendance.attended ? 'attended' : 'absent';
    }
    return null;
  };

  // Toggle attendance for a user on a specific date
  const toggleAttendance = (userId, dateStr, setToAttended) => {
    // This would update the user's log in localStorage
    const allUsers = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const user = allUsers[userIndex];
    const logIndex = user.logs?.findIndex(log => log.date.split('T')[0] === dateStr);

    if (logIndex !== -1 && logIndex !== undefined) {
      // Update existing log
      user.logs[logIndex].attended = setToAttended;
    } else {
      // Create new log for that date
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

    // Update localStorage
    allUsers[userIndex] = user;
    localStorage.setItem('weightloss_users', JSON.stringify(allUsers));

    // Trigger re-render by updating parent component
    if (window.dispatchEvent) {
      window.dispatchEvent(new Event('storage'));
    }
    
    // Force component re-render
    window.location.reload();
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const status = getDateStatus(day);
      const isSelected = selectedDate === day;

      days.push(
        <div
          key={day}
          onClick={() => !isFuture && setSelectedDate(day)}
          className={`
            h-16 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
            ${isToday ? 'ring-2 ring-primary' : ''}
            ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'}
            ${isFuture ? 'opacity-40 cursor-not-allowed' : ''}
          `}
        >
          <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
            {day}
          </span>
          {status && !isSelected && (
            <div className="flex gap-0.5 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'full' || status === 'attended' ? 'bg-green-500' :
                  status === 'partial' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
              ></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Render selected date details with edit capability
  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const attendance = getAttendanceForDate(selectedDate);
    const dateStr = new Date(year, month, selectedDate).toISOString().split('T')[0];
    const dateDisplay = new Date(year, month, selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (viewMode === 'all') {
      const attendedUsers = attendance.filter(a => a.attended && a.hasLog);
      const absentUsers = attendance.filter(a => !a.attended && a.hasLog);
      const noLogUsers = attendance.filter(a => !a.hasLog);

      return (
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{dateDisplay}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Attended</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{attendedUsers.length}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Absent</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{absentUsers.length}</p>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">No Log</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{noLogUsers.length}</p>
            </div>
          </div>

          {/* Editable User List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 mb-3">Mark Attendance:</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {attendance.map(user => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${user.attended && user.hasLog ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-800">{user.userName}</p>
                      <p className="text-xs text-gray-500">{user.trainer}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAttendance(user.userId, dateStr, true)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        user.attended && user.hasLog
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Mark Present
                    </button>
                    <button
                      onClick={() => toggleAttendance(user.userId, dateStr, false)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        !user.attended || !user.hasLog
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Mark Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (selectedUser) {
      const attendance = getAttendanceForDate(selectedDate);
      
      if (!attendance.hasLog) {
        return (
          <div className="mt-6 bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-600">{dateDisplay}</p>
            <p className="text-gray-500 mt-2">No log recorded for this day</p>
            <button
              onClick={() => toggleAttendance(selectedUser.id, dateStr, true)}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Mark as Present
            </button>
          </div>
        );
      }

      return (
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{dateDisplay}</h3>
          <div className={`${attendance.attended ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
            <div className="flex items-center gap-4 mb-4">
              {attendance.attended ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
              <div>
                <p className={`text-xl font-bold ${attendance.attended ? 'text-green-800' : 'text-red-800'}`}>
                  {attendance.attended ? 'Present' : 'Absent'}
                </p>
                <p className={`text-sm ${attendance.attended ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedUser.name}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => toggleAttendance(selectedUser.id, dateStr, true)}
                className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition ${
                  attendance.attended
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Mark as Present
              </button>
              <button
                onClick={() => toggleAttendance(selectedUser.id, dateStr, false)}
                className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition ${
                  !attendance.attended
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Mark as Absent
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
        <p className="text-gray-600 mt-2">Track and manage user attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Selection Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">View Mode</h2>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setViewMode('all');
                setSelectedUser(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'individual'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Individual
            </button>
          </div>

          {/* Filters */}
          {viewMode === 'all' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Trainer
                </label>
                <select
                  value={filterTrainer}
                  onChange={(e) => setFilterTrainer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {trainers.map(trainer => (
                    <option key={trainer} value={trainer}>
                      {trainer === 'all' ? 'All Trainers' : trainer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium">Showing {filteredUsers.length} users</p>
              </div>
            </>
          )}

          {/* Individual User Selection */}
          {viewMode === 'individual' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedUser?.id === user.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <p className={`font-medium ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-800'}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs ${selectedUser?.id === user.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {user.trainer} • {user.programType}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {viewMode === 'all' ? 'All Users Attendance' : selectedUser ? `${selectedUser.name}'s Attendance` : 'Select a User'}
                </h2>
                <p className="text-sm text-gray-600">
                  {viewMode === 'all' ? `Tracking ${filteredUsers.length} users` : 'Individual attendance tracking'}
                </p>
              </div>
            </div>
          </div>

          {(viewMode === 'all' || selectedUser) && (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-bold text-gray-800">
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-3">Legend:</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  {viewMode === 'all' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">100% Attendance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-600">50-99% Attendance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">&lt;50% Attendance</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">Absent</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                    <span className="text-gray-600">Today</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Details */}
              {renderSelectedDateDetails()}
            </>
          )}

          {viewMode === 'individual' && !selectedUser && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Select a user to view their attendance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
