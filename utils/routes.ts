export const constructionProgressRoute = (imgUrl: string) =>
  `/construction/progress?img=${encodeURIComponent(imgUrl)}` as const;

export const constructionDesignerRoute = () => `/construction/designer` as const;

export const constructionPaymentProgressRoute = (projectId?: string) =>
  projectId ? `/construction/payment-progress?id=${projectId}` : `/construction/payment-progress` as const;
