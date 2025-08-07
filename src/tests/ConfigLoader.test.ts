import { ConfigLoader } from '../config/ConfigLoader';

describe('配置加载器测试', function configLoaderTests() {
  let configLoader: ConfigLoader;
  
  beforeEach(() => {
    configLoader = new ConfigLoader();
  });
  
  test('加载武器配置', () => {
    const weaponConfig = {
      "laser": {
        "type": "projectile",
        "damage": 15,
        "cooldown": 200,
        "projectileSpeed": 600,
        "projectileLifetime": 1500,
        "texture": "assets/laser.png"
      }
    };
    
    const success = configLoader.loadWeaponConfig(JSON.stringify(weaponConfig));
    expect(success).toBe(true);
    
    const loadedConfig = configLoader.getWeaponConfig("laser");
    expect(loadedConfig).toBeDefined();
    expect(loadedConfig.damage).toBe(15);
    expect(loadedConfig.cooldown).toBe(200);
  });
  
  test('加载敌人配置', () => {
    const enemyConfig = {
      "basic": {
        "health": 30,
        "speed": 100,
        "score": 100,
        "texture": "assets/enemy_basic.png",
        "weapons": ["default"],
        "movementPattern": "linear"
      }
    };
    
    const success = configLoader.loadEnemyConfig(JSON.stringify(enemyConfig));
    expect(success).toBe(true);
    
    const loadedConfig = configLoader.getEnemyConfig("basic");
    expect(loadedConfig).toBeDefined();
    expect(loadedConfig.health).toBe(30);
    expect(loadedConfig.speed).toBe(100);
    expect(loadedConfig.score).toBe(100);
  });
  
  test('加载道具配置', () => {
    const itemConfig = {
      "health": {
        "type": "powerup",
        "effect": "health",
        "value": 20,
        "texture": "assets/item_health.png"
      }
    };
    
    const success = configLoader.loadItemConfig(JSON.stringify(itemConfig));
    expect(success).toBe(true);
    
    const loadedConfig = configLoader.getItemConfig("health");
    expect(loadedConfig).toBeDefined();
    expect(loadedConfig.type).toBe("powerup");
    expect(loadedConfig.effect).toBe("health");
    expect(loadedConfig.value).toBe(20);
  });
  
  test('验证无效的武器配置', () => {
    const invalidConfig = {
      "invalid": {
        "type": "projectile",
        "damage": -10, // 无效的伤害值（必须为正数）
        "cooldown": 200
      }
    };
    
    const success = configLoader.loadWeaponConfig(JSON.stringify(invalidConfig));
    expect(success).toBe(false);
  });
  
  test('验证无效的敌人配置', () => {
    const invalidConfig = {
      "invalid": {
        "health": 0, // 无效的生命值（必须为正数）
        "speed": 100,
        "score": 100
      }
    };
    
    const success = configLoader.loadEnemyConfig(JSON.stringify(invalidConfig));
    expect(success).toBe(false);
  });
  
  test('配置变更通知', () => {
    const listener = jest.fn();
    configLoader.addConfigChangeListener(listener);
    
    const weaponConfig = {
      "laser": {
        "type": "projectile",
        "damage": 15,
        "cooldown": 200
      }
    };
    
    configLoader.loadWeaponConfig(JSON.stringify(weaponConfig));
    expect(listener).toHaveBeenCalledWith('weapon');
    
    configLoader.removeConfigChangeListener(listener);
    listener.mockClear();
    
    configLoader.loadWeaponConfig(JSON.stringify(weaponConfig));
    expect(listener).not.toHaveBeenCalled();
  });
});