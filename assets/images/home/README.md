# Home Banners

Place your three home banner images in this folder and update the require() paths in `app/(tabs)/index.tsx` (HeroSlider section).

Guidelines:
- Use base scale PNG or JPG (do not require @2x/@3x explicitly). Metro will auto-resolve.
- Recommended filenames:
  - `banner-1.png`
  - `banner-2.png`
  - `banner-3.png`
- Recommended size: ~1080x480 (or similar 16:7 wide ratio). Keep file size small (<300KB) for performance.

After adding files, change:
```
images={[
  { id: 'banner-1', source: require('@/assets/images/home/banner-1.png') },
  { id: 'banner-2', source: require('@/assets/images/home/banner-2.png') },
  { id: 'banner-3', source: require('@/assets/images/home/banner-3.png') },
]}
```

Tap handling:
- You can pass `onPress` per banner to deep link to the relevant page (e.g., services or app store links).
