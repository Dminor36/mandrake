// ========== 強化系統 ==========

console.log('🔮 enhancement.js 開始載入...');

// 強化定義保持不變
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
     * 🔧 修復：檢查是否達到強化解鎖條件
     * 主要改進：只在真正跨越里程碑時觸發，避免重複觸發
     */
    static checkUnlockConditions() {
        // 確保數據結構存在
        if (!game.data.enhancements.lastChecked) {
            game.data.enhancements.lastChecked = {};
        }
        
        let hasNewMilestone = false;
        const milestones = [1, 10, 50, 100, 200, 500, 1000, 2000, 5000];
        
        for (const [mandrakeId, currentCount] of Object.entries(game.data.ownedMandrakes)) {
            if (currentCount === 0) continue;
            
            // 🔧 修復：記錄每個品種上次檢查的最高里程碑
            const lastMilestone = game.data.enhancements.lastChecked[mandrakeId] || 0;
            
            // 🔧 修復：找出這次新跨越的里程碑
            for (const milestone of milestones) {
                if (milestone > lastMilestone && currentCount >= milestone) {
                    // 真正的新里程碑！
                    game.data.enhancements.lastChecked[mandrakeId] = milestone;
                    hasNewMilestone = true;
                    
                    console.log(`🎉 ${mandrakeId} 達到 ${milestone} 株里程碑！`);
                    
                    // 🔧 修復：每個里程碑只觸發一次強化
                    this.addPendingEnhancement();
                    break; // 一次只處理一個里程碑
                }
            }
        }
        
        return hasNewMilestone;
    }
    
    /**
     * 🔧 新增：添加待處理的強化
     */
    static addPendingEnhancement() {
        // 增加待處理強化計數
        if (!game.data.enhancements.pendingCount) {
            game.data.enhancements.pendingCount = 0;
        }
        game.data.enhancements.pendingCount++;
        
        console.log(`📈 新增強化機會，總計待處理：${game.data.enhancements.pendingCount}`);
        
        // 🔧 修復：只有在沒有強化窗口時才顯示
        if (!game.data.enhancements.pendingEnhancement) {
            this.triggerEnhancementChoice();
        }
        
        // 🔧 修復：更新UI顯示強化可用狀態
        if (typeof UI !== 'undefined') {
            UI.updateEnhancementStatus();
        }
    }
    
    /**
     * 🔧 修復：觸發強化選擇
     */
    static triggerEnhancementChoice() {
        // 🔧 修復：檢查是否真的有待處理的強化
        if (game.data.enhancements.pendingCount <= 0) {
            console.warn('沒有待處理的強化，不應該觸發選擇');
            return;
        }
        
        game.data.enhancements.pendingEnhancement = true;
        game.data.enhancements.currentChoices = this.generateChoices();
        
        console.log('🔮 觸發強化選擇！選項：', game.data.enhancements.currentChoices);
        
        // 顯示強化選擇UI
        if (typeof UI !== 'undefined') {
            UI.showEnhancementChoice();
        }
    }
    
    /**
     * 生成三個強化選項（保持原邏輯）
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
     * 🔧 修復：選擇強化
     */
    static selectEnhancement(enhancementId) {
        // 🔧 修復：檢查是否有有效的強化選擇狀態
        if (!game.data.enhancements.pendingEnhancement || game.data.enhancements.pendingCount <= 0) {
            console.error('無效的強化選擇狀態');
            return;
        }
        
        // 記錄強化
        if (!game.data.enhancements.obtained[enhancementId]) {
            game.data.enhancements.obtained[enhancementId] = 0;
        }
        game.data.enhancements.obtained[enhancementId]++;
        
        // 應用強化效果
        this.applyEnhancement(enhancementId);
        
        // 🔧 修復：正確清理狀態
        game.data.enhancements.pendingEnhancement = false;
        game.data.enhancements.currentChoices = [];
        game.data.enhancements.pendingCount--;
        
        console.log(`✅ 選擇強化：${ENHANCEMENTS[enhancementId].name}，剩餘：${game.data.enhancements.pendingCount}`);
        
        // 🔧 修復：如果還有待處理的強化，延遲觸發下一個
        if (game.data.enhancements.pendingCount > 0) {
            console.log(`⏰ 還有 ${game.data.enhancements.pendingCount} 個強化待處理，將在1秒後顯示`);
            setTimeout(() => {
                this.triggerEnhancementChoice();
            }, 1000);
        }
        
        // 保存遊戲
        game.saveGame();
        
        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.hideEnhancementChoice();
            UI.updateAll();
            UI.updateEnhancementStatus(); // 🔧 新增：更新強化狀態顯示
            UI.showNotification(`獲得強化：${ENHANCEMENTS[enhancementId].name}！`, 'success');
        }
    }
    
    /**
     * 應用強化效果（保持原邏輯）
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
                
                if (!effects.savedProductionVariance) {
                    const prodVariance = ENHANCEMENT_VALUES.luck.production_variance;
                    const prodBoost = ENHANCEMENT_VALUES.luck.production_boost;
                    const prodRandomFactor = 1 + (Math.random() * 2 - 1) * prodVariance + prodBoost;
                    const prodFinalFactor = Math.max(0.1, prodRandomFactor);
                    
                    effects.savedProductionVariance = prodFinalFactor;
                    console.log('🎲 第一次生成產量波動因子:', prodFinalFactor);
                }
                
                effects.globalProductionVariance *= effects.savedProductionVariance;
                break;
                
            case 'purchase_crit':
                effects.hasPurchaseCrit = true;
                break;
                
            case 'cost_variance':
                effects.hasCostVariance = true;
                
                if (!effects.savedCostVariance) {
                    const costMin = ENHANCEMENT_VALUES.luck.cost_variance_min;
                    const costMax = ENHANCEMENT_VALUES.luck.cost_variance_max;
                    const costRandomFactor = 1 + (Math.random() * (costMax - costMin) + costMin);
                    const costFinalFactor = Math.max(0.1, costRandomFactor);
                    
                    effects.savedCostVariance = costFinalFactor;
                    console.log('🎲 第一次生成成本波動因子:', costFinalFactor);
                }
                
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

    /**
     * 🔧 新增：獲取下個里程碑信息
     */
    static getNextMilestone() {
        const milestones = [1, 10, 50, 100, 200, 500, 1000, 2000, 5000];
        
        for (const [mandrakeId, currentCount] of Object.entries(game.data.ownedMandrakes)) {
            const config = MANDRAKE_CONFIG[mandrakeId];
            if (!config) continue;
            
            const lastMilestone = game.data.enhancements.lastChecked[mandrakeId] || 0;
            
            // 找到下一個里程碑
            for (const milestone of milestones) {
                if (milestone > lastMilestone) {
                    return {
                        mandrakeId: mandrakeId,
                        mandrakeName: config.name,
                        currentCount: currentCount,
                        targetMilestone: milestone,
                        progress: currentCount / milestone,
                        remaining: milestone - currentCount
                    };
                }
            }
        }
        
        return null; // 已達到所有里程碑
    }

    /**
     * 🔧 新增：獲取強化系統狀態
     */
    static getEnhancementStatus() {
        return {
            pendingCount: game.data.enhancements.pendingCount || 0,
            isChoosing: game.data.enhancements.pendingEnhancement || false,
            nextMilestone: this.getNextMilestone(),
            totalEnhancements: Object.keys(game.data.enhancements.obtained || {}).length,
            totalLevels: Object.values(game.data.enhancements.obtained || {}).reduce((sum, level) => sum + level, 0)
        };
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

// 🔧 修復：在game.js中需要修改數據驗證
// 確保在validateGameData()函數中添加lastChecked初始化
function enhanceValidateGameData() {
    // 在現有的validateGameData函數中添加這些檢查
    
    // 確保強化系統數據完整
    if (!game.data.enhancements.lastChecked) {
        game.data.enhancements.lastChecked = {};
    }
    
    if (typeof game.data.enhancements.pendingCount !== 'number') {
        game.data.enhancements.pendingCount = 0;
    }
    
    if (typeof game.data.enhancements.pendingEnhancement !== 'boolean') {
        game.data.enhancements.pendingEnhancement = false;
    }
    
    if (!Array.isArray(game.data.enhancements.currentChoices)) {
        game.data.enhancements.currentChoices = [];
    }
}

// 暴露到全局
window.EnhancementSystem = EnhancementSystem;
window.ENHANCEMENTS = ENHANCEMENTS;

console.log('✅ ENHANCEMENTS 載入:', Object.keys(ENHANCEMENTS).length, '個強化');
console.log('✅ EnhancementSystem 修復版載入完成');
console.log('🔮 enhancement.js 載入完成！');