
import React from 'react';
import { Task, TaskStatus, SubTask } from '../types';

interface DetailScreenProps {
  task: Task;
  onBack: () => void;
}

const DetailScreen: React.FC<DetailScreenProps> = ({ task, onBack }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  const workItems = task.subTasks || task.description?.split('-').filter(i => i.trim().length > 0).map((item, idx) => ({
    id: `${task.id}-${idx}`,
    title: item.trim(),
    isCompleted: isCompleted 
  })) || [];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <span className="material-icons-round text-gray-500">arrow_back</span>
          </button>
          <div>
            <h1 className="font-bold text-lg text-gray-800">{task.title}</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Hạng mục {task.index}</p>
          </div>
        </div>
        <span className="material-icons-round text-gray-400">share</span>
      </header>

      <main className="px-4 py-6">
        {/* Banner Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
           <div className="flex justify-between items-center mb-4">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                isCompleted ? 'bg-green-100 text-green-700' : 
                isInProgress ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {task.status === TaskStatus.COMPLETED ? 'Đã hoàn thành' : 
                 task.status === TaskStatus.IN_PROGRESS ? 'Đang thực hiện' : 'Chờ triển khai'}
              </span>
              <span className="text-xl font-black text-green-600">{isCompleted ? '100%' : isInProgress ? '65%' : '0%'}</span>
           </div>
           <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-5">
              <div className={`h-full transition-all duration-700 ${isCompleted ? 'bg-green-500 w-full' : isInProgress ? 'bg-green-500 w-2/3' : 'w-0'}`}></div>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Bắt đầu</span>
                <span className="text-xs font-bold text-gray-700">{task.startDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Kết thúc</span>
                <span className="text-xs font-bold text-gray-700">{task.endDate}</span>
              </div>
           </div>
        </div>

        <h3 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2 px-1">
          <span className="material-icons-round text-green-600 text-xl">verified_user</span>
          Nhật ký công việc
        </h3>

        <div className="timeline-container">
          {workItems.map((item, idx) => (
            <WorkItemLog 
              key={item.id}
              item={item}
              isLast={idx === workItems.length - 1}
              parentTask={task}
              index={idx + 1}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

const WorkItemLog: React.FC<{ item: any; isLast: boolean; parentTask: Task; index: number }> = ({ item, isLast, parentTask, index }) => {
  const isDone = item.isCompleted;
  const showMedia = isDone && (index % 2 !== 0);
  const hasVideo = showMedia && index === 1;

  return (
    <div className="relative flex gap-4">
      {/* Line nối */}
      {!isLast && (
        <div className={`timeline-connector ${isDone ? 'active' : ''}`}></div>
      )}

      {/* Node indicator */}
      <div className={`timeline-node flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
        ${isDone ? 'bg-green-500 border-white text-white shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>
        {isDone ? <span className="material-icons-round text-lg">done</span> : <span className="text-xs font-bold">{index}</span>}
      </div>

      <div className={`flex-1 rounded-2xl p-3 border mb-3 transition-all ${isDone ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
        <div className="flex flex-col gap-1 mb-2">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Công việc #{index}</span>
          <h4 className={`font-bold text-sm leading-tight ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>
            {item.title}
          </h4>
        </div>

        {showMedia && (
          <div className="space-y-3 mt-2">
             <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-50 shadow-sm">
                  <img src={`https://picsum.photos/seed/img-${parentTask.id}-${index}/300/300`} className="w-full h-full object-cover" alt="Log" />
                </div>
                {hasVideo ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <img src={`https://picsum.photos/seed/vid-${parentTask.id}/300/300`} className="w-full h-full object-cover opacity-50" alt="Video" />
                    <span className="material-icons-round text-white text-3xl absolute">play_circle</span>
                    <span className="absolute bottom-2 right-2 text-[8px] text-white bg-black/40 px-1 rounded">0:12</span>
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-50 shadow-sm">
                    <img src={`https://picsum.photos/seed/img2-${parentTask.id}-${index}/300/300`} className="w-full h-full object-cover" alt="Log 2" />
                  </div>
                )}
             </div>
             <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium italic">
                <span>Cập nhật: {parentTask.startDate}</span>
             </div>
          </div>
        )}
        
        {!isDone && (
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase mt-1">
            <span className="material-icons-round text-[12px]">hourglass_empty</span>
            Chờ triển khai
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailScreen;
