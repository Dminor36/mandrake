// ========== 主啟動文件 ==========

console.log('🚀 main.js 開始載入...');

/**
 * 遊戲主初始化函數
 */
async function initGame() {
    console.log('🌱 曼德拉草農場啟動中...');

    // ✅ 檢查必要的配置是否載入
    const configChecks = [
        { name: 'GAME_CONFIG', exists: typeof GAME_CONFIG !== 'undefined' },
        { name: 'MANDRAKE_CONFIG', exists: typeof MANDRAKE_CONFIG !== 'undefined' },
        { name: 'WEATHER_CONFIG', exists: typeof WEATHER_CONFIG !== 'undefined' },
        { name: 'RARITY_CONFIG', exists: typeof RARITY_CONFIG !== 'undefined' },
        { name: 'REWARD_TEMPLATES', exists: typeof REWARD_TEMPLATES !== 'undefined' }
    ];

    for (const config of configChecks) {
        if (!config.exists) {
            console.error(`❌ ${config.name} 未載入！請檢查 config.js`);
            handleInitError(`配置載入失敗：${config.name}`);
            return;
        } else {
            console.log(`✅ ${config.name} 載入成功`);
        }
    }
    
    try {
        // 1. 初始化UI系統
        if (typeof UI !== 'undefined') {
            UI.init();
            console.log('✅ UI系統初始化完成');
        }
        
        // 2. 設置圖片管理器
        setupImageManager();
        console.log('✅ 圖片管理器設置完成');
        
        // 3. 初始化遊戲核心
        if (typeof game !== 'undefined') {
            await game.init();
            console.log('✅ 遊戲核心初始化完成');
        } else {
            console.error('❌ game 物件不存在！');
            handleInitError('遊戲核心物件不存在');
            return;
        }
        
        // 4. 設置全局事件監聽器
        setupEventListeners();
        console.log('✅ 事件監聽器設置完成');
        
        // 5. 初始化調試功能（開發環境）
        if (isDevelopmentMode()) {
            setupDebugFeatures();
            console.log('✅ 調試功能初始化完成');
        }
        
        // 6. 圖鑑系統初始化
        if (typeof EncyclopediaSystem !== 'undefined') {
            EncyclopediaSystem.initializeEncyclopedia();
        }
        
        console.log('🎉 遊戲啟動成功！');
        
        // 顯示歡迎訊息
        if (typeof UI !== 'undefined') {
            UI.showNotification('歡迎來到曼德拉草農場！', 'success');
        }
        
    } catch (error) {
        console.error('❌ 遊戲初始化失敗:', error);
        handleInitError('遊戲啟動失敗：' + error.message);
    }
}

/**
 * 🔧 新增：統一的初始化錯誤處理
 */
function handleInitError(message) {
    console.error('初始化錯誤:', message);
    
    // 顯示錯誤訊息
    if (typeof UI !== 'undefined') {
        UI.showNotification(message + '，請重新整理頁面', 'error');
    } else {
        // 如果UI還沒初始化，直接顯示alert
        alert(message + '，請重新整理頁面');
    }
    
    // 嘗試緊急恢復
    setTimeout(() => {
        attemptEmergencyRecovery();
    }, 3000);
}

/**
 * 設置圖片管理器
 */
function setupImageManager() {
    if (typeof imageManager === 'undefined') {
        console.warn('⚠️ imageManager 不存在，跳過圖片管理器設置');
        return;
    }
    
    // 根據環境設置圖片路徑
    const isLocalFile = window.location.protocol === 'file:';
    const basePath = isLocalFile ? './images/' : '/images/';
    
    imageManager.setBasePath(basePath);
    
    // 預載入基礎圖片
    imageManager.preloadTier(1);
}

/**
 * 設置全局事件監聽器
 */
function setupEventListeners() {
    // 頁面可見性變化（節省性能）
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 窗口失焦時自動保存
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 鍵盤快捷鍵
    document.addEventListener('keydown', handleKeydown);
    
    // 點擊外部關閉模態框
    document.addEventListener('click', handleModalOutsideClick);
    
    // 🔧 修復：改進的錯誤處理
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

/**
 * 處理頁面可見性變化
 */
function handleVisibilityChange() {
    if (!game) return;
    
    if (document.hidden) {
        // 頁面不可見時，降低更新頻率或暫停
        console.log('頁面隱藏，降低性能消耗');
        game.saveGame(); // 自動保存
    } else {
        // 頁面重新可見時，恢復正常更新
        console.log('頁面恢復顯示');
        if (typeof UI !== 'undefined') {
            UI.updateAll(); // 刷新UI
        }
    }
}

/**
 * 處理頁面關閉前事件
 */
function handleBeforeUnload(event) {
    // 自動保存遊戲
    if (game && game.saveGame) {
        try {
            game.saveGame();
        } catch (error) {
            console.error('保存遊戲失敗:', error);
        }
    }
    
    // 可選：顯示確認對話框（僅在有未保存數據時）
    // event.preventDefault();
    // event.returnValue = '';
}

/**
 * 處理鍵盤快捷鍵
 */
function handleKeydown(event) {
    // Ctrl/Cmd + S: 手動保存
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (game && game.saveGame) {
            try {
                game.saveGame();
                if (typeof UI !== 'undefined') {
                    UI.showNotification('遊戲已保存', 'info', 1000);
                }
            } catch (error) {
                console.error('手動保存失敗:', error);
                if (typeof UI !== 'undefined') {
                    UI.showNotification('保存失敗', 'error', 1000);
                }
            }
        }
    }
    
    // ESC: 關閉模態框
    if (event.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay.show');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }
    
    // 數字鍵1-3: 快速選擇獎勵（如果獎勵窗口開啟）
    if (event.key >= '1' && event.key <= '3') {
        const rewardModal = document.getElementById('reward-modal');
        if (rewardModal && rewardModal.classList.contains('show')) {
            const options = rewardModal.querySelectorAll('.reward-option');
            const index = parseInt(event.key) - 1;
            if (options[index]) {
                options[index].click();
            }
        }
    }
    
    // 開發者快捷鍵（僅在開發模式下）
    if (isDevelopmentMode()) {
        // F1: 強制觸發獎勵
        if (event.key === 'F1') {
            event.preventDefault();
            if (typeof Rewards !== 'undefined') {
                try {
                    Rewards.debugTriggerReward();
                } catch (error) {
                    console.error('觸發獎勵失敗:', error);
                }
            }
        }
        
        // F2: 添加1000果實
        if (event.key === 'F2') {
            event.preventDefault();
            if (game && game.data) {
                try {
                    game.data.fruit += 1000;
                    if (typeof UI !== 'undefined') {
                        UI.updateResources();
                        UI.showNotification('添加了1000果實（調試）', 'info');
                    }
                } catch (error) {
                    console.error('添加果實失敗:', error);
                }
            }
        }
        
        // F3: 顯示遊戲統計
        if (event.key === 'F3') {
            event.preventDefault();
            if (game && game.getGameStats) {
                try {
                    console.table(game.getGameStats());
                } catch (error) {
                    console.error('獲取統計失敗:', error);
                }
            }
        }
    }
}

/**
 * 處理模態框外部點擊
 */
function handleModalOutsideClick(event) {
    const modals = document.querySelectorAll('.modal-overlay.show');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    });
}

/**
 * 🔧 修復：處理全局錯誤
 */
function handleGlobalError(event) {
    const error = event.error;
    console.error('全局錯誤:', error);
    
    // 🔧 修復：安全的錯誤訊息提取
    let message = '發生了一個錯誤';
    try {
        if (error && error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
    } catch (e) {
        console.error('提取錯誤訊息失敗:', e);
    }
    
    // 記錄錯誤（可以發送到服務器）
    logError('Global Error', { message, stack: error?.stack });
    
    // 顯示用戶友好的錯誤訊息
    if (typeof UI !== 'undefined') {
        UI.showNotification('發生了一個錯誤，遊戲將繼續運行', 'warning');
    }
}

/**
 * 🔧 修復：處理未捕獲的Promise拒絕
 */
function handleUnhandledRejection(event) {
    const reason = event.reason;
    console.error('未捕獲的Promise拒絕:', reason);
    
    // 🔧 修復：安全的理由提取
    let message = '異步操作失敗';
    try {
        if (reason && reason.message) {
            message = reason.message;
        } else if (typeof reason === 'string') {
            message = reason;
        }
    } catch (e) {
        console.error('提取拒絕理由失敗:', e);
    }
    
    // 記錄錯誤
    logError('Unhandled Promise Rejection', { message, stack: reason?.stack });
    
    // 防止錯誤顯示在控制台
    event.preventDefault();
}

/**
 * 判斷是否為開發模式
 */
function isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'file:';
}

/**
 * 設置調試功能
 */
function setupDebugFeatures() {
    // 添加調試按鈕到頁面
    createDebugPanel();
    
    // 暴露調試函數到全局
    window.debug = {
        game: game,
        ui: UI,
        rewards: typeof Rewards !== 'undefined' ? Rewards : null,
        imageManager: typeof imageManager !== 'undefined' ? imageManager : null,
        addFruit: (amount) => {
            if (game && game.data) {
                try {
                    game.data.fruit += amount;
                    if (typeof UI !== 'undefined') {
                        UI.updateResources();
                    }
                } catch (error) {
                    console.error('添加果實失敗:', error);
                }
            }
        },
        triggerReward: () => {
            if (typeof Rewards !== 'undefined') {
                try {
                    Rewards.debugTriggerReward();
                } catch (error) {
                    console.error('觸發獎勵失敗:', error);
                }
            }
        },
        resetGame: () => {
            if (game && game.resetGame) {
                try {
                    game.resetGame();
                } catch (error) {
                    console.error('重置遊戲失敗:', error);
                }
            }
        },
        showStats: () => {
            if (game && game.getGameStats) {
                try {
                    console.table(game.getGameStats());
                } catch (error) {
                    console.error('獲取統計失敗:', error);
                }
            }
        },
        simulateTime: (hours) => {
            if (game && game.data && game.getTotalProduction) {
                try {
                    const production = game.getTotalProduction() * 3600 * hours;
                    game.data.totalFruitEarned += production;
                    game.data.fruit += production;
                    if (typeof UI !== 'undefined') {
                        UI.updateAll();
                    }
                } catch (error) {
                    console.error('模擬時間失敗:', error);
                }
            }
        }
    };
    
    console.log('🔧 調試功能已啟用，使用 window.debug 訪問調試工具');
}

/**
 * 創建調試面板
 */
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 9999;
        display: none;
    `;
    
    debugPanel.innerHTML = `
        <h4>調試面板</h4>
        <button onclick="debug.addFruit(1000)">+1000果實</button>
        <button onclick="debug.triggerReward()">觸發獎勵</button>
        <button onclick="debug.showStats()">顯示統計</button>
        <button onclick="debug.resetGame()">重置遊戲</button>
        <br><br>
        <label>
            <input type="checkbox" onchange="toggleDebugInfo(this.checked)"> 顯示調試信息
        </label>
    `;
    
    document.body.appendChild(debugPanel);
    
    // 添加切換快捷鍵（Ctrl + Shift + D）
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // 添加調試信息切換函數
    window.toggleDebugInfo = function(show) {
        if (show) {
            startDebugInfo();
        } else {
            stopDebugInfo();
        }
    };
}

/**
 * 開始顯示調試信息
 */
function startDebugInfo() {
    const debugInfo = document.createElement('div');
    debugInfo.id = 'debug-info';
    debugInfo.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 10px;
        font-family: monospace;
        z-index: 9998;
        max-width: 300px;
    `;
    
    document.body.appendChild(debugInfo);
    
    // 每秒更新一次調試信息
    window.debugInfoInterval = setInterval(() => {
        if (!game) return;
        
        try {
            const stats = game.getGameStats();
            const imageStats = typeof imageManager !== 'undefined' ? imageManager.getCacheStats() : { cached: 0, loading: 0 };
            
            debugInfo.innerHTML = `
                <strong>遊戲狀態:</strong><br>
                FPS: ${Math.round(1000 / 16.67)}<br>
                果實: ${stats.totalFruit}<br>
                產量: ${stats.productionPerSecond.toFixed(2)}/s<br>
                當前階層: ${stats.currentTier}<br>
                天氣: ${stats.currentWeather}<br>
                活躍效果: ${stats.activeBoosts}<br>
                <br>
                <strong>圖片快取:</strong><br>
                已快取: ${imageStats.cached}<br>
                載入中: ${imageStats.loading}<br>
                <br>
                <strong>記憶體:</strong><br>
                堆疊: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || 'N/A'}MB<br>
            `;
        } catch (error) {
            debugInfo.innerHTML = `<strong>調試信息錯誤:</strong><br>${error.message}`;
        }
    }, 1000);
}

/**
 * 停止顯示調試信息
 */
function stopDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        debugInfo.remove();
    }
    
    if (window.debugInfoInterval) {
        clearInterval(window.debugInfoInterval);
        delete window.debugInfoInterval;
    }
}

/**
 * 緊急恢復嘗試
 */
function attemptEmergencyRecovery() {
    console.log('嘗試緊急恢復...');
    
    try {
        // 清除可能損壞的存檔
        if (typeof GAME_CONFIG !== 'undefined' && GAME_CONFIG.SAVE_KEY) {
            localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
        }
        
        // 重新初始化遊戲
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
        if (typeof UI !== 'undefined') {
            UI.showNotification('3秒後將重新載入遊戲...', 'warning');
        }
        
    } catch (error) {
        console.error('緊急恢復失敗:', error);
        if (typeof UI !== 'undefined') {
            UI.showNotification('緊急恢復失敗，請手動重新整理頁面', 'error');
        }
    }
}

/**
 * 🔧 修復：記錄錯誤（可以擴展為發送到服務器）
 */
function logError(type, errorInfo) {
    // 🔧 修復：安全的錯誤日誌創建
    const errorLog = {
        type: type,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        gameVersion: typeof GAME_CONFIG !== 'undefined' ? GAME_CONFIG.VERSION : 'unknown'
    };
    
    // 🔧 修復：安全地添加錯誤信息
    try {
        if (errorInfo) {
            if (typeof errorInfo === 'object') {
                errorLog.message = errorInfo.message || 'Unknown error';
                errorLog.stack = errorInfo.stack || 'No stack trace';
            } else {
                errorLog.message = String(errorInfo);
            }
        } else {
            errorLog.message = 'No error information provided';
        }
    } catch (e) {
        errorLog.message = 'Error processing error information';
        console.error('處理錯誤信息時出錯:', e);
    }
    
    // 本地存儲錯誤日誌
    try {
        const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        logs.push(errorLog);
        
        // 只保留最近10個錯誤
        if (logs.length > 10) {
            logs.splice(0, logs.length - 10);
        }
        
        localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (e) {
        console.error('無法保存錯誤日誌:', e);
    }
    
    // 在開發模式下詳細輸出
    if (isDevelopmentMode()) {
        console.table(errorLog);
    }
}

/**
 * 性能監控
 */
function setupPerformanceMonitoring() {
    if (!isDevelopmentMode()) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    function measureFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
            
            // 如果FPS過低，發出警告
            if (fps < 30) {
                console.warn(`低FPS警告: ${fps}`);
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
}

/**
 * 檢查瀏覽器兼容性
 */
function checkBrowserCompatibility() {
    const requiredFeatures = [
        'localStorage',
        'JSON',
        'Promise',
        'fetch'
    ];
    
    const missingFeatures = [];
    
    requiredFeatures.forEach(feature => {
        if (typeof window[feature] === 'undefined') {
            missingFeatures.push(feature);
        }
    });
    
    if (missingFeatures.length > 0) {
        const message = `您的瀏覽器不支援以下功能：${missingFeatures.join(', ')}。遊戲可能無法正常運行。`;
        if (typeof UI !== 'undefined') {
            UI.showNotification(message, 'error', 10000);
        }
        console.error('瀏覽器兼容性問題:', missingFeatures);
        return false;
    }
    
    return true;
}

/**
 * 優雅關閉遊戲
 */
function shutdownGame() {
    console.log('正在關閉遊戲...');
    
    try {
        // 停止所有遊戲循環
        if (game && game.stopGameLoops) {
            game.stopGameLoops();
        }
        
        if (game && game.saveGame) {
            game.saveGame();
        }
        
        // 清理事件監聽器
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleModalOutsideClick);
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        
        // 清理調試功能
        if (window.debugInfoInterval) {
            clearInterval(window.debugInfoInterval);
        }
        
        console.log('遊戲已安全關閉');
        
    } catch (error) {
        console.error('關閉遊戲時出錯:', error);
    }
}

/**
 * 檢查並更新遊戲版本
 */
function checkGameVersion() {
    if (typeof GAME_CONFIG === 'undefined') return;
    
    const savedVersion = localStorage.getItem('gameVersion');
    const currentVersion = GAME_CONFIG.VERSION;
    
    if (savedVersion && savedVersion !== currentVersion) {
        console.log(`遊戲版本更新：${savedVersion} -> ${currentVersion}`);
        
        // 這裡可以加入版本遷移邏輯
        handleVersionUpdate(savedVersion, currentVersion);
        
        localStorage.setItem('gameVersion', currentVersion);
        if (typeof UI !== 'undefined') {
            UI.showNotification(`遊戲已更新到版本 ${currentVersion}！`, 'info', 5000);
        }
    } else if (!savedVersion) {
        localStorage.setItem('gameVersion', currentVersion);
    }
}

/**
 * 處理版本更新
 */
function handleVersionUpdate(oldVersion, newVersion) {
    // 根據版本差異執行不同的遷移策略
    console.log(`執行版本遷移：${oldVersion} -> ${newVersion}`);
    
    // 例如：
    // if (oldVersion === '1.0.0' && newVersion === '1.1.0') {
    //     // 執行1.0.0到1.1.0的遷移
    // }
}

/**
 * 頁面載入完成後自動啟動
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM內容載入完成');
    
    // 檢查瀏覽器兼容性
    if (!checkBrowserCompatibility()) {
        return;
    }
    
    // 檢查遊戲版本
    checkGameVersion();
    
    // 設置性能監控（開發模式）
    if (isDevelopmentMode()) {
        setupPerformanceMonitoring();
    }
    
    // 等待所有模組載入完成
    setTimeout(() => {
        console.log('開始初始化遊戲...');
        initGame();
    }, 100);
});

// 頁面卸載時清理
window.addEventListener('beforeunload', () => {
    shutdownGame();
});

// 暴露主要函數供全局使用
window.initGame = initGame;
window.shutdownGame = shutdownGame;

// 暴露版本信息
if (typeof GAME_CONFIG !== 'undefined') {
    window.GAME_VERSION = GAME_CONFIG.VERSION;
}

console.log(`🚀 main.js 載入完成`);
console.log('等待DOM載入完成...');