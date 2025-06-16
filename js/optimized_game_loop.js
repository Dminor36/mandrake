// ========== 優化的遊戲主循環 ==========

/**
 * 高性能遊戲循環系統
 * 使用requestAnimationFrame和時間差計算，避免固定間隔造成的性能問題
 */
class OptimizedGameLoop {
    constructor() {
        this.lastUpdate = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 100; // 100ms 固定步長
        this.maxFrameTime = 250;  // 最大幀時間，防止螺旋死亡
        
        this.updateCounters = {
            main: 0,
            ui: 0,
            save: 0,
            weather: 0
        };
        
        this.intervals = {
            ui: 200,        // UI更新間隔 (5FPS)
            save: 30000,    // 自動存檔間隔 (30秒)
            weather: 1000   // 天氣計時器更新間隔 (1秒)
        };
        
        this.isRunning = false;
        this.frameId = null;
    }

    /**
     * 啟動遊戲循環
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdate = performance.now();
        this.frameId = requestAnimationFrame((time) => this.gameLoop(time));
        console.log('🚀 優化遊戲循環已啟動');
    }

    /**
     * 停止遊戲循環
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        console.log('⏹️ 遊戲循環已停止');
    }

    /**
     * 主遊戲循環
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // 計算時間差
        const deltaTime = Math.min(currentTime - this.lastUpdate, this.maxFrameTime);
        this.lastUpdate = currentTime;
        this.accumulator += deltaTime;

        // 固定時間步進的遊戲邏輯更新
        while (this.accumulator >= this.fixedTimeStep) {
            this.updateGame(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
            this.updateCounters.main += this.fixedTimeStep;
        }

        // 基於時間間隔的其他更新
        this.updateUI(deltaTime);
        this.updateSave(deltaTime);
        this.updateWeather(deltaTime);

        // 安排下一幀
        this.frameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * 遊戲核心邏輯更新
     */
    updateGame(deltaTime) {
        if (!game || !game.data || !game.isInitialized) return;

        try {
            // 🔧 添加安全檢查
            if (!game.data.enhancementEffects) {
                console.warn('enhancementEffects 未初始化，跳過遊戲更新');
                return;
            }

            // 計算並增加果實產量 (每100ms)
            let production = game.getTotalProduction() * (deltaTime / 1000);
            
            // 🆕 幸運連擊檢查
            if (game.data.luckyStreak && 
                game.data.luckyStreak.remainingTriggers > 0 && 
                Date.now() < game.data.luckyStreak.endTime) {
                
                // 每次更新都有機會觸發幸運（降低觸發率）
                if (Math.random() < (game.data.luckyStreak.chance / 100) * (deltaTime / 1000)) {
                    production *= 2; // 雙倍產量
                    game.data.luckyStreak.remainingTriggers--;
                    
                    if (typeof UI !== 'undefined') {
                        UI.showNotification('🍀 幸運觸發！雙倍產量！', 'success', 1000);
                    }
                    
                    console.log(`幸運連擊觸發！剩餘次數: ${game.data.luckyStreak.remainingTriggers}`);
                    
                    if (game.data.luckyStreak.remainingTriggers <= 0) {
                        delete game.data.luckyStreak;
                        if (typeof UI !== 'undefined') {
                            UI.showNotification('幸運連擊效果已用完', 'info');
                        }
                    }
                }
            }
            
            if (!isNaN(production) && production > 0) {
                game.data.fruit += production;
                game.data.totalFruitEarned += production;
            }

            // 檢查階層解鎖
            game.checkTierUnlock();

            // 檢查獎勵時間
            game.checkRewardTime();

            // 清理過期的臨時效果
            game.cleanupExpiredBoosts();

            // 定期檢查強化條件
            if (typeof EnhancementSystem !== 'undefined') {
                EnhancementSystem.checkUnlockConditions();
            }

        } catch (error) {
            console.error('遊戲更新錯誤:', error);
            // 不要停止整個循環，只記錄錯誤
        }
    }

    /**
     * UI更新（降低頻率）
     */
    updateUI(deltaTime) {
        this.updateCounters.ui += deltaTime;
        
        if (this.updateCounters.ui >= this.intervals.ui) {
            this.updateCounters.ui = 0;
            
            if (typeof UI !== 'undefined') {
                try {
                    // 只更新必要的UI元素
                    UI.updateResources();
                    UI.updateRewardTimer();
                    UI.updateRewardStatus();
                    
                    // 較不重要的UI更新頻率更低
                    if (Math.random() < 0.3) { // 30%機率更新
                        UI.updateButtonStates();
                        UI.updateMandrakeList();
                    }
                } catch (error) {
                    console.error('UI更新錯誤:', error);
                }
            }
        }
    }

    /**
     * 自動存檔
     */
    updateSave(deltaTime) {
        this.updateCounters.save += deltaTime;
        
        if (this.updateCounters.save >= this.intervals.save) {
            this.updateCounters.save = 0;
            
            if (game && game.saveGame) {
                try {
                    game.saveGame();
                    console.log('🔄 自動存檔完成');
                } catch (error) {
                    console.error('自動存檔錯誤:', error);
                }
            }
        }
    }

    /**
     * 天氣系統更新
     */
    updateWeather(deltaTime) {
        this.updateCounters.weather += deltaTime;
        
        if (this.updateCounters.weather >= this.intervals.weather) {
            this.updateCounters.weather = 0;
            
            if (game && game.updateWeatherTimer) {
                try {
                    game.updateWeatherTimer();
                } catch (error) {
                    console.error('天氣更新錯誤:', error);
                }
            }
        }
    }

    /**
     * 獲取性能統計
     */
    getPerformanceStats() {
        return {
            isRunning: this.isRunning,
            fixedTimeStep: this.fixedTimeStep,
            maxFrameTime: this.maxFrameTime,
            updateIntervals: this.intervals,
            updateCounters: { ...this.updateCounters }
        };
    }

    /**
     * 調整性能設置
     */
    adjustPerformance(settings) {
        if (settings.uiInterval) {
            this.intervals.ui = Math.max(100, settings.uiInterval);
        }
        if (settings.fixedTimeStep) {
            this.fixedTimeStep = Math.max(50, settings.fixedTimeStep);
        }
        if (settings.maxFrameTime) {
            this.maxFrameTime = Math.max(100, settings.maxFrameTime);
        }
        
        console.log('⚙️ 性能設置已調整:', settings);
    }
}

/**
 * 頁面可見性優化
 */
class VisibilityOptimizer {
    constructor(gameLoop) {
        this.gameLoop = gameLoop;
        this.wasHidden = false;
        this.setupVisibilityListener();
    }

    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
    }

    onPageHidden() {
        console.log('📱 頁面隱藏，降低性能消耗');
        this.wasHidden = true;
        
        // 降低更新頻率
        this.gameLoop.adjustPerformance({
            uiInterval: 1000,      // UI更新降到1秒一次
            fixedTimeStep: 1000    // 遊戲邏輯降到1秒一次
        });
        
        // 自動保存
        if (game && game.saveGame) {
            game.saveGame();
        }
    }

    onPageVisible() {
        if (this.wasHidden) {
            console.log('📱 頁面恢復顯示，恢復正常性能');
            this.wasHidden = false;
            
            // 恢復正常更新頻率
            this.gameLoop.adjustPerformance({
                uiInterval: 200,     // 恢復正常UI更新
                fixedTimeStep: 100   // 恢復正常遊戲邏輯
            });
            
            // 全面更新UI
            if (typeof UI !== 'undefined') {
                setTimeout(() => {
                    UI.updateAll();
                }, 100);
            }
        }
    }
}

/**
 * 性能監控器
 */
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.isMonitoring = false;
    }

    start() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.monitor();
    }

    stop() {
        this.isMonitoring = false;
    }

    monitor() {
        if (!this.isMonitoring) return;

        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
            
            // 如果FPS過低，發出警告
            if (this.fps < 20) {
                console.warn(`⚠️ 低FPS警告: ${this.fps}`);
                
                // 可以在這裡自動調整性能設置
                if (window.optimizedGameLoop) {
                    window.optimizedGameLoop.adjustPerformance({
                        uiInterval: 500,      // 降低UI更新頻率
                        fixedTimeStep: 200    // 降低遊戲邏輯頻率
                    });
                }
            }
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame(() => this.monitor());
    }

    getFPS() {
        return this.fps;
    }
}

// 創建全局實例
window.optimizedGameLoop = new OptimizedGameLoop();
window.visibilityOptimizer = new VisibilityOptimizer(window.optimizedGameLoop);

// 開發模式下啟用性能監控
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:') {
    window.performanceMonitor = new PerformanceMonitor();
    window.performanceMonitor.start();
    
    // 暴露性能調試工具
    window.debugPerformance = {
        getFPS: () => window.performanceMonitor.getFPS(),
        getStats: () => window.optimizedGameLoop.getPerformanceStats(),
        adjustPerformance: (settings) => window.optimizedGameLoop.adjustPerformance(settings),
        startLoop: () => window.optimizedGameLoop.start(),
        stopLoop: () => window.optimizedGameLoop.stop()
    };
}

// 優雅的啟動函數
window.startOptimizedGameLoop = function() {
    if (window.optimizedGameLoop && !window.optimizedGameLoop.isRunning) {
        window.optimizedGameLoop.start();
        console.log('🎮 優化遊戲循環已啟動');
        return true;
    }
    return false;
};

// 優雅的停止函數
window.stopOptimizedGameLoop = function() {
    if (window.optimizedGameLoop && window.optimizedGameLoop.isRunning) {
        window.optimizedGameLoop.stop();
        console.log('⏹️ 優化遊戲循環已停止');
        return true;
    }
    return false;
};

console.log('⚡ 優化遊戲循環系統載入完成');