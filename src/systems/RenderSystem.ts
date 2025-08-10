import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { RenderComponent } from '../components/RenderComponent';

/**
 * 渲染系统 - 负责渲染所有具有渲染组件的实体
 */
export class RenderSystem extends System {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private backgroundColor: string;

  /**
   * 构造函数
   * @param canvas 画布元素
   * @param backgroundColor 背景颜色
   */
  constructor(canvas: HTMLCanvasElement, backgroundColor = '#000000') {
    super(100); // 渲染系统优先级较低，在大多数系统之后执行
    
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取Canvas 2D上下文');
    }
    this.context = ctx;
    
    this.width = canvas.width;
    this.height = canvas.height;
    this.backgroundColor = backgroundColor;
    
    // 设置画布尺寸
    this.resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  /**
   * 调整画布尺寸
   */
  private resizeCanvas(): void {
    try {
      // 获取画布容器的尺寸
      const container = this.canvas.parentElement;
      if (container) {
        // 设置画布尺寸与容器相同
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // 更新宽高
        this.width = this.canvas.width;
        this.height = this.canvas.height;
      } else {
        // 如果没有父元素，使用默认尺寸
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // 更新宽高
        this.width = this.canvas.width;
        this.height = this.canvas.height;
      }
    } catch (error) {
      console.error('调整画布尺寸时出错:', error);
      
      // 使用默认尺寸
      this.canvas.width = 800;
      this.canvas.height = 600;
      
      // 更新宽高
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }
  }

  /**
   * 过滤实体
   * 只处理同时具有变换组件和渲染组件的实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return entity.hasComponent(TransformComponent.TYPE) && 
           entity.hasComponent(RenderComponent.TYPE);
  }

  /**
   * 更新系统
   * @param deltaTime 时间增量（秒）
   */
  public update(deltaTime: number): void {
    if (!this.world) {
      console.error('渲染系统：世界对象不存在');
      return;
    }
    
    // 保存当前画布内容
    this.context.save();
    
    // 清空画布，但保留一个半透明层，这样可以看到之前手动绘制的内容
    this.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.context.fillRect(0, 0, this.width, this.height);
    
    // 获取所有实体
    const entities = this.world.getEntities();
    console.log(`渲染系统：世界中有 ${entities.length} 个实体`);
    
    // 过滤并排序实体（可以根据z-index或其他属性排序）
    const renderableEntities = entities
      .filter((entity: Entity) => {
        const canRender = this.filter(entity) && entity.isActive();
        if (!canRender && entity.hasTag('player')) {
          console.log('玩家实体不可渲染:', 
            '有Transform组件:', entity.hasComponent(TransformComponent.TYPE),
            '有Render组件:', entity.hasComponent(RenderComponent.TYPE),
            '是否激活:', entity.isActive()
          );
        }
        return canRender;
      })
      .sort((a: Entity, b: Entity) => {
        // 这里可以添加排序逻辑，例如按照y坐标排序以实现深度效果
        const transformA = a.getComponent(TransformComponent.TYPE) as TransformComponent;
        const transformB = b.getComponent(TransformComponent.TYPE) as TransformComponent;
        
        if (transformA && transformB) {
          return transformA.y - transformB.y;
        }
        
        return 0;
      });
    
    console.log(`渲染系统：可渲染的实体数量 ${renderableEntities.length}`);
    
    // 渲染实体
    for (const entity of renderableEntities) {
      this.renderEntity(entity);
    }
    
    // 恢复画布状态
    this.context.restore();
    
    // 添加一个调试信息到画布上
    this.context.fillStyle = '#FFFFFF';
    this.context.font = '14px Arial';
    this.context.fillText(`实体数量: ${entities.length}`, 10, 20);
    this.context.fillText(`可渲染实体: ${renderableEntities.length}`, 10, 40);
    this.context.fillText(`画布尺寸: ${this.width}x${this.height}`, 10, 60);
  }

  /**
   * 渲染单个实体
   * @param entity 实体
   */
  private renderEntity(entity: Entity): void {
    const transform = entity.getComponent<TransformComponent>(TransformComponent.TYPE);
    const render = entity.getComponent<RenderComponent>(RenderComponent.TYPE);
    
    if (!transform || !render || !render.isVisible()) {
      return;
    }
    
    // 保存当前上下文状态
    this.context.save();
    
    // 设置透明度
    this.context.globalAlpha = render.getAlpha();
    
    // 应用变换
    this.context.translate(transform.x, transform.y);
    this.context.rotate(transform.rotation);
    this.context.scale(transform.scaleX, transform.scaleY);
    
    // 获取渲染尺寸
    const width = render.getWidth();
    const height = render.getHeight();
    
    // 使用离屏Canvas进行渲染（如果可用）
    const offscreenCanvas = render.getOffscreenCanvas();
    if (offscreenCanvas) {
      this.context.drawImage(offscreenCanvas, -width / 2, -height / 2, width, height);
    } else {
      // 如果有图像，渲染图像
      const image = render.getImage();
      if (image && image.complete) {
        this.context.drawImage(image, -width / 2, -height / 2, width, height);
      } else {
        // 否则渲染矩形
        this.context.fillStyle = render.getColor();
        this.context.fillRect(-width / 2, -height / 2, width, height);
      }
    }
    
    // 恢复上下文状态
    this.context.restore();
  }

  /**
   * 销毁系统
   */
  public destroy(): void {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }
}