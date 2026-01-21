/**
 * Project Lifecycle Hooks
 * Auto-sync với Backend khi có thay đổi
 */

const { syncToBackend } = require('../../../../services/backendSync');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    console.log('[Project] afterCreate', result.documentId);
    await syncToBackend('projects', 'create', result);
  },

  async afterUpdate(event) {
    const { result } = event;
    console.log('[Project] afterUpdate', result.documentId);
    await syncToBackend('projects', 'update', result);
  },

  async afterDelete(event) {
    const { result } = event;
    console.log('[Project] afterDelete', result.documentId);
    await syncToBackend('projects', 'delete', result);
  },

  async afterPublish(event) {
    const { result } = event;
    console.log('[Project] afterPublish', result.documentId);
    await syncToBackend('projects', 'update', result);
  }
};
