import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import UserDetailModal from './UserDetailModal';

const Funnel = ({ users, loading, onUpdateUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    if (loading || users.length === 0) return;

    // Filter by active batch
    const activeBatchId = localStorage.getItem('activeBatchId');
    const filteredUsers = activeBatchId 
      ? users.filter(user => user.batchId === activeBatchId)
      : users;

    if (filteredUsers.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 800;
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Categorize users based on weight loss and size reduction
    const categorizedUsers = filteredUsers.map(user => {
      if (!user.logs || user.logs.length < 2) {
        return { ...user, category: 'noData', weightLost: false, sizeReduced: false };
      }

      const initialWeight = user.logs[0].weight;
      const latestWeight = user.logs[user.logs.length - 1].weight;
      const weightLost = latestWeight < initialWeight;

      // Check if size reduced in recent logs (last 5 logs or all if less)
      const recentLogs = user.logs.slice(-5);
      const sizeReducedCount = recentLogs.filter(log => log.sizeReduced).length;
      const sizeReduced = sizeReducedCount > recentLogs.length / 2; // More than 50% said yes

      let category;
      if (weightLost && sizeReduced) {
        category = 'success'; // Green - Both reduced
      } else if (weightLost && !sizeReduced) {
        category = 'needsExercise'; // Yellow - Weight lost but not size
      } else if (!weightLost && sizeReduced) {
        category = 'needsDiet'; // Orange - Size reduced but not weight
      } else {
        category = 'noProgress'; // Red - Neither reduced
      }

      return {
        ...user,
        category,
        weightLost,
        sizeReduced,
      };
    });

    // Group users by category
    const usersByCategory = d3.group(categorizedUsers, d => d.category);

    // Define 4 quadrants with modern design
    const quadrants = [
      {
        id: 'success',
        name: 'Lost Weight AND Size',
        emoji: '🎯',
        x: innerWidth / 2 + 10,
        y: 10,
        width: innerWidth / 2 - 10,
        height: innerHeight / 2 - 10,
        color: '#ecfdf5',
        gradient: ['#d1fae5', '#a7f3d0'],
        borderColor: '#10b981',
        textColor: '#047857',
        recommendation: 'Keep current routine',
        action: 'Maintain diet & exercise',
      },
      {
        id: 'needsExercise',
        name: 'Lost Weight NOT Size',
        emoji: '💪',
        x: 10,
        y: 10,
        width: innerWidth / 2 - 10,
        height: innerHeight / 2 - 10,
        color: '#fffbeb',
        gradient: ['#fef3c7', '#fde68a'],
        borderColor: '#f59e0b',
        textColor: '#b45309',
        recommendation: 'Increase exercise',
        action: 'Add cardio & strength training',
      },
      {
        id: 'needsDiet',
        name: 'Lost Size NOT Weight',
        emoji: '🥗',
        x: innerWidth / 2 + 10,
        y: innerHeight / 2 + 10,
        width: innerWidth / 2 - 10,
        height: innerHeight / 2 - 10,
        color: '#fff7ed',
        gradient: ['#fed7aa', '#fdba74'],
        borderColor: '#ea580c',
        textColor: '#c2410c',
        recommendation: 'Adjust diet plan',
        action: 'Reduce calorie intake',
      },
      {
        id: 'noProgress',
        name: 'No Progress Yet',
        emoji: '⚠️',
        x: 10,
        y: innerHeight / 2 + 10,
        width: innerWidth / 2 - 10,
        height: innerHeight / 2 - 10,
        color: '#fef2f2',
        gradient: ['#fee2e2', '#fecaca'],
        borderColor: '#ef4444',
        textColor: '#dc2626',
        recommendation: 'Needs attention',
        action: 'Review complete program',
      },
    ];

    // Draw quadrants with modern design
    quadrants.forEach(quadrant => {
      const quadUsers = usersByCategory.get(quadrant.id) || [];

      // Background with gradient
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', `gradient-${quadrant.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', quadrant.gradient[0]);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', quadrant.gradient[1]);

      // Rounded rectangle background
      g.append('rect')
        .attr('x', quadrant.x)
        .attr('y', quadrant.y)
        .attr('width', quadrant.width)
        .attr('height', quadrant.height)
        .attr('rx', 16)
        .attr('ry', 16)
        .attr('fill', `url(#gradient-${quadrant.id})`)
        .attr('stroke', quadrant.borderColor)
        .attr('stroke-width', 3)
        .attr('opacity', 0.95);

      // Emoji icon
      g.append('text')
        .attr('x', quadrant.x + 25)
        .attr('y', quadrant.y + 35)
        .attr('font-size', '28px')
        .text(quadrant.emoji);

      // Title
      g.append('text')
        .attr('x', quadrant.x + quadrant.width / 2)
        .attr('y', quadrant.y + 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', '700')
        .attr('fill', quadrant.textColor)
        .text(quadrant.name);

      // Count badge
      const countBadge = g.append('g');
      
      countBadge.append('rect')
        .attr('x', quadrant.x + quadrant.width - 70)
        .attr('y', quadrant.y + 15)
        .attr('width', 50)
        .attr('height', 28)
        .attr('rx', 14)
        .attr('fill', quadrant.borderColor)
        .attr('opacity', 0.9);

      countBadge.append('text')
        .attr('x', quadrant.x + quadrant.width - 45)
        .attr('y', quadrant.y + 33)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .text(quadUsers.length);

      // Recommendation
      g.append('text')
        .attr('x', quadrant.x + quadrant.width / 2)
        .attr('y', quadrant.y + quadrant.height - 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .attr('fill', quadrant.textColor)
        .text(quadrant.recommendation);

      // Action text
      g.append('text')
        .attr('x', quadrant.x + quadrant.width / 2)
        .attr('y', quadrant.y + quadrant.height - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', quadrant.textColor)
        .attr('opacity', 0.8)
        .text(quadrant.action);

      // Draw user bubbles with modern design
      quadUsers.forEach((user, i) => {
        const cols = Math.ceil(Math.sqrt(quadUsers.length));
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const bubbleX = quadrant.x + quadrant.width / 2 - (cols * 45) / 2 + col * 45 + 22;
        const bubbleY = quadrant.y + 90 + row * 45;
        const radius = 18;

        const bubble = g.append('g')
          .attr('cursor', 'pointer')
          .on('click', () => setSelectedUser(user));

        // Shadow
        bubble.append('circle')
          .attr('cx', bubbleX + 1)
          .attr('cy', bubbleY + 2)
          .attr('r', radius)
          .attr('fill', '#000')
          .attr('opacity', 0.1);

        // Main circle
        bubble.append('circle')
          .attr('cx', bubbleX)
          .attr('cy', bubbleY)
          .attr('r', radius)
          .attr('fill', '#ffffff')
          .attr('stroke', quadrant.borderColor)
          .attr('stroke-width', 3)
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', radius + 4)
              .attr('stroke-width', 4);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', radius)
              .attr('stroke-width', 3);
          });

        // User initials
        bubble.append('text')
          .attr('x', bubbleX)
          .attr('y', bubbleY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', quadrant.borderColor)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2));
      });
    });

    // Draw modern axes with labels
    // Horizontal axis (Weight)
    g.append('line')
      .attr('x1', 0)
      .attr('y1', innerHeight / 2)
      .attr('x2', innerWidth)
      .attr('y2', innerHeight / 2)
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.5);

    // Vertical axis (Size)
    g.append('line')
      .attr('x1', innerWidth / 2)
      .attr('y1', 0)
      .attr('x2', innerWidth / 2)
      .attr('y2', innerHeight)
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.5);

    // Axis labels with modern styling
    // Top label
    const topLabel = g.append('g')
      .attr('transform', `translate(${innerWidth / 2}, -40)`);
    
    topLabel.append('rect')
      .attr('x', -80)
      .attr('y', -15)
      .attr('width', 160)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);

    topLabel.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text('📏 Size Reduced →');

    // Bottom label
    const bottomLabel = g.append('g')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`);
    
    bottomLabel.append('rect')
      .attr('x', -80)
      .attr('y', -15)
      .attr('width', 160)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);

    bottomLabel.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text('📏 Size Not Reduced');

    // Left label
    const leftLabel = g.append('g')
      .attr('transform', `translate(-40, ${innerHeight / 2})`);
    
    leftLabel.append('rect')
      .attr('x', -80)
      .attr('y', -15)
      .attr('width', 160)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);

    leftLabel.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text('⚖️ Weight Not Reduced');

    // Right label
    const rightLabel = g.append('g')
      .attr('transform', `translate(${innerWidth + 40}, ${innerHeight / 2})`);
    
    rightLabel.append('rect')
      .attr('x', -80)
      .attr('y', -15)
      .attr('width', 160)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);

    rightLabel.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text('⚖️ Weight Reduced →');

  }, [users, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Results-Based Funnel</h1>
            <p className="text-gray-600 mt-1">4-Quadrant analysis showing who is where and what they should do</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {users.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Users Yet</h3>
            <p className="text-gray-500">Add users or load sample data to see the funnel visualization</p>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full"></svg>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateUser={onUpdateUser}
        />
      )}
    </div>
  );
};

export default Funnel;
