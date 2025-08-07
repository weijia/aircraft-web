import { Component } from '../core/ecs/Component';
import { TransformComponent } from './TransformComponent';

/**
 * 碰撞器类型枚举
 */
export enum ColliderType {
  CIRCLE,
  RECTANGLE
}

/**
 * 碰撞组件 - 用于处理实体之间的碰撞检测
 */
export class ColliderComponent extends Component {
  public static readonly TYPE = 'Collider';
  
  private type: ColliderType;
  private width: number;
  private height: number;
  private radius: number;
  private offsetX: number;
  private offsetY: number;
  private isTrigger: boolean;
  private collisionLayer: number;
  private collisionMask: number;

  /**
   * 构造函数
   * @param type 碰撞器类型
   * @param width 矩形宽度（仅在矩形碰撞器中使用）
   * @param height 矩形高度（仅在矩形碰撞器中使用）
   * @param radius 圆形半径（仅在圆形碰撞器中使用）
   * @param offsetX X轴偏移
   * @param offsetY Y轴偏移
   * @param isTrigger 是否为触发器（不产生物理反应，只触发事件）
   * @param collisionLayer 碰撞层（用于过滤碰撞）
   * @param collisionMask 碰撞掩码（用于过滤碰撞）
   */
  constructor(
    type = ColliderType.RECTANGLE,
    width = 32,
    height = 32,
    radius = 16,
    offsetX = 0,
    offsetY = 0,
    isTrigger = false,
    collisionLayer = 1,
    collisionMask = 0xFFFFFFFF
  ) {
    super();
    this.type = type;
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.isTrigger = isTrigger;
    this.collisionLayer = collisionLayer;
    this.collisionMask = collisionMask;
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return ColliderComponent.TYPE;
  }

  /**
   * 获取碰撞器类型
   */
  public getColliderType(): ColliderType {
    return this.type;
  }

  /**
   * 设置碰撞器类型
   * @param type 碰撞器类型
   */
  public setColliderType(type: ColliderType): void {
    this.type = type;
  }

  /**
   * 获取宽度
   */
  public getWidth(): number {
    return this.width;
  }

  /**
   * 设置宽度
   * @param width 宽度
   */
  public setWidth(width: number): void {
    this.width = width;
  }

  /**
   * 获取高度
   */
  public getHeight(): number {
    return this.height;
  }

  /**
   * 设置高度
   * @param height 高度
   */
  public setHeight(height: number): void {
    this.height = height;
  }

  /**
   * 获取半径
   */
  public getRadius(): number {
    return this.radius;
  }

  /**
   * 设置半径
   * @param radius 半径
   */
  public setRadius(radius: number): void {
    this.radius = radius;
  }

  /**
   * 获取X轴偏移
   */
  public getOffsetX(): number {
    return this.offsetX;
  }

  /**
   * 获取Y轴偏移
   */
  public getOffsetY(): number {
    return this.offsetY;
  }

  /**
   * 设置偏移
   * @param offsetX X轴偏移
   * @param offsetY Y轴偏移
   */
  public setOffset(offsetX: number, offsetY: number): void {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  /**
   * 是否为触发器
   */
  public isTriggerCollider(): boolean {
    return this.isTrigger;
  }

  /**
   * 设置是否为触发器
   * @param isTrigger 是否为触发器
   */
  public setTrigger(isTrigger: boolean): void {
    this.isTrigger = isTrigger;
  }

  /**
   * 获取碰撞层
   */
  public getCollisionLayer(): number {
    return this.collisionLayer;
  }

  /**
   * 设置碰撞层
   * @param layer 碰撞层
   */
  public setCollisionLayer(layer: number): void {
    this.collisionLayer = layer;
  }

  /**
   * 获取碰撞掩码
   */
  public getCollisionMask(): number {
    return this.collisionMask;
  }

  /**
   * 设置碰撞掩码
   * @param mask 碰撞掩码
   */
  public setCollisionMask(mask: number): void {
    this.collisionMask = mask;
  }

  /**
   * 检查是否可以与指定层碰撞
   * @param layer 碰撞层
   */
  public canCollideWith(layer: number): boolean {
    return (this.collisionMask & layer) !== 0;
  }

  /**
   * 获取碰撞边界
   * @param transform 变换组件
   */
  public getBounds(transform: TransformComponent): { x: number, y: number, width: number, height: number } {
    const x = transform.x + this.offsetX;
    const y = transform.y + this.offsetY;
    
    if (this.type === ColliderType.CIRCLE) {
      return {
        x: x - this.radius,
        y: y - this.radius,
        width: this.radius * 2,
        height: this.radius * 2
      };
    } else {
      return {
        x,
        y,
        width: this.width,
        height: this.height
      };
    }
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    return new ColliderComponent(
      this.type,
      this.width,
      this.height,
      this.radius,
      this.offsetX,
      this.offsetY,
      this.isTrigger,
      this.collisionLayer,
      this.collisionMask
    );
  }
}