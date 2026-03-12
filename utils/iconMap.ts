// Utility to map known category/service names to local asset icons
// Always require base-scale assets; Metro resolves @2x/@3x automatically

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type IconModule = number; // React Native require() returns a numeric ID

// Known mappings across feature groups
const MAP: Record<string, IconModule> = {
  // icon-dich-vu
  'bang-mau': require('../assets/images/icon-dich-vu/bang-mau.webp'),
  'cong-ty-noi-that': require('../assets/images/icon-dich-vu/cong-ty-noi-that.webp'),
  'cong-ty-xay-dung': require('../assets/images/icon-dich-vu/cong-ty-xay-dung.webp'),
  'giam-sat-chat-luong': require('../assets/images/icon-dich-vu/giam-sat-chat-luong.webp'),
  'ho-so-mau': require('../assets/images/icon-dich-vu/ho-so-mau.webp'),
  'lo-ban': require('../assets/images/icon-dich-vu/lo-ban.webp'),
  'thiet-ke-nha': require('../assets/images/icon-dich-vu/thiet-ke-nha.webp'),
  'thiet-ke-noi-that': require('../assets/images/icon-dich-vu/thiet-ke-noi-that.webp'),
  'tra-cuu-xay-dung': require('../assets/images/icon-dich-vu/tra-cuu-xay-dung.webp'),
  'tu-van-chat-luong': require('../assets/images/icon-dich-vu/Tư vấn chất lượng.webp'),
  'xin-phep': require('../assets/images/icon-dich-vu/xin-phep.webp'),

  // thu-vien
  'biet-thu-co-dien': require('../assets/images/thu-vien/biet-thu-co-dien.webp'),
  'biet-thu': require('../assets/images/thu-vien/biet-thu.webp'),
  'can-ho-dich-vu': require('../assets/images/thu-vien/can-ho-dich-vu.webp'),
  'khach-san': require('../assets/images/thu-vien/khach-san.webp'),
  'nha-pho': require('../assets/images/thu-vien/nha-pho.webp'),
  'nha-xuong': require('../assets/images/thu-vien/nha-xuong.webp'),
  'van-phong': require('../assets/images/thu-vien/van-phong.webp'),

  // tien-ich-mua-sam-trang-thiet-bi
  'ban-an': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.webp'),
  'ban-hoc': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.webp'),
  'dien': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp'),
  'nuoc': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/nuoc.webp'),
  'pccc': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/pccc.webp'),
  'sofa': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.webp'),
  'thiet-bi-bep': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.webp'),
  'thiet-bi-ve-sinh': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.webp'),

  // tien-ich-thiet-ke
  'du-toan': require('../assets/images/tien-ich-thiet-ke/du-toan.webp'),
  'kien-tru-su-noi-that': require('../assets/images/tien-ich-thiet-ke/kien-tru-su-noi-that.webp'),
  'kien-truc-su': require('../assets/images/tien-ich-thiet-ke/kien-truc-su.webp'),
  'ky-su-dien': require('../assets/images/tien-ich-thiet-ke/ky-su-dien.webp'),
  'ky-su-giam-sat': require('../assets/images/tien-ich-thiet-ke/ky-su-giam-sat.webp'),
  'ky-su-ket-cau': require('../assets/images/tien-ich-thiet-ke/ky-su-ket-cau.webp'),
  'ky-su-nuoc': require('../assets/images/tien-ich-thiet-ke/ky-su-nuoc.webp'),

  // tien-ich-xay-dung
  'be-tong': require('../assets/images/tien-ich-xay-dung/be-tong.webp'),
  'dao-dat': require('../assets/images/tien-ich-xay-dung/dao-dat.webp'),
  'ep-coc': require('../assets/images/tien-ich-xay-dung/ep-coc.webp'),
  'nhan-cong': require('../assets/images/tien-ich-xay-dung/nhan-cong.webp'),
  'tho-coffa': require('../assets/images/tien-ich-xay-dung/tho-coffa.webp'),
  'tho-dien-nuoc': require('../assets/images/tien-ich-xay-dung/tho-dien-nuoc.webp'),
  'tho-to-tuong': require('../assets/images/tien-ich-xay-dung/tho-to-tuong.webp'),
  'tho-xay': require('../assets/images/tien-ich-xay-dung/tho-xay.webp'),
  'vat-lieu': require('../assets/images/tien-ich-xay-dung/vat-lieu.webp'),

  // tien-ich-hoan-thien
  'tho-camera': require('../assets/images/tien-ich-hoan-thien/tho-camera.webp'),
  'tho-cong': require('../assets/images/tien-ich-hoan-thien/tho-cong.webp'),
  'tho-da': require('../assets/images/tien-ich-hoan-thien/tho-da.webp'),
  'tho-lam-cua': require('../assets/images/tien-ich-hoan-thien/tho-lam-cua.webp'),
  'tho-lan-can': require('../assets/images/tien-ich-hoan-thien/tho-lan-can.webp'),
  'tho-lat-gach': require('../assets/images/tien-ich-hoan-thien/tho-lat-gach.webp'),
  'tho-son': require('../assets/images/tien-ich-hoan-thien/tho-son.webp'),
  'tho-thach-cao': require('../assets/images/tien-ich-hoan-thien/tho-thachcao-.webp'),
};

export const getCategoryIcon = (name?: string): IconModule | undefined => {
  if (!name) return undefined;
  const key = normalize(name);
  return MAP[key];
};

export type { IconModule };
