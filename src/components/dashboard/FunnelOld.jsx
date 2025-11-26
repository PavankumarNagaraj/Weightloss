import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import UserDetailModal from './UserDetailModal';

const Funnel = ({ users, loading, onUpdateUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    if (loading || users.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 700;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Categorize users based on weight loss and size reduction
    const categorizedUsers = users.map(user => {
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

    // Group users by stage
    const usersByStage = d3.group(usersWithDays, d => d.stage);

    // Draw stage backgrounds
    stages.forEach((stage, i) => {
      const stageHeight = i < stages.length - 1 
        ? stages[i + 1].y - stage.y 
        : innerHeight - stage.y;

      g.append('rect')
        .attr('x', 0)
        .attr('y', stage.y)
        .attr('width', innerWidth)
        .attr('height', stageHeight)
        .attr('fill', i % 2 === 0 ? '#f9fafb' : '#ffffff')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', 10)
        .attr('y', stage.y + 25)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text(stage.name);

      const stageUsers = usersByStage.get(stage.name) || [];
      g.append('text')
        .attr('x', 10)
        .attr('y', stage.y + 45)
        .attr('font-size', '12px')
        .attr('fill', '#6b7280')
        .text(`${stageUsers.length} users`);
    });

    // Draw user bubbles
    usersByStage.forEach((stageUsers, stageName) => {
      const stage = stages.find(s => s.name === stageName);
      const stageHeight = stages[stages.findIndex(s => s.name === stageName) + 1]?.y - stage.y || innerHeight - stage.y;
      
      stageUsers.forEach((user, i) => {
        const x = 200 + (i % 8) * 70;
        const y = stage.y + 30 + Math.floor(i / 8) * 70;
        const radius = 25;

        const color = user.progressStatus === 'onTrack' 
          ? '#10b981' 
          : user.progressStatus === 'atRisk' 
          ? '#f59e0b' 
          : '#ef4444';

        const bubble = g.append('g')
          .attr('cursor', 'pointer')
          .on('click', () => setSelectedUser(user));

        bubble.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', radius)
          .attr('fill', color)
          .attr('opacity', 0.8)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', radius + 5)
              .attr('opacity', 1);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', radius)
              .attr('opacity', 0.8);
          });

        bubble.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2));
      });
    });

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 150}, 10)`);

    const legendData = [
      { label: 'On Track', color: '#10b981' },
      { label: 'At Risk', color: '#f59e0b' },
      { label: 'Struggling', color: '#ef4444' },
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendItem.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 8)
        .attr('fill', item.color);

      legendItem.append('text')
        .attr('x', 15)
        .attr('y', 0)
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#374151')
        .text(item.label);
    });

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
        <h1 className="text-3xl font-bold text-gray-800">Progress Funnel</h1>
        <p className="text-gray-600 mt-2">Visual representation of user progress through program stages</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No users to display. Add users to see the funnel visualization.
          </div>
        ) : (
          <svg ref={svgRef} className="w-full"></svg>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={onUpdateUser}
        />
      )}
    </div>
  );
};

export default Funnel;
