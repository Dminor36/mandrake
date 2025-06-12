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
            weatherTimer: 300,  
            lastWeatherChange: Date.now(), 
            
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

            // 🔧 修復：強化系統數據結構
            enhancements: {
                obtained: {},
                mandrakeProgress: {},  // 記錄每個品種的里程碑進度
                lastChecked: {},       // 記錄每個品種上次檢查的最高里程碑
                pendingEnhancement: false,
                currentChoices: [],
                pendingCount: 0        // 待處理的強化數量
            },

            // 🔧 修復：強化效果數據結構 - 初始化所有必要字段
            enhancementEffects: {
                // 基礎倍率
                globalProductionMultiplier: 1.0,
                globalCostMultiplier: 1.0,
                rewardCdMultiplier: 1.0,
                globalProductionVariance: 1.0,
                
                // 類型特定倍率
                typeProductionMultipliers: {
                    normal: 1.0,
                    element: 1.0,
                    animal: 1.0
                },
                typeCostMultipliers: {
                    normal: 1.0,
                    element: 1.0,
                    animal: 1.0
                },
                
                // 布林標記
                hasProductionVariance: false,
                hasPurchaseCrit: false,
                hasCostVariance: false,
                hasQuantityBonus: false,
                hasTypeSynergy: false,
                hasDiversityBonus: false,
                
                // 獎勵相關
                bonusRewardCapacity: 0,
                rewardRarityBoost: 0,
                
                // 保存的隨機值
                savedProductionVariance: null,
                savedCostVariance: null
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
            
            // 🔧 確保數據完整性
            this.validateGameData();
            
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

        // 天氣倒數循環（每秒更新）
        this.intervals.weatherTimer = setInterval(() => {
            this.updateWeatherTimer();
        }, 1000);

        // 天氣變化循環
        this.intervals.weather = setInterval(() => {
            this.changeWeather();
        }, GAME_CONFIG.WEATHER_CHANGE_INTERVAL);
    }

    updateWeatherTimer() {
        if (!this.data) return;
        
        // 倒數減1
        if (this.data.weatherTimer > 0) {
            this.data.weatherTimer--;
        } else {
            // 時間到了，重置倒數
            this.data.weatherTimer = GAME_CONFIG.WEATHER_CHANGE_INTERVAL / 1000; // 轉換為秒
            this.data.lastWeatherChange = Date.now();
        }
        
        // 更新UI顯示
        if (typeof UI !== 'undefined') {
            UI.updateWeatherTimer();
        }
    }

    /**
     * 主遊戲循環
     */
    gameLoop() {
        // 🔧 添加安全檢查
        if (!this.data || !this.data.enhancementEffects) {
            console.warn('遊戲數據未完全初始化，跳過此次循環');
            return;
        }

        // 計算並增加果實產量
        const production = this.getTotalProduction()/10; // 每100毫秒計算一次產量
        if (!isNaN(production) && production > 0) {
            this.data.fruit += production;
            this.data.totalFruitEarned += production;
        }

        // 檢查獎勵時間
        this.checkRewardTime();

        // 清理過期的臨時效果
        this.cleanupExpiredBoosts();
        
        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.updateResources();
            UI.updateRewardTimer();
            UI.updateRewardStatus();  
            UI.updateButtonStates();
        }

        // 定期檢查強化條件
        if (typeof EnhancementSystem !== 'undefined') {
            EnhancementSystem.checkUnlockConditions();
        }
    }

    /**
     * 獲取總曼德拉草數量
     */
    static getTotalMandrakeCount() {
        if (!window.game || !window.game.data || !window.game.data.ownedMandrakes) {
            return 0;
        }
        return Object.values(window.game.data.ownedMandrakes).reduce((sum, count) => sum + count, 0);
    }

    /**
     * 計算單一品種的產量（包含所有效果和詳細分解）
     */
    calculateSingleMandrakeProduction(id, count, showDetails = false) {
        if (count === 0) return showDetails ? {total: 0, breakdown: [], effects: []} : 0;
        
        const config = MANDRAKE_CONFIG[id];
        if (!config) return showDetails ? {total: 0, breakdown: [], effects: []} : 0;
        
        // 🔧 添加安全檢查
        if (!this.data.enhancementEffects) {
            console.warn('enhancementEffects 未初始化');
            return showDetails ? {total: 0, breakdown: [], effects: []} : 0;
        }
        
        let production = count * config.baseProduction;
        const breakdown = [];
        const effects = [];
        
        if (showDetails) {
            breakdown.push({
                name: '基礎產量',
                value: production,
                detail: `${count}株 × ${config.baseProduction}`
            });
        }
        
        const gameEffects = this.data.enhancementEffects;
        
        // 全體產量加成
        if (gameEffects.globalProductionMultiplier && gameEffects.globalProductionMultiplier !== 1.0) {
            const oldProduction = production;
            production *= gameEffects.globalProductionMultiplier;
            const increase = production - oldProduction;
            if (showDetails) {
                breakdown.push({
                    name: '全體產量加成',
                    value: increase,
                    detail: `×${gameEffects.globalProductionMultiplier.toFixed(2)} (+${((gameEffects.globalProductionMultiplier - 1) * 100).toFixed(1)}%)`
                });
                effects.push({
                    source: '全面發展',
                    level: this.data.enhancements.obtained['stable_global_production'] || 0,
                    effect: `全體產量 +${((gameEffects.globalProductionMultiplier - 1) * 100).toFixed(1)}%`
                });
            }
        }
        
        // 類型特定加成
        const typeMultiplier = gameEffects.typeProductionMultipliers[config.type] || 1.0;
        if (typeMultiplier !== 1.0) {
            const oldProduction = production;
            production *= typeMultiplier;
            const increase = production - oldProduction;
            if (showDetails) {
                const typeName = {normal: '普通', element: '元素', animal: '動物'}[config.type];
                breakdown.push({
                    name: `${typeName}系加成`,
                    value: increase,
                    detail: `×${typeMultiplier.toFixed(2)} (+${((typeMultiplier - 1) * 100).toFixed(1)}%)`
                });
                
                // 記錄對應的強化來源
                const enhancementKey = `stable_${config.type}_production`;
                if (this.data.enhancements.obtained[enhancementKey]) {
                    effects.push({
                        source: ENHANCEMENTS[enhancementKey]?.name || `${typeName}專精`,
                        level: this.data.enhancements.obtained[enhancementKey],
                        effect: `${typeName}系產量 +${((typeMultiplier - 1) * 100).toFixed(1)}%`
                    });
                }
            }
        }
        
        // 多元發展加成
        if (gameEffects.hasDiversityBonus) {
            const hasNormal = Object.entries(this.data.ownedMandrakes).some(([mandrakeId, mandrakeCount]) => 
                mandrakeCount > 0 && MANDRAKE_CONFIG[mandrakeId]?.type === 'normal'
            );
            const hasElement = Object.entries(this.data.ownedMandrakes).some(([mandrakeId, mandrakeCount]) => 
                mandrakeCount > 0 && MANDRAKE_CONFIG[mandrakeId]?.type === 'element'
            );
            const hasAnimal = Object.entries(this.data.ownedMandrakes).some(([mandrakeId, mandrakeCount]) => 
                mandrakeCount > 0 && MANDRAKE_CONFIG[mandrakeId]?.type === 'animal'
            );
            
            if (hasNormal && hasElement && hasAnimal) {
                const oldProduction = production;
                production *= (1 + ENHANCEMENT_VALUES.combo.three_type_bonus);
                const increase = production - oldProduction;
                if (showDetails) {
                    breakdown.push({
                        name: '多元發展',
                        value: increase,
                        detail: `三系齊全 +${(ENHANCEMENT_VALUES.combo.three_type_bonus * 100).toFixed(1)}%`
                    });
                    effects.push({
                        source: '多元發展',
                        level: this.data.enhancements.obtained['combo_diversity_bonus'] || 0,
                        effect: `三系齊全時全體 +${(ENHANCEMENT_VALUES.combo.three_type_bonus * 100).toFixed(1)}%`
                    });
                }
            }
        }

        // 規模效應加成
        if (gameEffects.hasQuantityBonus) {
            const totalMandrakes = Game.getTotalMandrakeCount();
            const bonusMultiplier = Math.floor(totalMandrakes / 10) * ENHANCEMENT_VALUES.combo.per_10_bonus;
            
            if (bonusMultiplier > 0) {
                const oldProduction = production;
                production *= (1 + bonusMultiplier);
                const increase = production - oldProduction;
                
                if (showDetails) {
                    breakdown.push({
                        name: '規模效應',
                        value: increase,
                        detail: `${totalMandrakes}株 → ${Math.floor(totalMandrakes / 10)}×10株 +${(bonusMultiplier * 100).toFixed(1)}%`
                    });
                    effects.push({
                        source: '規模效應',
                        level: this.data.enhancements.obtained['combo_quantity_bonus'] || 0,
                        effect: `每10株全體產量 +${(ENHANCEMENT_VALUES.combo.per_10_bonus * 100).toFixed(1)}%`
                    });
                }
            }
        }

        // 同系協同加成
        if (gameEffects.hasTypeSynergy) {
            // 計算同類型的總數量
            const sameTypeCount = Object.entries(this.data.ownedMandrakes)
                .filter(([mandrakeId, mandrakeCount]) => 
                    mandrakeCount > 0 && MANDRAKE_CONFIG[mandrakeId]?.type === config.type
                )
                .reduce((sum, [, mandrakeCount]) => sum + mandrakeCount, 0);
            
            if (sameTypeCount > 1) {
                const bonusMultiplier = (sameTypeCount - 1) * ENHANCEMENT_VALUES.combo.same_type_bonus;
                const oldProduction = production;
                production *= (1 + bonusMultiplier);
                const increase = production - oldProduction;
                
                if (showDetails) {
                    const typeName = {normal: '普通', element: '元素', animal: '動物'}[config.type];
                    breakdown.push({
                        name: '同系協同',
                        value: increase,
                        detail: `${typeName}系${sameTypeCount}株 +${(bonusMultiplier * 100).toFixed(1)}%`
                    });
                    effects.push({
                        source: '同系協同',
                        level: this.data.enhancements.obtained['combo_type_synergy'] || 0,
                        effect: `同類型每額外1株 +${(ENHANCEMENT_VALUES.combo.same_type_bonus * 100).toFixed(1)}%`
                    });
                }
            }
        }
        
        // 產量波動
        if (gameEffects.globalProductionVariance && gameEffects.globalProductionVariance !== 1.0) {
            const oldProduction = production;
            production *= gameEffects.globalProductionVariance;
            const change = production - oldProduction;
            if (showDetails) {
                const percentage = ((gameEffects.globalProductionVariance - 1) * 100).toFixed(1);
                breakdown.push({
                    name: '產量波動',
                    value: change,
                    detail: `累積波動 ${percentage >= 0 ? '+' : ''}${percentage}%`
                });
            }
        }
        
        // 天氣效果
        const weatherMultiplier = this.getWeatherMultiplier(config.type);
        if (weatherMultiplier !== 1.0) {
            const oldProduction = production;
            production *= weatherMultiplier;
            const change = production - oldProduction;
            if (showDetails) {
                const weatherName = WEATHER_CONFIG[this.data.weather]?.name || '未知';
                breakdown.push({
                    name: '天氣效果',
                    value: change,
                    detail: `${weatherName} ${((weatherMultiplier - 1) * 100).toFixed(1)}%`
                });
            }
        }
        
        // 臨時加成
        const tempBoost = this.getTempBoostMultiplier('production');
        const typeBoost = this.getTempBoostMultiplier(config.type);
        const totalTempBoost = tempBoost * typeBoost;
        if (totalTempBoost !== 1.0) {
            const oldProduction = production;
            production *= totalTempBoost;
            const change = production - oldProduction;
            if (showDetails) {
                breakdown.push({
                    name: '臨時加成',
                    value: change,
                    detail: `獎勵效果 +${((totalTempBoost - 1) * 100).toFixed(1)}%`
                });
            }
        }
        
        return showDetails ? {
            total: production,
            breakdown: breakdown,
            effects: effects
        } : production;
    }

    /**
     * 獲取總產量
     */
    getTotalProduction() {
        // 🔧 添加安全檢查
        if (!this.data || !this.data.ownedMandrakes || !this.data.enhancementEffects) {
            console.warn('getTotalProduction: 遊戲數據不完整');
            return 0;
        }

        if (!this.individualProductions) {
            this.individualProductions = {};
        }
        
        let total = 0;
        this.individualProductions = {}; // 儲存每個品種的產量
        
        for (const [id, count] of Object.entries(this.data.ownedMandrakes)) {
            const production = this.calculateSingleMandrakeProduction(id, count);
            this.individualProductions[id] = production;
            total += production;
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
        
        // 基礎成本計算
        let cost = Math.floor(config.baseCost * Math.pow(config.costGrowth, count));
        
        // ✅ 應用強化效果
        if (this.data.enhancementEffects) {
            const effects = this.data.enhancementEffects;
            
            // 全體成本減免
            if (effects.globalCostMultiplier) {
                cost *= effects.globalCostMultiplier;
            }
            
            // 類型特定成本減免
            if (effects.typeCostMultipliers && effects.typeCostMultipliers[config.type]) {
                cost *= effects.typeCostMultipliers[config.type];
            }
        }
                
        return Math.floor(Math.max(1, cost)); // 最低成本為1
    }

    /**
     * 購買曼德拉草
     */
    buyMandrake(id) {
        const cost = this.getCurrentCost(id);
        
        if (this.data.fruit >= cost) {
            this.data.fruit -= cost;

            let purchaseAmount = 1;
            
            if (this.data.enhancementEffects.hasPurchaseCrit) {
                const critChance = ENHANCEMENT_VALUES.luck.purchase_crit_chance;
                if (Math.random() < critChance) {
                    purchaseAmount = 2; // 暴擊獲得雙倍
                    
                    // 顯示暴擊通知
                    if (typeof UI !== 'undefined') {
                        const config = MANDRAKE_CONFIG[id];
                        UI.showNotification(`💥 購買暴擊！獲得 2 個 ${config.name}！`, 'success');
                    }
                    
                    console.log(`購買暴擊！獲得 ${purchaseAmount} 個 ${id}`);
                }
            }

            // 應用購買數量
            this.data.ownedMandrakes[id] = (this.data.ownedMandrakes[id] || 0) + purchaseAmount;

            // 在農場中種植（根據實際獲得數量）
            for (let i = 0; i < purchaseAmount; i++) {
                this.plantInFarm(id);
            }

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
        // 🔧 修復：確保enhancementEffects存在且有必要屬性
        if (!this.data || !this.data.enhancementEffects) {
            console.warn('遊戲數據未完全初始化，跳過獎勵檢查');
            return;
        }
        
        // 🔧 修復：確保 rewardCdMultiplier 有預設值
        if (typeof this.data.enhancementEffects.rewardCdMultiplier !== 'number') {
            this.data.enhancementEffects.rewardCdMultiplier = 1.0;
        }

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
            if (this.data.enhancementEffects && this.data.enhancementEffects.rewardRarityBoost > 0 && rarityName !== 'common') {
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
            
            // 🔧 重置倒數計時器
            this.data.weatherTimer = GAME_CONFIG.WEATHER_CHANGE_INTERVAL / 1000;
            this.data.lastWeatherChange = Date.now();
            
            if (typeof UI !== 'undefined') {
                UI.showNotification(`天氣變為 ${weatherConfig.name}！`, 'info');
                UI.updateWeather();
                UI.updateWeatherTimer(); // 🔧 添加：更新倒數顯示
            }
        }
    }

    /**
     * 重骰天氣
     */
    rerollWeather() {
        // 🔧 檢查是否被鎖定
        if (this.data.weatherLocked && Date.now() < this.data.weatherLocked) {
            if (typeof UI !== 'undefined') {
                UI.showNotification('天氣被鎖定中，無法重骰！', 'warning');
            }
            return;
        }
        
        const cost = this.data.freeWeatherReroll ? 0 : 100;
        
        if (this.data.fruit >= cost) {
            this.data.fruit -= cost;
            this.data.freeWeatherReroll = false;
            
            // 🔧 獲取可用天氣（包含當前天氣，保持隨機性）
            const availableWeathers = Object.entries(WEATHER_CONFIG)
                .filter(([type, config]) => !config.isSpecial)
                .map(([type]) => type);
            
            // 🔧 隨機選擇天氣（可能相同）
            const oldWeather = this.data.weather;
            const newWeather = availableWeathers[Math.floor(Math.random() * availableWeathers.length)];
            
            // 🔧 更新天氣
            this.data.weather = newWeather;
            
            // 🔧 重置倒數計時器
            this.data.weatherTimer = GAME_CONFIG.WEATHER_CHANGE_INTERVAL / 1000;
            this.data.lastWeatherChange = Date.now();
            
            const weatherConfig = WEATHER_CONFIG[newWeather];
            const message = cost === 0 ? '免費重骰天氣成功！' : '天氣已重新隨機！';
            
            if (typeof UI !== 'undefined') {
                // 🔧 顯示重骰結果
                if (oldWeather === newWeather) {
                    UI.showNotification(`${message} 維持 ${weatherConfig.name}`, 'success');
                } else {
                    UI.showNotification(`${message} 變為 ${weatherConfig.name}！`, 'success');
                }
                
                UI.updateWeather();
                UI.updateWeatherTimer();
                UI.updateAll();
            }
            
            this.saveGame();
            console.log(`天氣重骰：${oldWeather} → ${newWeather}`);
            
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
     * 🔧 修復：驗證遊戲數據完整性
     */
    validateGameData() {
        const defaultData = this.getDefaultGameData();

        // 🔧 修復：優先確保核心數據結構存在
        if (!this.data) {
            this.data = defaultData;
            return;
        }
        
        // 🔧 修復：確保 enhancementEffects 優先初始化
        if (!this.data.enhancementEffects || typeof this.data.enhancementEffects !== 'object') {
            console.log('重建 enhancementEffects');
            this.data.enhancementEffects = defaultData.enhancementEffects;
        }
        
        // 🔧 修復：確保所有必要的 enhancementEffects 屬性存在
        const requiredEffects = {
            'rewardCdMultiplier': 1.0,
            'globalProductionMultiplier': 1.0, 
            'globalCostMultiplier': 1.0,
            'globalProductionVariance': 1.0,
            'typeProductionMultipliers': { normal: 1.0, element: 1.0, animal: 1.0 },
            'typeCostMultipliers': { normal: 1.0, element: 1.0, animal: 1.0 },
            'hasProductionVariance': false,
            'hasPurchaseCrit': false,
            'hasCostVariance': false,
            'hasQuantityBonus': false,
            'hasTypeSynergy': false,
            'hasDiversityBonus': false,
            'bonusRewardCapacity': 0,
            'rewardRarityBoost': 0,
            'savedProductionVariance': null,
            'savedCostVariance': null
        };
        
        for (const [effect, defaultValue] of Object.entries(requiredEffects)) {
            if (this.data.enhancementEffects[effect] === undefined || this.data.enhancementEffects[effect] === null) {
                this.data.enhancementEffects[effect] = defaultValue;
                console.log(`修復 enhancementEffects.${effect}`);
            }
        }
        
        // 確保基本數據結構
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

         // 🔧 添加：驗證天氣倒數數據
        if (typeof this.data.weatherTimer !== 'number' || this.data.weatherTimer < 0) {
            this.data.weatherTimer = 300; // 默認5分鐘
        }
        
        if (typeof this.data.lastWeatherChange !== 'number') {
            this.data.lastWeatherChange = Date.now();
        }
        
        // 🔧 添加：載入存檔時同步倒數
        if (this.data.lastWeatherChange) {
            const timePassed = Math.floor((Date.now() - this.data.lastWeatherChange) / 1000);
            const intervalSeconds = GAME_CONFIG.WEATHER_CHANGE_INTERVAL / 1000;
            
            // 計算應該剩餘的時間
            const remainingTime = intervalSeconds - (timePassed % intervalSeconds);
            this.data.weatherTimer = Math.max(0, remainingTime);
        }
        
        // 驗證臨時加成
        if (typeof this.data.tempBoosts !== 'object') {
            this.data.tempBoosts = {};
        }

        // 驗證強化系統數據
        if (!this.data.enhancements || typeof this.data.enhancements !== 'object') {
            this.data.enhancements = defaultData.enhancements;
        }

        // 🔧 新增：確保強化系統必要字段存在
        if (!this.data.enhancements.obtained) {
            this.data.enhancements.obtained = {};
        }

        if (!this.data.enhancements.mandrakeProgress) {
            this.data.enhancements.mandrakeProgress = {};
        }

        // 🔧 新增：確保lastChecked字段存在
        if (!this.data.enhancements.lastChecked) {
            this.data.enhancements.lastChecked = {};
        }

        // 🔧 新增：確保計數字段正確
        if (typeof this.data.enhancements.pendingCount !== 'number') {
            this.data.enhancements.pendingCount = 0;
        }

        if (typeof this.data.enhancements.pendingEnhancement !== 'boolean') {
            this.data.enhancements.pendingEnhancement = false;
        }

        if (!Array.isArray(this.data.enhancements.currentChoices)) {
            this.data.enhancements.currentChoices = [];
        }

        // 🔧 新增：清理無效的強化狀態
        // 如果有待處理的強化但沒有選項，重置狀態
        if (this.data.enhancements.pendingEnhancement && 
            (!this.data.enhancements.currentChoices || this.data.enhancements.currentChoices.length === 0)) {
            this.data.enhancements.pendingEnhancement = false;
            this.data.enhancements.pendingCount = 0;
        }

        // 🔧 新增：檢查並修復lastChecked數據
        // 如果lastChecked為空，但已經有曼德拉草，需要初始化
        for (const [mandrakeId, count] of Object.entries(this.data.ownedMandrakes)) {
            if (count > 0 && !this.data.enhancements.lastChecked[mandrakeId]) {
                // 根據當前數量推算應該已經達到的里程碑
                const milestones = [1, 10, 50, 100, 200, 500, 1000, 2000, 5000];
                let lastMilestone = 0;
                
                for (const milestone of milestones) {
                    if (count >= milestone) {
                        lastMilestone = milestone;
                    } else {
                        break;
                    }
                }
                
                this.data.enhancements.lastChecked[mandrakeId] = lastMilestone;
            }
        }

        // 確保 mandrakeProgress 存在
        if (!this.data.enhancements.mandrakeProgress) {
            this.data.enhancements.mandrakeProgress = {};
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

        // 🔧 修復：在驗證完成後重建強化效果
        this.rebuildEnhancementEffects();
    }

    /**
     * 🔧 修復：重建強化效果
     */
    rebuildEnhancementEffects() {
        // 保存隨機值
        const savedProductionVariance = this.data.enhancementEffects.savedProductionVariance;
        const savedCostVariance = this.data.enhancementEffects.savedCostVariance;
        
        // 重置所有效果到默認值
        const defaultEffects = this.getDefaultGameData().enhancementEffects;
        this.data.enhancementEffects = JSON.parse(JSON.stringify(defaultEffects));
        
        // 恢復保存的隨機值
        this.data.enhancementEffects.savedProductionVariance = savedProductionVariance;
        this.data.enhancementEffects.savedCostVariance = savedCostVariance;
        
        // 重新應用所有已獲得的強化
        for (const [enhancementId, level] of Object.entries(this.data.enhancements.obtained)) {
            for (let i = 0; i < level; i++) {
                if (typeof EnhancementSystem !== 'undefined') {
                    EnhancementSystem.applyEnhancement(enhancementId);
                }
            }
        }
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