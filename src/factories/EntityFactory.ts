import { Entity } from '../core/ecs/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { RenderComponent } from '../components/RenderComponent';
import { ColliderComponent, ColliderType } from '../components/ColliderComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { WeaponComponent } from '../components/WeaponComponent';
import { HealthComponent } from '../components/HealthComponent';
import { InputComponent } from '../components/InputComponent';
import { TimerComponent } from '../components/TimerComponent';
import { ConfigLoader } from '../config/ConfigLoader';

/**
 * 实体工厂 - 负责创建游戏中的实体
 */
export class EntityFactory {
  private configLoader: ConfigLoader;

  /**
   * 构造函数
   * @param configLoader 配置加载器
   */
  constructor(configLoader: ConfigLoader) {
    this.configLoader = configLoader;
  }

  /**
   * 创建玩家实体
   * @param x X坐标
   * @param y Y坐标
   * @param initialWeapon 初始武器类型
   * @returns 玩家实体
   */
  public createPlayer(x: number, y: number, initialWeapon = 'default'): Entity {
    const player = new Entity();
    
    // 添加变换组件
    player.addComponent(new TransformComponent(x, y));
    
    // 添加渲染组件
    const render = new RenderComponent(40, 40, '#3498db');
    render.setImage('assets/player.png');
    player.addComponent(render);
    
    // 添加碰撞组件
    player.addComponent(new ColliderComponent(
      ColliderType.RECTANGLE,
      40, 40, 0, 0, 0,
      false, 1, 2 // 玩家碰撞层为1，可与层2（敌人）碰撞
    ));
    
    // 添加速度组件
    player.addComponent(new VelocityComponent(0, 0, 300, 0));
    
    // 添加武器组件
    const weaponConfig = this.configLoader.getWeaponConfig(initialWeapon) || {
      type: 'projectile',
      damage: 10,
      cooldown: 300,
      projectileSpeed: 500,
      projectileLifetime: 2000,
      spread: 0,
      projectileCount: 1,
      texture: 'assets/bullet.png'
    };
    
    player.addComponent(new WeaponComponent(
      initialWeapon,
      weaponConfig.damage,
      weaponConfig.cooldown,
      weaponConfig.projectileSpeed,
      weaponConfig.projectileLifetime,
      weaponConfig.spread,
      weaponConfig.projectileCount,
      weaponConfig.texture,
      weaponConfig.soundEffect,
      weaponConfig.specialProperties
    ));
    
    // 添加健康组件
    player.addComponent(new HealthComponent(100, 1000));
    
    // 添加输入组件
    player.addComponent(new InputComponent());
    
    // 添加标签
    player.addTag('player');
    
    return player;
  }

  /**
   * 创建敌人实体
   * @param type 敌人类型
   * @param x X坐标
   * @param y Y坐标
   * @returns 敌人实体
   */
  public createEnemy(type: string, x: number, y: number): Entity {
    const enemy = new Entity();
    
    // 获取敌人配置
    const enemyConfig = this.configLoader.getEnemyConfig(type) || {
      health: 30,
      speed: 100,
      score: 100,
      texture: 'assets/enemy.png',
      weapons: ['basic'],
      movementPattern: 'linear'
    };
    
    // 添加变换组件
    enemy.addComponent(new TransformComponent(x, y));
    
    // 添加渲染组件
    const render = new RenderComponent(30, 30, '#e74c3c');
    if (enemyConfig.texture) {
      render.setImage(enemyConfig.texture);
    }
    enemy.addComponent(render);
    
    // 添加碰撞组件
    enemy.addComponent(new ColliderComponent(
      ColliderType.RECTANGLE,
      30, 30, 0, 0, 0,
      false, 2, 1 // 敌人碰撞层为2，可与层1（玩家）碰撞
    ));
    
    // 添加速度组件
    const speed = enemyConfig.speed || 100;
    enemy.addComponent(new VelocityComponent(0, speed, speed, 0));
    
    // 添加健康组件
    const health = enemyConfig.health || 30;
    enemy.addComponent(new HealthComponent(health, 0));
    
    // 添加武器组件（如果有）
    if (enemyConfig.weapons && enemyConfig.weapons.length > 0) {
      const weaponType = enemyConfig.weapons[0];
      const weaponConfig = this.configLoader.getWeaponConfig(weaponType) || {
        type: 'projectile',
        damage: 5,
        cooldown: 2000,
        projectileSpeed: 200,
        projectileLifetime: 2000,
        spread: 0,
        projectileCount: 1,
        texture: 'assets/enemy_bullet.png'
      };
      
      enemy.addComponent(new WeaponComponent(
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
      ));
    }
    
    // 添加计时器组件（用于控制行为）
    const timer = new TimerComponent();
    
    // 根据移动模式添加不同的计时器
    if (enemyConfig.movementPattern === 'zigzag') {
      timer.addTimer('changeDirection', 1000, () => {
        const velocity = enemy.getComponent(VelocityComponent.TYPE) as VelocityComponent;
        if (velocity) {
          velocity.vx = -velocity.vx;
        }
      }, true);
    } else if (enemyConfig.movementPattern === 'circular') {
      let angle = 0;
      timer.addTimer('circular', 50, () => {
        const velocity = enemy.getComponent(VelocityComponent.TYPE) as VelocityComponent;
        if (velocity) {
          angle += 0.1;
          velocity.vx = Math.sin(angle) * velocity.maxSpeed;
          velocity.vy = Math.cos(angle) * velocity.maxSpeed * 0.5 + velocity.maxSpeed * 0.5;
        }
      }, true);
    }
    
    enemy.addComponent(timer);
    
    // 添加标签
    enemy.addTag('enemy');
    
    // 添加分数属性（用于计分）
    enemy.addTag(`score:${enemyConfig.score || 100}`);
    
    return enemy;
  }

  /**
   * 创建子弹实体
   * @param weaponType 武器类型
   * @param x X坐标
   * @param y Y坐标
   * @param angle 角度
   * @param isPlayerBullet 是否是玩家子弹
   * @returns 子弹实体
   */
  public createProjectile(weaponType: string, x: number, y: number, angle: number, isPlayerBullet = true): Entity {
    const projectile = new Entity();
    
    // 获取武器配置
    const weaponConfig = this.configLoader.getWeaponConfig(weaponType) || {
      type: 'projectile',
      damage: isPlayerBullet ? 10 : 5,
      projectileSpeed: 500,
      projectileLifetime: 2000,
      texture: isPlayerBullet ? 'assets/bullet.png' : 'assets/enemy_bullet.png'
    };
    
    // 添加变换组件
    projectile.addComponent(new TransformComponent(x, y, angle));
    
    // 添加渲染组件
    const color = isPlayerBullet ? '#3498db' : '#e74c3c';
    const render = new RenderComponent(10, 20, color);
    if (weaponConfig.texture) {
      render.setImage(weaponConfig.texture);
    }
    projectile.addComponent(render);
    
    // 添加碰撞组件
    const collisionLayer = isPlayerBullet ? 4 : 8; // 玩家子弹层为4，敌人子弹层为8
    const collisionMask = isPlayerBullet ? 2 : 1; // 玩家子弹可与敌人（层2）碰撞，敌人子弹可与玩家（层1）碰撞
    
    projectile.addComponent(new ColliderComponent(
      ColliderType.RECTANGLE,
      10, 20, 0, 0, 0,
      false, collisionLayer, collisionMask
    ));
    
    // 添加速度组件
    const speed = weaponConfig.projectileSpeed || 500;
    const vx = Math.sin(angle) * speed;
    const vy = -Math.cos(angle) * speed;
    projectile.addComponent(new VelocityComponent(vx, vy, speed, 0));
    
    // 添加计时器组件（用于生命周期）
    const timer = new TimerComponent();
    const lifetime = weaponConfig.projectileLifetime || 2000;
    
    timer.addTimer('lifetime', lifetime, () => {
      if (projectile.isActive()) {
        projectile.setActive(false);
      }
    }, false);
    
    projectile.addComponent(timer);
    
    // 添加标签
    projectile.addTag('projectile');
    projectile.addTag(isPlayerBullet ? 'playerProjectile' : 'enemyProjectile');
    
    // 添加伤害标签
    const damage = weaponConfig.damage || (isPlayerBullet ? 10 : 5);
    projectile.addTag(`damage:${damage}`);
    
    // 添加特殊属性标签
    if (weaponConfig.specialProperties) {
      for (const [key, value] of Object.entries(weaponConfig.specialProperties)) {
        projectile.addTag(`${key}:${value}`);
      }
    }
    
    return projectile;
  }

  /**
   * 创建道具实体
   * @param type 道具类型
   * @param x X坐标
   * @param y Y坐标
   * @returns 道具实体
   */
  public createItem(type: string, x: number, y: number): Entity {
    const item = new Entity();
    
    // 获取道具配置
    const itemConfig = this.configLoader.getItemConfig(type) || {
      type: 'powerup',
      effect: 'health',
      value: 20,
      texture: 'assets/item.png'
    };
    
    // 添加变换组件
    item.addComponent(new TransformComponent(x, y));
    
    // 添加渲染组件
    let color = '#2ecc71';
    if (itemConfig.effect === 'health') {
      color = '#2ecc71'; // 绿色
    } else if (itemConfig.effect === 'shield') {
      color = '#3498db'; // 蓝色
    } else if (itemConfig.effect === 'weapon') {
      color = '#f39c12'; // 橙色
    }
    
    const render = new RenderComponent(20, 20, color);
    if (itemConfig.texture) {
      render.setImage(itemConfig.texture);
    }
    item.addComponent(render);
    
    // 添加碰撞组件
    item.addComponent(new ColliderComponent(
      ColliderType.CIRCLE,
      0, 0, 10, 0, 0,
      true, 16, 1 // 道具碰撞层为16，可与层1（玩家）碰撞
    ));
    
    // 添加速度组件（缓慢下落）
    item.addComponent(new VelocityComponent(0, 50, 50, 0));
    
    // 添加计时器组件（用于生命周期）
    const timer = new TimerComponent();
    timer.addTimer('lifetime', 10000, () => {
      if (item.isActive()) {
        item.setActive(false);
      }
    }, false);
    
    item.addComponent(timer);
    
    // 添加标签
    item.addTag('item');
    item.addTag(`itemType:${type}`);
    item.addTag(`effect:${itemConfig.effect}`);
    
    // 添加值标签
    if (itemConfig.value) {
      item.addTag(`value:${itemConfig.value}`);
    }
    
    // 添加持续时间标签
    if (itemConfig.duration) {
      item.addTag(`duration:${itemConfig.duration}`);
    }
    
    return item;
  }
}