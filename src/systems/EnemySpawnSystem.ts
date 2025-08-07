import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { TimerComponent } from '../components/TimerComponent';

/**
 * 敌人生成系统 - 负责在游戏中生成敌人
 */
export class EnemySpawnSystem extends System {
  private enemyFactory: (type: string, x: number, y: number) => Entity;
  private spawnInterval: number;
  private timeSinceLastSpawn: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private enemyTypes: string[];
  private difficultyMultiplier: number;
  private maxEnemies: number;

  /**
   * 构造函数
   * @param enemyFactory 敌人工厂函数
   * @param canvasWidth 画布宽度
   * @param canvasHeight 画布高度
   * @param spawnInterval 生成间隔（毫秒）
   * @param enemyTypes 敌人类型列表
   * @param maxEnemies 最大敌人数量
   */
  constructor(
    enemyFactory: (type: string, x: number, y: number) => Entity,
    canvasWidth: number,
    canvasHeight: number,
    spawnInterval = 2000,
    enemyTypes: string[] = ['basic'],
    maxEnemies = 10
  ) {
    super(50); // 敌人生成系统优先级较低
    
    this.enemyFactory = enemyFactory;
    this.spawnInterval = spawnInterval;
    this.timeSinceLastSpawn = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.enemyTypes = enemyTypes;
    this.difficultyMultiplier = 1.0;
    this.maxEnemies = maxEnemies;
  }

  /**
   * 过滤实体
   * 敌人生成系统不处理任何实体
   * @param entity 实体
   */
  public filter(entity: Entity): boolean {
    return false;
  }

  /**
   * 更新系统
   * @param deltaTime 时间增量（秒）
   */
  public update(deltaTime: number): void {
    if (!this.world) return;
    
    // 增加计时器
    this.timeSinceLastSpawn += deltaTime * 1000; // 转换为毫秒
    
    // 检查是否应该生成敌人
    if (this.timeSinceLastSpawn >= this.spawnInterval / this.difficultyMultiplier) {
      // 检查当前敌人数量
      const enemies = this.world.getEntitiesByTag('enemy');
      
      if (enemies.length < this.maxEnemies) {
        this.spawnEnemy();
      }
      
      // 重置计时器
      this.timeSinceLastSpawn = 0;
    }
  }

  /**
   * 生成敌人
   */
  private spawnEnemy(): void {
    if (!this.world) return;
    
    // 随机选择敌人类型
    const typeIndex = Math.floor(Math.random() * this.enemyTypes.length);
    const enemyType = this.enemyTypes[typeIndex];
    
    // 随机生成位置（在画布顶部之外）
    const x = Math.random() * this.canvasWidth;
    const y = -50; // 在画布顶部之外
    
    // 创建敌人实体
    const enemy = this.enemyFactory(enemyType, x, y);
    
    // 将敌人添加到世界
    this.world.addEntity(enemy);
  }

  /**
   * 设置生成间隔
   * @param interval 间隔（毫秒）
   */
  public setSpawnInterval(interval: number): void {
    this.spawnInterval = interval;
  }

  /**
   * 设置难度乘数
   * 难度越高，生成间隔越短
   * @param multiplier 难度乘数
   */
  public setDifficultyMultiplier(multiplier: number): void {
    this.difficultyMultiplier = Math.max(0.1, multiplier);
  }

  /**
   * 设置敌人类型列表
   * @param types 敌人类型列表
   */
  public setEnemyTypes(types: string[]): void {
    if (types.length > 0) {
      this.enemyTypes = [...types];
    }
  }

  /**
   * 设置最大敌人数量
   * @param max 最大数量
   */
  public setMaxEnemies(max: number): void {
    this.maxEnemies = max;
  }

  /**
   * 设置画布尺寸
   * @param width 宽度
   * @param height 高度
   */
  public setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}