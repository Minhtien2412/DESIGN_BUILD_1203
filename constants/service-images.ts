import { ImageSourcePropType } from 'react-native';

// Intended filenames for your PNGs placed under `assets/images/service/`
// You can drop images with these exact names to replace the placeholders below.
export const SERVICE_IMAGE_FILES = {
  'khoan-ep-coc': 'service/khoan-ep-coc.png',
  'giam-sat-thi-cong': 'service/giam-sat-thi-cong.png',
  'van-chuyen-xay-dung': 'service/van-chuyen-xay-dung.png',
  'son-sua': 'service/son-sua.png',
  'lap-kinh-inox': 'service/lap-kinh-inox.png',
  'lap-camera': 'service/lap-camera.png',
  'lap-cua': 'service/lap-cua.png',
  'han-co-khi': 'service/han-co-khi.png',
  'mai-kim-loai': 'service/mai-kim-loai.png',
  'op-lat-gach': 'service/op-lat-gach.png',
  'lat-gach': 'service/lat-gach.png',
  'sua-chua-dien-nuoc': 'service/sua-chua-dien-nuoc.png',
  'lap-khoa': 'service/lap-khoa.png',
  'tran-thach-cao': 'service/tran-thach-cao.png',
  'xay-to-tuong': 'service/xay-to-tuong.png',
  'kho-vlxd': 'service/kho-vlxd.png',
  'do-be-tong': 'service/do-be-tong.png',
  'dao-mong': 'service/dao-mong.png',
  'buoc-thep': 'service/buoc-thep.png',
  'coffa': 'service/coffa.png',
  'trat-tuong': 'service/trat-tuong.png',
  'lap-da': 'service/lap-da.png',
} as const;

// Safe placeholder requires so the app builds even if real PNGs aren't added yet.
// Replace each require with: require('../assets/images/' + SERVICE_IMAGE_FILES[key]) once files are present.
export const SERVICE_IMAGE_MAP = {
  'khoan-ep-coc': require('../assets/images/react-logo.webp'),
  'giam-sat-thi-cong': require('../assets/images/react-logo.webp'),
  'van-chuyen-xay-dung': require('../assets/images/react-logo.webp'),
  'son-sua': require('../assets/images/react-logo.webp'),
  'lap-kinh-inox': require('../assets/images/react-logo.webp'),
  'lap-camera': require('../assets/images/react-logo.webp'),
  'lap-cua': require('../assets/images/react-logo.webp'),
  'han-co-khi': require('../assets/images/react-logo.webp'),
  'mai-kim-loai': require('../assets/images/react-logo.webp'),
  'op-lat-gach': require('../assets/images/react-logo.webp'),
  'lat-gach': require('../assets/images/react-logo.webp'),
  'sua-chua-dien-nuoc': require('../assets/images/react-logo.webp'),
  'lap-khoa': require('../assets/images/react-logo.webp'),
  'tran-thach-cao': require('../assets/images/react-logo.webp'),
  'xay-to-tuong': require('../assets/images/react-logo.webp'),
  'kho-vlxd': require('../assets/images/react-logo.webp'),
  'do-be-tong': require('../assets/images/react-logo.webp'),
  'dao-mong': require('../assets/images/react-logo.webp'),
  'buoc-thep': require('../assets/images/react-logo.webp'),
  'coffa': require('../assets/images/react-logo.webp'),
  'trat-tuong': require('../assets/images/react-logo.webp'),
  'lap-da': require('../assets/images/react-logo.webp'),
} as const;

export type ServiceImageKey = keyof typeof SERVICE_IMAGE_MAP;

export const serviceImageSource = (key: ServiceImageKey): ImageSourcePropType => SERVICE_IMAGE_MAP[key];
