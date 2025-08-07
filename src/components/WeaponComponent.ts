import { Component } from '../core/ecs/Component';

/**
 * 武器组件 - 用于处理实体的武器系统
 */
export class WeaponComponent extends Component {
  public static readonly TYPE = 'Weapon';
  
  private weaponType: string;
  private damage: number;
  private cooldown: number;
  private currentCooldown: number;
  private projectileSpeed: number;
  private projectileLifetime: number;
  private spread: number;
  private projectileCount: number;
  private texture: string;
  private soundEffect: string | null;
  private specialProperties: Record<string, unknown>;

  /**
   * 构造函数
   * @param weaponType 武器类型
   * @param damage 伤害值
   * @param cooldown 冷却时间（毫秒）
   * @param projectileSpeed 子弹速度
   * @param projectileLifetime 子弹生命周期（毫秒）
   * @param spread 散射角度（弧度）
   * @param projectileCount 每次发射的子弹数量
   * @param texture 子弹纹理
   * @param soundEffect 发射音效
   * @param specialProperties 特殊属性
   */
  constructor(
    weaponType = 'default',
    damage = 10,
    cooldown = 500,
    projectileSpeed = 300,
    projectileLifetime = 2000,
    spread = 0,
    projectileCount = 1,
    texture = '',
    soundEffect: string | null = null,
    specialProperties: Record<string, unknown> = {}
  ) {
    super();
    this.weaponType = weaponType;
    this.damage = damage;
    this.cooldown = cooldown;
    this.currentCooldown = 0;
    this.projectileSpeed = projectileSpeed;
    this.projectileLifetime = projectileLifetime;
    this.spread = spread;
    this.projectileCount = projectileCount;
    this.texture = texture;
    this.soundEffect = soundEffect;
    this.specialProperties = { ...specialProperties };
  }

  /**
   * 获取组件类型
   */
  public getType(): string {
    return WeaponComponent.TYPE;
  }

  /**
   * 获取武器类型
   */
  public getWeaponType(): string {
    return this.weaponType;
  }

  /**
   * 设置武器类型
   * @param weaponType 武器类型
   */
  public setWeaponType(weaponType: string): void {
    this.weaponType = weaponType;
  }

  /**
   * 获取伤害值
   */
  public getDamage(): number {
    return this.damage;
  }

  /**
   * 设置伤害值
   * @param damage 伤害值
   */
  public setDamage(damage: number): void {
    this.damage = damage;
  }

  /**
   * 获取冷却时间
   */
  public getCooldown(): number {
    return this.cooldown;
  }

  /**
   * 设置冷却时间
   * @param cooldown 冷却时间（毫秒）
   */
  public setCooldown(cooldown: number): void {
    this.cooldown = cooldown;
  }

  /**
   * 获取当前冷却时间
   */
  public getCurrentCooldown(): number {
    return this.currentCooldown;
  }

  /**
   * 设置当前冷却时间
   * @param currentCooldown 当前冷却时间
   */
  public setCurrentCooldown(currentCooldown: number): void {
    this.currentCooldown = currentCooldown;
  }

  /**
   * 减少冷却时间
   * @param deltaTime 时间增量（毫秒）
   */
  public reduceCooldown(deltaTime: number): void {
    this.currentCooldown = Math.max(0, this.currentCooldown - deltaTime);
  }

  /**
   * 重置冷却时间
   */
  public resetCooldown(): void {
    this.currentCooldown = this.cooldown;
  }

  /**
   * 检查是否可以发射
   */
  public canFire(): boolean {
    return this.currentCooldown <= 0;
  }

  /**
   * 获取子弹速度
   */
  public getProjectileSpeed(): number {
    return this.projectileSpeed;
  }

  /**
   * 设置子弹速度
   * @param speed 速度
   */
  public setProjectileSpeed(speed: number): void {
    this.projectileSpeed = speed;
  }

  /**
   * 获取子弹生命周期
   */
  public getProjectileLifetime(): number {
    return this.projectileLifetime;
  }

  /**
   * 设置子弹生命周期
   * @param lifetime 生命周期（毫秒）
   */
  public setProjectileLifetime(lifetime: number): void {
    this.projectileLifetime = lifetime;
  }

  /**
   * 获取散射角度
   */
  public getSpread(): number {
    return this.spread;
  }

  /**
   * 设置散射角度
   * @param spread 散射角度（弧度）
   */
  public setSpread(spread: number): void {
    this.spread = spread;
  }

  /**
   * 获取子弹数量
   */
  public getProjectileCount(): number {
    return this.projectileCount;
  }

  /**
   * 设置子弹数量
   * @param count 数量
   */
  public setProjectileCount(count: number): void {
    this.projectileCount = count;
  }

  /**
   * 获取子弹纹理
   */
  public getTexture(): string {
    return this.texture;
  }

  /**
   * 设置子弹纹理
   * @param texture 纹理路径
   */
  public setTexture(texture: string): void {
    this.texture = texture;
  }

  /**
   * 获取发射音效
   */
  public getSoundEffect(): string | null {
    return this.soundEffect;
  }

  /**
   * 设置发射音效
   * @param soundEffect 音效路径
   */
  public setSoundEffect(soundEffect: string | null): void {
    this.soundEffect = soundEffect;
  }

  /**
   * 获取特殊属性
   * @param key 属性键
   * @param defaultValue 默认值
   */
  public getSpecialProperty<T>(key: string, defaultValue: T): T {
    return (this.specialProperties[key] as T) ?? defaultValue;
  }

  /**
   * 设置特殊属性
   * @param key 属性键
   * @param value 属性值
   */
  public setSpecialProperty<T>(key: string, value: T): void {
    this.specialProperties[key] = value;
  }

  /**
   * 克隆组件
   */
  public clone(): Component {
    return new WeaponComponent(
      this.weaponType,
      this.damage,
      this.cooldown,
      this.projectileSpeed,
      this.projectileLifetime,
      this.spread,
      this.projectileCount,
      this.texture,
      this.soundEffect,
      { ...this.specialProperties }
    );
  }
}