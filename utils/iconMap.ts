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
  'bang-mau': require('../assets/images/icon-dich-vu/bang-mau.png'),
  'cong-ty-noi-that': require('../assets/images/icon-dich-vu/cong-ty-noi-that.png'),
  'cong-ty-xay-dung': require('../assets/images/icon-dich-vu/cong-ty-xay-dung.png'),
  'giam-sat-chat-luong': require('../assets/images/icon-dich-vu/giam-sat-chat-luong.png'),
  'ho-so-mau': require('../assets/images/icon-dich-vu/ho-so-mau.png'),
  'lo-ban': require('../assets/images/icon-dich-vu/lo-ban.png'),
  'thiet-ke-nha': require('../assets/images/icon-dich-vu/thiet-ke-nha.png'),
  'thiet-ke-noi-that': require('../assets/images/icon-dich-vu/thiet-ke-noi-that.png'),
  'tra-cuu-xay-dung': require('../assets/images/icon-dich-vu/tra-cuu-xay-dung.png'),
  'tu-van-chat-luong': require('../assets/images/icon-dich-vu/Tư vấn chất lượng.png'),
  'xin-phep': require('../assets/images/icon-dich-vu/xin-phep.png'),

  // thu-vien
  'biet-thu-co-dien': require('../assets/images/thu-vien/biet-thu-co-dien.png'),
  'biet-thu': require('../assets/images/thu-vien/biet-thu.png'),
  'can-ho-dich-vu': require('../assets/images/thu-vien/can-ho-dich-vu.png'),
  'khach-san': require('../assets/images/thu-vien/khach-san.png'),
  'nha-pho': require('../assets/images/thu-vien/nha-pho.png'),
  'nha-xuong': require('../assets/images/thu-vien/nha-xuong.png'),
  'van-phong': require('../assets/images/thu-vien/van-phong.png'),

  // tien-ich-mua-sam-trang-thiet-bi
  'ban-an': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.png'),
  'ban-hoc': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.png'),
  'dien': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.png'),
  'nuoc': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/nuoc.png'),
  'pccc': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/pccc.png'),
  'sofa': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.png'),
  'thiet-bi-bep': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.png'),
  'thiet-bi-ve-sinh': require('../assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.png'),

  // tien-ich-thiet-ke
  'du-toan': require('../assets/images/tien-ich-thiet-ke/du-toan.png'),
  'kien-tru-su-noi-that': require('../assets/images/tien-ich-thiet-ke/kien-tru-su-noi-that.png'),
  'kien-truc-su': require('../assets/images/tien-ich-thiet-ke/kien-truc-su.png'),
  'ky-su-dien': require('../assets/images/tien-ich-thiet-ke/ky-su-dien.png'),
  'ky-su-giam-sat': require('../assets/images/tien-ich-thiet-ke/ky-su-giam-sat.png'),
  'ky-su-ket-cau': require('../assets/images/tien-ich-thiet-ke/ky-su-ket-cau.png'),
  'ky-su-nuoc': require('../assets/images/tien-ich-thiet-ke/ky-su-nuoc.png'),

  // tien-ich-xay-dung
  'be-tong': require('../assets/images/tien-ich-xay-dung/be-tong.png'),
  'dao-dat': require('../assets/images/tien-ich-xay-dung/dao-dat.png'),
  'ep-coc': require('../assets/images/tien-ich-xay-dung/ep-coc.png'),
  'nhan-cong': require('../assets/images/tien-ich-xay-dung/nhan-cong.png'),
  'tho-coffa': require('../assets/images/tien-ich-xay-dung/tho-coffa.png'),
  'tho-dien-nuoc': require('../assets/images/tien-ich-xay-dung/tho-dien-nuoc.png'),
  'tho-to-tuong': require('../assets/images/tien-ich-xay-dung/tho-to-tuong.png'),
  'tho-xay': require('../assets/images/tien-ich-xay-dung/tho-xay.png'),
  'vat-lieu': require('../assets/images/tien-ich-xay-dung/vat-lieu.png'),

  // tien-ich-hoan-thien
  'tho-camera': require('../assets/images/tien-ich-hoan-thien/tho-camera.png'),
  'tho-cong': require('../assets/images/tien-ich-hoan-thien/tho-cong.png'),
  'tho-da': require('../assets/images/tien-ich-hoan-thien/tho-da.png'),
  'tho-lam-cua': require('../assets/images/tien-ich-hoan-thien/tho-lam-cua.png'),
  'tho-lan-can': require('../assets/images/tien-ich-hoan-thien/tho-lan-can.png'),
  'tho-lat-gach': require('../assets/images/tien-ich-hoan-thien/tho-lat-gach.png'),
  'tho-son': require('../assets/images/tien-ich-hoan-thien/tho-son.png'),
  'tho-thach-cao': require('../assets/images/tien-ich-hoan-thien/tho-thachcao-.png'),
};

export const getCategoryIcon = (name?: string): IconModule | undefined => {
  if (!name) return undefined;
  const key = normalize(name);
  return MAP[key];
};

export type { IconModule };
