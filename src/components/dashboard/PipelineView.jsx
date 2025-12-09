import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, TrendingDown, AlertTriangle, CheckCircle, Users as UsersIcon } from 'lucide-react';
import { getUserJourneyStage, getEngagementScore } from '../../services/prioritiesService';
import { differenceInDays, parseISO } from 'date-fns';

const PipelineView = ({ users, onUpdateUser }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [pipeline, setPipeline] = useState({
    new: [],
    active: [],
    plateau: [],
    atRisk: [],
    success: []
  });

  useEffect(() => {
    organizePipeline();
  }, [users, searchTerm]);

  const organizePipeline = () => {
    const newPipeline = {
      new: [],
      active: [],
      plateau: [],
      atRisk: [],
      success: []
    };

    users.forEach(user => {
      const stage = getUserJourneyStage(user);
      const engagementScore = getEngagementScore(user);
      
      // Check if user has a manually set status (from drag & drop)
      if (user.status) {
        const statusMap = {
          'new': 'new',
          'active': 'active',
          'plateau': 'plateau',
          'at-risk': 'atRisk',
          'completed': 'success'
        };
        
        const column = statusMap[user.status] || 'active';
        
        // Calculate daysSinceLastLog for at-risk users
        let daysSinceLastLog = null;
        if (user.logs && user.logs.length > 0) {
          const sortedLogs = [...user.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
          const lastLog = sortedLogs[0];
          daysSinceLastLog = differenceInDays(new Date(), parseISO(lastLog.date));
        }
        
        newPipeline[column].push({ ...user, engagementScore, stage, daysSinceLastLog });
        return;
      }
      
      // Auto-detect pipeline status if no manual status set
      if (!user.logs || user.logs.length === 0) {
        newPipeline.new.push({ ...user, engagementScore, stage });
      } else if (user.currentWeight && user.goalWeight && user.currentWeight <= user.goalWeight) {
        newPipeline.success.push({ ...user, engagementScore, stage });
      } else {
        // Check for plateau
        const sortedLogs = [...user.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentLogs = sortedLogs.slice(0, 5);
        const weights = recentLogs.map(log => log.weight).filter(w => w);
        
        let isPlateaued = false;
        if (weights.length >= 5) {
          const maxWeight = Math.max(...weights);
          const minWeight = Math.min(...weights);
          const weightDiff = maxWeight - minWeight;
          isPlateaued = weightDiff < 0.5;
        }

        // Check if at risk (inactive)
        const lastLog = sortedLogs[0];
        const daysSinceLastLog = differenceInDays(new Date(), parseISO(lastLog.date));
        const isAtRisk = daysSinceLastLog >= 3;

        if (isAtRisk) {
          newPipeline.atRisk.push({ ...user, engagementScore, stage, daysSinceLastLog });
        } else if (isPlateaued) {
          newPipeline.plateau.push({ ...user, engagementScore, stage });
        } else {
          newPipeline.active.push({ ...user, engagementScore, stage });
        }
      }
    });

    setPipeline(newPipeline);
  };

  const handleDragStart = (e, user, fromColumn) => {
    e.dataTransfer.setData('user', JSON.stringify(user));
    e.dataTransfer.setData('fromColumn', fromColumn);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, toColumn) => {
    e.preventDefault();
    const user = JSON.parse(e.dataTransfer.getData('user'));
    const fromColumn = e.dataTransfer.getData('fromColumn');
    
    if (fromColumn === toColumn) return;

    // Update user status based on column
    let status = 'active';
    
    if (toColumn === 'success') {
      status = 'completed';
    } else if (toColumn === 'atRisk') {
      status = 'at-risk';
    } else if (toColumn === 'plateau') {
      status = 'plateau';
    } else if (toColumn === 'new') {
      status = 'new';
    }

    // Call onUpdateUser with user ID and updates
    if (onUpdateUser) {
      onUpdateUser({ ...user, status });
    }
  };

  const filteredPipeline = Object.keys(pipeline).reduce((acc, key) => {
    acc[key] = pipeline[key].filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return acc;
  }, {});

  const UserCard = ({ user, columnKey }) => {
    const progressPercent = user.startWeight && user.goalWeight
      ? ((user.startWeight - user.currentWeight) / (user.startWeight - user.goalWeight)) * 100
      : 0;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, user, columnKey)}
        onClick={() => navigate(`/weightloss/dashboard/users?userId=${user.id}`)}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-move border-l-4"
        style={{ borderLeftColor: getColumnColor(columnKey) }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        {user.currentWeight && user.goalWeight && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{user.currentWeight}kg</span>
              <span>{user.goalWeight}kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progressPercent)}% to goal
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Engagement: {user.engagementScore}/100
          </span>
          {user.daysSinceLastLog !== undefined && (
            <span className="text-red-500">
              {user.daysSinceLastLog}d inactive
            </span>
          )}
        </div>
      </div>
    );
  };

  const getColumnColor = (key) => {
    const colors = {
      new: '#3b82f6',
      active: '#10b981',
      plateau: '#f59e0b',
      atRisk: '#ef4444',
      success: '#8b5cf6'
    };
    return colors[key] || '#6b7280';
  };

  const Column = ({ title, users, columnKey, icon: Icon, color }) => (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, columnKey)}
      className="bg-gray-50 rounded-xl p-4 min-h-[600px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2" style={{ borderColor: color }}>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color }} />
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: color + '20', color }}>
          {users.length}
        </span>
      </div>
      <div className="space-y-3 flex-1">
        {users.map(user => (
          <UserCard key={user.id} user={user} columnKey={columnKey} />
        ))}
        {users.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No users</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Pipeline</h1>
        <p className="text-gray-600 mt-2">Drag and drop to update user status</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto">
        <Column
          title="New"
          users={filteredPipeline.new}
          columnKey="new"
          icon={User}
          color="#3b82f6"
        />
        <Column
          title="Active"
          users={filteredPipeline.active}
          columnKey="active"
          icon={TrendingDown}
          color="#10b981"
        />
        <Column
          title="Plateau"
          users={filteredPipeline.plateau}
          columnKey="plateau"
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <Column
          title="At Risk"
          users={filteredPipeline.atRisk}
          columnKey="atRisk"
          icon={AlertTriangle}
          color="#ef4444"
        />
        <Column
          title="Success"
          users={filteredPipeline.success}
          columnKey="success"
          icon={CheckCircle}
          color="#8b5cf6"
        />
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">Pipeline Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{pipeline.new.length}</p>
            <p className="text-sm text-gray-600">New Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{pipeline.active.length}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{pipeline.plateau.length}</p>
            <p className="text-sm text-gray-600">Plateau</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{pipeline.atRisk.length}</p>
            <p className="text-sm text-gray-600">At Risk</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">{pipeline.success.length}</p>
            <p className="text-sm text-gray-600">Success</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineView;
