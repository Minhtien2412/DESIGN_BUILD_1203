/**
 * Example: Basic Usage - Vanilla JavaScript
 */

import { ConstructionMapEngine } from '@construction-app/canvas-map';

// 1. Create container
const container = document.getElementById('map-container');

// 2. Initialize engine
const engine = new ConstructionMapEngine({
  container,
  minZoom: 0.1,
  maxZoom: 5.0,
  initialZoom: 1.0,
  backgroundColor: '#fafafa',
  gridEnabled: true,
});

// 3. Add stages
const stages = [
  {
    id: 'stage-1',
    number: '01',
    label: 'Khởi đầu',
    status: 'completed',
    x: 200,
    y: 200,
  },
  {
    id: 'stage-2',
    number: '02',
    label: 'Kết cấu',
    status: 'active',
    x: 600,
    y: 200,
  },
  {
    id: 'stage-3',
    number: '03',
    label: 'Hoàn thiện',
    status: 'upcoming',
    x: 1000,
    y: 200,
  },
];

stages.forEach(stage => engine.addStage(stage));

// 4. Add tasks
const tasks = [
  {
    id: 'task-1',
    stageId: 'stage-1',
    label: 'Đào móng',
    status: 'done',
    progress: 100,
    x: 200,
    y: 350,
  },
  {
    id: 'task-2',
    stageId: 'stage-1',
    label: 'Đổ bê tông móng',
    status: 'done',
    progress: 100,
    x: 400,
    y: 350,
  },
  {
    id: 'task-3',
    stageId: 'stage-2',
    label: 'Xây tường',
    status: 'in-progress',
    progress: 60,
    x: 600,
    y: 350,
  },
  {
    id: 'task-4',
    stageId: 'stage-2',
    label: 'Đổ sàn tầng 1',
    status: 'pending',
    progress: 0,
    x: 800,
    y: 350,
  },
];

tasks.forEach(task => engine.addTask(task));

// 5. Setup event listeners
engine.on('task-selected', (task) => {
  console.log('Task selected:', task);
  showTaskDetails(task);
});

engine.on('task-moved', (task) => {
  console.log('Task moved:', task.id, task.x, task.y);
  // Sync to server
  saveTaskPosition(task.id, task.x, task.y);
});

engine.on('zoom-changed', ({ zoom }) => {
  document.getElementById('zoom-level').textContent = `${Math.round(zoom * 100)}%`;
});

// 6. Add controls
document.getElementById('zoom-in').addEventListener('click', () => {
  engine.zoomIn();
});

document.getElementById('zoom-out').addEventListener('click', () => {
  engine.zoomOut();
});

document.getElementById('reset-view').addEventListener('click', () => {
  engine.resetView();
});

document.getElementById('export-png').addEventListener('click', async () => {
  const blob = await engine.exportToPNG();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'construction-map.png';
  a.click();
});

// Helper functions
function showTaskDetails(task) {
  const panel = document.getElementById('task-panel');
  panel.innerHTML = `
    <h3>${task.label}</h3>
    <p>Status: ${task.status}</p>
    <p>Progress: ${task.progress}%</p>
    <button onclick="updateTaskStatus('${task.id}', 'done')">Mark Done</button>
  `;
  panel.style.display = 'block';
}

async function saveTaskPosition(taskId, x, y) {
  await fetch(`/api/tasks/${taskId}/position`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y }),
  });
}

window.updateTaskStatus = async (taskId, status) => {
  const task = engine.getObject(taskId);
  if (task) {
    task.status = status;
    engine.emit('task-status-changed', { taskId, status });
    
    // Sync to server
    await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }
};
