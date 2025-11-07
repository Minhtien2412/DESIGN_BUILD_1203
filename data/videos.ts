export type VideoItem = {
  id: string;
  title: string;
  url: string | number; // string for remote URL or number for require(module)
  fallbackUrl?: string; // optional backup source
  author?: string;
  likes?: number;
  comments?: number;
  category?: string; // category slug
  hashtags?: string[];
  type?: 'vod' | 'live'; // optional explicit type; if omitted, inferred by URL
  authorSlug?: string; // optional slug to navigate to author's page
  authorAvatarUrl?: string; // optional avatar URL for author
};

// Use dynamic require to tolerate missing file during early dev before generation
// eslint-disable-next-line @typescript-eslint/no-var-requires
const __generated: any = (() => { try { return require('./localVideos.generated'); } catch { return {}; } })();
const GENERATED_VIDEOS: VideoItem[] = Array.isArray(__generated.GENERATED_VIDEOS) ? __generated.GENERATED_VIDEOS as VideoItem[] : [];

export const VIDEOS: VideoItem[] = [
  // Lưu ý: chọn file MP4 vừa phải để tránh lỗi bundler “Cannot create a string longer than ...”.
  // Có thể nén/giảm bitrate nếu cần cho demo nội tuyến.
  {
    id: 'local:maika',
    title: 'MAIKA (Demo nội tuyến)',
    // Metro is configured to blockList assets/videos/* to avoid bundling huge local MP4s.
    // Use a small remote demo instead to prevent "Unable to resolve" during bundling.
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    author: 'Local Asset',
    authorSlug: 'local',
    likes: 120,
    comments: 12,
    category: 'mau-noi-that',
    hashtags: ['#local', '#inline'],
    type: 'vod',
  },
  {
    id: 'local:den-thong-tang',
    title: 'Đèn thông tầng (Inline)',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    author: 'Local Asset',
    authorSlug: 'local',
    likes: 62,
    comments: 5,
    category: 'mau-nha',
    hashtags: ['#lighting'],
    type: 'vod',
  },
  {
    id: 'local:reel-demo',
    title: 'Reel demo (Giả lập trực tiếp)',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    author: 'Local Asset',
    authorSlug: 'local',
    likes: 210,
    comments: 20,
    category: 'store',
    hashtags: ['#reel'],
    type: 'live',
  },
];

// Merge generated list with curated seed items (de-dup by id)
const seed = VIDEOS;
const seen = new Set<string>(seed.map((v) => v.id));
export const ALL_LOCAL_VIDEOS: VideoItem[] = [
  ...seed,
  ...GENERATED_VIDEOS.filter((v: VideoItem) => !seen.has(v.id)),
];
