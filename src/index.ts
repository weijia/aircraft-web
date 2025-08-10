import './styles.css';
import { Game } from './core/Game';

/**
 * 调试日志函数
 * @param message 日志消息
 */
function debugLog(message: string): void {
  const debugContent = document.getElementById('debug-content');
  if (debugContent) {
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    debugContent.appendChild(logEntry);
    
    // 限制日志条目数量
    if (debugContent.children.length > 20) {
      debugContent.removeChild(debugContent.firstChild as Node);
    }
    
    // 自动滚动到底部
    debugContent.scrollTop = debugContent.scrollHeight;
  }
  
  // 同时输出到控制台
  console.log(message);
}

/**
 * 游戏入口文件
 */
window.onload = function() {
  debugLog('页面加载完成');
  
  // 获取画布元素
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    debugLog('错误：找不到画布元素');
    return;
  }
  
  debugLog('找到画布元素');
  
  // 创建游戏实例
  const game = new Game(canvas);
  debugLog('游戏实例已创建');
  
  // 设置画布大小
  game.resizeCanvas();
  debugLog(`画布大小已设置: ${canvas.width}x${canvas.height}`);
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    game.resizeCanvas();
    debugLog(`窗口大小已变化，画布大小已调整: ${canvas.width}x${canvas.height}`);
  });
  
  // 设置难度
  game.setDifficulty(2); // 中等难度
  debugLog('游戏难度已设置为中等');
  
  // 监听配置文件上传
  setupConfigUpload(game);
  debugLog('配置文件上传功能已设置');
  
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
    debugLog('开始游戏按钮被点击');
    game.start();
    startButton.remove();
    debugLog('游戏已开始');
  });
  
  document.querySelector('.game-container')?.appendChild(startButton);
  debugLog('开始游戏按钮已添加到页面');
  
  // 监听键盘事件（暂停/恢复）
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      if (game.isRunning) {
        game.pause();
        debugLog('游戏已暂停');
      } else {
        game.resume();
        debugLog('游戏已恢复');
      }
    }
  });
  
  // 重新开始按钮
  const restartButton = document.getElementById('restart-button');
  if (restartButton) {
    restartButton.addEventListener('click', () => {
      debugLog('重新开始按钮被点击');
      const gameOverElement = document.getElementById('game-over');
      if (gameOverElement) {
        gameOverElement.style.display = 'none';
      }
      game.reset();
      game.start();
      debugLog('游戏已重新开始');
    });
  }
  
  // 将调试函数暴露给全局，方便在控制台调试
  (window as any).debugGame = {
    game,
    debugLog
  };
};

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
        debugLog(`正在加载武器配置文件: ${file.name}`);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const success = game.loadWeaponConfig(content);
            if (success) {
              debugLog('武器配置加载成功！');
              alert('武器配置加载成功！');
            } else {
              debugLog('武器配置加载失败，请检查JSON格式是否正确。');
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
        debugLog(`正在加载敌人配置文件: ${file.name}`);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const success = game.loadEnemyConfig(content);
            if (success) {
              debugLog('敌人配置加载成功！');
              alert('敌人配置加载成功！');
            } else {
              debugLog('敌人配置加载失败，请检查JSON格式是否正确。');
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
        debugLog(`正在加载道具配置文件: ${file.name}`);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const success = game.loadItemConfig(content);
            if (success) {
              debugLog('道具配置加载成功！');
              alert('道具配置加载成功！');
            } else {
              debugLog('道具配置加载失败，请检查JSON格式是否正确。');
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
      debugLog('配置已应用！');
      alert('配置已应用！');
    });
  }
}
