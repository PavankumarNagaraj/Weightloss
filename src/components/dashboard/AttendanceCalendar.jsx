import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, CheckCircle, XCircle } from 'lucide-react';

const AttendanceCalendar = ({ users, isAdmin = false, currentUser = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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
    
    if (isAdmin) {
      // Admin view: get all users' attendance
      return users.map(user => {
        const log = user.logs?.find(log => log.date.split('T')[0] === dateStr);
        return {
          userId: user.id,
          userName: user.name,
          attended: log?.attended || false,
          hasLog: !!log,
        };
      });
    } else {
      // User view: get current user's attendance
      const log = currentUser?.logs?.find(log => log.date.split('T')[0] === dateStr);
      return {
        attended: log?.attended || false,
        hasLog: !!log,
      };
    }
  };

  // Get attendance status for calendar dot
  const getDateStatus = (day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (dateStr > today) return null; // Future date

    if (isAdmin) {
      const attendance = getAttendanceForDate(day);
      const attendedCount = attendance.filter(a => a.attended && a.hasLog).length;
      const totalWithLogs = attendance.filter(a => a.hasLog).length;
      
      if (totalWithLogs === 0) return null;
      
      const percentage = (attendedCount / totalWithLogs) * 100;
      if (percentage === 100) return 'full';
      if (percentage >= 50) return 'partial';
      return 'low';
    } else {
      const attendance = getAttendanceForDate(day);
      if (!attendance.hasLog) return null;
      return attendance.attended ? 'attended' : 'absent';
    }
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
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
            h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
            ${isToday ? 'ring-2 ring-primary' : ''}
            ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'}
            ${isFuture ? 'opacity-40 cursor-not-allowed' : ''}
          `}
        >
          <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
            {day}
          </span>
          {status && !isSelected && (
            <div className="flex gap-0.5 mt-0.5">
              {isAdmin ? (
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === 'full' ? 'bg-green-500' :
                    status === 'partial' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                ></div>
              ) : (
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === 'attended' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Render selected date details
  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const attendance = getAttendanceForDate(selectedDate);
    const dateStr = new Date(year, month, selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (isAdmin) {
      const attendedUsers = attendance.filter(a => a.attended && a.hasLog);
      const absentUsers = attendance.filter(a => !a.attended && a.hasLog);
      const noLogUsers = attendance.filter(a => !a.hasLog);

      return (
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{dateStr}</h3>
          
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

          <div className="space-y-4">
            {attendedUsers.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Attended ({attendedUsers.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {attendedUsers.map(user => (
                    <span
                      key={user.userId}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {user.userName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {absentUsers.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Absent ({absentUsers.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {absentUsers.map(user => (
                    <span
                      key={user.userId}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {user.userName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // User view
      if (!attendance.hasLog) {
        return (
          <div className="mt-6 bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-600">{dateStr}</p>
            <p className="text-gray-500 mt-2">No log recorded for this day</p>
          </div>
        );
      }

      return (
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{dateStr}</h3>
          <div className={`${attendance.attended ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6 text-center`}>
            {attendance.attended ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-xl font-bold text-green-800">You Attended!</p>
                <p className="text-sm text-green-600 mt-1">Great job staying consistent</p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-xl font-bold text-red-800">You Were Absent</p>
                <p className="text-sm text-red-600 mt-1">Try to maintain regular attendance</p>
              </>
            )}
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isAdmin ? 'Attendance Calendar' : 'My Attendance'}
            </h2>
            <p className="text-sm text-gray-600">
              {isAdmin ? 'Track user attendance' : 'Your attendance history'}
            </p>
          </div>
        </div>
      </div>

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
          {isAdmin ? (
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
                <span className="text-gray-600">Attended</span>
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
    </div>
  );
};

export default AttendanceCalendar;
