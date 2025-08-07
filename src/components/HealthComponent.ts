import { Component } from '../core/ecs/Component';

/**
 * 健康组件 - 用于处理实体的生命值和伤害
 */
export class HealthComponent extends Component {
  public static readonly TYPE = 'Health';
  
  private maxHealth: number;
  private currentHealth: number;
  private invincible: boolean;
  private invincibilityTime: number;
  private currentInvincibilityTime: number;

  /**
   * 构造函数
   * @param maxHealth 最大生命值
   * @param invincibilityTime 受伤后的无敌时间（毫秒）
   */
  constructor(maxHealth = 100, invincibilityTime = 1000) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.invincible = false;
    this.invincibilityTime = invincibilityTime;
    this.currentInvincibilityTime = 0;
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return HealthComponent.TYPE;
  }

  /**
   * 获取最大生命值
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * 设置最大生命值
   * @param maxHealth 最大生命值
   */
  public setMaxHealth(maxHealth: number): void {
    this.maxHealth = maxHealth;
    // 确保当前生命值不超过最大生命值
    this.currentHealth = Math.min(this.currentHealth, this.maxHealth);
  }

  /**
   * 获取当前生命值
   */
  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  /**
   * 设置当前生命值
   * @param health 当前生命值
   */
  public setCurrentHealth(health: number): void {
    this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
  }

  /**
   * 增加生命值
   * @param amount 增加量
   * @returns 实际增加的生命值
   */
  public heal(amount: number): number {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
    return this.currentHealth - oldHealth;
  }

  /**
   * 减少生命值
   * @param amount 减少量
   * @returns 实际减少的生命值，如果处于无敌状态则返回0
   */
  public damage(amount: number): number {
    if (this.invincible) {
      return 0;
    }

    const oldHealth = this.currentHealth;
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    
    // 如果设置了无敌时间，则进入无敌状态
    if (this.invincibilityTime > 0 && oldHealth > this.currentHealth) {
      this.invincible = true;
      this.currentInvincibilityTime = this.invincibilityTime;
    }
    
    return oldHealth - this.currentHealth;
  }

  /**
   * 检查是否存活
   */
  public isAlive(): boolean {
    return this.currentHealth > 0;
  }

  /**
   * 获取生命值百分比
   */
  public getHealthPercentage(): number {
    return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
  }

  /**
   * 设置无敌状态
   * @param invincible 是否无敌
   */
  public setInvincible(invincible: boolean): void {
    this.invincible = invincible;
    if (!invincible) {
      this.currentInvincibilityTime = 0;
    }
  }

  /**
   * 检查是否处于无敌状态
   */
  public isInvincible(): boolean {
    return this.invincible;
  }

  /**
   * 更新无敌状态
   * @param deltaTime 时间增量（毫秒）
   */
  public updateInvincibility(deltaTime: number): void {
    if (this.invincible && this.currentInvincibilityTime > 0) {
      this.currentInvincibilityTime -= deltaTime;
      if (this.currentInvincibilityTime <= 0) {
        this.invincible = false;
      }
    }
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    const clone = new HealthComponent(this.maxHealth, this.invincibilityTime);
    clone.setCurrentHealth(this.currentHealth);
    clone.setInvincible(this.invincible);
    return clone;
  }
}