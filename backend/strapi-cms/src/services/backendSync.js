/**
 * Backend Sync Service
 * Đồng bộ dữ liệu giữa Strapi và Backend NestJS
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://baotienweb.cloud/api/v1';
const BACKEND_TOKEN = process.env.BACKEND_API_TOKEN || 'strapi-sync-token-secret';

// Axios instance với auth header
const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BACKEND_TOKEN}`,
    'X-Strapi-Sync': 'true'
  },
  timeout: 10000
});

/**
 * Sync data từ Strapi sang Backend
 */
async function syncToBackend(contentType, operation, data) {
  try {
    console.log(`[Strapi → Backend] Syncing ${contentType} - ${operation}`, {
      id: data.id,
      documentId: data.documentId
    });

    const endpoint = `/strapi-sync/${contentType}`;
    
    let response;
    switch (operation) {
      case 'create':
        response = await backendApi.post(endpoint, {
          operation: 'create',
          data: transformDataForBackend(contentType, data)
        });
        break;
      
      case 'update':
        response = await backendApi.post(endpoint, {
          operation: 'update',
          data: transformDataForBackend(contentType, data)
        });
        break;
      
      case 'delete':
        response = await backendApi.post(endpoint, {
          operation: 'delete',
          data: { id: data.id, documentId: data.documentId }
        });
        break;
      
      default:
        console.warn(`Unknown operation: ${operation}`);
        return null;
    }

    console.log(`[Strapi → Backend] ✅ Synced ${contentType} successfully`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[Strapi → Backend] ❌ Sync failed for ${contentType}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Không throw error để không block Strapi operations
    return null;
  }
}

/**
 * Transform Strapi data format sang Backend format
 */
function transformDataForBackend(contentType, data) {
  const transformed = {
    strapiId: data.documentId || data.id,
    ...data
  };

  // Remove Strapi metadata
  delete transformed.createdAt;
  delete transformed.updatedAt;
  delete transformed.publishedAt;
  delete transformed.locale;
  delete transformed.documentId;
  
  // Content-specific transformations
  switch (contentType) {
    case 'products':
      return {
        strapiId: transformed.strapiId,
        name: transformed.name,
        description: transformed.description,
        price: transformed.price,
        category: transformed.category,
        stock: transformed.stock,
        status: transformed.status,
        rejectionReason: transformed.rejectionReason,
        viewCount: transformed.viewCount || 0,
        soldCount: transformed.soldCount || 0,
        isBestseller: transformed.isBestseller || false,
        isNew: transformed.isNew !== undefined ? transformed.isNew : true,
        reviewedAt: transformed.reviewedAt,
        images: Array.isArray(transformed.images) 
          ? transformed.images.map(img => img.url || img) 
          : []
      };
    
    case 'projects':
      return {
        strapiId: transformed.strapiId,
        title: transformed.title,
        description: transformed.description,
        status: transformed.status,
        budget: transformed.budget,
        startDate: transformed.startDate,
        endDate: transformed.endDate,
        clientId: transformed.clientId,
        engineerId: transformed.engineerId,
        images: Array.isArray(transformed.images) 
          ? transformed.images.map(img => img.url || img) 
          : []
      };
    
    case 'services':
      return {
        strapiId: transformed.strapiId,
        name: transformed.name,
        description: transformed.description,
        category: transformed.category,
        price: transformed.price,
        unit: transformed.unit || 'công trình',
        duration: transformed.duration,
        features: Array.isArray(transformed.features) ? transformed.features : [],
        status: transformed.status,
        viewCount: transformed.viewCount || 0,
        orderCount: transformed.orderCount || 0,
        rating: transformed.rating,
        reviewCount: transformed.reviewCount || 0,
        images: Array.isArray(transformed.images) 
          ? transformed.images.map(img => img.url || img) 
          : []
      };
    
    case 'tasks':
      return {
        strapiId: transformed.strapiId,
        title: transformed.title,
        description: transformed.description,
        status: transformed.status,
        priority: transformed.priority,
        dueDate: transformed.dueDate,
        projectId: transformed.projectId,
        assigneeId: transformed.assigneeId
      };
    
    default:
      return transformed;
  }
}

/**
 * Fetch data từ Backend và import vào Strapi
 */
async function importFromBackend(contentType, strapiModel) {
  try {
    console.log(`[Backend → Strapi] Importing ${contentType}...`);

    const response = await backendApi.get(`/${contentType}`);
    const backendData = response.data;

    if (!backendData || !Array.isArray(backendData)) {
      console.warn(`No data from backend for ${contentType}`);
      return { success: false, count: 0 };
    }

    let imported = 0;
    for (const item of backendData) {
      try {
        // Check if already exists by strapiId or id
        const existing = await strapiModel.findMany({
          filters: {
            $or: [
              { strapiId: item.id },
              { id: item.strapiId }
            ]
          }
        });

        if (existing.length > 0) {
          // Update existing
          await strapiModel.update(existing[0].id, {
            data: transformDataFromBackend(contentType, item)
          });
        } else {
          // Create new
          await strapiModel.create({
            data: {
              ...transformDataFromBackend(contentType, item),
              strapiId: item.id
            }
          });
        }
        imported++;
      } catch (err) {
        console.error(`Failed to import ${contentType} item:`, err.message);
      }
    }

    console.log(`[Backend → Strapi] ✅ Imported ${imported}/${backendData.length} ${contentType}`);
    return { success: true, count: imported };
  } catch (error) {
    console.error(`[Backend → Strapi] ❌ Import failed for ${contentType}:`, error.message);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Transform Backend data format sang Strapi format
 */
function transformDataFromBackend(contentType, data) {
  switch (contentType) {
    case 'products':
      return {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        status: data.status,
        rejectionReason: data.rejectionReason,
        viewCount: data.viewCount || 0,
        soldCount: data.soldCount || 0,
        isBestseller: data.isBestseller || false,
        isNew: data.isNew !== undefined ? data.isNew : true,
        reviewedAt: data.reviewedAt,
        backendId: data.id
      };
    
    case 'projects':
      return {
        title: data.title,
        description: data.description,
        status: data.status,
        budget: data.budget,
        startDate: data.startDate,
        endDate: data.endDate,
        clientId: data.clientId,
        engineerId: data.engineerId,
        backendId: data.id
      };
    
    case 'services':
      return {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        unit: data.unit,
        duration: data.duration,
        features: data.features || [],
        status: data.status,
        viewCount: data.viewCount || 0,
        orderCount: data.orderCount || 0,
        rating: data.rating,
        reviewCount: data.reviewCount || 0,
        backendId: data.id
      };
    
    case 'tasks':
      return {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        backendId: data.id
      };
    
    default:
      return data;
  }
}

module.exports = {
  syncToBackend,
  importFromBackend,
  transformDataForBackend,
  transformDataFromBackend
};
