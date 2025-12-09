import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isToday,
  isPast,
  isFuture,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { getUserJourneyStage } from '../../services/prioritiesService';

const CheckinScheduler = ({ users, onUpdateUser, showToast }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddCheckin, setShowAddCheckin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [checkinData, setCheckinData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'weekly',
    notes: '',
    status: 'scheduled'
  });
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all check-ins from users
  const getAllCheckins = () => {
    const checkins = [];
    users.forEach(user => {
      if (user.checkins && user.checkins.length > 0) {
        user.checkins.forEach(checkin => {
          checkins.push({
            ...checkin,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone
            }
          });
        });
      }
    });
    return checkins;
  };

  const allCheckins = getAllCheckins();

  // Get check-ins for a specific date
  const getCheckinsForDate = (date) => {
    return allCheckins.filter(checkin => 
      isSameDay(parseISO(checkin.date), date)
    );
  };

  // Get users needing check-ins based on journey stage
  const getUsersNeedingCheckins = () => {
    return users.map(user => {
      const stage = getUserJourneyStage(user);
      const lastCheckin = user.checkins?.length > 0 
        ? user.checkins.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;
      
      return {
        ...user,
        stage,
        lastCheckin,
        needsCheckin: !lastCheckin || isPast(parseISO(lastCheckin.date))
      };
    }).filter(user => user.needsCheckin);
  };

  // Calendar generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleAddCheckin = () => {
    if (!selectedUser) {
      showToast('Please select a user', 'error');
      return;
    }

    const checkin = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: checkinData.date,
      time: checkinData.time,
      type: checkinData.type,
      notes: checkinData.notes,
      status: checkinData.status,
      createdAt: new Date().toISOString()
    };

    const checkins = selectedUser.checkins || [];
    checkins.push(checkin);

    onUpdateUser(selectedUser.id, { checkins });

    showToast('Check-in scheduled successfully!', 'success');
    setShowAddCheckin(false);
    setSelectedUser(null);
    setCheckinData({
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      type: 'weekly',
      notes: '',
      status: 'scheduled'
    });
  };

  const handleUpdateCheckinStatus = (userId, checkinId, newStatus) => {
    const user = users.find(u => u.id === userId);
    const checkins = user.checkins.map(c => 
      c.id === checkinId ? { ...c, status: newStatus } : c
    );

    onUpdateUser(userId, { checkins });
    showToast(`Check-in marked as ${newStatus}!`, 'success');
  };

  const handleDeleteCheckin = (userId, checkinId) => {
    const user = users.find(u => u.id === userId);
    const checkins = user.checkins.filter(c => c.id !== checkinId);

    onUpdateUser(userId, { checkins });
    showToast('Check-in deleted successfully!', 'success');
  };

  const handleSendReminder = (checkin) => {
    const phone = checkin.user.phone?.replace(/\D/g, '');
    if (!phone) {
      showToast('Phone number not available', 'error');
      return;
    }

    const message = `Hi ${checkin.user.name}, this is a reminder for your ${checkin.type} check-in scheduled for ${format(parseISO(checkin.date), 'MMMM dd, yyyy')} at ${checkin.time}. Looking forward to hearing about your progress!`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Missed
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      default:
        return null;
    }
  };

  const getCheckinCountForDate = (date) => {
    return getCheckinsForDate(date).length;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Check-in Scheduler</h1>
          <p className="text-gray-600 mt-2">Manage and schedule user check-ins</p>
        </div>
        <button
          onClick={() => setShowAddCheckin(true)}
          className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Schedule Check-in
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Scheduled</p>
              <p className="text-3xl font-bold mt-1">
                {allCheckins.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1">
                {allCheckins.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Missed</p>
              <p className="text-3xl font-bold mt-1">
                {allCheckins.filter(c => c.status === 'missed').length}
              </p>
            </div>
            <XCircle className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Need Check-in</p>
              <p className="text-3xl font-bold mt-1">
                {getUsersNeedingCheckins().length}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map(day => {
              const checkinCount = getCheckinCountForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-2 rounded-lg transition relative
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-800'}
                    ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'}
                    ${isTodayDate && !isSelected ? 'border-2 border-primary' : ''}
                  `}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  {checkinCount > 0 && (
                    <div className={`
                      absolute bottom-1 left-1/2 transform -translate-x-1/2
                      w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center
                      ${isSelected ? 'bg-white text-primary' : 'bg-primary text-white'}
                    `}>
                      {checkinCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
          </h3>

          {selectedDate && (
            <div className="space-y-3">
              {getCheckinsForDate(selectedDate).length > 0 ? (
                getCheckinsForDate(selectedDate).map(checkin => (
                  <div key={checkin.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {checkin.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{checkin.user.name}</p>
                          <p className="text-xs text-gray-500">{checkin.time}</p>
                        </div>
                      </div>
                      {getStatusBadge(checkin.status)}
                    </div>

                    <p className="text-xs text-gray-600 mb-2 capitalize">
                      {checkin.type} check-in
                    </p>

                    {checkin.notes && (
                      <p className="text-xs text-gray-500 mb-2 italic">{checkin.notes}</p>
                    )}

                    <div className="flex gap-2">
                      {checkin.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleUpdateCheckinStatus(checkin.user.id, checkin.id, 'completed')}
                            className="flex-1 px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-medium transition"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleSendReminder(checkin)}
                            className="flex-1 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition"
                          >
                            Remind
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteCheckin(checkin.user.id, checkin.id)}
                        className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">No check-ins scheduled</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Needing Check-ins */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Users Needing Check-ins</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getUsersNeedingCheckins().slice(0, 6).map(user => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.stage.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowAddCheckin(true);
                }}
                className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
              >
                Schedule Check-in
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Check-in Modal */}
      {showAddCheckin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Schedule Check-in
            </h3>

            <div className="space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User *
                </label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={checkinData.date}
                  onChange={(e) => setCheckinData({ ...checkinData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={checkinData.time}
                  onChange={(e) => setCheckinData({ ...checkinData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Type
                </label>
                <select
                  value={checkinData.type}
                  onChange={(e) => setCheckinData({ ...checkinData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={checkinData.notes}
                  onChange={(e) => setCheckinData({ ...checkinData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddCheckin(false);
                  setSelectedUser(null);
                  setCheckinData({
                    date: new Date().toISOString().split('T')[0],
                    time: '10:00',
                    type: 'weekly',
                    notes: '',
                    status: 'scheduled'
                  });
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCheckin}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinScheduler;
