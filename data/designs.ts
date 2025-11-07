import { ImageSourcePropType } from 'react-native';

export type Design = {
  id: string;
  title: string;
  category: 'biet-thu' | 'nha' | 'noi-that' | string;
  images: ImageSourcePropType[];
  description?: string;
  author?: string;
};

export const DESIGNS: Design[] = [
  {
    id: 'd-bietthu-001',
    title: 'Biệt thự hiện đại 3 tầng',
    category: 'biet-thu',
    images: [require('../assets/images/react-logo.png')],
    description: 'Biệt thự 3 tầng phong cách hiện đại, mặt tiền rộng, nhiều ánh sáng tự nhiên, phù hợp khu đô thị mới.',
    author: 'Studio A',
  },
  {
    id: 'd-nha-002',
    title: 'Nhà phố 2 tầng tối giản',
    category: 'nha',
    images: [require('../assets/images/partial-react-logo.png')],
    description: 'Nhà phố thiết kế tối giản, tận dụng không gian nhỏ với giải pháp lưu trữ thông minh.',
    author: 'Kiến trúc B',
  },
  {
    id: 'd-noithat-003',
    title: 'Thiết kế nội thất Scandinavian',
    category: 'noi-that',
    images: [require('../assets/images/react-logo.png')],
    description: 'Nội thất phong cách Scandinavian: tông màu nhẹ, đồ nội thất tối giản và ấm cúng.',
    author: 'Nội thất C',
  },
];

export default DESIGNS;
