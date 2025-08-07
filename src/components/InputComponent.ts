import { Component } from '../core/ecs/Component';

/**
 * 输入组件 - 用于处理玩家的输入控制
 */
export class InputComponent extends Component {
  public static readonly TYPE = 'Input';
  
  private keys: Map<string, boolean>;
  private mouseX: number;
  private mouseY: number;
  private mouseButtons: Map<number, boolean>;
  private touchActive: boolean;
  private touchX: number;
  private touchY: number;

  constructor() {
    super();
    this.keys = new Map();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseButtons = new Map();
    this.touchActive = false;
    this.touchX = 0;
    this.touchY = 0;
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return InputComponent.TYPE;
  }

  /**
   * 初始化输入监听
   */
  public init(): void {
    // 键盘事件
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // 鼠标事件
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // 触摸事件
    window.addEventListener('touchstart', this.handleTouchStart.bind(this));
    window.addEventListener('touchmove', this.handleTouchMove.bind(this));
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * 销毁输入监听
   */
  public destroy(): void {
    // 移除键盘事件
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    
    // 移除鼠标事件
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // 移除触摸事件
    window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * 处理键盘按下事件
   * @param event 键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.keys.set(event.code, true);
  }

  /**
   * 处理键盘释放事件
   * @param event 键盘事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.set(event.code, false);
  }

  /**
   * 处理鼠标移动事件
   * @param event 鼠标事件
   */
  private handleMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  /**
   * 处理鼠标按下事件
   * @param event 鼠标事件
   */
  private handleMouseDown(event: MouseEvent): void {
    this.mouseButtons.set(event.button, true);
  }

  /**
   * 处理鼠标释放事件
   * @param event 鼠标事件
   */
  private handleMouseUp(event: MouseEvent): void {
    this.mouseButtons.set(event.button, false);
  }

  /**
   * 处理触摸开始事件
   * @param event 触摸事件
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.touchActive = true;
      this.touchX = event.touches[0].clientX;
      this.touchY = event.touches[0].clientY;
    }
  }

  /**
   * 处理触摸移动事件
   * @param event 触摸事件
   */
  private handleTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.touchX = event.touches[0].clientX;
      this.touchY = event.touches[0].clientY;
    }
  }

  /**
   * 处理触摸结束事件
   * @param event 触摸事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    this.touchActive = false;
  }

  /**
   * 检查按键是否被按下
   * @param keyCode 按键代码
   */
  public isKeyDown(keyCode: string): boolean {
    return this.keys.get(keyCode) === true;
  }

  /**
   * 检查鼠标按键是否被按下
   * @param button 鼠标按键（0:左键, 1:中键, 2:右键）
   */
  public isMouseButtonDown(button: number): boolean {
    return this.mouseButtons.get(button) === true;
  }

  /**
   * 获取鼠标X坐标
   */
  public getMouseX(): number {
    return this.mouseX;
  }

  /**
   * 获取鼠标Y坐标
   */
  public getMouseY(): number {
    return this.mouseY;
  }

  /**
   * 检查触摸是否激活
   */
  public isTouchActive(): boolean {
    return this.touchActive;
  }

  /**
   * 获取触摸X坐标
   */
  public getTouchX(): number {
    return this.touchX;
  }

  /**
   * 获取触摸Y坐标
   */
  public getTouchY(): number {
    return this.touchY;
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    return new InputComponent();
  }
}