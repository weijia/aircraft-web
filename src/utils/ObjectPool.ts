/**
 * 对象池 - 用于重用对象，减少垃圾回收
 * @template T 对象类型
 */
export class ObjectPool<T> {
  private pool: T[];
  private factory: () => T;
  private reset: (obj: T) => void;
  private activate: (obj: T) => void;
  private maxSize: number;

  /**
   * 构造函数
   * @param factory 创建对象的工厂函数
   * @param reset 重置对象的函数
   * @param activate 激活对象的函数
   * @param maxSize 对象池最大容量
   */
  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    activate: (obj: T) => void,
    maxSize = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.activate = activate;
    this.maxSize = maxSize;
    this.pool = [];
  }

  /**
   * 从对象池获取对象
   * 如果池中有可用对象，则返回一个已存在的对象
   * 否则创建一个新对象
   */
  public get(): T | null {
    // 如果池中有对象，返回最后一个
    if (this.pool.length > 0) {
      const obj = this.pool.pop() as T;
      this.activate(obj);
      return obj;
    }
    
    // 否则创建新对象
    const obj = this.factory();
    this.activate(obj);
    return obj;
  }

  /**
   * 将对象放回对象池
   * @param obj 要放回的对象
   */
  public release(obj: T): void {
    // 如果池已满，不再添加
    if (this.pool.length >= this.maxSize) {
      return;
    }
    
    // 重置对象
    this.reset(obj);
    
    // 将对象添加到池中
    this.pool.push(obj);
  }

  /**
   * 清空对象池
   */
  public clear(): void {
    this.pool = [];
  }

  /**
   * 预填充对象池
   * @param count 要预填充的对象数量
   */
  public preFill(count: number): void {
    const fillCount = Math.min(count, this.maxSize - this.pool.length);
    
    for (let i = 0; i < fillCount; i++) {
      const obj = this.factory();
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  /**
   * 获取对象池当前大小
   */
  public size(): number {
    return this.pool.length;
  }

  /**
   * 获取对象池最大容量
   */
  public getMaxSize(): number {
    return this.maxSize;
  }

  /**
   * 设置对象池最大容量
   * @param maxSize 最大容量
   */
  public setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
    
    // 如果当前池大小超过新的最大容量，移除多余的对象
    while (this.pool.length > this.maxSize) {
      this.pool.pop();
    }
  }
}