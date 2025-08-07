import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { WeaponComponent } from '../components/WeaponComponent';
import { InputComponent } from '../components/InputComponent';
import { ObjectPool } from '../utils/ObjectPool';

/**
 * 武器系统 - 负责处理实体的武器发射逻辑
 */
export class WeaponSystem extends System {
  private projectilePool: ObjectPool<Entity>;
  private projectileFactory: (weaponType: string, x: number, y: number, angle: number) => Entity;
  private autoFire: boolean;

  /**
   * 构造函数
   * @param projectileFactory 子弹工厂函数
   * @param poolSize 对象池大小
   * @param autoFire 是否自动发射（对于敌人）
   */
  constructor(
    projectileFactory: (weaponType: string, x: number, y: number, angle: number) => Entity,
    poolSize = 100,
    autoFire = false
  ) {
    super(30); // 武器系统优先级中等
    
    this.projectileFactory = projectileFactory;
    this.autoFire = autoFire;
    
    // 创建子弹对象池
    this.projectilePool = new ObjectPool<Entity>(
      () => {
        // 创建一个空的实体作为子弹
        return new Entity();
      },
      (entity: Entity) => {
        // 重置实体
        entity.setActive(false);
      },
      (entity: Entity) => {
        // 激活实体
        entity.setActive(true);
      },
      poolSize
    );
  }

  /**
   * 过滤实体
   * 只处理具有武器组件的实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return entity.hasComponent(WeaponComponent.TYPE) && 
           entity.hasComponent(TransformComponent.TYPE);
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
    const weaponEntities = entities.filter((entity: Entity) => 
      this.filter(entity) && entity.isActive()
    );
    
    // 更新武器冷却时间
    for (const entity of weaponEntities) {
      this.updateWeaponCooldown(entity, deltaTime);
      
      // 检查是否应该发射
      if (this.shouldFire(entity)) {
        this.fireWeapon(entity);
      }
    }
  }

  /**
   * 更新武器冷却时间
   * @param entity 实体
   * @param deltaTime 时间增量（秒）
   */
  private updateWeaponCooldown(entity: Entity, deltaTime: number): void {
    const weapon = entity.getComponent(WeaponComponent.TYPE) as WeaponComponent;
    
    if (weapon) {
      // 减少冷却时间（转换为毫秒）
      weapon.reduceCooldown(deltaTime * 1000);
    }
  }

  /**
   * 检查是否应该发射武器
   * @param entity 实体
   */
  private shouldFire(entity: Entity): boolean {
    const weapon = entity.getComponent(WeaponComponent.TYPE) as WeaponComponent;
    
    if (!weapon || !weapon.canFire()) {
      return false;
    }
    
    // 检查是否是玩家控制的实体
    const input = entity.getComponent(InputComponent.TYPE) as InputComponent;
    
    if (input) {
      // 玩家控制的实体，检查输入
      return input.isKeyDown('Space') || input.isMouseButtonDown(0);
    } else {
      // 非玩家控制的实体，根据autoFire决定
      return this.autoFire;
    }
  }

  /**
   * 发射武器
   * @param entity 实体
   */
  private fireWeapon(entity: Entity): void {
    if (!this.world) return;
    
    const weapon = entity.getComponent(WeaponComponent.TYPE) as WeaponComponent;
    const transform = entity.getComponent(TransformComponent.TYPE) as TransformComponent;
    
    if (!weapon || !transform) {
      return;
    }
    
    // 重置武器冷却
    weapon.resetCooldown();
    
    // 获取武器属性
    const weaponType = weapon.getWeaponType();
    const projectileCount = weapon.getProjectileCount();
    const spread = weapon.getSpread();
    
    // 计算发射角度
    const baseAngle = transform.rotation - Math.PI / 2; // 假设实体朝上为0度
    
    // 发射多个子弹
    for (let i = 0; i < projectileCount; i++) {
      // 计算子弹角度（添加散射）
      let angle = baseAngle;
      
      if (projectileCount > 1 && spread > 0) {
        // 计算散射角度
        const spreadAngle = spread * (i / (projectileCount - 1) - 0.5);
        angle += spreadAngle;
      }
      
      // 从对象池获取子弹实体
      const projectile = this.projectilePool.get();
      
      // 如果对象池已满，跳过
      if (!projectile) {
        continue;
      }
      
      // 使用工厂函数配置子弹
      const configuredProjectile = this.projectileFactory(weaponType, transform.x, transform.y, angle);
      
      // 将子弹添加到世界
      this.world.addEntity(configuredProjectile);
    }
  }

  /**
   * 回收子弹
   * @param projectile 子弹实体
   */
  public recycleProjectile(projectile: Entity): void {
    this.projectilePool.release(projectile);
  }
}