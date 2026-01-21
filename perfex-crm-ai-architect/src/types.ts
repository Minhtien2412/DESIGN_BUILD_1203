export enum AppTab {
  OVERVIEW = 'overview',
  ARCHITECTURE = 'architecture',
  IMPLEMENTATION = 'implementation',
  CONSULTANT = 'consultant',
  VISUALIZER = 'visualizer'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingLinks?: { title: string; uri: string }[];
}

export type ImageAspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9" | "2:3" | "3:2";
export type ImageSize = "1K" | "2K" | "4K";

export interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'loading';
  latency?: number;
  lastCheck: Date;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export interface ArchitectureStyle {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  image: string;
  tags: string[];
}

export interface ConsultingTopic {
  id: string;
  title: string;
  icon: string;
  questions: string[];
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'hook' | 'controller' | 'model' | 'helper' | 'api';
  code: string;
}
