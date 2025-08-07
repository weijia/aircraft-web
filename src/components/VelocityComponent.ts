import { Component } from '../core/ecs/Component';

/**
 * 速度组件 - 用于处理实体的移动
 */
export class VelocityComponent extends Component {
  public static readonly TYPE = 'Velocity';
  
  public vx: number;
  public vy: number;
  public maxSpeed: number;
  public friction: number;

  /**
   * 构造函数
   * @param vx X轴速度
   * @param vy Y轴速度
   * @param maxSpeed 最大速度
   * @param friction 摩擦力（减速因子）
   */
  constructor(vx = 0, vy = 0, maxSpeed = 500, friction = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
    this.maxSpeed = maxSpeed;
    this.friction = friction;
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return VelocityComponent.TYPE;
  }

  /**
   * 设置速度
   * @param vx X轴速度
   * @param vy Y轴速度
   */
  public setVelocity(vx: number, vy: number): void {
    this.vx = vx;
    this.vy = vy;
    this.clampSpeed();
  }

  /**
   * 添加速度
   * @param vx X轴速度增量
   * @param vy Y轴速度增量
   */
  public addVelocity(vx: number, vy: number): void {
    this.vx += vx;
    this.vy += vy;
    this.clampSpeed();
  }

  /**
   * 设置速度方向和大小
   * @param angle 方向角度（弧度）
   * @param speed 速度大小
   */
  public setVelocityFromPolar(angle: number, speed: number): void {
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.clampSpeed();
  }

  /**
   * 获取速度大小
   */
  public getSpeed(): number {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  /**
   * 获取速度方向
   */
  public getDirection(): number {
    return Math.atan2(this.vy, this.vx);
  }

  /**
   * 应用摩擦力
   * @param deltaTime 时间增量
   */
  public applyFriction(deltaTime: number): void {
    if (this.friction > 0 && (this.vx !== 0 || this.vy !== 0)) {
      const speed = this.getSpeed();
      const frictionAmount = this.friction * deltaTime;
      
      if (speed <= frictionAmount) {
        // 如果摩擦力足够大，直接停止
        this.vx = 0;
        this.vy = 0;
      } else {
        // 应用摩擦力减速
        const scale = Math.max(0, (speed - frictionAmount) / speed);
        this.vx *= scale;
        this.vy *= scale;
      }
    }
  }

  /**
   * 限制速度不超过最大速度
   */
  private clampSpeed(): void {
    const speed = this.getSpeed();
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    return new VelocityComponent(this.vx, this.vy, this.maxSpeed, this.friction);
  }
}