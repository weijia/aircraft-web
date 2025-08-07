import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { InputComponent } from '../components/InputComponent';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';

/**
 * 输入系统 - 负责处理玩家的输入并更新相应实体
 */
export class InputSystem extends System {
  private playerSpeed: number;
  private canvas: HTMLCanvasElement;

  /**
   * 构造函数
   * @param canvas 游戏画布
   * @param playerSpeed 玩家移动速度
   */
  constructor(canvas: HTMLCanvasElement, playerSpeed = 200) {
    super(5); // 输入系统优先级最高，在所有系统之前执行
    
    this.playerSpeed = playerSpeed;
    this.canvas = canvas;
  }

  /**
   * 过滤实体
   * 只处理具有输入组件的实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return entity.hasComponent(InputComponent.TYPE);
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
    const inputEntities = entities.filter((entity: Entity) => 
      this.filter(entity) && entity.isActive()
    );
    
    // 处理每个实体的输入
    for (const entity of inputEntities) {
      this.handleEntityInput(entity, deltaTime);
    }
  }

  /**
   * 处理实体的输入
   * @param entity 实体
   * @param deltaTime 时间增量（秒）
   */
  private handleEntityInput(entity: Entity, deltaTime: number): void {
    const input = entity.getComponent(InputComponent.TYPE) as InputComponent;
    
    if (!input) {
      return;
    }
    
    // 处理移动输入
    this.handleMovementInput(entity, input, deltaTime);
    
    // 处理其他输入（如武器发射）在武器系统中处理
  }

  /**
   * 处理移动输入
   * @param entity 实体
   * @param input 输入组件
   * @param deltaTime 时间增量（秒）
   */
  private handleMovementInput(entity: Entity, input: InputComponent, deltaTime: number): void {
    const velocity = entity.getComponent(VelocityComponent.TYPE) as VelocityComponent;
    
    if (!velocity) {
      return;
    }
    
    // 初始化移动方向
    let dx = 0;
    let dy = 0;
    
    // 键盘控制
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) {
      dy -= 1;
    }
    
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) {
      dy += 1;
    }
    
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) {
      dx -= 1;
    }
    
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) {
      dx += 1;
    }
    
    // 触摸控制
    if (input.isTouchActive()) {
      const touchX = input.getTouchX();
      const touchY = input.getTouchY();
      
      // 获取画布位置
      const rect = this.canvas.getBoundingClientRect();
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;
      
      // 计算触摸点相对于画布中心的方向
      const touchDx = touchX - canvasCenterX;
      const touchDy = touchY - canvasCenterY;
      
      // 如果触摸点距离中心足够远，则移动
      const touchDistance = Math.sqrt(touchDx * touchDx + touchDy * touchDy);
      if (touchDistance > 20) { // 设置一个阈值，避免轻微触摸导致移动
        dx = touchDx / touchDistance;
        dy = touchDy / touchDistance;
      }
    }
    
    // 归一化方向向量
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }
    
    // 设置速度
    velocity.setVelocity(dx * this.playerSpeed, dy * this.playerSpeed);
    
    // 如果有变换组件，更新旋转
    const transform = entity.getComponent(TransformComponent.TYPE) as TransformComponent;
    if (transform && (dx !== 0 || dy !== 0)) {
      // 计算朝向角度（假设0度是向上）
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      transform.rotation = angle;
    }
  }

  /**
   * 设置玩家移动速度
   * @param speed 速度
   */
  public setPlayerSpeed(speed: number): void {
    this.playerSpeed = speed;
  }
}