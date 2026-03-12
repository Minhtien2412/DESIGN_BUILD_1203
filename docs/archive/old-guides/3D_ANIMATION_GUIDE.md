# 3D Animation Components - Usage Guide

## Components Created

### 1. **FlipCard3D** - Card Flip Animation
File: `components/auth/FlipCard3D.tsx`

**Features:**
- ✅ 3D card flip between Login/Register
- ✅ Toggle switch with smooth indicator
- ✅ Perspective transform (rotateY)
- ✅ Backface hidden (proper 3D effect)
- ✅ Spring animations

**Usage:**
```tsx
import { FlipCard3D } from '@/components/auth/FlipCard3D';

<FlipCard3D
  frontContent={<LoginForm />}
  backContent={<RegisterForm />}
  isFlipped={false}
  onFlip={(flipped) => console.log('Flipped:', flipped)}
/>
```

---

### 2. **Auth3DFlipScreen** - Complete Login/Register Screen
File: `app/(auth)/auth-3d-flip.tsx`

**Features:**
- ✅ Combined Login + Register in one screen
- ✅ 3D flip card animation
- ✅ Inline validation (InlineError)
- ✅ Toast notifications
- ✅ Gradient background
- ✅ Show/hide password toggle
- ✅ Loading states

**Access:**
Navigate to: `/(auth)/auth-3d-flip`

---

### 3. **TiltCard3D** - Interactive Perspective Tilt
File: `components/auth/TiltCard3D.tsx`

**Features:**
- ✅ 3D tilt on touch/pan
- ✅ Perspective rotation (rotateX, rotateY)
- ✅ Scale on press
- ✅ Smooth spring animations
- ✅ Auto-reset on release

**Usage:**
```tsx
import { TiltCard3D } from '@/components/auth/TiltCard3D';

<TiltCard3D
  maxTilt={20}
  perspective={1000}
>
  <YourContent />
</TiltCard3D>
```

---

## Implementation Details

### FlipCard3D Animation

**Transform Chain:**
```tsx
transform: [
  { perspective: 1000 },  // 3D perspective
  { rotateY: '180deg' },  // Flip rotation
]
```

**Interpolation:**
```tsx
// Front side
frontRotate: 0deg → 180deg
frontOpacity: 1 → 0 (at 90deg)

// Back side  
backRotate: 180deg → 360deg
backOpacity: 0 → 1 (at 90deg)
```

**Key:** `backfaceVisibility: 'hidden'` prevents seeing back while rotating

---

### TiltCard3D Animation

**Calculation:**
```tsx
// Touch position relative to center
const centerX = cardWidth / 2;
const centerY = cardHeight / 2;

const tiltX = ((touchY - centerY) / centerY) * -maxTilt;
const tiltY = ((touchX - centerX) / centerX) * maxTilt;
```

**Result:** Touch top-left → rotates top-left, creating 3D depth

---

## Testing

### Test FlipCard3D:
1. Navigate to `/(auth)/auth-3d-flip`
2. Tap toggle button (Log In ↔ Sign Up)
3. Watch card flip animation
4. Fill forms on both sides
5. Verify validation works

### Test TiltCard3D:
```tsx
// Wrap existing login screen
<TiltCard3D>
  <LoginForm />
</TiltCard3D>
```

---

## Customization

### Change Flip Duration:
```tsx
// In FlipCard3D.tsx
Animated.spring(flipAnim, {
  toValue: flipped ? 180 : 0,
  friction: 8,    // ← Lower = faster
  tension: 10,    // ← Higher = snappier
  useNativeDriver: true,
}).start();
```

### Change Tilt Sensitivity:
```tsx
<TiltCard3D
  maxTilt={30}        // ← Increase for more tilt
  perspective={800}   // ← Lower = more dramatic
>
```

### Change Toggle Style:
```tsx
// In FlipCard3D.tsx styles
toggleButton: {
  width: 200,           // ← Adjust width
  height: 50,           // ← Adjust height
  borderRadius: 25,     // ← Half of height
  borderWidth: 2,
}
```

---

## Performance Notes

✅ **Good:**
- `useNativeDriver: true` for transform animations
- Spring animations (natural feel)
- Proper backface culling

⚠️ **Watch out:**
- Don't animate `width`, `height` (use `scale` instead)
- Don't nest too many 3D transforms
- Test on lower-end Android devices

---

## Comparison with Original

### Original (HTML/CSS):
```css
.card-3d-wrapper {
  transform: rotateY(180deg);
  transition: all 600ms cubic-bezier(0.93, 0.24, 0.15, 1.46);
  backface-visibility: hidden;
}
```

### React Native Implementation:
```tsx
Animated.spring(flipAnim, {
  toValue: 180,
  friction: 8,
  tension: 10,
  useNativeDriver: true,
})
```

**Difference:** Spring animation (React Native) feels more natural than cubic-bezier (CSS)

---

## Color Schemes

### Current (Gradient Purple):
```tsx
<LinearGradient
  colors={['#667eea', '#764ba2', '#f093fb']}
/>
```

### Alternative Gradients:

**Blue Ocean:**
```tsx
colors={['#2E3192', '#1BFFFF', '#1BFFFF']}
```

**Sunset:**
```tsx
colors={['#FF6B6B', '#FFE66D', '#4ECDC4']}
```

**Dark Mode:**
```tsx
colors={['#141E30', '#243B55', '#141E30']}
```

---

## Integration with Existing Screens

### Option 1: Replace Default Login
```tsx
// app/(auth)/_layout.tsx
<Stack>
  <Stack.Screen name="auth-3d-flip" />
  {/* Hide old login/register */}
</Stack>
```

### Option 2: Add as Alternative
Keep both screens, let user choose in settings:
- Traditional: `login.tsx` + `register.tsx`
- 3D Experience: `auth-3d-flip.tsx`

---

## Troubleshooting

### Card not flipping?
- Check `backfaceVisibility: 'hidden'` is set
- Verify `perspective` is in transform chain
- Ensure rotateY interpolation is correct

### Tilt not smooth?
- Increase `friction` in spring config
- Check PanResponder is capturing touches
- Test on physical device (simulator may lag)

### Validation not showing?
- Ensure InlineError component imported
- Check error state is set correctly
- Verify toast provider wraps screen

---

## Next Steps

1. ✅ Test on iOS/Android/Web
2. ✅ Add Remember Me checkbox
3. ✅ Add Forgot Password flow
4. ✅ Add Social Login buttons (Google/Facebook)
5. ✅ Add Role Selection to Register side
6. ✅ Add biometric authentication option

---

**Demo:** Navigate to `/(auth)/auth-3d-flip` to see it in action! 🎉
