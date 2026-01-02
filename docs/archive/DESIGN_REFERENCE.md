# Login/Register Design Reference

## Mẫu Thiết Kế Tham Khảo

### Key Visual Features

#### 1. **Glassmorphism Effect**
```css
backdrop-filter: blur(25px);
background-color: rgba(0, 0, 0, 0.2);
border: 2px solid rgba(198, 195, 195, 0.5);
border-radius: 15px;
box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.2);
```

**React Native equivalent:**
```tsx
<View style={{
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 15,
  borderWidth: 2,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 5,
}}>
```

---

#### 2. **Floating Labels (Animated)**
```css
.input-field:focus ~ .label {
  position: absolute;
  top: -10px;
  left: 20px;
  font-size: 14px;
  background-color: var(--primary-color);
  border-radius: 30px;
  padding: 0 10px;
}
```

**React Native implementation:**
```tsx
const labelAnimation = useRef(new Animated.Value(0)).current;

// On focus
Animated.timing(labelAnimation, {
  toValue: 1,
  duration: 200,
  useNativeDriver: false,
}).start();

// Animated label position
const labelTop = labelAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [15, -10],
});

<Animated.Text style={{
  position: 'absolute',
  top: labelTop,
  left: 20,
  fontSize: emailFocused || email ? 12 : 16,
  backgroundColor: emailFocused || email ? primary : 'transparent',
  paddingHorizontal: emailFocused || email ? 8 : 0,
  borderRadius: 15,
}}>
  Email
</Animated.Text>
```

---

#### 3. **Curved Header Design**
```css
.login-header {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  width: 140px;
  height: 70px;
  border-radius: 0 0 20px 20px;
}

.login-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: -30px;
  width: 30px;
  height: 30px;
  border-top-right-radius: 50%;
  box-shadow: 15px 0 0 0 var(--primary-color);
}
```

**React Native (using SVG):**
```tsx
import Svg, { Path, Circle } from 'react-native-svg';

<Svg height="100" width="200" style={styles.headerCurve}>
  <Path
    d="M 0,70 Q 50,0 100,70 T 200,70"
    fill={primary}
  />
</Svg>
```

---

#### 4. **Input Field Styling**
```css
.input-field {
  width: 100%;
  height: 55px;
  font-size: 16px;
  background: transparent;
  padding-inline: 20px 50px;
  border: 2px solid var(--primary-color);
  border-radius: 30px;
}
```

**Current app style (already similar):**
```tsx
<TextInput
  style={{
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingRight: 50,
    fontSize: 16,
  }}
/>
```

---

## App Hiện Tại vs Mẫu

### ✅ Đã Có (Keep)
- ✅ Inline validation errors (InlineError component)
- ✅ Toast notifications (không dùng Alert)
- ✅ Show/hide password toggle
- ✅ Loading states với ActivityIndicator
- ✅ Social login (Google/Facebook OAuth)
- ✅ Role selection (RoleSelector)
- ✅ Rounded input fields
- ✅ Icon trong input (Ionicons)

### 🎨 Có Thể Thêm (từ mẫu)
- 🔲 Glassmorphism container (blur background)
- 🔲 Floating label animation (label di chuyển lên khi focus)
- 🔲 Curved header với logo
- 🔲 Remember me checkbox (login)
- 🔲 Background gradient/image
- 🔲 Pseudo-element curves (::before, ::after)

### ⚠️ Không Nên Thay Đổi
- ❌ Validation logic (đã tốt với validateEmail, validatePassword)
- ❌ Error handling (InlineError + Toast đã tối ưu)
- ❌ Social login flow (OAuth2 code flow đã secure)
- ❌ Navigation logic (expo-router)

---

## Đề Xuất Cải Tiến

### Option 1: **Minor Enhancements** (Recommended)

**Thêm floating label animation:**
```tsx
// Chỉ cần animate top position của label
const labelY = emailFocused || email ? -10 : 15;
const labelSize = emailFocused || email ? 12 : 16;

<Animated.Text style={{
  position: 'absolute',
  top: labelY,
  fontSize: labelSize,
  backgroundColor: emailFocused || email ? surface : 'transparent',
}}>
  Email
</Animated.Text>
```

**Thêm Remember Me checkbox:**
```tsx
import { Checkbox } from 'expo-checkbox'; // or custom

<View style={styles.rememberRow}>
  <Checkbox value={rememberMe} onValueChange={setRememberMe} />
  <Text>Remember me</Text>
</View>
```

---

### Option 2: **Full Redesign** (Major)

**Tạo GlassmorphismContainer component:**
```tsx
// components/ui/GlassmorphismContainer.tsx
export function GlassmorphismContainer({ children }) {
  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.glassBorder}>
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  glassBorder: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 40,
  },
});
```

---

## Design Variants (từ image reference)

### Login Versions (10 variants)
1. **Version 1**: White background, simple
2. **Version 2**: Blue gradient
3. **Version 3**: Blue solid with Google button
4. **Version 4**: Dark theme
5. **Version 5**: White with social icons
6. **Version 6**: Dark with gradient
7. **Version 7**: White minimalist
8. **Version 8**: Light blue
9. **Version 9**: Purple gradient
10. **Version 10**: Beige/cream

### Sign Up Versions (10 variants)
- Similar color schemes
- Additional fields: Name, Phone, Birth Date
- Country/Role selectors

---

## Color Schemes (từ mẫu)

```tsx
// Light Theme
const LIGHT_THEME = {
  primary: '#4A90E2',
  surface: '#FFFFFF',
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'rgba(0, 0, 0, 0.1)',
};

// Dark Theme
const DARK_THEME = {
  primary: '#64B5F6',
  surface: '#1E1E1E',
  background: 'rgba(30, 30, 30, 0.9)',
  border: 'rgba(255, 255, 255, 0.1)',
};

// Blue Gradient
const BLUE_GRADIENT = {
  colors: ['#4A90E2', '#357ABD'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Purple Gradient
const PURPLE_GRADIENT = {
  colors: ['#9B59B6', '#8E44AD'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
```

---

## Implementation Priority

### Phase 1 (Quick Wins - 1-2 hours)
1. ✅ Add Remember Me checkbox
2. ✅ Improve label animation (floating effect)
3. ✅ Add subtle shadow to containers
4. ✅ Adjust input padding for better icon spacing

### Phase 2 (Medium - 3-4 hours)
1. 🔲 Create GlassmorphismContainer component
2. 🔲 Add curved header design
3. 🔲 Implement background gradient/image
4. 🔲 Add micro-interactions (button press, input focus)

### Phase 3 (Advanced - 5+ hours)
1. 🔲 Multiple theme variants (10 designs)
2. 🔲 Theme switcher UI
3. 🔲 Custom SVG illustrations
4. 🔲 Advanced animations (page transitions)

---

## Testing Checklist

- [ ] Label animation smooth on all devices
- [ ] Glassmorphism works on Android (may need fallback)
- [ ] Remember Me persists after app restart
- [ ] Social login still works after UI changes
- [ ] Validation errors display correctly
- [ ] Toast notifications visible on new background
- [ ] Keyboard avoidance still functional
- [ ] Responsive on all screen sizes

---

## Notes

- **Glassmorphism** trên Android cần `expo-blur` package
- **Floating labels** có thể conflict với autofill - cần test
- **Remember Me** cần lưu vào SecureStore
- **Background image** tăng bundle size - nên dùng gradient

---

## References

- Mẫu HTML: `Modern-Login-Form/dist/index.html`
- Mẫu CSS: `Modern-Login-Form/dist/style.css`
- Current Login: `app/(auth)/login.tsx`
- Current Register: `app/(auth)/register.tsx`
- Design Images: 20 variants (10 login + 10 signup)

---

**Recommendation:** Start với **Phase 1** (quick wins) để cải thiện UX mà không ảnh hưởng functionality hiện tại.
