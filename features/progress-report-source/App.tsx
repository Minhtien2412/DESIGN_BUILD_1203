
import React, { useState } from 'react';
import OverviewScreen from './components/OverviewScreen';
import DetailScreen from './components/DetailScreen';
import { ViewType, Task } from './types';
import { CONSTRUCTION_TASKS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('OVERVIEW');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setCurrentView('DETAIL');
  };

  const handleBack = () => {
    setCurrentView('OVERVIEW');
    setSelectedTask(null);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-xl overflow-hidden">
      {currentView === 'OVERVIEW' ? (
        <OverviewScreen onTaskClick={handleOpenDetail} />
      ) : (
        <DetailScreen task={selectedTask || CONSTRUCTION_TASKS[1]} onBack={handleBack} />
      )}
      
      {/* Shared Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        <NavItem icon="assignment" label="Tiến độ" active={currentView === 'OVERVIEW'} />
        <NavItem icon="photo_library" label="Hình ảnh" active={false} />
        <NavItem icon="chat" label="Thảo luận" active={false} />
        <NavItem icon="person" label="Tài khoản" active={false} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean }> = ({ icon, label, active }) => (
  <div className={`flex flex-col items-center gap-1 ${active ? 'text-green-600' : 'text-gray-400'}`}>
    <span className="material-icons-round text-2xl">{icon}</span>
    <span className="text-[10px] font-semibold">{label}</span>
  </div>
);

export default App;
