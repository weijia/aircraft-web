import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { TimerComponent } from '../components/TimerComponent';

/**
 * 计时器系统 - 负责处理实体的计时逻辑
 */
export class TimerSystem extends System {
  /**
   * 构造函数
   */
  constructor() {
    super(15); // 计时器系统优先级中等
  }

  /**
   * 过滤实体
   * 只处理具有计时器组件的实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return entity.hasComponent(TimerComponent.TYPE);
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
    const timerEntities = entities.filter((entity: Entity) => 
      this.filter(entity) && entity.isActive()
    );
    
    // 更新每个实体的计时器
    for (const entity of timerEntities) {
      this.updateEntityTimers(entity, deltaTime);
    }
  }

  /**
   * 更新实体的计时器
   * @param entity 实体
   * @param deltaTime 时间增量（秒）
   */
  private updateEntityTimers(entity: Entity, deltaTime: number): void {
    const timer = entity.getComponent(TimerComponent.TYPE) as TimerComponent;
    
    if (!timer) {
      return;
    }
    
    // 更新计时器（转换为毫秒）
    timer.update(deltaTime * 1000);
  }
}