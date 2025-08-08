import { World } from './ecs/World';
import { RenderSystem } from '../systems/RenderSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { CollisionSystem, CollisionEvent, CollisionEventType } from '../systems/CollisionSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { InputSystem } from '../systems/InputSystem';
import { HealthSystem } from '../systems/HealthSystem';
import { TimerSystem } from '../systems/TimerSystem';
import { EnemySpawnSystem } from '../systems/EnemySpawnSystem';
import { ConfigLoader } from '../config/ConfigLoader';
import { EntityFactory } from '../factories/EntityFactory';
import { Entity } from './ecs/Entity';
import { HealthComponent } from '../components/HealthComponent';
import { WeaponComponent } from '../components/WeaponComponent';
import { TransformComponent } from '../components/TransformComponent';

/**
 * 游戏类 - 管理游戏的整体逻辑
 */
export class Game {
  private canvas: HTMLCanvasElement;
  private world: World;
  private configLoader: ConfigLoader;
  private entityFactory: EntityFactory;
  private lastFrameTime: number;
  public isRunning: boolean;
  private score: number;
  private lives: number;
  private player: Entity | null;
  private scoreElement: HTMLElement | null;
  private livesElement: HTMLElement | null;
  private systems: {
    render: RenderSystem;
    movement: MovementSystem;
    collision: CollisionSystem;
    weapon: WeaponSystem;
    input: InputSystem;
    health: HealthSystem;
    timer: TimerSystem;
    enemySpawn: EnemySpawnSystem;
  };

  /**
   * 构造函数
   * @param canvas 游戏画布
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.world = new World();
    this.configLoader = new ConfigLoader();
    this.entityFactory = new EntityFactory(this.configLoader);
    this.lastFrameTime = 0;
    this.isRunning = false;
    this.score = 0;
    this.lives = 3;
    this.player = null;
    
    // 获取UI元素
    this.scoreElement = document.getElementById('score');
    this.livesElement = document.getElementById('lives');
    
    // 创建系统
    this.systems = {
      render: new RenderSystem(canvas),
      movement: new MovementSystem(canvas.width, canvas.height, 'bounce'),
      collision: new CollisionSystem(true),
      weapon: new WeaponSystem(
        (weaponType, x, y, angle) => this.entityFactory.createProjectile(weaponType, x, y, angle, true)
      ),
      input: new InputSystem(canvas),
      health: new HealthSystem(),
      timer: new TimerSystem(),
      enemySpawn: new EnemySpawnSystem(
        (type, x, y) => this.entityFactory.createEnemy(type, x, y),
        canvas.width,
        canvas.height
      )
    };
    
    // 初始化系统
    this.initSystems();
    
    // 设置配置加载器监听器
    this.configLoader.addConfigChangeListener(this.handleConfigChange.bind(this));
    
    // 设置默认配置
    this.loadDefaultConfigs();
  }

  /**
   * 初始化系统
   */
  private initSystems(): void {
    // 添加系统到世界
    this.world.addSystem(this.systems.timer);
    this.world.addSystem(this.systems.input);
    this.world.addSystem(this.systems.movement);
    this.world.addSystem(this.systems.weapon);
    this.world.addSystem(this.systems.collision);
    this.world.addSystem(this.systems.health);
    this.world.addSystem(this.systems.enemySpawn);
    this.world.addSystem(this.systems.render);
    
    // 设置碰撞监听器
    this.systems.collision.addCollisionListener(this.handleCollision.bind(this));
    
    // 设置健康系统监听器
    this.systems.health.addEntityDeathListener(this.handleEntityDeath.bind(this));
  }

  /**
   * 加载默认配置
   */
  private loadDefaultConfigs(): void {
    // 默认武器配置
    const defaultWeaponConfig = {
      "default": {
        "type": "projectile",
        "damage": 10,
        "cooldown": 300,
        "projectileSpeed": 500,
        "projectileLifetime": 2000,
        "texture": "assets/bullet.png"
      },
      "laser": {
        "type": "projectile",
        "damage": 15,
        "cooldown": 200,
        "projectileSpeed": 600,
        "projectileLifetime": 1500,
        "texture": "assets/laser.png"
      },
      "missile": {
        "type": "homing",
        "damage": 30,
        "cooldown": 1000,
        "projectileSpeed": 300,
        "projectileLifetime": 3000,
        "blastRadius": 50,
        "texture": "assets/missile.png"
      },
      "shotgun": {
        "type": "projectile",
        "damage": 8,
        "cooldown": 600,
        "projectileSpeed": 450,
        "projectileLifetime": 1000,
        "spread": 0.5,
        "projectileCount": 5,
        "texture": "assets/bullet.png"
      }
    };
    
    // 默认敌人配置
    const defaultEnemyConfig = {
      "basic": {
        "health": 30,
        "speed": 100,
        "score": 100,
        "texture": "assets/enemy_basic.png",
        "weapons": ["default"],
        "movementPattern": "linear"
      },
      "fast": {
        "health": 15,
        "speed": 200,
        "score": 150,
        "texture": "assets/enemy_fast.png",
        "weapons": ["default"],
        "movementPattern": "zigzag"
      },
      "tank": {
        "health": 100,
        "speed": 50,
        "score": 300,
        "texture": "assets/enemy_tank.png",
        "weapons": ["missile"],
        "movementPattern": "linear"
      },
      "boss": {
        "health": 500,
        "speed": 30,
        "score": 1000,
        "texture": "assets/enemy_boss.png",
        "weapons": ["shotgun", "missile"],
        "movementPattern": "circular"
      }
    };
    
    // 默认道具配置
    const defaultItemConfig = {
      "health": {
        "type": "powerup",
        "effect": "health",
        "value": 20,
        "texture": "assets/item_health.png"
      },
      "shield": {
        "type": "powerup",
        "effect": "shield",
        "duration": 5000,
        "texture": "assets/item_shield.png"
      },
      "laser": {
        "type": "weapon",
        "effect": "weapon",
        "value": "laser",
        "texture": "assets/item_laser.png"
      },
      "missile": {
        "type": "weapon",
        "effect": "weapon",
        "value": "missile",
        "texture": "assets/item_missile.png"
      },
      "shotgun": {
        "type": "weapon",
        "effect": "weapon",
        "value": "shotgun",
        "texture": "assets/item_shotgun.png"
      }
    };
    
    // 加载默认配置
    this.configLoader.loadWeaponConfig(JSON.stringify(defaultWeaponConfig));
    this.configLoader.loadEnemyConfig(JSON.stringify(defaultEnemyConfig));
    this.configLoader.loadItemConfig(JSON.stringify(defaultItemConfig));
  }

  /**
   * 处理配置变更
   * @param configType 配置类型
   */
  private handleConfigChange(configType: string): void {
    console.log(`配置已更新: ${configType}`);
    
    // 根据配置类型更新游戏
    if (configType === 'enemy') {
      // 更新敌人生成系统
      const enemyTypes = Object.keys(this.configLoader.getAllEnemyConfigs());
      if (enemyTypes.length > 0) {
        this.systems.enemySpawn.setEnemyTypes(enemyTypes);
      }
    }
  }

  /**
   * 处理碰撞事件
   * @param event 碰撞事件
   */
  private handleCollision(event: CollisionEvent): void {
    if (event.type !== CollisionEventType.ENTER) {
      return;
    }
    
    const entityA = event.entityA;
    const entityB = event.entityB;
    
    // 玩家子弹与敌人碰撞
    if (entityA.hasTag('playerProjectile') && entityB.hasTag('enemy')) {
      this.handleProjectileEnemyCollision(entityA, entityB);
    } else if (entityA.hasTag('enemy') && entityB.hasTag('playerProjectile')) {
      this.handleProjectileEnemyCollision(entityB, entityA);
    }
    
    // 敌人子弹与玩家碰撞
    if (entityA.hasTag('enemyProjectile') && entityB.hasTag('player')) {
      this.handleProjectilePlayerCollision(entityA, entityB);
    } else if (entityA.hasTag('player') && entityB.hasTag('enemyProjectile')) {
      this.handleProjectilePlayerCollision(entityB, entityA);
    }
    
    // 敌人与玩家碰撞
    if (entityA.hasTag('enemy') && entityB.hasTag('player')) {
      this.handleEnemyPlayerCollision(entityA, entityB);
    } else if (entityA.hasTag('player') && entityB.hasTag('enemy')) {
      this.handleEnemyPlayerCollision(entityB, entityA);
    }
    
    // 道具与玩家碰撞
    if (entityA.hasTag('item') && entityB.hasTag('player')) {
      this.handleItemPlayerCollision(entityA, entityB);
    } else if (entityA.hasTag('player') && entityB.hasTag('item')) {
      this.handleItemPlayerCollision(entityB, entityA);
    }
  }

  /**
   * 处理子弹与敌人碰撞
   * @param projectile 子弹实体
   * @param enemy 敌人实体
   */
  private handleProjectileEnemyCollision(projectile: Entity, enemy: Entity): void {
    // 获取子弹伤害
    const damageTags = projectile.getTags().filter(tag => tag.startsWith('damage:'));
    if (damageTags.length > 0) {
      const damageStr = damageTags[0].split(':')[1];
      const damage = parseInt(damageStr, 10);
      
      // 对敌人造成伤害
      this.systems.health.damageEntity(enemy, damage);
      
      // 回收子弹
      this.world.removeEntity(projectile.getId());
    }
  }

  /**
   * 处理子弹与玩家碰撞
   * @param projectile 子弹实体
   * @param player 玩家实体
   */
  private handleProjectilePlayerCollision(projectile: Entity, player: Entity): void {
    // 获取子弹伤害
    const damageTags = projectile.getTags().filter(tag => tag.startsWith('damage:'));
    if (damageTags.length > 0) {
      const damageStr = damageTags[0].split(':')[1];
      const damage = parseInt(damageStr, 10);
      
      // 对玩家造成伤害
      this.systems.health.damageEntity(player, damage);
      
      // 回收子弹
      this.world.removeEntity(projectile.getId());
    }
  }

  /**
   * 处理敌人与玩家碰撞
   * @param enemy 敌人实体
   * @param player 玩家实体
   */
  private handleEnemyPlayerCollision(enemy: Entity, player: Entity): void {
    // 对玩家造成伤害
    this.systems.health.damageEntity(player, 10);
    
    // 对敌人造成伤害（碰撞也会伤害敌人）
    this.systems.health.damageEntity(enemy, 10);
  }

  /**
   * 处理道具与玩家碰撞
   * @param item 道具实体
   * @param player 玩家实体
   */
  private handleItemPlayerCollision(item: Entity, player: Entity): void {
    // 获取道具效果
    const effectTags = item.getTags().filter(tag => tag.startsWith('effect:'));
    if (effectTags.length > 0) {
      const effect = effectTags[0].split(':')[1];
      
      // 根据效果类型处理
      if (effect === 'health') {
        // 获取治疗量
        const valueTags = item.getTags().filter(tag => tag.startsWith('value:'));
        if (valueTags.length > 0) {
          const valueStr = valueTags[0].split(':')[1];
          const value = parseInt(valueStr, 10);
          
          // 治疗玩家
          this.systems.health.healEntity(player, value);
        }
      } else if (effect === 'shield') {
        // 获取持续时间
        const durationTags = item.getTags().filter(tag => tag.startsWith('duration:'));
        if (durationTags.length > 0) {
          const durationStr = durationTags[0].split(':')[1];
          const duration = parseInt(durationStr, 10);
          
          // 给玩家添加护盾
          const health = player.getComponent(HealthComponent.TYPE) as HealthComponent;
          if (health) {
            health.setInvincible(true);
            
            // 设置定时器，在持续时间结束后移除护盾
            setTimeout(() => {
              if (health) {
                health.setInvincible(false);
              }
            }, duration);
          }
        }
      } else if (effect === 'weapon') {
        // 获取武器类型
        const valueTags = item.getTags().filter(tag => tag.startsWith('value:'));
        if (valueTags.length > 0) {
          const weaponType = valueTags[0].split(':')[1];
          
          // 更新玩家武器
          this.updatePlayerWeapon(weaponType);
        }
      }
    }
    
    // 移除道具
    this.world.removeEntity(item.getId());
  }

  /**
   * 更新玩家武器
   * @param weaponType 武器类型
   */
  private updatePlayerWeapon(weaponType: string): void {
    if (!this.player) return;
    
    // 获取武器配置
    const weaponConfig = this.configLoader.getWeaponConfig(weaponType);
    if (!weaponConfig) return;
    
    // 创建新的武器组件
    const newWeapon = new WeaponComponent(
      weaponType,
      weaponConfig.damage,
      weaponConfig.cooldown,
      weaponConfig.projectileSpeed,
      weaponConfig.projectileLifetime,
      weaponConfig.spread,
      weaponConfig.projectileCount,
      weaponConfig.texture,
      weaponConfig.soundEffect,
      weaponConfig.specialProperties
    );
    
    // 替换玩家的武器组件
    this.player.removeComponent('Weapon');
    this.player.addComponent(newWeapon);
  }

  /**
   * 处理实体死亡
   * @param entity 实体
   */
  private handleEntityDeath(entity: Entity): void {
    // 处理敌人死亡
    if (entity.hasTag('enemy')) {
      // 获取分数
      const scoreTags = entity.getTags().filter(tag => tag.startsWith('score:'));
      if (scoreTags.length > 0) {
        const scoreStr = scoreTags[0].split(':')[1];
        const score = parseInt(scoreStr, 10);
        
        // 增加分数
        this.addScore(score);
      }
      
    // 随机掉落道具（20%概率）
    if (Math.random() < 0.2) {
      const transform = entity.getComponent('Transform') as TransformComponent;
      const x = transform?.x || 0;
      const y = transform?.y || 0;
        
        // 随机选择道具类型
        const itemTypes = Object.keys(this.configLoader.getAllItemConfigs());
        if (itemTypes.length > 0) {
          const randomIndex = Math.floor(Math.random() * itemTypes.length);
          const itemType = itemTypes[randomIndex];
          
          // 创建道具
          const item = this.entityFactory.createItem(itemType, x, y);
          this.world.addEntity(item);
        }
      }
    }
    
    // 处理玩家死亡
    if (entity.hasTag('player')) {
      this.lives--;
      this.updateUI();
      
      // 检查游戏是否结束
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        // 重生玩家
        setTimeout(() => {
          this.respawnPlayer();
        }, 1000);
      }
    }
  }

  /**
   * 增加分数
   * @param points 分数
   */
  private addScore(points: number): void {
    this.score += points;
    this.updateUI();
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    if (this.scoreElement) {
      this.scoreElement.textContent = this.score.toString();
    }
    
    if (this.livesElement) {
      this.livesElement.textContent = this.lives.toString();
    }
  }

  /**
   * 重生玩家
   */
  private respawnPlayer(): void {
    if (!this.canvas) return;
    
    // 创建新的玩家实体
    const x = this.canvas.width / 2;
    const y = this.canvas.height - 50;
    this.player = this.entityFactory.createPlayer(x, y);
    
    // 添加到世界
    this.world.addEntity(this.player);
  }

  /**
   * 重置游戏
   */
  public reset(): void {
    this.score = 0;
    this.lives = 3;
    
    // 移除所有实体
    const entities = this.world.getEntities();
    for (const entity of entities) {
      this.world.removeEntity(entity.getId());
    }
    
    // 重新初始化世界
    this.respawnPlayer();
    this.updateUI();
  }
  
  /**
   * 游戏结束
   */
  private gameOver(): void {
    this.isRunning = false;
    console.log('游戏结束，最终得分：', this.score);
    
    // 显示游戏结束界面
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
      gameOverElement.style.display = 'flex';
      
      const finalScoreElement = document.getElementById('final-score');
      if (finalScoreElement) {
        finalScoreElement.textContent = this.score.toString();
      }
    }
  }

  /**
   * 开始游戏
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.score = 0;
    this.lives = 3;
    
    // 清空世界
    this.world.clear();
    
    // 创建玩家
    this.respawnPlayer();
    
    // 更新UI
    this.updateUI();
    
    // 开始游戏循环
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * 暂停游戏
   */
  public pause(): void {
    this.isRunning = false;
  }

  /**
   * 恢复游戏
   */
  public resume(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * 游戏循环
   * @param currentTime 当前时间
   */
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;
    
    // 计算时间增量（秒）
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    // 限制时间增量，防止大延迟导致的问题
    const cappedDeltaTime = Math.min(deltaTime, 0.1);
    
    // 更新世界
    this.world.update(cappedDeltaTime);
    
    // 继续游戏循环
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * 加载武器配置
   * @param jsonContent JSON内容
   * @returns 是否成功加载
   */
  public loadWeaponConfig(jsonContent: string): boolean {
    return this.configLoader.loadWeaponConfig(jsonContent);
  }

  /**
   * 加载敌人配置
   * @param jsonContent JSON内容
   * @returns 是否成功加载
   */
  public loadEnemyConfig(jsonContent: string): boolean {
    return this.configLoader.loadEnemyConfig(jsonContent);
  }

  /**
   * 加载道具配置
   * @param jsonContent JSON内容
   * @returns 是否成功加载
   */
  public loadItemConfig(jsonContent: string): boolean {
    return this.configLoader.loadItemConfig(jsonContent);
  }

  /**
   * 设置难度
   * @param level 难度级别（1-5）
   */
  public setDifficulty(level: number): void {
    // 限制难度范围
    const difficulty = Math.max(1, Math.min(5, level));
    
    // 计算难度乘数
    const multiplier = 0.5 + (difficulty * 0.3);
    
    // 更新敌人生成系统
    this.systems.enemySpawn.setDifficultyMultiplier(multiplier);
    this.systems.enemySpawn.setSpawnInterval(3000 / multiplier);
    this.systems.enemySpawn.setMaxEnemies(5 + difficulty * 2);
  }

  /**
   * 调整画布大小
   */
  public resizeCanvas(): void {
    if (!this.canvas) return;
    
    // 获取画布容器的尺寸
    const container = this.canvas.parentElement;
    if (container) {
      // 设置画布尺寸与容器相同
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
      
      // 更新系统
      this.systems.movement.setCanvasSize(this.canvas.width, this.canvas.height);
      this.systems.enemySpawn.setCanvasSize(this.canvas.width, this.canvas.height);
    }
  }
}