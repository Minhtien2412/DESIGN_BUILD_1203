# ========================================
# NORDIC GRADIENT THEME APPLIED
# White-Black-Green (#4AA14A) Palette
# ========================================

Write-Host "`n=== NORDIC GRADIENT UPDATES ===" -ForegroundColor Green
Write-Host "`nChanges Applied:" -ForegroundColor Cyan

Write-Host "`n1. Category Gradients (constants/categories.ts)" -ForegroundColor Yellow
Write-Host "   Construction Category:" -ForegroundColor White
Write-Host "     Before: gradient: ['#FF6B6B', '#FF8E8E'] (Red)" -ForegroundColor Red
Write-Host "     After:  gradient: ['#FFFFFF', '#4AA14A'] (White to Green)" -ForegroundColor Green
Write-Host "     Color:  #4AA14A (Nordic green)" -ForegroundColor Green

Write-Host "`n   Procurement Category:" -ForegroundColor White
Write-Host "     Before: gradient: ['#F38181', '#F59C9C'] (Pink)" -ForegroundColor Red
Write-Host "     After:  gradient: ['#FFFFFF', '#4AA14A'] (White to Green)" -ForegroundColor Green
Write-Host "     Color:  #4AA14A (Nordic green)" -ForegroundColor Green

Write-Host "`n2. Quick Actions Colors" -ForegroundColor Yellow
Write-Host "   'Tạo dự án':" -ForegroundColor White
Write-Host "     Before: #FF6B6B (Red)" -ForegroundColor Red
Write-Host "     After:  #4AA14A (Green)" -ForegroundColor Green

Write-Host "`n   'Thêm chi phí':" -ForegroundColor White
Write-Host "     Before: #F38181 (Pink)" -ForegroundColor Red
Write-Host "     After:  #808080 (Gray)" -ForegroundColor Gray

Write-Host "`n=== GRADIENT USAGE EXAMPLES ===" -ForegroundColor Cyan

Write-Host "`n1. CSS Linear Gradient (Web):" -ForegroundColor Yellow
Write-Host @"
/* White to Green (recommended) */
background-image: linear-gradient(129.806deg, 
  rgba(255, 255, 255, 1), 
  rgba(74, 161, 74, 0.87)
);

/* Green to White (alternative) */
background-image: linear-gradient(129.806deg, 
  rgba(74, 161, 74, 1), 
  rgba(255, 255, 255, 0.87)
);

/* Subtle Three-tone */
background-image: linear-gradient(129.806deg, 
  rgba(255, 255, 255, 1), 
  rgba(240, 240, 240, 0.9), 
  rgba(74, 161, 74, 0.87)
);
"@ -ForegroundColor White

Write-Host "`n2. React Native LinearGradient:" -ForegroundColor Yellow
Write-Host @"
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#FFFFFF', '#4AA14A']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.gradient}
>
  {/* content */}
</LinearGradient>
"@ -ForegroundColor White

Write-Host "`n=== COLOR PALETTE REFERENCE ===" -ForegroundColor Cyan
Write-Host "Primary:       #4AA14A (Green)" -ForegroundColor Green
Write-Host "Background:    #FFFFFF (White)" -ForegroundColor White
Write-Host "Surface:       #FFFFFF (White)" -ForegroundColor White
Write-Host "Border:        #F0F0F0 (Very Light Gray)" -ForegroundColor Gray
Write-Host "Text:          #1A1A1A (Near Black)" -ForegroundColor Black
Write-Host "Text Muted:    #808080 (Medium Gray)" -ForegroundColor Gray

Write-Host "`n=== FONT LOADING TIMEOUT FIX ===" -ForegroundColor Cyan
Write-Host "`nIf you see '6000ms timeout exceeded' error:" -ForegroundColor Yellow

Write-Host "`n1. Clear Metro cache:" -ForegroundColor White
Write-Host "   npx expo start --clear" -ForegroundColor Gray

Write-Host "`n2. Hard refresh browser:" -ForegroundColor White
Write-Host "   Press Ctrl + Shift + R (Windows)" -ForegroundColor Gray
Write-Host "   Press Cmd + Shift + R (Mac)" -ForegroundColor Gray

Write-Host "`n3. Add width constraint to container:" -ForegroundColor White
Write-Host @"
.container {
  max-width: 100vw;
  width: 100%;
  overflow-x: hidden;
}
"@ -ForegroundColor Gray

Write-Host "`n4. Disable font observer (if persistent):" -ForegroundColor White
Write-Host "   Check app.json or metro.config.js for fontfaceobserver" -ForegroundColor Gray
Write-Host "   Fonts usually load fine without it in modern browsers" -ForegroundColor Gray

Write-Host "`n=== NORDIC DESIGN PRINCIPLES ===" -ForegroundColor Cyan
Write-Host "✓ Subtle gradients (not flashy)" -ForegroundColor Green
Write-Host "✓ White space as design element" -ForegroundColor Green
Write-Host "✓ Minimal color palette (4 colors)" -ForegroundColor Green
Write-Host "✓ Focus on content, not decoration" -ForegroundColor Green
Write-Host "✓ Clean, calm, professional" -ForegroundColor Green

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Press 'r' in Metro terminal to reload" -ForegroundColor White
Write-Host "2. Or refresh browser (Ctrl + R)" -ForegroundColor White
Write-Host "3. Verify gradient cards are white-to-green" -ForegroundColor White
Write-Host "4. Check Quick Actions icons are green/gray" -ForegroundColor White

Write-Host "`nNordic minimalism theme complete! 🎨" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Green
