# Replace 7 category screens with CategoryProductList

Write-Host "=== Replacing Category Screens ===" -ForegroundColor Cyan

# 1. Gạch men
$gachmen = @'
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function GachMenScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Gạch men & Gạch ốp lát"
      description="Gạch men, gạch granite, gạch ceramic chất lượng cao"
    />
  );
}
'@
$gachmen | Out-File -FilePath "app\shopping\gach-men.tsx" -Encoding UTF8 -Force
Write-Host "✅ gach-men.tsx" -ForegroundColor Green

# 2. Sơn
$son = @'
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function SonScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Sơn & Chất chống thấm"
      description="Sơn nước, sơn dầu, chất chống thấm đa dạng màu sắc"
    />
  );
}
'@
$son | Out-File -FilePath "app\shopping\son.tsx" -Encoding UTF8 -Force
Write-Host "✅ son.tsx" -ForegroundColor Green

# 3. Điện
$dien = @'
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function DienScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.ELECTRONICS}
      title="Thiết bị điện"
      description="Dây điện, ổ cắm, công tắc và thiết bị điện gia dụng"
    />
  );
}
'@
$dien | Out-File -FilePath "app\shopping\dien.tsx" -Encoding UTF8 -Force
Write-Host "✅ dien.tsx" -ForegroundColor Green

# 4. Nước
$nuoc = @'
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function NuocScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Thiết bị nước"
      description="Ống nước, van, đầu vòi và thiết bị vệ sinh"
    />
  );
}
'@
$nuoc | Out-File -FilePath "app\shopping\nuoc.tsx" -Encoding UTF8 -Force
Write-Host "✅ nuoc.tsx" -ForegroundColor Green

# 5. Cửa
$cua = @'
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function CuaScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Cửa & Cửa sổ"
      description="Cửa gỗ, cửa nhôm kính, khung cửa sổ đa dạng"
    />
  );
}
'@
$cua | Out-File -FilePath "app\shopping\cua.tsx" -Encoding UTF8 -Force
Write-Host "✅ cua.tsx" -ForegroundColor Green

# 6. Nội thất
$noithat = @'
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function NoiThatScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.HOME}
      title="Nội thất & Trang trí"
      description="Đèn trang trí, kệ, tủ và phụ kiện nội thất"
    />
  );
}
'@
$noithat | Out-File -FilePath "app\shopping\noi-that.tsx" -Encoding UTF8 -Force
Write-Host "✅ noi-that.tsx" -ForegroundColor Green

# 7. Điều hòa
$dieuhoa = @'
import { CategoryProductList } from '@/components/shopping/category-product-list';
import { ProductCategory } from '@/services/api';

export default function DieuHoaScreen() {
  return (
    <CategoryProductList
      category={ProductCategory.ELECTRONICS}
      title="Điều hòa & Quạt"
      description="Máy lạnh, điều hòa, quạt và thiết bị làm mát"
    />
  );
}
'@
$dieuhoa | Out-File -FilePath "app\shopping\dieu-hoa.tsx" -Encoding UTF8 -Force
Write-Host "✅ dieu-hoa.tsx" -ForegroundColor Green

Write-Host "`nDone! 7 files replaced (4,984 → 84 lines)" -ForegroundColor Cyan
