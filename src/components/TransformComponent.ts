import { Component } from '../core/ecs/Component';

/**
 * 变换组件 - 存储实体的位置、旋转和缩放信息
 */
export class TransformComponent extends Component {
  public static readonly TYPE = 'Transform';
  
  public x: number;
  public y: number;
  public rotation: number;
  public scaleX: number;
  public scaleY: number;

  /**
   * 构造函数
   * @param x X坐标
   * @param y Y坐标
   * @param rotation 旋转角度（弧度）
   * @param scaleX X轴缩放
   * @param scaleY Y轴缩放
   */
  constructor(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
    super();
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return TransformComponent.TYPE;
  }

  /**
   * 设置位置
   * @param x X坐标
   * @param y Y坐标
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 移动位置
   * @param dx X轴位移
   * @param dy Y轴位移
   */
  public translate(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  /**
   * 设置旋转
   * @param rotation 旋转角度（弧度）
   */
  public setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  /**
   * 旋转
   * @param angle 旋转角度增量（弧度）
   */
  public rotate(angle: number): void {
    this.rotation += angle;
  }

  /**
   * 设置缩放
   * @param scaleX X轴缩放
   * @param scaleY Y轴缩放
   */
  public setScale(scaleX: number, scaleY: number): void {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    return new TransformComponent(this.x, this.y, this.rotation, this.scaleX, this.scaleY);
  }
}