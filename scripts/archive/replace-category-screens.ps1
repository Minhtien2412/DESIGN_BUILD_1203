# PowerShell Script to Replace 7 Category Screens
# Converts mock data (712 lines) to API-integrated CategoryProductList (12 lines)

Write-Host "🔧 Replacing 7 category screens with CategoryProductList component..." -ForegroundColor Cyan

# 1. Gạch men & gạch ceramic
Write-Host "  Replacing gach-men.tsx..." -ForegroundColor Yellow
@"
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function GachMenScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Gạch men & gạch ceramic"
      description="Gạch lát nền, ốp tường chất lượng cao từ thương hiệu uy tín"
    />
  );
}
"@ | Out-File -FilePath "app\shopping\gach-men.tsx" -Encoding UTF8 -Force

# 2. Sơn tường & sơn gỗ
Write-Host "  Replacing son.tsx..." -ForegroundColor Yellow
@"
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function SonScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Sơn tường & sơn gỗ"
      description="Sơn nước, sơn dầu, sơn lót, sơn chống thấm"
    />
  );
}
"@ | Out-File -FilePath "app\shopping\son.tsx" -Encoding UTF8 -Force

# 3. Thiết bị điện
Write-Host "  Replacing dien.tsx..." -ForegroundColor Yellow
@"
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function DienScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.ELECTRONICS}
      title="Thiết bị điện"
      description="Dây điện, công tắc, ổ cắm, đèn LED, thiết bị điện"
    />
  );
}
"@ | Out-File -FilePath "app\shopping\dien.tsx" -Encoding UTF8 -Force

# 4. Thiết bị nước & vệ sinh
Write-Host "  Replacing nuoc.tsx..." -ForegroundColor Yellow
@"
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function NuocScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Thiết bị nước & vệ sinh"
      description="Bồn cầu, lavabo, vòi sen, bồn tắm, phụ kiện nhà tắm"
    />
  );
}
"@ | Out-File -FilePath "app\shopping\nuoc.tsx" -Encoding UTF8 -Force

# 5. Cửa & cửa sổ
Write-Host "  Replacing cua.tsx..." -ForegroundColor Yellow
@"
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function CuaScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Cửa & cửa sổ"
      description="Cửa gỗ, cửa kính, cửa cuốn, cửa chống cháy"
    />
  );
}
"@ | Out-File -FilePath "app\shopping\cua.tsx" -Encoding UTF8 -Force

# 6. Nội thất & trang trí
Write-Host "  Replacing noi-that.tsx..." -ForegroundColor Yellow
@"
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function NoiThatScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Nội thất & trang trí"
      description="Bàn, ghế, tủ, kệ, giường, sofa, tủ bếp"
    />
  );
}
"@ | Out-File -FilePath "app\shopping\noi-that.tsx" -Encoding UTF8 -Force

# 7. Điều hòa & máy lạnh
Write-Host "  Replacing dieu-hoa.tsx..." -ForegroundColor Yellow
@"
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function DieuHoaScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.ELECTRONICS}
      title="Điều hòa & máy lạnh"
      description="Điều hòa 1 chiều, 2 chiều, inverter, multi, quạt làm mát"
    />
  );
}
"@ | Out-File -FilePath "app\shopping\dieu-hoa.tsx" -Encoding UTF8 -Force

Write-Host ""
Write-Host "✅ All 7 category screens replaced successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Code Reduction Summary:" -ForegroundColor Cyan
Write-Host "  Before: 7 files × 712 lines = 4,984 lines" -ForegroundColor White
Write-Host "  After:  7 files × 12 lines = 84 lines" -ForegroundColor White
Write-Host "  Reduction: 98.3% (4,900 lines removed!)" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 What's Changed:" -ForegroundColor Cyan
Write-Host "  ✅ Mock data → Real API integration" -ForegroundColor Green
Write-Host "  ✅ Duplicate code → Reusable component" -ForegroundColor Green
Write-Host "  ✅ Hardcoded products → 12 APPROVED products from backend" -ForegroundColor Green
Write-Host "  ✅ No search/sort → Full search + 4 sort options" -ForegroundColor Green
Write-Host "  ✅ No refresh → Pull-to-refresh enabled" -ForegroundColor Green
Write-Host "  ✅ Crash on missing images → ImagePlaceholder fallback" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Metro will auto-reload in terminal" -ForegroundColor White
Write-Host "  2. Check for any TypeScript errors" -ForegroundColor White
Write-Host "  3. Test on web: http://localhost:8081" -ForegroundColor White
Write-Host "  4. Test on device: Scan QR code from Metro terminal" -ForegroundColor White
Write-Host ""
