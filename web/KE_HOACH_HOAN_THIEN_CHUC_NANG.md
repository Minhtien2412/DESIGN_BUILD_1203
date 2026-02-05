# 📋 KẾ HOẠCH HOÀN THIỆN CHỨC NĂNG TRANG CHỦ

**Ngày tạo:** 2026-01-28  
**Cập nhật lần cuối:** 2026-01-28  
**Tổng số sections:** 10  
**Tổng số chức năng:** 114 items  
**Backend Controllers:** 57 files

---

## ✅ TIẾN ĐỘ HOÀN THÀNH

| Task | Module             | BE Status | FE Service | FE Screen  |
| ---- | ------------------ | --------- | ---------- | ---------- |
| 1.1  | House Design       | ✅ Done   | ✅ Done    | 🔄 Pending |
| 4.x  | Products/Equipment | ✅ Done   | ✅ Done    | 🔄 Pending |
| 6.x  | Workers            | ✅ Done   | ✅ Done    | 🔄 Pending |

### 📁 Files đã tạo/cập nhật:

**Backend (BE-baotienweb.cloud/src/):**

- ✅ `services/dto/house-design.dto.ts` - DTOs cho House Design
- ✅ `services/house-design.controller.ts` - Controller với CRUD + Admin approval
- ✅ `services/house-design.service.ts` - Service với mock data
- ✅ `services/services.module.ts` - Đã import HouseDesign
- ✅ `workers/dto/worker.dto.ts` - Mở rộng DTOs (WorkerQueryDto, ApproveWorkerDto, CreateWorkerReviewDto)
- ✅ `workers/workers.controller.ts` - 15+ endpoints (CRUD, reviews, admin approval)
- ✅ `workers/workers.service.ts` - Full service với mock data 10 workers
- ✅ `products/dto/product-query.dto.ts` - Categories cho equipment
- ✅ `products/products.controller.ts` - Thêm categories, featured, best-sellers
- ✅ `products/products.service.ts` - Thêm methods mới

**Frontend (services/):**

- ✅ `house-design.api.ts` - API service với types & helpers
- ✅ `workers.api.ts` - API service với types & helpers
- ✅ `products.api.ts` - API service với categories equipment

---

## 📊 TỔNG QUAN SECTIONS TRANG CHỦ

| #   | Section                                  | Số items | BE Controller            | Trạng thái        |
| --- | ---------------------------------------- | -------- | ------------------------ | ----------------- |
| 1   | SERVICES (Dịch vụ)                       | 16       | services.controller.ts   | ✅ Task 1.1 Done  |
| 2   | DESIGN_LIVE (Live stream)                | 6        | livestream.controller.ts | 🔄 Cần hoàn thiện |
| 3   | DESIGN_SERVICES (Tiện ích thiết kế)      | 16       | workers.controller.ts    | 🔄 Cần hoàn thiện |
| 4   | EQUIPMENT_ITEMS (Mua sắm thiết bị)       | 16       | products.controller.ts   | ✅ Task 4.x Done  |
| 5   | LIBRARY_ITEMS (Thư viện mẫu)             | 16       | services.controller.ts   | 🔄 Cần hoàn thiện |
| 6   | CONSTRUCTION_WORKERS (Tiện ích xây dựng) | 16       | workers.controller.ts    | ✅ Task 6.x Done  |
| 7   | VIDEO_ITEMS (Video công trình)           | 8        | video.controller.ts      | ✅ Đã có BE       |
| 8   | FINISHING_WORKERS (Tiện ích hoàn thiện)  | 16       | workers.controller.ts    | ✅ Task 6.x Done  |
| 9   | CATEGORY_ITEMS (Danh mục)                | 8        | -                        | 🔄 Cần hoàn thiện |
| 10  | External Content (News/Videos)           | -        | External APIs            | ✅ Đã tích hợp    |

---

## 🎯 CHI TIẾT TỪNG TASK HOÀN THIỆN

---

### 📦 SECTION 1: DỊCH VỤ (SERVICES) - 16 items

| Task # | Chức năng             | Route FE                        | BE API cần                            | Admin approval       | Trạng thái |
| ------ | --------------------- | ------------------------------- | ------------------------------------- | -------------------- | ---------- |
| 1.1    | **Thiết kế nhà**      | `/services/house-design`        | `GET/POST /services/house-designs`    | ✅ Admin duyệt mẫu   | ✅ DONE    |
| 1.2    | **Thiết kế nội thất** | `/services/interior-design`     | `GET/POST /services/interior-designs` | ✅ Admin duyệt       | 🔄         |
| 1.3    | **Tra cứu xây dựng**  | `/construction`                 | `GET /construction/lookup`            | ❌                   | ✅         |
| 1.4    | **Xin phép XD**       | `/services/permit`              | `GET/POST /services/permits`          | ✅ Admin duyệt hồ sơ | 🔄         |
| 1.5    | **Hồ sơ mẫu**         | `/documents`                    | `GET /documents/templates`            | ✅ Admin upload      | 🔄         |
| 1.6    | **Lô ban**            | `/tools/lo-ban-ruler`           | ❌ Tính toán local                    | ❌                   | ✅         |
| 1.7    | **Bảng màu**          | `/tools/color-picker`           | ❌ Tính toán local                    | ❌                   | ✅         |
| 1.8    | **Tư vấn CL**         | `/quality-assurance`            | `GET /qc/consultations`               | ❌                   | 🔄         |
| 1.9    | **Công ty XD**        | `/contractor`                   | `GET /workers?type=company`           | ✅ Admin duyệt       | 🔄         |
| 1.10   | **Công ty NT**        | `/services/interior-design`     | `GET /workers?type=interior`          | ✅ Admin duyệt       | 🔄         |
| 1.11   | **Giám sát CL**       | `/services/quality-supervision` | `GET /services/supervisors`           | ✅ Admin duyệt       | 🔄         |
| 1.12   | **Dự toán**           | `/calculators`                  | `POST /utilities/estimate`            | ❌                   | 🔄         |
| 1.13   | **Vật liệu**          | `/materials`                    | `GET /products?category=materials`    | ✅ Admin duyệt SP    | ✅ DONE    |
| 1.14   | **AI Thiết kế**       | `/ai-design`                    | `POST /ai/design`                     | ❌                   | 🔄         |
| 1.15   | **Tìm thợ**           | `/workers`                      | `GET /workers`                        | ✅ Admin duyệt thợ   | ✅ DONE    |
| 1.16   | **Xem thêm**          | `/(tabs)/menu`                  | ❌                                    | ❌                   | ✅         |

#### 📝 TASK 1.1: THIẾT KẾ NHÀ (House Design) ✅ COMPLETED

```
✅ BE API Endpoints:
- GET /services/house-designs - Lấy danh sách với filters
- GET /services/house-designs/types - Lấy loại thiết kế
- GET /services/house-designs/styles - Lấy phong cách
- GET /services/house-designs/featured - Mẫu nổi bật
- GET /services/house-designs/:id - Chi tiết mẫu
- POST /services/house-designs - Thêm mẫu mới (auth)
- PATCH /services/house-designs/:id - Cập nhật
- DELETE /services/house-designs/:id - Xóa
- GET /services/house-designs/admin/pending - Danh sách chờ duyệt
- PATCH /services/house-designs/:id/approve - Admin duyệt
- PATCH /services/house-designs/:id/feature - Toggle nổi bật

✅ FE Service: services/house-design.api.ts
- Types: DesignType (15 loại), DesignStyle (8 phong cách)
- Functions: getHouseDesigns, getDesignTypes, getFeaturedDesigns...
- Helpers: getDesignTypeLabel, formatCost...
```

#### 📝 TASK 1.4: XIN PHÉP XÂY DỰNG (Building Permit)

```
Yêu cầu FE:
- Form nộp hồ sơ xin phép
- Upload bản vẽ, giấy tờ
- Theo dõi trạng thái hồ sơ
- Timeline tiến trình

Yêu cầu BE:
- POST /services/permits - Nộp hồ sơ
- GET /services/permits/:id - Xem trạng thái
- GET /services/permits/my - Danh sách hồ sơ của user
- PATCH /services/permits/:id/status - Admin cập nhật trạng thái

Admin Panel:
- Xem tất cả hồ sơ
- Lọc theo trạng thái: pending, reviewing, approved, rejected
- Ghi chú và phản hồi
```

---

### 📦 SECTION 2: DESIGN LIVE (Livestream) - 6 items

| Task # | Chức năng         | Route FE | BE API                   | Trạng thái |
| ------ | ----------------- | -------- | ------------------------ | ---------- |
| 2.1    | **Live Stream 1** | `/live`  | `GET /livestream/active` | 🔄         |
| 2.2    | **Live Stream 2** | `/live`  | `GET /livestream/active` | 🔄         |
| 2.3    | **Live Stream 3** | `/live`  | `GET /livestream/active` | 🔄         |
| 2.4    | **Live Stream 4** | `/live`  | `GET /livestream/active` | 🔄         |
| 2.5    | **Live Stream 5** | `/live`  | `GET /livestream/active` | 🔄         |
| 2.6    | **Live Stream 6** | `/live`  | `GET /livestream/active` | 🔄         |

#### 📝 TASK 2.1: LIVESTREAM FEATURE

```
Yêu cầu FE:
- Hiển thị danh sách live đang phát
- Xem livestream với chat real-time
- Bắt đầu live (cho ARCHITECT/DESIGNER/CONTRACTOR)

Yêu cầu BE (livestream.controller.ts):
- GET /livestream/active - Danh sách live đang phát
- POST /livestream/start - Bắt đầu live
- POST /livestream/end - Kết thúc live
- WebSocket integration với LiveKit

Admin Panel:
- Monitor all livestreams
- Force end inappropriate streams
```

---

### 📦 SECTION 3: TIỆN ÍCH THIẾT KẾ (Design Services) - 16 items

| Task # | Chức năng        | Route FE                         | BE API                         | Admin | Status |
| ------ | ---------------- | -------------------------------- | ------------------------------ | ----- | ------ |
| 3.1    | **Kiến trúc sư** | `/services/house-design`         | `GET /workers?type=architect`  | ✅    | 🔄     |
| 3.2    | **Kỹ sư**        | `/services/construction-company` | `GET /workers?type=engineer`   | ✅    | 🔄     |
| 3.3    | **Kết cấu**      | `/services/construction-lookup`  | `GET /workers?type=structural` | ✅    | 🔄     |
| 3.4    | **Điện**         | `/finishing/dien-nuoc`           | `GET /workers?type=electrical` | ✅    | 🔄     |
| 3.5    | **Nước**         | `/finishing/dien-nuoc`           | `GET /workers?type=plumbing`   | ✅    | 🔄     |
| 3.6    | **Dự toán**      | `/calculators`                   | `POST /utilities/estimate`     | ❌    | 🔄     |
| 3.7    | **Nội thất**     | `/services/interior-design`      | `GET /workers?type=interior`   | ✅    | 🔄     |
| 3.8    | **Công cụ AI**   | `/ai-design`                     | `POST /ai/design`              | ❌    | 🔄     |
| 3.9    | **Phong thủy**   | `/tools/feng-shui-ai`            | `POST /ai/feng-shui`           | ❌    | 🔄     |
| 3.10   | **Xin phép XD**  | `/services/permit`               | `POST /services/permits`       | ✅    | 🔄     |
| 3.11   | **Khảo sát**     | `/construction`                  | `GET /services/surveys`        | ✅    | 🔄     |
| 3.12   | **Thiết kế 3D**  | `/ai-design`                     | `POST /ai/3d-design`           | ❌    | 🔄     |
| 3.13   | **Bản vẽ**       | `/documents`                     | `GET /documents/drawings`      | ✅    | 🔄     |
| 3.14   | **Thi công**     | `/contractor`                    | `GET /workers?type=contractor` | ✅    | 🔄     |
| 3.15   | **Giám sát**     | `/services/quality-supervision`  | `GET /workers?type=supervisor` | ✅    | 🔄     |
| 3.16   | **Nghiệm thu**   | `/quality-assurance`             | `GET /qc/acceptance`           | ✅    | 🔄     |

---

### 📦 SECTION 4: MUA SẮM THIẾT BỊ (Equipment) - 16 items

| Task # | Chức năng            | Route FE                           | BE API                                | Status |
| ------ | -------------------- | ---------------------------------- | ------------------------------------- | ------ |
| 4.1    | **Thiết bị bếp**     | `/equipment?category=kitchen`      | `GET /products?category=kitchen`      | 🔄     |
| 4.2    | **Thiết bị vệ sinh** | `/equipment?category=bathroom`     | `GET /products?category=bathroom`     | 🔄     |
| 4.3    | **Điện**             | `/equipment?category=electrical`   | `GET /products?category=electrical`   | 🔄     |
| 4.4    | **Nước**             | `/equipment?category=plumbing`     | `GET /products?category=plumbing`     | 🔄     |
| 4.5    | **PCCC**             | `/equipment?category=fire-safety`  | `GET /products?category=fire-safety`  | 🔄     |
| 4.6    | **Bàn ăn**           | `/shop?type=dining`                | `GET /products?type=dining`           | 🔄     |
| 4.7    | **Bàn học**          | `/shop?type=desk`                  | `GET /products?type=desk`             | 🔄     |
| 4.8    | **Sofa**             | `/shop?type=sofa`                  | `GET /products?type=sofa`             | 🔄     |
| 4.9    | **Tủ quần áo**       | `/shop?type=wardrobe`              | `GET /products?type=wardrobe`         | 🔄     |
| 4.10   | **Giường ngủ**       | `/shop?type=bed`                   | `GET /products?type=bed`              | 🔄     |
| 4.11   | **Đèn trang trí**    | `/shop?category=lighting`          | `GET /products?category=lighting`     | 🔄     |
| 4.12   | **Rèm cửa**          | `/shop?category=curtain`           | `GET /products?category=curtain`      | 🔄     |
| 4.13   | **Máy lạnh**         | `/equipment?category=hvac`         | `GET /products?category=hvac`         | 🔄     |
| 4.14   | **Máy nước nóng**    | `/equipment?category=water-heater` | `GET /products?category=water-heater` | 🔄     |
| 4.15   | **Bồn tắm**          | `/equipment?category=bathroom`     | `GET /products?category=bathtub`      | 🔄     |
| 4.16   | **Xem thêm**         | `/shop`                            | `GET /products`                       | 🔄     |

#### 📝 TASK 4.x: PRODUCTS/EQUIPMENT MODULE

```
Yêu cầu BE (products.controller.ts):
- GET /products - Lấy danh sách SP với filter
- GET /products/:id - Chi tiết SP
- POST /products - SUPPLIER thêm SP mới
- PUT /products/:id - Cập nhật SP
- PATCH /products/:id/approve - Admin duyệt SP

Admin Panel:
- Duyệt sản phẩm mới từ suppliers
- Quản lý categories
- Featured products
```

---

### 📦 SECTION 5: THƯ VIỆN (Library) - 16 items

| Task # | Chức năng            | Route FE                    | BE API                                    | Status |
| ------ | -------------------- | --------------------------- | ----------------------------------------- | ------ |
| 5.1    | **Văn phòng**        | `/categories/office`        | `GET /services/templates?type=office`     | 🔄     |
| 5.2    | **Nhà phố**          | `/categories/townhouse`     | `GET /services/templates?type=townhouse`  | 🔄     |
| 5.3    | **Biệt thự**         | `/categories/villa`         | `GET /services/templates?type=villa`      | 🔄     |
| 5.4    | **Biệt thự cổ điển** | `/categories/classic-villa` | `GET /services/templates?type=classic`    | 🔄     |
| 5.5    | **Khách sạn**        | `/categories/hotel`         | `GET /services/templates?type=hotel`      | 🔄     |
| 5.6    | **Nhà xưởng**        | `/categories/factory`       | `GET /services/templates?type=factory`    | 🔄     |
| 5.7    | **Căn hộ DV**        | `/categories/apartment`     | `GET /services/templates?type=apartment`  | 🔄     |
| 5.8    | **Nhà hàng**         | `/categories/restaurant`    | `GET /services/templates?type=restaurant` | 🔄     |
| 5.9    | **Cafe**             | `/categories/cafe`          | `GET /services/templates?type=cafe`       | 🔄     |
| 5.10   | **Spa**              | `/categories/spa`           | `GET /services/templates?type=spa`        | 🔄     |
| 5.11   | **Gym**              | `/categories/gym`           | `GET /services/templates?type=gym`        | 🔄     |
| 5.12   | **Trường học**       | `/categories/school`        | `GET /services/templates?type=school`     | 🔄     |
| 5.13   | **Bệnh viện**        | `/categories/hospital`      | `GET /services/templates?type=hospital`   | 🔄     |
| 5.14   | **Showroom**         | `/categories/showroom`      | `GET /services/templates?type=showroom`   | 🔄     |
| 5.15   | **Kho**              | `/warehouse`                | `GET /services/templates?type=warehouse`  | 🔄     |
| 5.16   | **Xem thêm**         | `/categories`               | `GET /services/templates`                 | 🔄     |

---

### 📦 SECTION 6: TIỆN ÍCH XÂY DỰNG (Construction Workers) - 16 items

| Task # | Chức năng         | Route FE                        | BE API                              | Admin | Status |
| ------ | ----------------- | ------------------------------- | ----------------------------------- | ----- | ------ |
| 6.1    | **Ép cọc**        | `/workers?specialty=ep-coc`     | `GET /workers?specialty=ep-coc`     | ✅    | 🔄     |
| 6.2    | **Đào đất**       | `/workers?specialty=dao-dat`    | `GET /workers?specialty=dao-dat`    | ✅    | 🔄     |
| 6.3    | **Vật liệu**      | `/materials`                    | `GET /products?category=materials`  | ✅    | 🔄     |
| 6.4    | **Nhân công XD**  | `/workers?specialty=nhan-cong`  | `GET /workers?specialty=labor`      | ✅    | 🔄     |
| 6.5    | **Thợ xây**       | `/workers?specialty=tho-xay`    | `GET /workers?specialty=mason`      | ✅    | 🔄     |
| 6.6    | **Thợ sắt**       | `/workers?specialty=tho-sat`    | `GET /workers?specialty=steel`      | ✅    | 🔄     |
| 6.7    | **Thợ coffa**     | `/workers?specialty=tho-coffa`  | `GET /workers?specialty=coffa`      | ✅    | 🔄     |
| 6.8    | **Thợ cơ khí**    | `/workers?specialty=co-khi`     | `GET /workers?specialty=mechanic`   | ✅    | 🔄     |
| 6.9    | **Thợ tô tường**  | `/workers?specialty=to-tuong`   | `GET /workers?specialty=plastering` | ✅    | 🔄     |
| 6.10   | **Thợ điện nước** | `/finishing/dien-nuoc`          | `GET /workers?specialty=mep`        | ✅    | 🔄     |
| 6.11   | **Bê tông**       | `/materials?category=be-tong`   | `GET /products?category=concrete`   | ✅    | 🔄     |
| 6.12   | **Cốp pha**       | `/workers?specialty=cop-pha`    | `GET /workers?specialty=formwork`   | ✅    | 🔄     |
| 6.13   | **Máy móc**       | `/equipment?category=machinery` | `GET /products?category=machinery`  | ✅    | 🔄     |
| 6.14   | **Vận tải**       | `/fleet`                        | `GET /fleet/vehicles`               | ✅    | 🔄     |
| 6.15   | **Giám sát**      | `/services/quality-supervision` | `GET /workers?type=supervisor`      | ✅    | 🔄     |
| 6.16   | **Xem thêm**      | `/workers`                      | `GET /workers`                      | ✅    | 🔄     |

#### 📝 TASK 6.x: WORKERS MODULE

```
Yêu cầu BE (workers.controller.ts):
- GET /workers - Lấy danh sách thợ với filter
- GET /workers/:id - Chi tiết thợ
- POST /workers/register - Đăng ký làm thợ
- PUT /workers/:id - Cập nhật profile
- PATCH /workers/:id/approve - Admin duyệt thợ
- GET /workers/:id/reviews - Đánh giá của thợ

Admin Panel:
- Duyệt thợ mới đăng ký
- Xác minh CMND/CCCD
- Quản lý specialties
```

---

### 📦 SECTION 7: VIDEO (Construction Videos) - 8 items

| Task #  | Chức năng            | Route FE  | BE API             | Status   |
| ------- | -------------------- | --------- | ------------------ | -------- |
| 7.1-7.8 | **Video công trình** | `/videos` | `GET /video/reels` | ✅ Đã có |

#### 📝 TASK 7.1: VIDEO/REELS MODULE (ĐÃ CÓ)

```
BE Controllers đã có:
- video.controller.ts
- video-interactions.controller.ts
- reels.controller.ts
- ratings.controller.ts

Cần hoàn thiện FE:
- Upload video mới
- Admin duyệt video
- Report/flag video
```

---

### 📦 SECTION 8: TIỆN ÍCH HOÀN THIỆN (Finishing Workers) - 16 items

| Task # | Chức năng         | Route FE                  | BE API                                  | Admin | Status |
| ------ | ----------------- | ------------------------- | --------------------------------------- | ----- | ------ |
| 8.1    | **Thợ lát gạch**  | `/finishing/lat-gach`     | `GET /workers?specialty=tiling`         | ✅    | 🔄     |
| 8.2    | **Thợ thạch cao** | `/finishing/thach-cao`    | `GET /workers?specialty=gypsum`         | ✅    | 🔄     |
| 8.3    | **Thợ sơn**       | `/finishing/son`          | `GET /workers?specialty=painting`       | ✅    | 🔄     |
| 8.4    | **Thợ đá**        | `/finishing/da`           | `GET /workers?specialty=stone`          | ✅    | 🔄     |
| 8.5    | **Thợ làm cửa**   | `/finishing/lam-cua`      | `GET /workers?specialty=door`           | ✅    | 🔄     |
| 8.6    | **Thợ lan can**   | `/finishing/lan-can`      | `GET /workers?specialty=railing`        | ✅    | 🔄     |
| 8.7    | **Thợ cổng**      | `/finishing`              | `GET /workers?specialty=gate`           | ✅    | 🔄     |
| 8.8    | **Thợ camera**    | `/finishing/camera`       | `GET /workers?specialty=cctv`           | ✅    | 🔄     |
| 8.9    | **Thợ ốp đá**     | `/finishing/op-da`        | `GET /workers?specialty=stone-cladding` | ✅    | 🔄     |
| 8.10   | **Thợ điện**      | `/finishing/dien-nuoc`    | `GET /workers?specialty=electrical`     | ✅    | 🔄     |
| 8.11   | **Thợ nội thất**  | `/finishing/noi-that`     | `GET /workers?specialty=interior`       | ✅    | 🔄     |
| 8.12   | **Tổng hợp**      | `/finishing/tho-tong-hop` | `GET /workers?specialty=general`        | ✅    | 🔄     |
| 8.13   | **Thợ mộc**       | `/finishing`              | `GET /workers?specialty=carpentry`      | ✅    | 🔄     |
| 8.14   | **Thợ nhôm kính** | `/finishing`              | `GET /workers?specialty=aluminum`       | ✅    | 🔄     |
| 8.15   | **Thợ vệ sinh**   | `/finishing`              | `GET /workers?specialty=cleaning`       | ✅    | 🔄     |
| 8.16   | **Xem thêm**      | `/finishing`              | `GET /workers?category=finishing`       | ✅    | 🔄     |

---

### 📦 SECTION 9: DANH MỤC (Category) - 8 items

| Task # | Chức năng              | Route FE                 | BE API                            | Status |
| ------ | ---------------------- | ------------------------ | --------------------------------- | ------ |
| 9.1    | **Lát gạch**           | `/finishing/lat-gach`    | `GET /workers?specialty=tiling`   | 🔄     |
| 9.2    | **Nội quy công trình** | `/documents`             | `GET /documents?type=rules`       | 🔄     |
| 9.3    | **Bảo quản thiết bị**  | `/equipment/maintenance` | `GET /documents?type=maintenance` | 🔄     |
| 9.4    | **Ốp đá**              | `/finishing/op-da`       | `GET /workers?specialty=stone`    | 🔄     |
| 9.5    | **Sơn tường**          | `/finishing/son`         | `GET /workers?specialty=paint`    | 🔄     |
| 9.6    | **Thạch cao**          | `/finishing/thach-cao`   | `GET /workers?specialty=gypsum`   | 🔄     |
| 9.7    | **Làm cửa**            | `/finishing/lam-cua`     | `GET /workers?specialty=door`     | 🔄     |
| 9.8    | **Camera**             | `/finishing/camera`      | `GET /workers?specialty=cctv`     | 🔄     |

---

## 🔧 DANH SÁCH BE API CẦN BỔ SUNG/CHỈNH SỬA

### 1. services.controller.ts - CẦN THÊM:

```typescript
// House Design endpoints
GET /services/house-designs
POST /services/house-designs
PATCH /services/house-designs/:id/approve

// Interior Design endpoints
GET /services/interior-designs
POST /services/interior-designs
PATCH /services/interior-designs/:id/approve

// Permit endpoints
POST /services/permits
GET /services/permits/:id
PATCH /services/permits/:id/status

// Templates endpoints
GET /services/templates
POST /services/templates
```

### 2. workers.controller.ts - CẦN THÊM:

```typescript
// Worker registration with verification
POST /workers/register
PATCH /workers/:id/verify
PATCH /workers/:id/approve

// Filter by specialty
GET /workers?specialty=xxx
GET /workers/:id/reviews
POST /workers/:id/reviews
```

### 3. products.controller.ts - CẦN THÊM:

```typescript
// Category filter
GET /products?category=xxx&type=xxx

// Supplier upload
POST /products (for SUPPLIER role)
PATCH /products/:id/approve (for ADMIN role)
```

---

## 📅 TIMELINE HOÀN THIỆN (ĐỀ XUẤT)

### Tuần 1: Core Services (Task 1.1 - 1.5)

- [ ] Task 1.1: Thiết kế nhà - 2 ngày
- [ ] Task 1.2: Thiết kế nội thất - 1 ngày
- [ ] Task 1.4: Xin phép XD - 2 ngày
- [ ] Task 1.5: Hồ sơ mẫu - 1 ngày

### Tuần 2: Workers Module (Task 6.x, 8.x)

- [ ] Workers BE API completion - 2 ngày
- [ ] Workers FE integration - 2 ngày
- [ ] Admin approval flow - 1 ngày

### Tuần 3: Products/Equipment (Task 4.x)

- [ ] Products API filter enhancement - 1 ngày
- [ ] Equipment screens - 2 ngày
- [ ] Shop integration - 2 ngày

### Tuần 4: Library & Categories (Task 5.x, 9.x)

- [ ] Templates API - 1 ngày
- [ ] Category screens - 2 ngày
- [ ] Testing & fixes - 2 ngày

---

## 🛠️ CÁCH CHẠY TỪNG TASK

### Quy trình mỗi task:

1. **Check BE API** - Kiểm tra API endpoint đã có chưa
2. **Tạo/Update API** - Nếu chưa có, tạo trong BE controller
3. **Update FE Service** - Cập nhật service gọi API
4. **Update FE Screen** - Cập nhật UI để hiển thị data
5. **Add Admin Flow** - Thêm chức năng admin duyệt (nếu cần)
6. **Test** - Test FE+BE integration

### Commands:

```bash
# Test BE
cd BE-baotienweb.cloud && npm run test

# Run BE
cd BE-baotienweb.cloud && npm run start:dev

# Run FE
npm start

# Test specific route
curl https://baotienweb.cloud/api/v1/workers?specialty=mason
```

---

## 📊 TỔNG KẾT

- **Tổng tasks:** 114 items
- **Đã hoàn thành:** ~15 items (13%)
- **Cần BE API:** ~45 endpoints
- **Cần Admin flow:** ~25 features
- **Ước tính:** 4 tuần để hoàn thiện cơ bản

---

_Cập nhật lần cuối: 2026-01-28_
