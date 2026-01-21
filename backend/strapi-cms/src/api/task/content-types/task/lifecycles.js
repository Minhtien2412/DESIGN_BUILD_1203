/**
 * Task Lifecycle Hooks
 * Auto-sync với Backend khi có thay đổi
 */

const { syncToBackend } = require('../../../../services/backendSync');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    console.log('[Task] afterCreate', result.documentId);
    await syncToBackend('tasks', 'create', result);
  },

  async afterUpdate(event) {
    const { result } = event;
    console.log('[Task] afterUpdate', result.documentId);
    await syncToBackend('tasks', 'update', result);
  },

  async afterDelete(event) {
    const { result } = event;
    console.log('[Task] afterDelete', result.documentId);
    await syncToBackend('tasks', 'delete', result);
  },

  async afterPublish(event) {
    const { result } = event;
    console.log('[Task] afterPublish', result.documentId);
    await syncToBackend('tasks', 'update', result);
  }
};
