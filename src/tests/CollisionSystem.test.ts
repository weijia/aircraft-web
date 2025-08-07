import { World } from '../core/ecs/World';
import { Entity } from '../core/ecs/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { ColliderComponent, ColliderType } from '../components/ColliderComponent';
import { CollisionSystem, CollisionEventType } from '../systems/CollisionSystem';

// 共享测试设置
let world: World;
let collisionSystem: CollisionSystem;

beforeEach(() => {
  world = new World();
  collisionSystem = new CollisionSystem();
  world.addSystem(collisionSystem);
});

// 矩形碰撞测试套件
describe('矩形碰撞测试', function rectangleCollisionTests() {
  test('矩形与矩形碰撞检测', () => {
    // 创建两个实体
    const entityA = new Entity();
    entityA.addComponent(new TransformComponent(100, 100));
    entityA.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    const entityB = new Entity();
    entityB.addComponent(new TransformComponent(120, 120));
    entityB.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    // 添加到世界
    world.addEntity(entityA);
    world.addEntity(entityB);
    
    // 监听碰撞事件
    let collisionDetected = false;
    collisionSystem.addCollisionListener((event) => {
      if (event.type === CollisionEventType.ENTER) {
        collisionDetected = true;
      }
    });
    
    // 更新世界
    world.update(0.016); // 16ms
    
    // 检查是否检测到碰撞
    expect(collisionDetected).toBe(true);
  });
});

// 圆形碰撞测试套件
describe('圆形碰撞测试', function circleCollisionTests() {
  test('圆形与圆形碰撞检测', () => {
    // 创建两个实体
    const entityA = new Entity();
    entityA.addComponent(new TransformComponent(100, 100));
    entityA.addComponent(new ColliderComponent(ColliderType.CIRCLE, 0, 0, 25));
    
    const entityB = new Entity();
    entityB.addComponent(new TransformComponent(140, 100));
    entityB.addComponent(new ColliderComponent(ColliderType.CIRCLE, 0, 0, 25));
    
    // 添加到世界
    world.addEntity(entityA);
    world.addEntity(entityB);
    
    // 监听碰撞事件
    let collisionDetected = false;
    collisionSystem.addCollisionListener((event) => {
      if (event.type === CollisionEventType.ENTER) {
        collisionDetected = true;
      }
    });
    
    // 更新世界
    world.update(0.016); // 16ms
    
    // 检查是否检测到碰撞
    expect(collisionDetected).toBe(true);
  });
});

// 混合碰撞测试套件
describe('混合碰撞测试', function mixedCollisionTests() {
  test('圆形与矩形碰撞检测', () => {
    // 创建两个实体
    const entityA = new Entity();
    entityA.addComponent(new TransformComponent(100, 100));
    entityA.addComponent(new ColliderComponent(ColliderType.CIRCLE, 0, 0, 25));
    
    const entityB = new Entity();
    entityB.addComponent(new TransformComponent(130, 100));
    entityB.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    // 添加到世界
    world.addEntity(entityA);
    world.addEntity(entityB);
    
    // 监听碰撞事件
    let collisionDetected = false;
    collisionSystem.addCollisionListener((event) => {
      if (event.type === CollisionEventType.ENTER) {
        collisionDetected = true;
      }
    });
    
    // 更新世界
    world.update(0.016); // 16ms
    
    // 检查是否检测到碰撞
    expect(collisionDetected).toBe(true);
  });
});

// 碰撞层测试套件
describe('碰撞层测试', function collisionLayerTests() {
  test('碰撞层过滤', () => {
    // 创建两个实体，设置不同的碰撞层
    const entityA = new Entity();
    entityA.addComponent(new TransformComponent(100, 100));
    entityA.addComponent(new ColliderComponent(
      ColliderType.RECTANGLE, 50, 50, 0, 0, 0, false, 1, 2
    )); // 层1，只与层2碰撞
    
    const entityB = new Entity();
    entityB.addComponent(new TransformComponent(120, 120));
    entityB.addComponent(new ColliderComponent(
      ColliderType.RECTANGLE, 50, 50, 0, 0, 0, false, 4, 8
    )); // 层4，只与层8碰撞
    
    // 添加到世界
    world.addEntity(entityA);
    world.addEntity(entityB);
    
    // 监听碰撞事件
    let collisionDetected = false;
    collisionSystem.addCollisionListener((event) => {
      if (event.type === CollisionEventType.ENTER) {
        collisionDetected = true;
      }
    });
    
    // 更新世界
    world.update(0.016); // 16ms
    
    // 检查是否检测到碰撞（不应该检测到）
    expect(collisionDetected).toBe(false);
  });
});

// 碰撞事件ENTER测试
describe('碰撞事件ENTER测试', function collisionEventEnterTests() {
  test('碰撞开始事件', () => {
    // 创建两个实体
    const entityA = new Entity();
    entityA.addComponent(new TransformComponent(100, 100));
    entityA.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    const entityB = new Entity();
    entityB.addComponent(new TransformComponent(200, 200));
    entityB.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    // 添加到世界
    world.addEntity(entityA);
    world.addEntity(entityB);
    
    // 监听碰撞事件
    const collisionEvents: CollisionEventType[] = [];
    collisionSystem.addCollisionListener((event) => {
      collisionEvents.push(event.type);
    });
    
    // 初始状态：没有碰撞
    world.update(0.016);
    expect(collisionEvents.length).toBe(0);
    
    // 移动实体B使其与实体A碰撞
    const transformB = entityB.getComponent('Transform') as TransformComponent;
    transformB.x = 120;
    transformB.y = 120;
    
    // 应该触发ENTER事件
    world.update(0.016);
    expect(collisionEvents.length).toBe(1);
    expect(collisionEvents[0]).toBe(CollisionEventType.ENTER);
  });
});

// 碰撞事件STAY测试
describe('碰撞事件STAY测试', function collisionEventStayTests() {
  test('碰撞持续事件', () => {
    // 创建两个实体
    const entityA = new Entity();
    entityA.addComponent(new TransformComponent(100, 100));
    entityA.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    const entityB = new Entity();
    entityB.addComponent(new TransformComponent(120, 120));
    entityB.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    // 添加到世界
    world.addEntity(entityA);
    world.addEntity(entityB);
    
    // 监听碰撞事件
    const collisionEvents: CollisionEventType[] = [];
    collisionSystem.addCollisionListener((event) => {
      collisionEvents.push(event.type);
    });
    
    // 第一次更新：触发ENTER事件
    world.update(0.016);
    collisionEvents.length = 0; // 清空事件列表
    
    // 第二次更新：应该触发STAY事件
    world.update(0.016);
    expect(collisionEvents.length).toBe(1);
    expect(collisionEvents[0]).toBe(CollisionEventType.STAY);
  });
});

// 碰撞事件EXIT测试
describe('碰撞事件EXIT测试', function collisionEventExitTests() {
  test('碰撞结束事件', () => {
    // 创建两个实体
    const entityA = new Entity();
    entityA.addComponent(new TransformComponent(100, 100));
    entityA.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    const entityB = new Entity();
    entityB.addComponent(new TransformComponent(120, 120));
    entityB.addComponent(new ColliderComponent(ColliderType.RECTANGLE, 50, 50));
    
    // 添加到世界
    world.addEntity(entityA);
    world.addEntity(entityB);
    
    // 监听碰撞事件
    const collisionEvents: CollisionEventType[] = [];
    collisionSystem.addCollisionListener((event) => {
      collisionEvents.push(event.type);
    });
    
    // 第一次更新：触发ENTER事件
    world.update(0.016);
    collisionEvents.length = 0; // 清空事件列表
    
    // 移动实体B使其不再与实体A碰撞
    const transformB = entityB.getComponent('Transform') as TransformComponent;
    transformB.x = 200;
    transformB.y = 200;
    
    // 应该触发EXIT事件
    world.update(0.016);
    expect(collisionEvents.length).toBe(1);
    expect(collisionEvents[0]).toBe(CollisionEventType.EXIT);
  });
});
