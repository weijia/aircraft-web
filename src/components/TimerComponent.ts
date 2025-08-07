import { Component } from '../core/ecs/Component';

/**
 * 计时器组件 - 用于处理实体的计时逻辑
 */
export class TimerComponent extends Component {
  public static readonly TYPE = 'Timer';
  
  private timers: Map<string, number>;
  private callbacks: Map<string, () => void>;
  private repeating: Map<string, boolean>;
  private durations: Map<string, number>;

  constructor() {
    super();
    this.timers = new Map();
    this.callbacks = new Map();
    this.repeating = new Map();
    this.durations = new Map();
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return TimerComponent.TYPE;
  }

  /**
   * 添加计时器
   * @param id 计时器ID
   * @param duration 持续时间（毫秒）
   * @param callback 回调函数
   * @param repeat 是否重复
   */
  public addTimer(id: string, duration: number, callback: () => void, repeat = false): void {
    this.timers.set(id, duration);
    this.callbacks.set(id, callback);
    this.repeating.set(id, repeat);
    this.durations.set(id, duration);
  }

  /**
   * 移除计时器
   * @param id 计时器ID
   */
  public removeTimer(id: string): void {
    this.timers.delete(id);
    this.callbacks.delete(id);
    this.repeating.delete(id);
    this.durations.delete(id);
  }

  /**
   * 重置计时器
   * @param id 计时器ID
   */
  public resetTimer(id: string): void {
    const duration = this.durations.get(id);
    if (duration !== undefined) {
      this.timers.set(id, duration);
    }
  }

  /**
   * 暂停计时器
   * @param id 计时器ID
   */
  public pauseTimer(id: string): void {
    // 将计时器设置为负值表示暂停
    const currentTime = this.timers.get(id);
    if (currentTime !== undefined && currentTime > 0) {
      this.timers.set(id, -currentTime);
    }
  }

  /**
   * 恢复计时器
   * @param id 计时器ID
   */
  public resumeTimer(id: string): void {
    // 将计时器从负值恢复为正值
    const currentTime = this.timers.get(id);
    if (currentTime !== undefined && currentTime < 0) {
      this.timers.set(id, -currentTime);
    }
  }

  /**
   * 检查计时器是否存在
   * @param id 计时器ID
   */
  public hasTimer(id: string): boolean {
    return this.timers.has(id);
  }

  /**
   * 获取计时器剩余时间
   * @param id 计时器ID
   */
  public getTimeRemaining(id: string): number {
    const time = this.timers.get(id);
    return time !== undefined ? Math.abs(time) : 0;
  }

  /**
   * 获取计时器进度（0-1）
   * @param id 计时器ID
   */
  public getProgress(id: string): number {
    const time = this.timers.get(id);
    const duration = this.durations.get(id);
    
    if (time === undefined || duration === undefined || duration === 0) {
      return 0;
    }
    
    return 1 - Math.abs(time) / duration;
  }

  /**
   * 更新所有计时器
   * @param deltaTime 时间增量（毫秒）
   */
  public update(deltaTime: number): void {
    for (const [id, time] of this.timers.entries()) {
      // 跳过暂停的计时器（负值）
      if (time <= 0) {
        continue;
      }
      
      // 减少计时器时间
      const newTime = time - deltaTime;
      
      // 检查计时器是否完成
      if (newTime <= 0) {
        // 执行回调
        const callback = this.callbacks.get(id);
        if (callback) {
          callback();
        }
        
        // 处理重复计时器
        if (this.repeating.get(id)) {
          // 重置计时器
          this.timers.set(id, this.durations.get(id) || 0);
        } else {
          // 移除计时器
          this.removeTimer(id);
        }
      } else {
        // 更新计时器时间
        this.timers.set(id, newTime);
      }
    }
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    const clone = new TimerComponent();
    
    // 复制所有计时器
    for (const [id, time] of this.timers.entries()) {
      clone.timers.set(id, time);
    }
    
    // 复制所有回调
    for (const [id, callback] of this.callbacks.entries()) {
      clone.callbacks.set(id, callback);
    }
    
    // 复制所有重复标志
    for (const [id, repeat] of this.repeating.entries()) {
      clone.repeating.set(id, repeat);
    }
    
    // 复制所有持续时间
    for (const [id, duration] of this.durations.entries()) {
      clone.durations.set(id, duration);
    }
    
    return clone;
  }
}