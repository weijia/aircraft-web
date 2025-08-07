import './styles.css';
import { Game } from './core/Game';

/**
 * 游戏入口文件
 */
document.addEventListener('DOMContentLoaded', () => {
  // 获取画布元素
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('找不到画布元素');
    return;
  }
  
  // 创建游戏实例
  const game = new Game(canvas);
  
  // 设置画布大小
  game.resizeCanvas();
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    game.resizeCanvas();
  });
  
  // 设置难度
  game.setDifficulty(2); // 中等难度
  
  // 监听配置文件上传
  setupConfigUpload(game);
  
  // 开始游戏按钮
  const startButton = document.createElement('button');
  startButton.textContent = '开始游戏';
  startButton.style.position = 'absolute';
  startButton.style.top = '50%';
  startButton.style.left = '50%';
  startButton.style.transform = 'translate(-50%, -50%)';
  startButton.style.padding = '10px 20px';
  startButton.style.fontSize = '20px';
  startButton.style.cursor = 'pointer';
  
  startButton.addEventListener('click', () => {
    game.start();
    startButton.remove();
  });
  
  document.querySelector('.game-container')?.appendChild(startButton);
  
  // 监听键盘事件（暂停/恢复）
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      if (game.isRunning) {
        game.pause();
      } else {
        game.resume();
      }
    }
  });
});

/**
 * 设置配置文件上传
 * @param game 游戏实例
 */
function setupConfigUpload(game: Game): void {
  // 武器配置上传
  const weaponConfigInput = document.getElementById('weaponConfig') as HTMLInputElement;
  if (weaponConfigInput) {
    weaponConfigInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const success = game.loadWeaponConfig(content);
            if (success) {
              alert('武器配置加载成功！');
            } else {
              alert('武器配置加载失败，请检查JSON格式是否正确。');
            }
          }
        };
        reader.readAsText(file);
      }
    });
  }
  
  // 敌人配置上传
  const enemyConfigInput = document.getElementById('enemyConfig') as HTMLInputElement;
  if (enemyConfigInput) {
    enemyConfigInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const success = game.loadEnemyConfig(content);
            if (success) {
              alert('敌人配置加载成功！');
            } else {
              alert('敌人配置加载失败，请检查JSON格式是否正确。');
            }
          }
        };
        reader.readAsText(file);
      }
    });
  }
  
  // 道具配置上传
  const itemConfigInput = document.getElementById('itemConfig') as HTMLInputElement;
  if (itemConfigInput) {
    itemConfigInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const success = game.loadItemConfig(content);
            if (success) {
              alert('道具配置加载成功！');
            } else {
              alert('道具配置加载失败，请检查JSON格式是否正确。');
            }
          }
        };
        reader.readAsText(file);
      }
    });
  }
  
  // 应用配置按钮
  const applyConfigButton = document.getElementById('applyConfig');
  if (applyConfigButton) {
    applyConfigButton.addEventListener('click', () => {
      alert('配置已应用！');
    });
  }
}