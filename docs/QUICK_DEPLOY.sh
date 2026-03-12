# Quick Deploy Script
# Copy paste từng block vào SSH terminal

# ==================================================
# BLOCK 1: Generate Prisma & Migrate
# ==================================================
cd /root/baotienweb-api
npx prisma generate
npx prisma migrate dev --name add_services_utilities_modules

# ==================================================
# BLOCK 2: Create Services Module Directory
# ==================================================
mkdir -p src/services/dto

# ==================================================
# BLOCK 3: Create services.controller.ts
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.controller.ts
# COPY TOÀN BỘ NỘI DUNG, SAU ĐÓ CHẠY:

cat > src/services/services.controller.ts << 'CONTROLLER_EOF'
# PASTE NỘI DUNG Ở ĐÂY
CONTROLLER_EOF

# ==================================================
# BLOCK 4: Create services.service.ts
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.service.ts
# COPY TOÀN BỘ NỘI DUNG, SAU ĐÓ CHẠY:

cat > src/services/services.service.ts << 'SERVICE_EOF'
# PASTE NỘI DUNG Ở ĐÂY
SERVICE_EOF

# ==================================================
# BLOCK 5: Create services.module.ts
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.module.ts

cat > src/services/services.module.ts << 'MODULE_EOF'
# PASTE NỘI DUNG Ở ĐÂY
MODULE_EOF

# ==================================================
# BLOCK 6: Create services DTOs
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.dto.ts

cat > src/services/dto/index.ts << 'DTO_EOF'
# PASTE NỘI DUNG Ở ĐÂY
DTO_EOF

# ==================================================
# BLOCK 7: Create Utilities Module Directory
# ==================================================
mkdir -p src/utilities/dto

# ==================================================
# BLOCK 8: Create utilities.controller.ts
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.controller.ts

cat > src/utilities/utilities.controller.ts << 'CONTROLLER_EOF'
# PASTE NỘI DUNG Ở ĐÂY
CONTROLLER_EOF

# ==================================================
# BLOCK 9: Create utilities.service.ts
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.service.ts

cat > src/utilities/utilities.service.ts << 'SERVICE_EOF'
# PASTE NỘI DUNG Ở ĐÂY
SERVICE_EOF

# ==================================================
# BLOCK 10: Create utilities.module.ts
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.module.ts

cat > src/utilities/utilities.module.ts << 'MODULE_EOF'
# PASTE NỘI DUNG Ở ĐÂY
MODULE_EOF

# ==================================================
# BLOCK 11: Create utilities DTOs
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.dto.ts

cat > src/utilities/dto/index.ts << 'DTO_EOF'
# PASTE NỘI DUNG Ở ĐÂY
DTO_EOF

# ==================================================
# BLOCK 12: Verify Files Created
# ==================================================
ls -la src/services/
ls -la src/services/dto/
ls -la src/utilities/
ls -la src/utilities/dto/

# ==================================================
# BLOCK 13: Update app.module.ts
# ==================================================
# MANUAL STEP - SỬ DỤNG nano:
nano src/app.module.ts

# THÊM 2 DÒNG IMPORT Ở ĐẦU FILE (sau các import khác):
# import { ServicesModule } from './services/services.module';
# import { UtilitiesModule } from './utilities/utilities.module';

# THÊM 2 MODULE VÀO IMPORTS ARRAY:
#   imports: [
#     ... existing modules,
#     ServicesModule,
#     UtilitiesModule,
#   ],

# LƯU: Ctrl+O, Enter, Ctrl+X

# ==================================================
# BLOCK 14: Verify app.module.ts
# ==================================================
cat src/app.module.ts | grep -E "ServicesModule|UtilitiesModule"

# ==================================================
# BLOCK 15: Install & Build
# ==================================================
npm install
npm run build

# ==================================================
# BLOCK 16: Restart PM2
# ==================================================
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 50

# ==================================================
# BLOCK 17: Check Status
# ==================================================
pm2 status

# ==================================================
# BLOCK 18: Test API - Login
# ==================================================
curl -X POST "https://baotienweb.cloud/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'

# COPY access_token từ response, gán vào biến:
TOKEN="YOUR_TOKEN_HERE"

# ==================================================
# BLOCK 19: Test Services API
# ==================================================
# Get all services
curl -X GET "https://baotienweb.cloud/api/v1/services"

# Create service
curl -X POST "https://baotienweb.cloud/api/v1/services" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thiết kế kiến trúc",
    "description": "Thiết kế bản vẽ kiến trúc 2D/3D",
    "category": "DESIGN",
    "price": 500000,
    "unit": "m²",
    "duration": "2-3 tháng"
  }'

# ==================================================
# BLOCK 20: Test Utilities API
# ==================================================
# Get all utilities
curl -X GET "https://baotienweb.cloud/api/v1/utilities"

# Create utility
curl -X POST "https://baotienweb.cloud/api/v1/utilities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tính toán vật liệu",
    "description": "Công cụ tính toán lượng vật liệu",
    "type": "CALCULATOR",
    "icon": "calculator-outline",
    "color": "#3B82F6",
    "route": "/utilities/calculator"
  }'

# ==================================================
# BLOCK 21: Seed Sample Data (Optional)
# ==================================================
# MỞ FILE: c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\seed-admin.ts
# COPY TOÀN BỘ NỘI DUNG, SAU ĐÓ:

cat > prisma/seed-admin.ts << 'SEED_EOF'
# PASTE NỘI DUNG Ở ĐÂY
SEED_EOF

# Run seed
npx ts-node prisma/seed-admin.ts

# ==================================================
# BLOCK 22: Verify Swagger
# ==================================================
# Mở browser: https://baotienweb.cloud/api/docs
# Tìm "Construction Services" và "App Utilities"

# ==================================================
# ✅ DEPLOYMENT COMPLETED!
# ==================================================
