import { Component } from './Component';
import { v4 as uuidv4 } from 'uuid';

/**
 * 实体类 - ECS架构的基础
 * 实体是游戏中的基本对象，通过添加不同的组件来定义其行为和属性
 */
export class Entity {
  private id: string;
  private components: Map<string, Component>;
  private tags: Set<string>;
  private active: boolean;

  constructor() {
    this.id = uuidv4();
    this.components = new Map();
    this.tags = new Set();
    this.active = true;
  }

  /**
   * 获取实体ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * 添加组件到实体
   * @param component 要添加的组件
   */
  public addComponent<T extends Component>(component: T): Entity {
    this.components.set(component.getType(), component);
    component.setOwner(this);
    return this;
  }

  /**
   * 移除组件
   * @param componentType 要移除的组件类型
   */
  public removeComponent(componentType: string): Entity {
    if (this.components.has(componentType)) {
      const component = this.components.get(componentType);
      if (component) {
        component.setOwner(null);
      }
      this.components.delete(componentType);
    }
    return this;
  }

  /**
   * 获取指定类型的组件
   * @param componentType 组件类型
   */
  public getComponent<T extends Component>(componentType: string): T | undefined {
    return this.components.get(componentType) as T | undefined;
  }

  /**
   * 检查实体是否拥有指定类型的组件
   * @param componentType 组件类型
   */
  public hasComponent(componentType: string): boolean {
    return this.components.has(componentType);
  }

  /**
   * 获取实体的所有组件
   */
  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * 添加标签
   * @param tag 标签名
   */
  public addTag(tag: string): Entity {
    this.tags.add(tag);
    return this;
  }

  /**
   * 移除标签
   * @param tag 标签名
   */
  public removeTag(tag: string): Entity {
    this.tags.delete(tag);
    return this;
  }

  /**
   * 检查是否有指定标签
   * @param tag 标签名
   */
  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * 获取所有标签
   */
  public getTags(): string[] {
    return Array.from(this.tags);
  }

  /**
   * 设置实体活动状态
   * @param active 是否活动
   */
  public setActive(active: boolean): void {
    this.active = active;
  }

  /**
   * 获取实体活动状态
   */
  public isActive(): boolean {
    return this.active;
  }
}