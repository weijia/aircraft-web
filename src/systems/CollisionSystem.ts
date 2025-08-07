import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { ColliderComponent, ColliderType } from '../components/ColliderComponent';

/**
 * 碰撞事件类型
 */
export enum CollisionEventType {
  ENTER, // 开始碰撞
  STAY,  // 持续碰撞
  EXIT   // 结束碰撞
}

/**
 * 碰撞事件
 */
export interface CollisionEvent {
  type: CollisionEventType;
  entityA: Entity;
  entityB: Entity;
}

/**
 * 碰撞系统 - 负责处理实体之间的碰撞检测
 */
export class CollisionSystem extends System {
  private collisionPairs: Map<string, boolean>;
  private collisionListeners: Array<(event: CollisionEvent) => void>;
  private useQuadTree: boolean;
  private maxObjectsPerNode: number;
  private maxLevels: number;

  /**
   * 构造函数
   * @param useQuadTree 是否使用四叉树优化
   * @param maxObjectsPerNode 每个四叉树节点的最大对象数
   * @param maxLevels 四叉树的最大层级
   */
  constructor(useQuadTree = true, maxObjectsPerNode = 10, maxLevels = 5) {
    super(20); // 碰撞系统优先级中等，在移动系统之后执行
    
    this.collisionPairs = new Map();
    this.collisionListeners = [];
    this.useQuadTree = useQuadTree;
    this.maxObjectsPerNode = maxObjectsPerNode;
    this.maxLevels = maxLevels;
  }

  /**
   * 过滤实体
   * 只处理同时具有变换组件和碰撞组件的实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return entity.hasComponent(TransformComponent.TYPE) && 
           entity.hasComponent(ColliderComponent.TYPE);
  }

  /**
   * 添加碰撞监听器
   * @param listener 监听器函数
   */
  public addCollisionListener(listener: (event: CollisionEvent) => void): void {
    this.collisionListeners.push(listener);
  }

  /**
   * 移除碰撞监听器
   * @param listener 监听器函数
   */
  public removeCollisionListener(listener: (event: CollisionEvent) => void): void {
    const index = this.collisionListeners.indexOf(listener);
    if (index !== -1) {
      this.collisionListeners.splice(index, 1);
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
    const collidableEntities = entities.filter((entity: Entity) => 
      this.filter(entity) && entity.isActive()
    );
    
    // 记录当前帧的碰撞对
    const currentCollisionPairs = new Map<string, boolean>();
    
    // 如果使用四叉树优化
    if (this.useQuadTree && collidableEntities.length > this.maxObjectsPerNode) {
      // 这里可以实现四叉树优化
      // 为简化实现，这里暂时使用暴力检测
      this.bruteForceCollisionDetection(collidableEntities, currentCollisionPairs);
    } else {
      // 使用暴力检测
      this.bruteForceCollisionDetection(collidableEntities, currentCollisionPairs);
    }
    
    // 处理碰撞事件
    this.processCollisionEvents(currentCollisionPairs);
    
    // 更新碰撞对记录
    this.collisionPairs = currentCollisionPairs;
  }

  /**
   * 暴力碰撞检测
   * @param entities 实体列表
   * @param currentCollisionPairs 当前碰撞对
   */
  private bruteForceCollisionDetection(entities: Entity[], currentCollisionPairs: Map<string, boolean>): void {
    const length = entities.length;
    
    // 遍历所有实体对
    for (let i = 0; i < length; i++) {
      const entityA = entities[i];
      const colliderA = entityA.getComponent(ColliderComponent.TYPE) as ColliderComponent;
      
      for (let j = i + 1; j < length; j++) {
        const entityB = entities[j];
        const colliderB = entityB.getComponent(ColliderComponent.TYPE) as ColliderComponent;
        
        // 检查碰撞层是否匹配
        if (!colliderA.canCollideWith(colliderB.getCollisionLayer()) || 
            !colliderB.canCollideWith(colliderA.getCollisionLayer())) {
          continue;
        }
        
        // 检查是否碰撞
        if (this.checkCollision(entityA, entityB)) {
          // 生成碰撞对ID
          const pairId = this.getCollisionPairId(entityA, entityB);
          currentCollisionPairs.set(pairId, true);
        }
      }
    }
  }

  /**
   * 处理碰撞事件
   * @param currentCollisionPairs 当前碰撞对
   */
  private processCollisionEvents(currentCollisionPairs: Map<string, boolean>): void {
    // 处理新的碰撞（ENTER）
    for (const [pairId, _] of currentCollisionPairs) {
      if (!this.collisionPairs.has(pairId)) {
        const [entityA, entityB] = this.getEntitiesFromPairId(pairId);
        if (entityA && entityB) {
          this.dispatchCollisionEvent({
            type: CollisionEventType.ENTER,
            entityA,
            entityB
          });
        }
      } else {
        // 持续碰撞（STAY）
        const [entityA, entityB] = this.getEntitiesFromPairId(pairId);
        if (entityA && entityB) {
          this.dispatchCollisionEvent({
            type: CollisionEventType.STAY,
            entityA,
            entityB
          });
        }
      }
    }
    
    // 处理结束的碰撞（EXIT）
    for (const [pairId, _] of this.collisionPairs) {
      if (!currentCollisionPairs.has(pairId)) {
        const [entityA, entityB] = this.getEntitiesFromPairId(pairId);
        if (entityA && entityB) {
          this.dispatchCollisionEvent({
            type: CollisionEventType.EXIT,
            entityA,
            entityB
          });
        }
      }
    }
  }

  /**
   * 分发碰撞事件
   * @param event 碰撞事件
   */
  private dispatchCollisionEvent(event: CollisionEvent): void {
    for (const listener of this.collisionListeners) {
      listener(event);
    }
  }

  /**
   * 检查两个实体是否碰撞
   * @param entityA 实体A
   * @param entityB 实体B
   */
  private checkCollision(entityA: Entity, entityB: Entity): boolean {
    const transformA = entityA.getComponent(TransformComponent.TYPE) as TransformComponent;
    const colliderA = entityA.getComponent(ColliderComponent.TYPE) as ColliderComponent;
    
    const transformB = entityB.getComponent(TransformComponent.TYPE) as TransformComponent;
    const colliderB = entityB.getComponent(ColliderComponent.TYPE) as ColliderComponent;
    
    if (!transformA || !colliderA || !transformB || !colliderB) {
      return false;
    }
    
    // 获取碰撞器类型
    const typeA = colliderA.getColliderType();
    const typeB = colliderB.getColliderType();
    
    // 根据碰撞器类型选择不同的碰撞检测算法
    if (typeA === ColliderType.CIRCLE && typeB === ColliderType.CIRCLE) {
      return this.checkCircleCircleCollision(transformA, colliderA, transformB, colliderB);
    } else if (typeA === ColliderType.RECTANGLE && typeB === ColliderType.RECTANGLE) {
      return this.checkRectRectCollision(transformA, colliderA, transformB, colliderB);
    } else {
      // 一个是圆形，一个是矩形
      if (typeA === ColliderType.CIRCLE) {
        return this.checkCircleRectCollision(transformA, colliderA, transformB, colliderB);
      } else {
        return this.checkCircleRectCollision(transformB, colliderB, transformA, colliderA);
      }
    }
  }

  /**
   * 检查圆形与圆形的碰撞
   */
  private checkCircleCircleCollision(
    transformA: TransformComponent,
    colliderA: ColliderComponent,
    transformB: TransformComponent,
    colliderB: ColliderComponent
  ): boolean {
    const x1 = transformA.x + colliderA.getOffsetX();
    const y1 = transformA.y + colliderA.getOffsetY();
    const r1 = colliderA.getRadius();
    
    const x2 = transformB.x + colliderB.getOffsetX();
    const y2 = transformB.y + colliderB.getOffsetY();
    const r2 = colliderB.getRadius();
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < r1 + r2;
  }

  /**
   * 检查矩形与矩形的碰撞
   */
  private checkRectRectCollision(
    transformA: TransformComponent,
    colliderA: ColliderComponent,
    transformB: TransformComponent,
    colliderB: ColliderComponent
  ): boolean {
    const boundsA = colliderA.getBounds(transformA);
    const boundsB = colliderB.getBounds(transformB);
    
    return boundsA.x < boundsB.x + boundsB.width &&
           boundsA.x + boundsA.width > boundsB.x &&
           boundsA.y < boundsB.y + boundsB.height &&
           boundsA.y + boundsA.height > boundsB.y;
  }

  /**
   * 检查圆形与矩形的碰撞
   */
  private checkCircleRectCollision(
    circleTransform: TransformComponent,
    circleCollider: ColliderComponent,
    rectTransform: TransformComponent,
    rectCollider: ColliderComponent
  ): boolean {
    const circleX = circleTransform.x + circleCollider.getOffsetX();
    const circleY = circleTransform.y + circleCollider.getOffsetY();
    const radius = circleCollider.getRadius();
    
    const rectBounds = rectCollider.getBounds(rectTransform);
    
    // 找到矩形上离圆心最近的点
    const closestX = Math.max(rectBounds.x, Math.min(circleX, rectBounds.x + rectBounds.width));
    const closestY = Math.max(rectBounds.y, Math.min(circleY, rectBounds.y + rectBounds.height));
    
    // 计算圆心到最近点的距离
    const dx = closestX - circleX;
    const dy = closestY - circleY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < radius;
  }

  /**
   * 生成碰撞对ID
   * @param entityA 实体A
   * @param entityB 实体B
   */
  private getCollisionPairId(entityA: Entity, entityB: Entity): string {
    // 确保ID的顺序一致，无论传入的实体顺序如何
    const idA = entityA.getId();
    const idB = entityB.getId();
    
    return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
  }

  /**
   * 从碰撞对ID获取实体
   * @param pairId 碰撞对ID
   */
  private getEntitiesFromPairId(pairId: string): [Entity | undefined, Entity | undefined] {
    if (!this.world) {
      return [undefined, undefined];
    }
    
    const [idA, idB] = pairId.split(':');
    const entityA = this.world.getEntity(idA);
    const entityB = this.world.getEntity(idB);
    
    return [entityA, entityB];
  }
}