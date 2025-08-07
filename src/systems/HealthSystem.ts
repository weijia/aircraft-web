import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { HealthComponent } from '../components/HealthComponent';
import { RenderComponent } from '../components/RenderComponent';

/**
 * 健康系统 - 负责处理实体的生命值和伤害
 */
export class HealthSystem extends System {
  private entityDeathListeners: Array<(entity: Entity) => void>;
  private blinkOnDamage: boolean;
  private blinkDuration: number;

  /**
   * 构造函数
   * @param blinkOnDamage 受伤时是否闪烁
   * @param blinkDuration 闪烁持续时间（毫秒）
   */
  constructor(blinkOnDamage = true, blinkDuration = 200) {
    super(40); // 健康系统优先级较低
    
    this.entityDeathListeners = [];
    this.blinkOnDamage = blinkOnDamage;
    this.blinkDuration = blinkDuration;
  }

  /**
   * 过滤实体
   * 只处理具有健康组件的实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return entity.hasComponent(HealthComponent.TYPE);
  }

  /**
   * 添加实体死亡监听器
   * @param listener 监听器函数
   */
  public addEntityDeathListener(listener: (entity: Entity) => void): void {
    this.entityDeathListeners.push(listener);
  }

  /**
   * 移除实体死亡监听器
   * @param listener 监听器函数
   */
  public removeEntityDeathListener(listener: (entity: Entity) => void): void {
    const index = this.entityDeathListeners.indexOf(listener);
    if (index !== -1) {
      this.entityDeathListeners.splice(index, 1);
    }
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
    const healthEntities = entities.filter((entity: Entity) => 
      this.filter(entity) && entity.isActive()
    );
    
    // 更新每个实体的健康状态
    for (const entity of healthEntities) {
      this.updateEntityHealth(entity, deltaTime);
    }
  }

  /**
   * 更新实体的健康状态
   * @param entity 实体
   * @param deltaTime 时间增量（秒）
   */
  private updateEntityHealth(entity: Entity, deltaTime: number): void {
    const health = entity.getComponent(HealthComponent.TYPE) as HealthComponent;
    
    if (!health) {
      return;
    }
    
    // 更新无敌状态
    health.updateInvincibility(deltaTime * 1000); // 转换为毫秒
    
    // 检查是否死亡
    if (!health.isAlive()) {
      this.handleEntityDeath(entity);
      return;
    }
    
    // 处理受伤闪烁效果
    if (this.blinkOnDamage) {
      this.updateBlinkEffect(entity, health);
    }
  }

  /**
   * 处理实体死亡
   * @param entity 实体
   */
  private handleEntityDeath(entity: Entity): void {
    if (!this.world) return;
    
    // 通知所有监听器
    for (const listener of this.entityDeathListeners) {
      listener(entity);
    }
    
    // 从世界中移除实体
    this.world.removeEntity(entity.getId());
  }

  /**
   * 更新闪烁效果
   * @param entity 实体
   * @param health 健康组件
   */
  private updateBlinkEffect(entity: Entity, health: HealthComponent): void {
    const render = entity.getComponent(RenderComponent.TYPE) as RenderComponent;
    
    if (!render) {
      return;
    }
    
    // 如果处于无敌状态，闪烁效果
    if (health.isInvincible()) {
      // 计算闪烁频率（每200毫秒切换一次）
      const blinkFrequency = this.blinkDuration;
      const currentTime = Date.now();
      const visible = Math.floor(currentTime / blinkFrequency) % 2 === 0;
      
      render.setVisible(visible);
    } else {
      // 确保实体可见
      render.setVisible(true);
    }
  }

  /**
   * 对实体造成伤害
   * @param entity 实体
   * @param amount 伤害量
   * @returns 实际造成的伤害
   */
  public damageEntity(entity: Entity, amount: number): number {
    const health = entity.getComponent(HealthComponent.TYPE) as HealthComponent;
    
    if (!health) {
      return 0;
    }
    
    return health.damage(amount);
  }

  /**
   * 治疗实体
   * @param entity 实体
   * @param amount 治疗量
   * @returns 实际恢复的生命值
   */
  public healEntity(entity: Entity, amount: number): number {
    const health = entity.getComponent(HealthComponent.TYPE) as HealthComponent;
    
    if (!health) {
      return 0;
    }
    
    return health.heal(amount);
  }
}