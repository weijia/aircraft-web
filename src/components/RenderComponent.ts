import { Component } from '../core/ecs/Component';

/**
 * 渲染组件 - 存储实体的渲染信息
 */
export class RenderComponent extends Component {
  public static readonly TYPE = 'Render';
  
  private image: HTMLImageElement | null;
  private width: number;
  private height: number;
  private color: string;
  private alpha: number;
  private visible: boolean;
  private offscreenCanvas: HTMLCanvasElement | null;

  /**
   * 构造函数
   * @param width 宽度
   * @param height 高度
   * @param color 颜色
   * @param alpha 透明度
   */
  constructor(width = 32, height = 32, color = '#FFFFFF', alpha = 1) {
    super();
    this.image = null;
    this.width = width;
    this.height = height;
    this.color = color;
    this.alpha = alpha;
    this.visible = true;
    this.offscreenCanvas = null;
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return RenderComponent.TYPE;
  }

  /**
   * 设置图像
   * @param image 图像对象或图像路径
   */
  public setImage(image: HTMLImageElement | string): void {
    if (typeof image === 'string') {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        this.image = img;
        this.width = img.width;
        this.height = img.height;
        this.createOffscreenCanvas();
      };
    } else {
      this.image = image;
      this.width = image.width;
      this.height = image.height;
      this.createOffscreenCanvas();
    }
  }

  /**
   * 获取图像
   */
  public getImage(): HTMLImageElement | null {
    return this.image;
  }

  /**
   * 设置尺寸
   * @param width 宽度
   * @param height 高度
   */
  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.createOffscreenCanvas();
  }

  /**
   * 获取宽度
   */
  public getWidth(): number {
    return this.width;
  }

  /**
   * 获取高度
   */
  public getHeight(): number {
    return this.height;
  }

  /**
   * 设置颜色
   * @param color 颜色
   */
  public setColor(color: string): void {
    this.color = color;
    this.createOffscreenCanvas();
  }

  /**
   * 获取颜色
   */
  public getColor(): string {
    return this.color;
  }

  /**
   * 设置透明度
   * @param alpha 透明度
   */
  public setAlpha(alpha: number): void {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  /**
   * 获取透明度
   */
  public getAlpha(): number {
    return this.alpha;
  }

  /**
   * 设置可见性
   * @param visible 是否可见
   */
  public setVisible(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * 获取可见性
   */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * 获取离屏Canvas
   */
  public getOffscreenCanvas(): HTMLCanvasElement | null {
    return this.offscreenCanvas;
  }

  /**
   * 创建离屏Canvas
   * 用于预渲染静态资源，提高性能
   */
  private createOffscreenCanvas(): void {
    if (this.width <= 0 || this.height <= 0) {
      return;
    }

    // 创建离屏Canvas
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }

    // 清空Canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // 如果有图像，绘制图像
    if (this.image && this.image.complete) {
      ctx.drawImage(this.image, 0, 0, this.width, this.height);
    } else {
      // 否则绘制矩形
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    this.offscreenCanvas = canvas;
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    const clone = new RenderComponent(this.width, this.height, this.color, this.alpha);
    if (this.image) {
      clone.setImage(this.image);
    }
    clone.setVisible(this.visible);
    return clone;
  }
}