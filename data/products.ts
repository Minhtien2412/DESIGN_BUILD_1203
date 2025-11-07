export type Product = {
  id: string;
  name: string;
  price: number; // VND
  image: any; // require() static asset for expo-image
  description?: string;
  category?: string;      // e.g. 'design', 'construction', 'consult'
  brand?: string;         // e.g. 'Panasonic', 'Sino', 'Toto'
  type?: string;          // e.g. 'Công tắc', 'Vòi', 'Đèn'
  discountPercent?: number; // optional discount (0-100)
  flashSale?: boolean;    // mark product in current flash sale
  stock?: number;         // optional stock count
};

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Gói Thiết Kế Cơ Bản',
    price: 1500000,
    image: require('../assets/images/react-logo.png'),
    description: 'Gói cơ bản cho thiết kế nhà ở diện tích nhỏ.',
    category: 'design',
    brand: 'Panasonic',
    type: 'Công tắc',
    discountPercent: 10,
    flashSale: true,
    stock: 100,
  },
  {
    id: 'p2',
    name: 'Gói Thiết Kế Nâng Cao',
    price: 3500000,
    // Use the base asset; Metro will automatically pick @2x/@3x variants.
    image: require('../assets/images/react-logo.png'),
    description: 'Thiết kế nâng cao với nhiều lựa chọn vật liệu.',
    category: 'design',
    brand: 'Sino',
    type: 'Đèn',
    discountPercent: 15,
    stock: 40,
  },
  {
    id: 'p3',
    name: 'Thi Công Trọn Gói',
    price: 25000000,
    // Use the base asset; Metro will automatically pick @2x/@3x variants.
    image: require('../assets/images/react-logo.png'),
    description: 'Thi công trọn gói bao gồm giám sát và nghiệm thu.',
    category: 'construction',
    brand: 'Clipsal',
    type: 'Ổ cắm',
    flashSale: true,
    stock: 8,
  },
  {
    id: 'p4',
    name: 'Tư Vấn Phong Thủy',
    price: 500000,
    image: require('../assets/images/icon.png'),
    description: 'Tư vấn phong thủy theo yêu cầu.',
    category: 'consult',
    brand: 'Toto',
    type: 'Vòi',
    stock: 200,
  },
];
