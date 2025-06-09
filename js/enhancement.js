// ========== 強化系統核心 ==========

console.log('🔮 enhancement.js 開始載入...');

// 強化定義
const ENHANCEMENTS = {
    // 穩穩強化類
    stable_global_production: {
        category: 'stable',
        name: '全面發展',
        description: () => `全體產量 +${ENHANCEMENT_VALUES.stable.global_production * 100}%`,
        icon: '📈',
        effect: 'global_production'
    },
    stable_global_cost: {
        category: 'stable',
        name: '經濟管理',
        description: () => `全體成本 -${ENHANCEMENT_VALUES.stable.global_cost * 100}%`,
        icon: '💰',
        effect: 'global_cost'
    },
    stable_normal_production: {
        category: 'stable',
        name: '普通專精',
        description: () => `普通系產量 +${ENHANCEMENT_VALUES.stable.type_production * 100}%`,
        icon: '🌱',
        effect: 'normal_production'
    },
    stable_element_production: {
        category: 'stable',
        name: '元素掌控',
        description: () => `元素系產量 +${ENHANCEMENT_VALUES.stable.type_production * 100}%`,
        icon: '🔥',
        effect: 'element_production'
    },
    stable_animal_production: {
        category: 'stable',
        name: '動物親和',
        description: () => `動物系產量 +${ENHANCEMENT_VALUES.stable.type_production * 100}%`,
        icon: '🐱',
        effect: 'animal_production'
    },
    
    // 運氣類
    luck_production_variance: {
        category: 'luck',
        name: '產量波動',
        description: () => `產量隨機波動 ±${ENHANCEMENT_VALUES.luck.production_variance * 100}%，期望值 +${ENHANCEMENT_VALUES.luck.production_boost * 100}%`,
        icon: '📊',
        effect: 'production_variance'
    },
    luck_purchase_crit: {
        category: 'luck',
        name: '購買暴擊',
        description: () => `購買時有 ${ENHANCEMENT_VALUES.luck.purchase_crit_chance * 100}% 機率獲得雙倍數量`,
        icon: '💥',
        effect: 'purchase_crit'
    },
    luck_cost_variance: {
        category: 'luck',
        name: '成本波動',
        description: () => `所有成本隨機波動 ${ENHANCEMENT_VALUES.luck.cost_variance_min * 100}% ~ +${ENHANCEMENT_VALUES.luck.cost_variance_max * 100}%`,
        icon: '🎲',
        effect: 'cost_variance'
    },
    
    // 獎勵類
    reward_cd_reduction: {
        category: 'reward',
        name: '時間加速',
        description: () => `獎勵冷卻時間 -${ENHANCEMENT_VALUES.reward.cd_reduction * 100}%`,
        icon: '⏰',
        effect: 'reward_cd'
    },
    reward_capacity_increase: {
        category: 'reward',
        name: '儲備擴充',
        description: () => `獎勵累積上限 +${ENHANCEMENT_VALUES.reward.capacity_increase}`,
        icon: '📦',
        effect: 'reward_capacity'
    },
    reward_rarity_boost: {
        category: 'reward',
        name: '幸運之星',
        description: () => `獎勵稀有度提升 +${ENHANCEMENT_VALUES.reward.rarity_boost * 100}%`,
        icon: '⭐',
        effect: 'reward_rarity'
    },
    
    // Combo類
    combo_quantity_bonus: {
        category: 'combo',
        name: '規模效應',
        description: () => `每10株曼德拉草：全體產量 +${ENHANCEMENT_VALUES.combo.per_10_bonus * 100}%`,
        icon: '🔢',
        effect: 'quantity_bonus'
    },
    combo_type_synergy: {
        category: 'combo',
        name: '同系協同',
        description: () => `同類型數量越多，該類型額外產量越高（每株 +${ENHANCEMENT_VALUES.combo.same_type_bonus * 100}%）`,
        icon: '🤝',
        effect: 'type_synergy'
    },
    combo_diversity_bonus: {
        category: 'combo',
        name: '多元發展',
        description: () => `三種類型都有時：全體產量 +${ENHANCEMENT_VALUES.combo.three_type_bonus * 100}%`,
        icon: '🌈',
        effect: 'diversity_bonus'
    }
};

class EnhancementSystem {
    /**
     * 檢查是否達到強化解鎖條件
     */
    static checkUnlockConditions() {
        // 降低日誌頻率
        const shouldLog = Math.random() < 0.001;
        
        if (shouldLog) {
            console.log('=== 強化檢查開始 ===');
        }
        
        let triggeredCount = 0; // 記錄這次檢查觸發了幾次
        const milestones = [1, 10, 50, 100, 200, 500, 1000, 2000, 5000];
        
        for (const [mandrakeId, currentCount] of Object.entries(game.data.ownedMandrakes)) {
            if (currentCount === 0) continue;
            
            const lastMilestone = game.data.enhancements.mandrakeProgress[mandrakeId] || 0;
            
            // 找出這個品種跨越了哪些里程碑
            for (const milestone of milestones) {
                if (milestone > lastMilestone && currentCount >= milestone) {
                    // 記錄進度
                    game.data.enhancements.mandrakeProgress[mandrakeId] = milestone;
                    triggeredCount++;
                    
                    console.log(`${mandrakeId} 達到 ${milestone} 株，觸發升級！`);
                }
            }
        }
        
        if (triggeredCount > 0) {
            if (!game.data.enhancements.pendingCount) {
                game.data.enhancements.pendingCount = 0;
            }
            game.data.enhancements.pendingCount += triggeredCount;
            
            console.log(`累積 ${triggeredCount} 次強化，總待處理：${game.data.enhancements.pendingCount}`);
            
            // 如果目前沒有強化窗口在顯示，就顯示一個
            if (!game.data.enhancements.pendingEnhancement) {
                this.triggerEnhancementChoice();
            }
            
            game.saveGame();
            return true;
        }
        
        return false;
    }
        
            /**
         * 觸發強化選擇
         */
        static triggerEnhancementChoice() {
            game.data.enhancements.pendingEnhancement = true;
            game.data.enhancements.currentChoices = this.generateChoices();
            
            console.log('觸發強化選擇！', game.data.enhancements.currentChoices);
            
            // 顯示強化選擇UI
            if (typeof UI !== 'undefined') {
                UI.showEnhancementChoice();
            }
    }
    
    /**
     * 生成三個強化選項
     */
    static generateChoices() {
        const allEnhancements = Object.keys(ENHANCEMENTS);
        const choices = [];
        
        // 確保三個選項來自不同類別
        const categories = ['stable', 'luck', 'reward', 'combo'];
        const usedCategories = [];
        
        while (choices.length < 3 && usedCategories.length < categories.length) {
            const availableCategories = categories.filter(cat => !usedCategories.includes(cat));
            const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
            
            const categoryEnhancements = allEnhancements.filter(id => 
                ENHANCEMENTS[id].category === randomCategory
            );
            
            if (categoryEnhancements.length > 0) {
                const randomEnhancement = categoryEnhancements[Math.floor(Math.random() * categoryEnhancements.length)];
                choices.push(randomEnhancement);
                usedCategories.push(randomCategory);
            }
        }
        
        // 如果還不夠3個，隨機填充
        while (choices.length < 3) {
            const remaining = allEnhancements.filter(id => !choices.includes(id));
            if (remaining.length === 0) break;
            
            const randomId = remaining[Math.floor(Math.random() * remaining.length)];
            choices.push(randomId);
        }
        
        return choices;
    }

    /**
     * 選擇強化
     */
    static selectEnhancement(enhancementId) {
        // 記錄強化
        if (!game.data.enhancements.obtained[enhancementId]) {
            game.data.enhancements.obtained[enhancementId] = 0;
        }
        game.data.enhancements.obtained[enhancementId]++;
        
        // 應用強化效果
        this.applyEnhancement(enhancementId);
        
        // 清理狀態
        game.data.enhancements.pendingEnhancement = false;
        game.data.enhancements.currentChoices = [];
        if (game.data.enhancements.pendingCount > 1) {
            game.data.enhancements.pendingCount--;
            console.log(`還有 ${game.data.enhancements.pendingCount - 1} 個強化待處理`);
            
            // 短暫延遲後觸發下一個強化選擇
            setTimeout(() => this.triggerEnhancementChoice(), 500);
        } else {
            game.data.enhancements.pendingCount = 0;
        }
        
        // 保存遊戲
        game.saveGame();
        
        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.hideEnhancementChoice();
            UI.updateAll();
            UI.showNotification(`獲得強化：${ENHANCEMENTS[enhancementId].name}！`, 'success');
        }
    }
    
    /**
     * 應用強化效果
     */
    static applyEnhancement(enhancementId) {
        const enhancement = ENHANCEMENTS[enhancementId];
        const effects = game.data.enhancementEffects;
        
        switch (enhancement.effect) {
            case 'global_production':
                effects.globalProductionMultiplier += ENHANCEMENT_VALUES.stable.global_production;
                break;
                
            case 'global_cost':
                effects.globalCostMultiplier -= ENHANCEMENT_VALUES.stable.global_cost;
                effects.globalCostMultiplier = Math.max(0.1, effects.globalCostMultiplier);
                break;
                
            case 'normal_production':
                effects.typeProductionMultipliers.normal += ENHANCEMENT_VALUES.stable.type_production;
                break;
                
            case 'element_production':
                effects.typeProductionMultipliers.element += ENHANCEMENT_VALUES.stable.type_production;
                break;
                
            case 'animal_production':
                effects.typeProductionMultipliers.animal += ENHANCEMENT_VALUES.stable.type_production;
                break;
                
           case 'production_variance':
                effects.hasProductionVariance = true;
                
                // 檢查是否已經有固定的波動值
                if (!effects.savedProductionVariance) {
                    // 第一次獲得，隨機生成並保存
                    const prodVariance = ENHANCEMENT_VALUES.luck.production_variance;
                    const prodBoost = ENHANCEMENT_VALUES.luck.production_boost;
                    const prodRandomFactor = 1 + (Math.random() * 2 - 1) * prodVariance + prodBoost;
                    const prodFinalFactor = Math.max(0.1, prodRandomFactor);
                    
                    effects.savedProductionVariance = prodFinalFactor;
                    console.log('🎲 第一次生成產量波動因子:', prodFinalFactor);
                }
                
                // 使用保存的固定值
                effects.globalProductionVariance *= effects.savedProductionVariance;
                break;
                
            case 'purchase_crit':
                effects.hasPurchaseCrit = true;
                break;
                
           case 'cost_variance':
                effects.hasCostVariance = true;
                
                // 檢查是否已經有固定的波動值
                if (!effects.savedCostVariance) {
                    // 第一次獲得，隨機生成並保存
                    const costMin = ENHANCEMENT_VALUES.luck.cost_variance_min;
                    const costMax = ENHANCEMENT_VALUES.luck.cost_variance_max;
                    const costRandomFactor = 1 + (Math.random() * (costMax - costMin) + costMin);
                    const costFinalFactor = Math.max(0.1, costRandomFactor);
                    
                    effects.savedCostVariance = costFinalFactor;
                    console.log('🎲 第一次生成成本波動因子:', costFinalFactor);
                }
                
                // 使用保存的固定值
                effects.globalCostMultiplier *= effects.savedCostVariance;
                break;
                            
            case 'reward_cd':
                effects.rewardCdMultiplier -= ENHANCEMENT_VALUES.reward.cd_reduction;
                effects.rewardCdMultiplier = Math.max(0.1, effects.rewardCdMultiplier);
                break;
                
            case 'reward_capacity':
                effects.bonusRewardCapacity += ENHANCEMENT_VALUES.reward.capacity_increase;
                game.data.maxPendingRewards += ENHANCEMENT_VALUES.reward.capacity_increase;
                break;
                
            case 'reward_rarity':
                effects.rewardRarityBoost += ENHANCEMENT_VALUES.reward.rarity_boost;
                break;
                
            case 'quantity_bonus':
                effects.hasQuantityBonus = true;
                break;
                
            case 'type_synergy':
                effects.hasTypeSynergy = true;
                break;
                
            case 'diversity_bonus':
                effects.hasDiversityBonus = true;
                break;
        }
    }

    // 在統計或UI中顯示波動情況
    static getProductionVarianceDisplay() {
        const variance = game.data.enhancementEffects.globalProductionVariance;
        if (variance === 1.0) return "無波動";
        
        const percentage = ((variance - 1) * 100).toFixed(1);
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage}%`;
}

    
}

// 暴露到全局
window.EnhancementSystem = EnhancementSystem;
window.ENHANCEMENTS = ENHANCEMENTS;

console.log('✅ ENHANCEMENTS 載入:', Object.keys(ENHANCEMENTS).length, '個強化');
console.log('✅ EnhancementSystem 載入完成');
console.log('🔮 enhancement.js 載入完成！');

