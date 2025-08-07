import { Entity } from './Entity';
import { World } from './World';

/**
 * 系统基类 - ECS架构的基础
 * 系统用于处理具有特定组件的实体的逻辑
 */
export abstract class System {
  protected world: World | null = null;
  private active: boolean = true;
  private priority: number = 0;

  /**
   * 构造函数
   * @param priority 系统优先级，数值越小优先级越高
   */
  constructor(priority: number = 0) {
    this.priority = priority;
  }

  /**
   * 设置系统所属的世界
   * @param world 世界实例
   */
  public setWorld(world: World): void {
    this.world = world;
  }

  /**
   * 获取系统所属的世界
   */
  public getWorld(): World | null {
    return this.world;
  }

  /**
   * 设置系统活动状态
   * @param active 是否活动
   */
  public setActive(active: boolean): void {
    this.active = active;
  }

  /**
   * 获取系统活动状态
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * 获取系统优先级
   */
  public getPriority(): number {
    return this.priority;
  }

  /**
   * 系统初始化方法
   * 在系统被添加到世界时调用
   */
  public init(): void {
    // 子类可以重写此方法以进行初始化
  }

  /**
   * 系统更新方法
   * 每帧调用，用于处理系统逻辑
   * @param deltaTime 上一帧到当前帧的时间间隔（秒）
   */
  public abstract update(deltaTime: number): void;

  /**
   * 系统销毁方法
   * 在系统被从世界移除时调用
   */
  public destroy(): void {
    // 子类可以重写此方法以进行清理
  }

  /**
   * 过滤实体
   * 检查实体是否满足系统处理的条件
   * @param entity 要检查的实体
   */
  public abstract filter(entity: Entity): boolean;
}