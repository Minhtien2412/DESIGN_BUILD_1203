/**
 * Sync Controller
 * API endpoint để Backend có thể push data vào Strapi
 */

'use strict';

module.exports = {
  /**
   * Import data từ backend
   * POST /api/sync/import
   */
  async import(ctx) {
    try {
      const { contentType, data } = ctx.request.body;

      if (!contentType || !data) {
        return ctx.badRequest('Missing contentType or data');
      }

      // Verify API token từ backend
      const authHeader = ctx.request.headers.authorization;
      const expectedToken = process.env.BACKEND_API_TOKEN;
      
      if (!authHeader || !authHeader.includes(expectedToken)) {
        return ctx.unauthorized('Invalid API token');
      }

      // Get the appropriate service
      let service;
      switch (contentType) {
        case 'products':
          service = strapi.service('api::product.product');
          break;
        case 'projects':
          service = strapi.service('api::project.project');
          break;
        case 'services':
          service = strapi.service('api::service.service');
          break;
        case 'tasks':
          service = strapi.service('api::task.task');
          break;
        default:
          return ctx.badRequest(`Unknown content type: ${contentType}`);
      }

      // Check if exists by strapiId hoặc backend id
      const existing = await strapi.db.query(`api::${contentType.slice(0, -1)}.${contentType.slice(0, -1)}`).findOne({
        where: {
          $or: [
            { strapiId: data.id },
            { id: data.strapiId }
          ]
        }
      });

      let result;
      if (existing) {
        // Update existing entry
        result = await service.update(existing.id, { data });
        console.log(`[Backend → Strapi] Updated ${contentType}:`, existing.id);
      } else {
        // Create new entry
        result = await service.create({ 
          data: {
            ...data,
            strapiId: data.id
          }
        });
        console.log(`[Backend → Strapi] Created ${contentType}:`, result.id);
      }

      return ctx.send({
        success: true,
        data: result,
        message: existing ? 'Updated' : 'Created'
      });

    } catch (error) {
      console.error('[Sync Controller] Error:', error);
      return ctx.internalServerError('Sync failed', { error: error.message });
    }
  },

  /**
   * Batch import
   * POST /api/sync/batch-import
   */
  async batchImport(ctx) {
    try {
      const { contentType, items } = ctx.request.body;

      if (!contentType || !Array.isArray(items)) {
        return ctx.badRequest('Missing contentType or items array');
      }

      // Verify API token
      const authHeader = ctx.request.headers.authorization;
      const expectedToken = process.env.BACKEND_API_TOKEN;
      
      if (!authHeader || !authHeader.includes(expectedToken)) {
        return ctx.unauthorized('Invalid API token');
      }

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const item of items) {
        try {
          await this.import({
            request: {
              body: { contentType, data: item },
              headers: ctx.request.headers
            },
            send: () => {},
            badRequest: () => { throw new Error('Bad request'); },
            unauthorized: () => { throw new Error('Unauthorized'); },
            internalServerError: () => { throw new Error('Internal error'); }
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            item: item.id,
            error: error.message
          });
        }
      }

      return ctx.send({
        success: true,
        results
      });

    } catch (error) {
      console.error('[Sync Controller] Batch import error:', error);
      return ctx.internalServerError('Batch import failed', { error: error.message });
    }
  }
};
