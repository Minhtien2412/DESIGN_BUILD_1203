/**
 * Construction Map Library - Main Entry Point
 * 
 * A 2D infinite canvas library for construction progress visualization
 * with zoom, pan, and real-time data synchronization.
 */

export { Camera } from './core/Camera';
export { EventBus } from './core/EventBus';

export type {
    BBox, CameraState, ConstructionProject, EngineConfig, EventHandler,
    EventMap, LinkData,
    MapState, Point, Rect, RenderContext, StageData, StageStatus, StatusConfig, TaskData, TaskStatus
} from './types';

export { STATUS_CONFIG } from './types';

// Version
export const VERSION = '0.1.0';
