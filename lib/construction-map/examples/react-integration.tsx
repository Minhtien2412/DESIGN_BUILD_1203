/**
 * Example: React Integration
 */

import { ConstructionMapEngine, TaskData } from '@construction-app/canvas-map';
import { useEffect, useRef, useState } from 'react';

interface ConstructionMapProps {
  projectId: string;
  onTaskSelect?: (task: TaskData) => void;
}

export function ConstructionMap({ projectId, onTaskSelect }: ConstructionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ConstructionMapEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new ConstructionMapEngine({
      container: containerRef.current,
      minZoom: 0.1,
      maxZoom: 5.0,
      initialZoom: 1.0,
    });

    engineRef.current = engine;

    // Load project data
    loadProjectData(projectId, engine);

    // Setup event listeners
    engine.on('task-selected', (task) => {
      setSelectedTask(task);
      onTaskSelect?.(task);
    });

    engine.on('zoom-changed', ({ zoom }) => {
      setZoom(Math.round(zoom * 100));
    });

    engine.on('task-moved', async (task) => {
      await fetch(`/api/tasks/${task.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: task.x, y: task.y }),
      });
    });

    // Cleanup
    return () => {
      engine.destroy();
    };
  }, [projectId, onTaskSelect]);

  const loadProjectData = async (id: string, engine: ConstructionMapEngine) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/construction-map/${id}`);
      const project = await response.json();

      // Add stages
      project.stages.forEach((stage: any) => {
        engine.addStage(stage);
      });

      // Add tasks
      project.tasks.forEach((task: any) => {
        engine.addTask(task);
      });

      // Restore camera state
      const stateResponse = await fetch(`/api/construction-map/${id}/state`);
      const state = await stateResponse.json();
      engine.setState(state);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load project:', error);
      setLoading(false);
    }
  };

  const handleZoomIn = () => engineRef.current?.zoomIn();
  const handleZoomOut = () => engineRef.current?.zoomOut();
  const handleResetView = () => engineRef.current?.resetView();

  const handleExportPNG = async () => {
    const blob = await engineRef.current?.exportToPNG();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `construction-map-${projectId}.png`;
      a.click();
    }
  };

  const handleUpdateStatus = async (status: TaskStatus) => {
    if (!selectedTask) return;

    const task = engineRef.current?.getObject(selectedTask.id);
    if (task) {
      task.status = status;
      engineRef.current?.emit('task-status-changed', {
        taskId: selectedTask.id,
        status,
      });

      await fetch(`/api/tasks/${selectedTask.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[600px] border border-gray-300 rounded-lg"
      />

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="px-3 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          onClick={handleZoomOut}
          className="px-3 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <button
          onClick={handleResetView}
          className="px-3 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={handleExportPNG}
          className="px-3 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          title="Export PNG"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <div className="px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm">
          {zoom}%
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="absolute bottom-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">{selectedTask.label}</h3>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <div className="flex gap-2 mt-1">
                {(['pending', 'in-progress', 'done', 'late'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    className={`px-3 py-1 text-xs rounded ${
                      selectedTask.status === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Progress</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{selectedTask.progress}%</span>
              </div>
            </div>

            {selectedTask.assignedWorkers && selectedTask.assignedWorkers.length > 0 && (
              <div>
                <label className="text-sm text-gray-500">Assigned Workers</label>
                <div className="mt-1 text-sm">
                  {selectedTask.assignedWorkers.join(', ')}
                </div>
              </div>
            )}

            {selectedTask.notes && (
              <div>
                <label className="text-sm text-gray-500">Notes</label>
                <p className="mt-1 text-sm text-gray-700">{selectedTask.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConstructionMap;
