/**
 * Camera system for viewport management and transformations
 */

import { BBox, CameraState, Point } from '../types';

export interface CameraConfig {
  width: number;
  height: number;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

export class Camera {
  private zoom: number;
  private offsetX: number;
  private offsetY: number;
  
  // Animation targets
  private targetZoom: number;
  private targetOffsetX: number;
  private targetOffsetY: number;
  
  private readonly minZoom: number;
  private readonly maxZoom: number;
  private readonly width: number;
  private readonly height: number;

  constructor(config: CameraConfig) {
    this.width = config.width;
    this.height = config.height;
    this.minZoom = config.minZoom ?? 0.1;
    this.maxZoom = config.maxZoom ?? 5.0;
    
    this.zoom = config.initialZoom ?? 1.0;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.targetZoom = this.zoom;
    this.targetOffsetX = this.offsetX;
    this.targetOffsetY = this.offsetY;
  }

  /**
   * Transform world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: (worldX + this.offsetX) * this.zoom,
      y: (worldY + this.offsetY) * this.zoom,
    };
  }

  /**
   * Transform screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: screenX / this.zoom - this.offsetX,
      y: screenY / this.zoom - this.offsetY,
    };
  }

  /**
   * Zoom to a specific point (keeps point under cursor/touch)
   */
  zoomToPoint(zoomDelta: number, screenX: number, screenY: number, animated = true): void {
    // Get world coordinate before zoom
    const worldBefore = this.screenToWorld(screenX, screenY);
    
    // Apply zoom
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomDelta));
    
    if (animated) {
      this.targetZoom = newZoom;
    } else {
      this.zoom = newZoom;
    }
    
    // Calculate new offset to keep point stationary
    const worldAfter = this.screenToWorld(screenX, screenY);
    const deltaX = worldAfter.x - worldBefore.x;
    const deltaY = worldAfter.y - worldBefore.y;
    
    if (animated) {
      this.targetOffsetX += deltaX;
      this.targetOffsetY += deltaY;
    } else {
      this.offsetX += deltaX;
      this.offsetY += deltaY;
    }
  }

  /**
   * Zoom by a factor (centered on viewport)
   */
  zoomBy(factor: number, animated = true): void {
    this.zoomToPoint(factor, this.width / 2, this.height / 2, animated);
  }

  /**
   * Set absolute zoom level
   */
  setZoom(zoom: number, animated = true): void {
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    if (animated) {
      this.targetZoom = newZoom;
    } else {
      this.zoom = newZoom;
      this.targetZoom = newZoom;
    }
  }

  /**
   * Pan by delta in world coordinates
   */
  pan(deltaX: number, deltaY: number, animated = false): void {
    if (animated) {
      this.targetOffsetX += deltaX;
      this.targetOffsetY += deltaY;
    } else {
      this.offsetX += deltaX;
      this.offsetY += deltaY;
      this.targetOffsetX = this.offsetX;
      this.targetOffsetY = this.offsetY;
    }
  }

  /**
   * Set absolute pan position
   */
  setPan(x: number, y: number, animated = true): void {
    if (animated) {
      this.targetOffsetX = x;
      this.targetOffsetY = y;
    } else {
      this.offsetX = x;
      this.offsetY = y;
      this.targetOffsetX = x;
      this.targetOffsetY = y;
    }
  }

  /**
   * Fit bounds to viewport
   */
  fitToBounds(bounds: BBox, padding = 50, animated = true): void {
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (this.width - padding * 2) / boundsWidth;
    const scaleY = (this.height - padding * 2) / boundsHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, scale));
    
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    const newOffsetX = this.width / 2 / newZoom - centerX;
    const newOffsetY = this.height / 2 / newZoom - centerY;
    
    if (animated) {
      this.targetZoom = newZoom;
      this.targetOffsetX = newOffsetX;
      this.targetOffsetY = newOffsetY;
    } else {
      this.zoom = newZoom;
      this.offsetX = newOffsetX;
      this.offsetY = newOffsetY;
      this.targetZoom = newZoom;
      this.targetOffsetX = newOffsetX;
      this.targetOffsetY = newOffsetY;
    }
  }

  /**
   * Update camera (smooth animation)
   */
  update(deltaTime: number): boolean {
    const lerpFactor = 1 - Math.exp(-10 * deltaTime);
    
    let changed = false;
    
    // Smooth zoom
    if (Math.abs(this.zoom - this.targetZoom) > 0.001) {
      this.zoom += (this.targetZoom - this.zoom) * lerpFactor;
      changed = true;
    } else {
      this.zoom = this.targetZoom;
    }
    
    // Smooth pan
    if (Math.abs(this.offsetX - this.targetOffsetX) > 0.1) {
      this.offsetX += (this.targetOffsetX - this.offsetX) * lerpFactor;
      changed = true;
    } else {
      this.offsetX = this.targetOffsetX;
    }
    
    if (Math.abs(this.offsetY - this.targetOffsetY) > 0.1) {
      this.offsetY += (this.targetOffsetY - this.offsetY) * lerpFactor;
      changed = true;
    } else {
      this.offsetY = this.targetOffsetY;
    }
    
    return changed;
  }

  /**
   * Get visible world bounds
   */
  getVisibleBounds(): BBox {
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(this.width, this.height);
    
    return {
      minX: topLeft.x,
      minY: topLeft.y,
      maxX: bottomRight.x,
      maxY: bottomRight.y,
    };
  }

  /**
   * Get camera state
   */
  getState(): CameraState {
    return {
      zoom: this.zoom,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    };
  }

  /**
   * Getters
   */
  getZoom(): number {
    return this.zoom;
  }

  getOffsetX(): number {
    return this.offsetX;
  }

  getOffsetY(): number {
    return this.offsetY;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

/**
 * Linear interpolation helper (reserved for future use)
 */
/*
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
*/
