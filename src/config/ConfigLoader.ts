import { z } from 'zod';

/**
 * 配置加载器 - 负责解析和加载JSON配置文件
 */
export class ConfigLoader {
  private weaponConfigs: Record<string, any>;
  private enemyConfigs: Record<string, any>;
  private itemConfigs: Record<string, any>;
  private configChangeListeners: Array<(configType: string) => void>;

  constructor() {
    this.weaponConfigs = {};
    this.enemyConfigs = {};
    this.itemConfigs = {};
    this.configChangeListeners = [];
  }

  /**
   * 添加配置变更监听器
   * @param listener 监听器函数
   */
  public addConfigChangeListener(listener: (configType: string) => void): void {
    this.configChangeListeners.push(listener);
  }

  /**
   * 移除配置变更监听器
   * @param listener 监听器函数
   */
  public removeConfigChangeListener(listener: (configType: string) => void): void {
    const index = this.configChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.configChangeListeners.splice(index, 1);
    }
  }

  /**
   * 通知配置变更
   * @param configType 配置类型
   */
  private notifyConfigChange(configType: string): void {
    for (const listener of this.configChangeListeners) {
      listener(configType);
    }
  }

  /**
   * 加载武器配置
   * @param jsonContent JSON内容
   * @returns 是否成功加载
   */
  public loadWeaponConfig(jsonContent: string): boolean {
    try {
      // 定义武器配置的Zod模式
      const weaponSchema = z.record(z.object({
        type: z.string(),
        damage: z.number().positive(),
        cooldown: z.number().positive(),
        projectileSpeed: z.number().positive().optional(),
        projectileLifetime: z.number().positive().optional(),
        spread: z.number().min(0).optional(),
        projectileCount: z.number().int().positive().optional(),
        texture: z.string().optional(),
        soundEffect: z.string().optional().nullable(),
        specialProperties: z.record(z.unknown()).optional()
      }));

      // 解析JSON
      const config = JSON.parse(jsonContent);
      
      // 验证配置
      const validatedConfig = weaponSchema.parse(config);
      
      // 更新配置
      this.weaponConfigs = { ...this.weaponConfigs, ...validatedConfig };
      
      // 通知配置变更
      this.notifyConfigChange('weapon');
      
      return true;
    } catch (error) {
      console.error('武器配置加载失败:', error);
      return false;
    }
  }

  /**
   * 加载敌人配置
   * @param jsonContent JSON内容
   * @returns 是否成功加载
   */
  public loadEnemyConfig(jsonContent: string): boolean {
    try {
      // 定义敌人配置的Zod模式
      const enemySchema = z.record(z.object({
        health: z.number().positive(),
        speed: z.number().positive(),
        score: z.number().int().nonnegative(),
        texture: z.string().optional(),
        weapons: z.array(z.string()).optional(),
        movementPattern: z.string().optional(),
        spawnRate: z.number().positive().optional(),
        specialProperties: z.record(z.unknown()).optional()
      }));

      // 解析JSON
      const config = JSON.parse(jsonContent);
      
      // 验证配置
      const validatedConfig = enemySchema.parse(config);
      
      // 更新配置
      this.enemyConfigs = { ...this.enemyConfigs, ...validatedConfig };
      
      // 通知配置变更
      this.notifyConfigChange('enemy');
      
      return true;
    } catch (error) {
      console.error('敌人配置加载失败:', error);
      return false;
    }
  }

  /**
   * 加载道具配置
   * @param jsonContent JSON内容
   * @returns 是否成功加载
   */
  public loadItemConfig(jsonContent: string): boolean {
    try {
      // 定义道具配置的Zod模式
      const itemSchema = z.record(z.object({
        type: z.string(),
        duration: z.number().positive().optional(),
        effect: z.string(),
        value: z.union([z.number(), z.string()]).optional(),
        texture: z.string().optional(),
        soundEffect: z.string().optional().nullable(),
        specialProperties: z.record(z.unknown()).optional()
      }));

      // 解析JSON
      const config = JSON.parse(jsonContent);
      
      // 验证配置
      const validatedConfig = itemSchema.parse(config);
      
      // 更新配置
      this.itemConfigs = { ...this.itemConfigs, ...validatedConfig };
      
      // 通知配置变更
      this.notifyConfigChange('item');
      
      return true;
    } catch (error) {
      console.error('道具配置加载失败:', error);
      return false;
    }
  }

  /**
   * 获取武器配置
   * @param weaponId 武器ID
   * @returns 武器配置
   */
  public getWeaponConfig(weaponId: string): any {
    return this.weaponConfigs[weaponId];
  }

  /**
   * 获取所有武器配置
   * @returns 所有武器配置
   */
  public getAllWeaponConfigs(): Record<string, any> {
    return { ...this.weaponConfigs };
  }

  /**
   * 获取敌人配置
   * @param enemyId 敌人ID
   * @returns 敌人配置
   */
  public getEnemyConfig(enemyId: string): any {
    return this.enemyConfigs[enemyId];
  }

  /**
   * 获取所有敌人配置
   * @returns 所有敌人配置
   */
  public getAllEnemyConfigs(): Record<string, any> {
    return { ...this.enemyConfigs };
  }

  /**
   * 获取道具配置
   * @param itemId 道具ID
   * @returns 道具配置
   */
  public getItemConfig(itemId: string): any {
    return this.itemConfigs[itemId];
  }

  /**
   * 获取所有道具配置
   * @returns 所有道具配置
   */
  public getAllItemConfigs(): Record<string, any> {
    return { ...this.itemConfigs };
  }
}