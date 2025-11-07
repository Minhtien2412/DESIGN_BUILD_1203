export type ChatDemoThread = { id: string; name: string; preview: string; unread: number };
export type ChatDemoMessage = { id: string; sender: 'agent' | 'user'; name: string; text: string };
export type ChatListEntry = {
  id: string;
  name: string;
  subtext: string;
  time: string; // e.g. '23 phút', '1 ngày'
  status: 'online' | 'offline';
  iconUrl?: string;
};

// Threads per mock
export const CHAT_DEMO_THREADS: ChatDemoThread[] = [
  { id: 't1', name: 'Kiến Trúc Sư A',       preview: 'Em đã chỉnh sửa lại bản vẽ rồi ạ.',                              unread: 9 },
  { id: 't2', name: 'Nhân Viên Hỗ Trợ B',   preview: 'Chị còn thắc mắc gì có thể nhắn trực tiếp với em ạ…',            unread: 0 },
  { id: 't3', name: 'Nhà Thầu B',           preview: 'Chào chị, em bên nhà thầu B.',                                   unread: 2 },
  { id: 't4', name: 'Nhà Thầu A',           preview: 'Em bên nhà thầu A.',                                             unread: 0 },
  { id: 't5', name: 'Công Ty C',            preview: 'Chào chị, em công ty C; chị có thắc mắc gì về công ty cứ ạ…',    unread: 0 },
  { id: 't6', name: 'Nhà Thầu D',           preview: 'Chào chị.',                                                       unread: 0 },
  { id: 't7', name: 'Nhà Thầu E',           preview: 'Em chào chị.',                                                    unread: 0 },
  { id: 't8', name: 'Kỹ Sư G',              preview: '…',                                                               unread: 0 },
];

// Conversation per mock (used for the thread UI)
export const CHAT_DEMO_MESSAGES: ChatDemoMessage[] = [
  { id: 'm1', sender: 'agent', name: 'Nhân Viên B', text: 'Em chào chị ạ.' },
  { id: 'm2', sender: 'agent', name: 'Nhân Viên B', text: 'Chị có thể gửi giúp em ảnh sổ đất không ạ?' },
  { id: 'm3', sender: 'user',  name: 'Chị A',       text: 'Chào em!' },
  { id: 'm4', sender: 'user',  name: 'Chị A',       text: 'Mình sẽ sắp xếp thời gian gửi lại cho em nhé.' },
  { id: 'm5', sender: 'agent', name: 'Nhân Viên B', text: 'Dạ, khi nào chị có thời gian chị gửi em để em hỗ trợ trực tiếp mình ạ.' },
  { id: 'm6', sender: 'user',  name: 'Chị A',       text: 'Ok em nha!' },
];

export const getDemoThreadById = (id: string) => CHAT_DEMO_THREADS.find(t => t.id === id);

// Two-tab lists per UI mock: "Cuộc họp" and "Tin nhắn"
export const CHAT_MEETINGS_LIST: (ChatListEntry & { lastUpdate?: number })[] = [
  {
    id: 'm_da14245',
    name: 'DA14245 - Nhà chị Tâm Bình Thạnh',
    subtext: 'Báo: Báo cáo công việc hôm nay...',
    time: '23 phút',
    lastUpdate: Date.now() - 23 * 60 * 1000,
    status: 'offline',
    iconUrl: 'https://placehold.co/40x40/b3d4ff/000000?text=GR',
  },
  {
    id: 'm_da61643',
    name: 'DA61643 - Công trình Gò Vấp',
    subtext: '📢 Cuộc họp sẽ diễn ra trong 10 phút',
    time: '10 phút',
    lastUpdate: Date.now() - 10 * 60 * 1000,
    status: 'online',
    iconUrl: 'https://placehold.co/40x40/c8d5d9/000000?text=GR',
  },
  {
    id: 'm_vovanhung',
    name: 'Võ Văn Hùng',
    subtext: 'Bạn: [Link]',
    time: '1 tiếng',
    lastUpdate: Date.now() - 60 * 60 * 1000,
    status: 'offline',
    iconUrl: 'https://placehold.co/40x40/b4c9b9/000000?text=VVH',
  },
  {
    id: 'm_ks_hieu',
    name: 'Kỹ sư Hiếu',
    subtext: '[File]',
    time: '1 tiếng',
    lastUpdate: Date.now() - 60 * 60 * 1000,
    status: 'online',
    iconUrl: 'https://placehold.co/40x40/b4c9b9/000000?text=KSH',
  },
];

export const CHAT_INBOX_LIST: ChatListEntry[] = [
  {
    id: 't_phuong_son',
    name: 'Phương - Thợ sơn',
    subtext: '[Hình ảnh]',
    time: '10 phút',
    status: 'offline',
    iconUrl: 'https://placehold.co/40x40/d1c4e9/000000?text=PT',
  },
  {
    id: 't_nguyet_nu',
    name: 'Nguyễn Thị Nguyệt Nữ',
    subtext: 'Báo giá tay nắm cửa....',
    time: '47 phút',
    status: 'online',
    iconUrl: 'https://placehold.co/40x40/ef9a9a/000000?text=NN',
  },
  {
    id: 't_vovanhung',
    name: 'Võ Văn Hùng',
    subtext: 'Bạn: gửi file dự toán giúp mình...',
    time: '1 tiếng',
    status: 'offline',
    iconUrl: 'https://placehold.co/40x40/b4c9b9/000000?text=VVH',
  },
  {
    id: 't_ks_hieu',
    name: 'Kỹ sư Hiếu',
    subtext: '[File]',
    time: '1 tiếng',
    status: 'online',
    iconUrl: 'https://placehold.co/40x40/b4c9b9/000000?text=KSH',
  },
  {
    id: 't_maylanh_tien',
    name: 'Máy lạnh thợ Tiên',
    subtext: 'Bạn: [Hình ảnh]',
    time: '4 tiếng',
    status: 'offline',
    iconUrl: 'https://placehold.co/40x40/e6ee9c/000000?text=MLTT',
  },
  {
    id: 't_nguyen_xuan_luyen',
    name: 'Nguyễn Xuân Luyến',
    subtext: 'Em gửi chị dự toán chị xem qua...',
    time: '1 ngày',
    status: 'offline',
    iconUrl: 'https://placehold.co/40x40/c5e1a5/000000?text=NXL',
  },
];

export const getAnyThreadNameById = (id: string): string | undefined => {
  const t = getDemoThreadById(id);
  if (t) return t.name;
  const m = [...CHAT_MEETINGS_LIST, ...CHAT_INBOX_LIST].find(x => x.id === id);
  return m?.name;
};