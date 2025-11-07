export interface Project {
  id: string;
  name: string;
  address: string;
  status: 'Đang thực hiện' | 'Tạm dừng' | 'Hoàn thành' | 'Đang thi công';
  progress: number; // percentage 0-100
  projectCode: string;
  image: string;
}

export interface WorkItem {
  id: string;
  code: string;
  name: string;
  description: string;
  estimatedCompletion: string;
  status: 'Đã hoàn thành' | 'Đang thực hiện' | 'Chưa thi công';
}

export interface ProjectDetail {
  id: string;
  name: string;
  workItems: WorkItem[];
}

export const PAYMENT_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Biệt thự Quận 2 - Anh Cường',
    address: '125 Trần Não, Phường An Khánh',
    status: 'Đang thực hiện',
    progress: 70,
    projectCode: 'BT-235',
    image: 'https://placehold.co/78x72'
  },
  {
    id: '2',
    name: 'Biệt thự Gò Vấp - Chị Phương',
    address: '68 Dương Quảng Hàm, Gò Vấp',
    status: 'Tạm dừng',
    progress: 30,
    projectCode: 'BT-235',
    image: 'https://placehold.co/78x72'
  },
  {
    id: '3',
    name: 'Nhà phố Phú Nhuận - Chị Tú',
    address: '126 Trường Sa, Quận Phú Nhuận',
    status: 'Đang thực hiện',
    progress: 50,
    projectCode: 'BT-186',
    image: 'https://placehold.co/78x72'
  },
  {
    id: '4',
    name: 'Biệt thự hoa sứ - Anh Hiếu',
    address: '129 Hoa sứ, Quận Phú Nhuận',
    status: 'Hoàn thành',
    progress: 100,
    projectCode: 'BT-145',
    image: 'https://placehold.co/78x72'
  },
  {
    id: '5',
    name: 'Nhà phố Tân Phú - Chị Uyên',
    address: '125 Tân kỳ tân quý, Tân Phú',
    status: 'Đang thi công',
    progress: 100,
    projectCode: 'NP-139',
    image: 'https://placehold.co/78x72'
  }
];

export const PROJECT_WORK_ITEMS: Record<string, WorkItem[]> = {
  '1': [
    {
      id: 'w1',
      code: 'P-Wall',
      name: 'Sơn tường bao ngoài nhà',
      description: 'Sơn tường bao ngoài nhà',
      estimatedCompletion: '20/03/2024',
      status: 'Đã hoàn thành'
    },
    {
      id: 'w2',
      code: 'P-Inside',
      name: 'Sơn tường trong nhà',
      description: 'Sơn tường trong nhà',
      estimatedCompletion: '14/04/2024',
      status: 'Đang thực hiện'
    },
    {
      id: 'w3',
      code: 'P-Stone',
      name: 'Sơn giả đá bên ngoài',
      description: 'Sơn giả đá bên ngoài',
      estimatedCompletion: '15/06/2024',
      status: 'Chưa thi công'
    }
  ]
};