import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';

/**
 * 移动系统 - 负责处理实体的移动
 */
export class MovementSystem extends System {
  private canvasWidth: number;
  private canvasHeight: number;
  private boundaryMode: 'wrap' | 'bounce' | 'none';

  /**
   * 构造函数
   * @param canvasWidth 画布宽度
   * @param canvasHeight 画布高度
   * @param boundaryMode 边界模式（wrap: 环绕, bounce: 反弹, none: 无限制）
   */
  constructor(canvasWidth: number, canvasHeight: number, boundaryMode: 'wrap' | 'bounce' | 'none' = 'none') {
    super(10); // 移动系统优先级较高，在大多数系统之前执行
    
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.boundaryMode = boundaryMode;
  }

  /**
   * 过滤实体
   * 只处理同时具有变换组件和速度组件的实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return entity.hasComponent(TransformComponent.TYPE) && 
           entity.hasComponent(VelocityComponent.TYPE);
  }

  /**
   * 更新系统
   * @param deltaTime 时间增量（秒）
   */
  public update(deltaTime: number): void {
    if (!this.world) return;
    
    // 获取所有实体
    const entities = this.world.getEntities();
    
    // 过滤实体
    const movableEntities = entities.filter((entity: Entity) => 
      this.filter(entity) && entity.isActive()
    );
    
    // 更新实体位置
    for (const entity of movableEntities) {
      this.updateEntityPosition(entity, deltaTime);
    }
  }

  /**
   * 更新实体位置
   * @param entity 实体
   * @param deltaTime 时间增量（秒）
   */
  private updateEntityPosition(entity: Entity, deltaTime: number): void {
    const transform = entity.getComponent(TransformComponent.TYPE) as TransformComponent;
    const velocity = entity.getComponent(VelocityComponent.TYPE) as VelocityComponent;
    
    if (!transform || !velocity) {
      return;
    }
    
    // 应用摩擦力
    velocity.applyFriction(deltaTime * 1000); // 转换为毫秒
    
    // 更新位置
    transform.x += velocity.vx * deltaTime;
    transform.y += velocity.vy * deltaTime;
    
    // 处理边界
    this.handleBoundaries(transform, velocity);
  }

  /**
   * 处理边界
   * @param transform 变换组件
   * @param velocity 速度组件
   */
  private handleBoundaries(transform: TransformComponent, velocity: VelocityComponent): void {
    // 如果边界模式为"无限制"，则不做任何处理
    if (this.boundaryMode === 'none') {
      return;
    }
    
    // 环绕模式
    if (this.boundaryMode === 'wrap') {
      if (transform.x < 0) {
        transform.x = this.canvasWidth;
      } else if (transform.x > this.canvasWidth) {
        transform.x = 0;
      }
      
      if (transform.y < 0) {
        transform.y = this.canvasHeight;
      } else if (transform.y > this.canvasHeight) {
        transform.y = 0;
      }
    }
    
    // 反弹模式
    if (this.boundaryMode === 'bounce') {
      if (transform.x < 0) {
        transform.x = 0;
        velocity.vx = -velocity.vx;
      } else if (transform.x > this.canvasWidth) {
        transform.x = this.canvasWidth;
        velocity.vx = -velocity.vx;
      }
      
      if (transform.y < 0) {
        transform.y = 0;
        velocity.vy = -velocity.vy;
      } else if (transform.y > this.canvasHeight) {
        transform.y = this.canvasHeight;
        velocity.vy = -velocity.vy;
      }
    }
  }

  /**
   * 设置画布尺寸
   * @param width 宽度
   * @param height 高度
   */
  public setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}