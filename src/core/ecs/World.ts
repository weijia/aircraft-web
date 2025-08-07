import { Entity } from './Entity';
import { System } from './System';

/**
 * 世界类 - ECS架构的核心
 * 管理所有实体和系统
 */
export class World {
  private entities: Map<string, Entity>;
  private systems: System[];
  private entitiesToAdd: Entity[];
  private entitiesToRemove: Set<string>;
  private entityListeners: Array<(entity: Entity, added: boolean) => void>;

  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.entitiesToAdd = [];
    this.entitiesToRemove = new Set();
    this.entityListeners = [];
  }

  /**
   * 添加实体到世界
   * @param entity 要添加的实体
   */
  public addEntity(entity: Entity): Entity {
    this.entitiesToAdd.push(entity);
    return entity;
  }

  /**
   * 移除实体
   * @param entityId 要移除的实体ID
   */
  public removeEntity(entityId: string): void {
    this.entitiesToRemove.add(entityId);
  }

  /**
   * 获取指定ID的实体
   * @param entityId 实体ID
   */
  public getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * 获取所有实体
   */
  public getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * 根据标签获取实体
   * @param tag 标签名
   */
  public getEntitiesByTag(tag: string): Entity[] {
    return this.getEntities().filter(entity => entity.hasTag(tag));
  }

  /**
   * 添加系统到世界
   * @param system 要添加的系统
   */
  public addSystem(system: System): System {
    system.setWorld(this);
    system.init();
    
    // 按优先级插入系统
    const priority = system.getPriority();
    let index = this.systems.findIndex(s => s.getPriority() > priority);
    if (index === -1) {
      index = this.systems.length;
    }
    
    this.systems.splice(index, 0, system);
    return system;
  }

  /**
   * 移除系统
   * @param systemType 要移除的系统类型
   */
  public removeSystem<T extends System>(systemType: new (...args: any[]) => T): void {
    const index = this.systems.findIndex(system => system instanceof systemType);
    if (index !== -1) {
      const system = this.systems[index];
      system.destroy();
      system.setWorld(null);
      this.systems.splice(index, 1);
    }
  }

  /**
   * 获取指定类型的系统
   * @param systemType 系统类型
   */
  public getSystem<T extends System>(systemType: new (...args: any[]) => T): T | undefined {
    return this.systems.find(system => system instanceof systemType) as T | undefined;
  }

  /**
   * 更新世界
   * 处理实体的添加和移除，并更新所有系统
   * @param deltaTime 上一帧到当前帧的时间间隔（秒）
   */
  public update(deltaTime: number): void {
    // 处理实体添加
    if (this.entitiesToAdd.length > 0) {
      for (const entity of this.entitiesToAdd) {
        const entityId = entity.getId();
        this.entities.set(entityId, entity);
        
        // 通知监听器
        for (const listener of this.entityListeners) {
          listener(entity, true);
        }
      }
      this.entitiesToAdd = [];
    }
    
    // 处理实体移除
    if (this.entitiesToRemove.size > 0) {
      for (const entityId of this.entitiesToRemove) {
        const entity = this.entities.get(entityId);
        if (entity) {
          this.entities.delete(entityId);
          
          // 通知监听器
          for (const listener of this.entityListeners) {
            listener(entity, false);
          }
        }
      }
      this.entitiesToRemove.clear();
    }
    
    // 更新系统
    for (const system of this.systems) {
      if (system.isActive()) {
        system.update(deltaTime);
      }
    }
  }

  /**
   * 添加实体监听器
   * @param listener 监听器函数
   */
  public addEntityListener(listener: (entity: Entity, added: boolean) => void): void {
    this.entityListeners.push(listener);
  }

  /**
   * 移除实体监听器
   * @param listener 监听器函数
   */
  public removeEntityListener(listener: (entity: Entity, added: boolean) => void): void {
    const index = this.entityListeners.indexOf(listener);
    if (index !== -1) {
      this.entityListeners.splice(index, 1);
    }
  }

  /**
   * 清空世界
   * 移除所有实体和系统
   */
  public clear(): void {
    // 清空实体
    this.entities.clear();
    this.entitiesToAdd = [];
    this.entitiesToRemove.clear();
    
    // 销毁所有系统
    for (const system of this.systems) {
      system.destroy();
      system.setWorld(null);
    }
    this.systems = [];
  }
}