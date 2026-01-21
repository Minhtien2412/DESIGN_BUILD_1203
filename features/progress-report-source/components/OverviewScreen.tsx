
import React from 'react';
import { Task, TaskStatus } from '../types';
import { CONSTRUCTION_TASKS } from '../constants';

interface OverviewScreenProps {
  onTaskClick: (task: Task) => void;
}

const OverviewScreen: React.FC<OverviewScreenProps> = ({ onTaskClick }) => {
  const completedCount = CONSTRUCTION_TASKS.filter(t => t.status === TaskStatus.COMPLETED).length;
  const progressPercent = Math.round((completedCount / CONSTRUCTION_TASKS.length) * 100);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-icons-round text-gray-400">arrow_back</span>
          <div>
            <h1 className="font-bold text-lg">Tiến độ thi công</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dự án: Biệt thự phố - Q2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-icons-round text-gray-400 text-xl">search</span>
          <span className="material-icons-round text-green-600">notifications_active</span>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiến độ tổng quát</p>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{progressPercent}%</h2>
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Làm thép sàn tầng trệt
              </span>
            </div>
            <div className="w-16 h-16">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#F3F4F6" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${progressPercent}, 100`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 uppercase font-bold">Bắt đầu</span>
               <span className="text-xs font-bold text-gray-700">01/01/2026</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 uppercase font-bold">Dự kiến xong</span>
               <span className="text-xs font-bold text-gray-700">31/05/2026</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800 text-base">Hạng mục chi tiết</h3>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{CONSTRUCTION_TASKS.length} Task</span>
        </div>

        <div className="timeline-container">
          {CONSTRUCTION_TASKS.map((task, idx) => (
            <TimelineItem 
              key={task.id} 
              task={task} 
              isLast={idx === CONSTRUCTION_TASKS.length - 1} 
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

const TimelineItem: React.FC<{ task: Task; isLast: boolean; onClick: () => void }> = ({ task, isLast, onClick }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  return (
    <div className="relative flex gap-4 group cursor-pointer" onClick={onClick}>
      {/* Line nối xanh/xám */}
      {!isLast && (
        <div className={`timeline-connector ${isCompleted ? 'active' : ''}`}></div>
      )}
      
      {/* Node indicator - Luôn hiển thị số hoặc icon check */}
      <div className={`timeline-node flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all
        ${isCompleted ? 'bg-green-500 border-white text-white shadow-sm' : 
          isInProgress ? 'bg-green-600 border-white text-white shadow-lg shadow-green-100 scale-105' : 
          'bg-white border-gray-200 text-gray-400'}`}>
        {isCompleted ? <span className="material-icons-round text-lg">check</span> : task.index}
      </div>

      <div className={`flex-1 task-card rounded-2xl border p-3.5 mb-2 ${isInProgress ? 'bg-green-50/50 border-green-100 shadow-sm' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className={`font-bold leading-tight flex-1 ${isInProgress ? 'text-green-700 text-base' : 'text-gray-800 text-sm'}`}>
            {task.title}
          </h4>
          {isInProgress && (
            <span className="flex-shrink-0 text-[8px] font-black bg-green-600 text-white px-1.5 py-0.5 rounded-md animate-pulse uppercase tracking-tighter">
              Đang làm
            </span>
          )}
        </div>

        <div className="text-[11px] text-gray-500 line-clamp-1 leading-relaxed mb-3">
          {task.description}
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
            <span className="material-icons-round text-[12px]">calendar_today</span>
            {task.startDate} {task.startDate !== task.endDate ? `– ${task.endDate}` : ''}
          </div>
          <button className="text-[11px] font-bold text-green-600 flex items-center gap-0.5 hover:underline">
            Chi tiết
            <span className="material-icons-round text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;
