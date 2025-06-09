// ========== 核心遊戲邏輯 ==========

class Game {
    constructor() {
        this.data = this.getDefaultGameData();
        this.intervals = {};
        this.isInitialized = false;
    }

    /**
     * 獲取預設遊戲數據
     */
    getDefaultGameData() {
        return {
            // 基礎資源
            fruit: 100,
            talentPoints: 0,
            totalFruitEarned: 0,
            rebirthCount: 0,
            
            // 曼德拉草相關
            currentTier: 1,
            unlockedMandrakes: ['original'],
            ownedMandrakes: { original: 0 },
            
            // 農場系統
            farmSlots: Array(GAME_CONFIG.FARM_TOTAL_SLOTS).fill(null),
            
            // 天氣系統
            weather: 'sunny',
            weatherLocked: null,
            
            
            // 特殊效果
            freeWeatherReroll: false,
            forceNextType: null,
            nextUnlockBonus: false,

            // 獎勵系統 - 改為累計模式
            lastRewardTime: Date.now(),
            pendingRewards: 0,           // 待領取的獎勵數量
            maxPendingRewards: 2,        // 最大累計數量（可通過天賦擴展）
            generatedRewards: [], // 預生成的獎勵列表
            tempBoosts: {},

            // 強化系統數據
            enhancements: {
                obtained: {},
                mandrakeProgress: {},
                pendingEnhancement: false,
                currentChoices: [],
                pendingCount: 0
            },

            // 強化效果數據
            enhancementEffects: {
                // 產量加成
                globalProductionMultiplier: 1.0,
                typeProductionMultipliers: {
                    normal: 1.0,
                    element: 1.0,
                    animal: 1.0
                },

                // 成本減免
                globalCostMultiplier: 1.0,
                typeCostMultipliers: {
                    normal: 1.0,
                    element: 1.0,
                    animal: 1.0
                },

                // 運氣效果標記
                hasProductionVariance: false,
                hasPurchaseCrit: false,
                hasCostVariance: false,

                // 獎勵效果
                rewardCdMultiplier: 1.0,
                bonusRewardCapacity: 0,
                rewardRarityBoost: 0,

                // Combo效果標記
                hasQuantityBonus: false,
                hasTypeSynergy: false,
                hasDiversityBonus: false,

                // 保存的運氣因子
                savedProductionVariance: null,
                savedCostVariance: null,

                globalProductionVariance: 1.0
            },

            // 版本控制
            version: GAME_CONFIG.VERSION,
            lastSaveTime: Date.now()
        };
    }

    /**
     * 初始化遊戲
     */
    async init() {
        console.log('遊戲初始化開始...');
        
        try {
            // 載入存檔
            this.loadGame();
            
            // 預載入圖片
            if (typeof imageManager !== 'undefined') {
                await imageManager.preloadUnlocked(this.data.unlockedMandrakes);
            }
            
            // 啟動遊戲循環
            this.startGameLoops();
            
            // 初始化UI
            setTimeout(() => {
                if (typeof UI !== 'undefined') {
                    UI.updateAll();
                }
            }, 100);
            
            this.isInitialized = true;
            console.log('遊戲初始化完成！');
            
        } catch (error) {
            console.error('遊戲初始化失敗:', error);
            // 使用預設數據重新開始
            this.data = this.getDefaultGameData();
            this.startGameLoops();
            if (typeof UI !== 'undefined') {
                UI.updateAll();
            }
        }
    }

    /**
     * 啟動遊戲循環
     */
    startGameLoops() {
        // 主遊戲循環 (每秒)
        this.intervals.main = setInterval(() => {
            this.gameLoop();
        }, 100);

        // 自動存檔循環
        this.intervals.autosave = setInterval(() => {
            this.saveGame();
        }, GAME_CONFIG.AUTOSAVE_INTERVAL);

        // 天氣變化循環
        this.intervals.weather = setInterval(() => {
            this.changeWeather();
        }, GAME_CONFIG.WEATHER_CHANGE_INTERVAL);
    }

    /**
     * 主遊戲循環
     */
    gameLoop() {
        // 計算並增加果實產量
        const production = this.getTotalProduction()/10; // 每100毫秒計算一次產量
        this.data.fruit += production;
        this.data.totalFruitEarned += production;

        // 檢查獎勵時間
        this.checkRewardTime();

        // 清理過期的臨時效果
        this.cleanupExpiredBoosts();

        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.updateResources();
            UI.updateRewardTimer();
            UI.updateRewardStatus();  
        }
    }

    /**
     * 獲取總曼德拉草數量
     */
    static getTotalMandrakeCount() {
        return Object.values(window.game.data.ownedMandrakes).reduce((sum, count) => sum + count, 0);
    }

    /**
     * 獲取總產量
     */
    getTotalProduction() {
        let total = 0;
        
        for (const [id, count] of Object.entries(this.data.ownedMandrakes)) {
            if (count > 0) {
                const config = MANDRAKE_CONFIG[id];
                if (config) {
                    const production = config.baseProduction * Math.pow(config.prodGrowth, count);
                    const weatherMultiplier = this.getWeatherMultiplier(config.type);
                    const tempBoost = this.getTempBoostMultiplier('production');
                    const typeBoost = this.getTempBoostMultiplier(config.type);
                    
                    total += count * production * weatherMultiplier * tempBoost * typeBoost;
                }
            }
        }
        
        return total;
    }

    /**
     * 獲取天氣倍率
     */
    getWeatherMultiplier(type) {
        const weather = WEATHER_CONFIG[this.data.weather];
        if (!weather) return 1;
        
        if (weather.getMultiplier) {
            return weather.getMultiplier(type);
        }
        return weather.multiplier || 1;
    }

    /**
     * 獲取臨時加成倍率
     */
    getTempBoostMultiplier(type) {
        const boost = this.data.tempBoosts[type];
        if (boost && Date.now() < boost.endTime) {
            return boost.multiplier;
        }
        return 1;
    }

    /**
     * 清理過期的臨時效果
     */
    cleanupExpiredBoosts() {
        const now = Date.now();
        for (const [type, boost] of Object.entries(this.data.tempBoosts)) {
            if (now >= boost.endTime) {
                delete this.data.tempBoosts[type];
            }
        }
    }

    /**
     * 獲取當前成本
     */
    getCurrentCost(id) {
        const count = this.data.ownedMandrakes[id] || 0;
        const config = MANDRAKE_CONFIG[id];
        if (!config) return 0;
        
        return Math.floor(config.baseCost * Math.pow(config.costGrowth, count));
    }

    /**
     * 購買曼德拉草
     */
    buyMandrake(id) {
        const cost = this.getCurrentCost(id);
        
        if (this.data.fruit >= cost) {
            this.data.fruit -= cost;
            this.data.ownedMandrakes[id] = (this.data.ownedMandrakes[id] || 0) + 1;
            
            // 在農場中種植
            this.plantInFarm(id);
            
            // 檢查階層解鎖
            this.checkTierUnlock();
            
            // 更新UI
            if (typeof UI !== 'undefined') {
                UI.updateAll();
            }
            
            // 自動存檔
            this.saveGame();
            
            return true;
        }
        
        return false;
    }

    /**
     * 在農場中種植
     */
    plantInFarm(id) {
        const emptySlotIndex = this.data.farmSlots.findIndex(slot => slot === null);
        
        if (emptySlotIndex !== -1) {
            this.data.farmSlots[emptySlotIndex] = {
                type: id,
                plantedAt: Date.now()
            };
            
            if (typeof UI !== 'undefined') {
                UI.updateFarmVisual();
            }
        }
    }

    /**
     * 檢查階層解鎖
     */
    checkTierUnlock() {
        const nextTier = this.data.currentTier + 1;
        const unlockCondition = TIER_UNLOCK_CONDITIONS[nextTier];
        
        if (unlockCondition && unlockCondition()) {
            this.unlockNextTier(nextTier);
        }
    }

    /**
     * 解鎖下一階層
     */
    async unlockNextTier(tier) {
        this.data.currentTier = tier;
        
        // 獲取該階層的選項
        const tierOptions = Object.entries(MANDRAKE_CONFIG)
            .filter(([id, config]) => config.tier === tier)
            .map(([id, config]) => ({ id, ...config }));
        
        if (tierOptions.length === 0) return;
        
        // 應用強制類型（如果有）
        let availableOptions = tierOptions;
        if (this.data.forceNextType) {
            const filteredOptions = tierOptions.filter(option => option.type === this.data.forceNextType);
            if (filteredOptions.length > 0) {
                availableOptions = filteredOptions;
            }
            delete this.data.forceNextType;
        }

        // 隨機選擇一個曼德拉草
        const randomChoice = availableOptions[Math.floor(Math.random() * availableOptions.length)];
        
        // 解鎖新曼德拉草
        this.data.unlockedMandrakes.push(randomChoice.id);
        this.data.ownedMandrakes[randomChoice.id] = 0;
        
        // 預載入新曼德拉草的圖片
        if (typeof imageManager !== 'undefined') {
            await imageManager.loadMandrakeImage(randomChoice.id);
        }
        
        // 顯示解鎖通知
        if (typeof UI !== 'undefined') {
            UI.showNotification(`解鎖新曼德拉草：${randomChoice.name} ${randomChoice.icon}！`, 'success');
        }
        
        // 如果有額外獎勵
        if (this.data.nextUnlockBonus) {
            this.data.talentPoints += 1;
            if (typeof UI !== 'undefined') {
                UI.showNotification('額外獲得 1 天賦點數！', 'info');
            }
            delete this.data.nextUnlockBonus;
        }
        
        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.updateAll();
        }
    }

    /**
     * 檢查獎勵時間
     */
    checkRewardTime() {
        // 如果獎勵已滿，重置計時並停止檢查
        if (this.data.pendingRewards >= this.data.maxPendingRewards) {
            this.data.lastRewardTime = Date.now();
            return;
        }

        const adjustedInterval =
            GAME_CONFIG.REWARD_INTERVAL * this.data.enhancementEffects.rewardCdMultiplier;
        const timeSinceReward = Date.now() - this.data.lastRewardTime;

        // 檢查是否應該增加待領取獎勵
        if (timeSinceReward >= adjustedInterval) {
            // 計算可以累積幾次獎勵
            const rewardsToAdd = Math.floor(timeSinceReward / adjustedInterval);

            // 增加待領取獎勵，但不超過上限
            const oldPendingRewards = this.data.pendingRewards;
            const newPendingRewards = Math.min(
                this.data.pendingRewards + rewardsToAdd,
                this.data.maxPendingRewards
            );

            // 如果有新的獎勵可以領取
            if (newPendingRewards > oldPendingRewards) {
                // 為新增的獎勵預生成獎勵內容
                const rewardsAdded = newPendingRewards - oldPendingRewards;
                for (let i = 0; i < rewardsAdded; i++) {
                    this.generateNewReward();
                }

                this.data.pendingRewards = newPendingRewards;

                // 立即更新獎勵狀態UI
                if (typeof UI !== 'undefined') {
                    UI.updateRewardStatus();
                }

                // 顯示通知
                if (typeof UI !== 'undefined') {
                    const message = newPendingRewards === this.data.maxPendingRewards ?
                        '🎁 獎勵已滿！記得領取哦～' :
                        `🎁 新獎勵可領取！(${this.data.pendingRewards}/${this.data.maxPendingRewards})`;
                    UI.showNotification(message, 'info');
                }
            }

            // 更新最後領獎時間，考慮強化影響的間隔
            const remainder = timeSinceReward % adjustedInterval;
            this.data.lastRewardTime =
                newPendingRewards >= this.data.maxPendingRewards
                    ? Date.now()
                    : Date.now() - remainder;
        }
    }

    // 生成單個獎勵的函數
generateNewReward() {

   const rewardOptions = [];
    
    // 生成3個不同的獎勵選項
    for (let i = 0; i < 3; i++) {
        // 先決定稀有度
        let rarity = this.selectRarity();
        
        // 再選擇獎勵類型
        let template = this.selectRewardTemplate();

        // 添加安全檢查
    if (!template) {
        console.error('無法獲取獎勵模板！');
        // 嘗試手動選擇一個模板
        const templateKeys = Object.keys(REWARD_TEMPLATES);
        if (templateKeys.length > 0) {
            const fallbackTemplate = REWARD_TEMPLATES[templateKeys[0]];
            template = fallbackTemplate;
            console.log('使用備用模板:', template.name);
        } else {
            continue;
        }
    }
    
        // 獲取對應稀有度的配置
        let tier = template.tiers[rarity];

        // 檢查 tier 是否存在
        if (!tier) {
        console.error(`獎勵模板 ${template.name} 沒有 ${rarity} 稀有度配置！`);
        // 使用 common 稀有度作為備用
        const fallbackTier = template.tiers['common'];
        if (!fallbackTier) {
            console.error(`獎勵模板 ${template.name} 連 common 稀有度都沒有！`);
            continue;
        }
        tier = fallbackTier;
        rarity = 'common';
        }
        
        const option = {
            template: template,
            rarity: rarity,
            tier: tier,
            rarityInfo: RARITY_CONFIG[rarity]
        };
        
        rewardOptions.push(option);
        console.log(`獎勵選項 ${i+1}:`, option.template.name, option.rarity);
    }
    
    // 確保至少有一個有效選項
        if (rewardOptions.length === 0) {
            console.error('沒有生成任何有效的獎勵選項！');
            return;
        }

    const reward = {
        id: Date.now() + Math.random(), // 唯一ID
        options: rewardOptions,         // 3個選項
        generatedAt: Date.now()
    };
    
    // 添加到預生成獎勵列表
    this.data.generatedRewards.push(reward);
    console.log('成功生成獎勵組:', reward);
}
// 稀有度選擇邏輯
selectRarity() {
    const weights = {};
    let totalWeight = 0;

    for (const [rarityName, rarity] of Object.entries(RARITY_CONFIG)) {
        let weight = rarity.weight;

        if (this.data.weather === 'misty' && rarityName !== 'common') {
            weight *= WEATHER_CONFIG.misty.bonusRarity || 1;
        }

        // 強化：提升非普通稀有度的機率
        if (this.data.enhancementEffects.rewardRarityBoost > 0 && rarityName !== 'common') {
            weight *= 1 + this.data.enhancementEffects.rewardRarityBoost;
        }

        weights[rarityName] = weight;
        totalWeight += weight;
    }

    let random = Math.random() * totalWeight;
    for (const [rarityName, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            return rarityName;
        }
    }

    return 'common';
}

// 獎勵模板選擇邏輯
selectRewardTemplate() {
    // 檢查 REWARD_TEMPLATES 是否存在
    if (typeof REWARD_TEMPLATES === 'undefined') {
        console.error('REWARD_TEMPLATES 未定義！');
        return null;
    }
    
    const templates = Object.values(REWARD_TEMPLATES);
    if (templates.length === 0) {
        console.error('REWARD_TEMPLATES 是空的！');
        return null;
    }
    
    return templates[Math.floor(Math.random() * templates.length)];
}

    /**
     * 改變天氣
     */
    changeWeather() {
        // 檢查天氣是否被鎖定
        if (this.data.weatherLocked && Date.now() < this.data.weatherLocked) {
            return;
        }
        
        // 獲取可用天氣（排除特殊天氣）
        const availableWeathers = Object.entries(WEATHER_CONFIG)
            .filter(([type, config]) => !config.isSpecial)
            .map(([type]) => type);
        
        // 隨機選擇天氣
        const newWeather = availableWeathers[Math.floor(Math.random() * availableWeathers.length)];
        
        if (newWeather !== this.data.weather) {
            this.data.weather = newWeather;
            const weatherConfig = WEATHER_CONFIG[newWeather];
            if (typeof UI !== 'undefined') {
                UI.showNotification(`天氣變為 ${weatherConfig.name}！`, 'info');
                UI.updateWeather();
            }
        }
    }

    /**
     * 重骰天氣
     */
    rerollWeather() {
        const cost = this.data.freeWeatherReroll ? 0 : 100;
        
        if (this.data.fruit >= cost) {
            this.data.fruit -= cost;
            this.data.freeWeatherReroll = false;
            
            this.changeWeather();
            
            const message = cost === 0 ? '免費重骰天氣成功！' : '天氣已重新隨機！';
            if (typeof UI !== 'undefined') {
                UI.showNotification(message, 'success');
                UI.updateAll();
            }
            
            this.saveGame();
        } else {
            if (typeof UI !== 'undefined') {
                UI.showNotification('果實不足！', 'error');
            }
        }
    }

    /**
     * 應用臨時加成
     */
    applyTempBoost(type, multiplier, duration) {
        this.data.tempBoosts[type] = {
            multiplier: multiplier,
            endTime: Date.now() + duration
        };
        
        const endTime = new Date(Date.now() + duration).toLocaleTimeString();
        if (typeof UI !== 'undefined') {
            UI.showNotification(`${type} 效果已啟動！持續到 ${endTime}`, 'success');
        }
    }

    /**
     * 重生
     */
    rebirth() {
        const points = this.calculateRebirthPoints();
        
        if (points === 0) {
            if (typeof UI !== 'undefined') {
                UI.showNotification('需要獲得更多果實才能重生！', 'warning');
            }
            return;
        }
        
        if (confirm(`確定要重生嗎？這會重置所有進度，但獲得 ${points} 天賦點數！`)) {
            // 獲得天賦點數
            this.data.talentPoints += points;
            
            // 記錄重生次數
            this.data.rebirthCount++;
            
            // 重置遊戲狀態
            const preservedData = {
                talentPoints: this.data.talentPoints,
                rebirthCount: this.data.rebirthCount,
                version: this.data.version
            };
            
            this.data = { ...this.getDefaultGameData(), ...preservedData };
            
            // 清理圖片快取
            if (typeof imageManager !== 'undefined') {
                imageManager.clearCache();
                imageManager.preloadUnlocked(['original']);
            }
            
            if (typeof UI !== 'undefined') {
                UI.showNotification(`重生完成！獲得 ${points} 天賦點數！`, 'success');
                UI.updateAll();
            }
            
            this.saveGame();
        }
    }

    /**
     * 計算重生點數
     */
    calculateRebirthPoints() {
        return Math.floor(Math.sqrt(this.data.totalFruitEarned / GAME_CONFIG.REBIRTH_COST_DIVISOR));
    }

    /**
     * 獲取已使用的農場格子數量
     */
    getUsedFarmSlots() {
        return this.data.farmSlots.filter(slot => slot !== null).length;
    }

    /**
     * 保存遊戲
     */
    saveGame() {
        try {
            this.data.lastSaveTime = Date.now();
            const saveData = JSON.stringify(this.data);
            localStorage.setItem(GAME_CONFIG.SAVE_KEY, saveData);
        } catch (error) {
            console.error('保存遊戲失敗:', error);
            if (typeof UI !== 'undefined') {
                UI.showNotification('保存遊戲失敗！', 'error');
            }
        }
    }

    /**
     * 載入遊戲
     */
    loadGame() {
        try {
            const savedData = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // 版本兼容性檢查
                if (this.isCompatibleSave(parsedData)) {
                    this.data = { ...this.getDefaultGameData(), ...parsedData };
                    
                    // 數據完整性檢查
                    this.validateGameData();
                    
                    console.log('遊戲存檔載入成功');
                } else {
                    console.warn('存檔版本不兼容，使用預設數據');
                    this.data = this.getDefaultGameData();
                }
            } else {
                console.log('未找到存檔，使用預設數據');
                this.data = this.getDefaultGameData();
            }
        } catch (error) {
            console.error('載入遊戲失敗:', error);
            this.data = this.getDefaultGameData();
            if (typeof UI !== 'undefined') {
                UI.showNotification('載入存檔失敗，重新開始遊戲', 'warning');
            }
        }
    }

    /**
     * 檢查存檔兼容性
     */
    isCompatibleSave(saveData) {
        if (!saveData.version) return false;
        
        const majorVersion = saveData.version.split('.')[0];
        const currentMajorVersion = GAME_CONFIG.VERSION.split('.')[0];
        
        return majorVersion === currentMajorVersion;
    }

    /**
     * 驗證遊戲數據完整性
     */
    validateGameData() {
        const defaultData = this.getDefaultGameData();
        
        for (const [key, defaultValue] of Object.entries(defaultData)) {
            if (this.data[key] === undefined) {
                this.data[key] = defaultValue;
            }
        }
        
        // 驗證農場格子數量
        if (!Array.isArray(this.data.farmSlots) || this.data.farmSlots.length !== GAME_CONFIG.FARM_TOTAL_SLOTS) {
            this.data.farmSlots = Array(GAME_CONFIG.FARM_TOTAL_SLOTS).fill(null);
        }
        
        // 驗證已解鎖的曼德拉草
        if (!Array.isArray(this.data.unlockedMandrakes) || this.data.unlockedMandrakes.length === 0) {
            this.data.unlockedMandrakes = ['original'];
        }
        
        // 驗證擁有的曼德拉草
        if (typeof this.data.ownedMandrakes !== 'object') {
            this.data.ownedMandrakes = { original: 0 };
        }
        
        // 驗證臨時加成
        if (typeof this.data.tempBoosts !== 'object') {
            this.data.tempBoosts = {};
        }
        
        // 清理過期的臨時加成
        this.cleanupExpiredBoosts();

        // 驗證預生成獎勵列表的新結構
        if (!Array.isArray(this.data.generatedRewards)) {
            this.data.generatedRewards = [];
        }
        
        // 清理過期的獎勵（超過24小時的獎勵自動清除）
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.data.generatedRewards = this.data.generatedRewards.filter(
            reward => reward.generatedAt > oneDayAgo
        );
        
        // 驗證獎勵組結構
        this.data.generatedRewards = this.data.generatedRewards.filter(reward => {
            return reward.options && Array.isArray(reward.options) && reward.options.length === 3;
        });
        
        // 確保預生成獎勵數量與待領取數量一致
        if (this.data.generatedRewards.length < this.data.pendingRewards) {
            // 如果預生成獎勵不足，補充生成
            const needToGenerate = this.data.pendingRewards - this.data.generatedRewards.length;
            for (let i = 0; i < needToGenerate; i++) {
                this.generateNewReward();
            }
        } else if (this.data.generatedRewards.length > this.data.pendingRewards) {
            // 如果預生成獎勵過多，截斷多餘的
            this.data.generatedRewards = this.data.generatedRewards.slice(0, this.data.pendingRewards);
        }

        // ✅ 重建獎勵模板引用
        this.data.generatedRewards = this.data.generatedRewards.map(reward => {
        reward.options = reward.options.map(option => {
            // 重新從 REWARD_TEMPLATES 中獲取完整的模板
            const templateName = option.template.name;
            let fullTemplate = null;
            
            // 尋找對應的模板
            for (const [key, template] of Object.entries(REWARD_TEMPLATES)) {
                if (template.name === templateName) {
                    fullTemplate = template;
                    break;
                }
            }
            
            if (fullTemplate) {
                option.template = fullTemplate;
            } else {
                console.warn('找不到對應的獎勵模板:', templateName);
            }
            
            return option;
        });
        return reward;
        });
    }

    /**
     * 重置遊戲（調試用）
     */
    resetGame() {
        if (confirm('確定要重置遊戲嗎？這將刪除所有進度！')) {
            localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
            this.data = this.getDefaultGameData();
            if (typeof imageManager !== 'undefined') {
                imageManager.clearCache();
            }
            if (typeof UI !== 'undefined') {
                UI.updateAll();
                UI.showNotification('遊戲已重置！', 'info');
            }
        }
    }

    /**
     * 停止遊戲循環（清理用）
     */
    stopGameLoops() {
        for (const [name, intervalId] of Object.entries(this.intervals)) {
            clearInterval(intervalId);
            delete this.intervals[name];
        }
    }

    /**
     * 獲取遊戲統計信息
     */
    getGameStats() {
        return {
            // 基礎統計
            totalFruit: Math.floor(this.data.fruit),
            totalMandrakes: Game.getTotalMandrakeCount(),
            productionPerSecond: this.getTotalProduction(),
            talentPoints: this.data.talentPoints,
            rebirthCount: this.data.rebirthCount,
            
            // 時間統計
            playTime: Date.now() - (this.data.lastSaveTime || Date.now()),
            lastSave: new Date(this.data.lastSaveTime).toLocaleString(),
            
            // 進度統計
            currentTier: this.data.currentTier,
            unlockedCount: this.data.unlockedMandrakes.length,
            maxTier: Math.max(...Object.values(MANDRAKE_CONFIG).map(config => config.tier)),
            
            // 農場統計
            farmUsage: `${this.getUsedFarmSlots()}/${GAME_CONFIG.FARM_TOTAL_SLOTS}`,
            
            // 天氣統計
            currentWeather: this.data.weather,
            weatherLocked: this.data.weatherLocked ? new Date(this.data.weatherLocked).toLocaleString() : null,
            
            // 效果統計
            activeBoosts: Object.keys(this.data.tempBoosts).length
        };
    }
}

// 創建全局遊戲實例
console.log('🎮 正在創建 Game 實例...');
window.game = new Game();
console.log('✅ Game 實例創建完成:', window.game);

// 暴露Game類供其他模組使用
window.Game = Game;

console.log('🎮 game.js 載入完成');

