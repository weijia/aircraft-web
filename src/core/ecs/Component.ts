import { Entity } from './Entity';

/**
 * 组件基类 - ECS架构的基础
 * 组件用于存储实体的数据和状态
 */
export abstract class Component {
  private owner: Entity | null = null;

  /**
   * 获取组件类型
   * 每个组件子类必须实现此方法以返回唯一的类型标识符
   */
  public abstract getType(): string;

  /**
   * 设置组件所属的实体
   * @param entity 所属实体
   */
  public setOwner(entity: Entity | null): void {
    this.owner = entity;
  }

  /**
   * 获取组件所属的实体
   */
  public getOwner(): Entity | null {
    return this.owner;
  }

  /**
   * 组件初始化方法
   * 在组件被添加到实体时调用
   */
  public init(): void {
    // 子类可以重写此方法以进行初始化
  }

  /**
   * 组件销毁方法
   * 在组件被从实体移除时调用
   */
  public destroy(): void {
    // 子类可以重写此方法以进行清理
  }

  /**
   * 克隆组件
   * 创建组件的副本
   */
  public abstract clone(): Component;
}