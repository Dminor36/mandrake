// ========== 強化系統 - 修改為總株數解鎖條件 ==========

console.log('🔮 enhancement.js 開始載入...');

// 強化定義保持不變
const ENHANCEMENTS = {
    // 穩穩強化類
    stable_global_production: {
        category: 'stable',
        name: '全面發展',
        description: () => {
            const currentLevel = Math.round(((game?.data?.enhancementEffects?.globalProductionMultiplier || 1) - 1) / ENHANCEMENT_VALUES.stable.global_production);
            const nextLevel = currentLevel + 1;
            const currentEffect = currentLevel * ENHANCEMENT_VALUES.stable.global_production * 100;
            const nextEffect = nextLevel * ENHANCEMENT_VALUES.stable.global_production * 100;
            
            if (currentLevel === 0) {
                return `全體產量 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 全體產量 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '📈',
        effect: 'global_production'
    },
    stable_global_cost: {
        category: 'stable',
        name: '經濟管理',
        description: () => {
            const currentLevel = Math.round(((1 - (game?.data?.enhancementEffects?.globalCostMultiplier || 1)) / ENHANCEMENT_VALUES.stable.global_cost));
            const nextLevel = currentLevel + 1;
            const currentEffect = currentLevel * ENHANCEMENT_VALUES.stable.global_cost * 100;
            const nextEffect = nextLevel * ENHANCEMENT_VALUES.stable.global_cost * 100;
            
            if (currentLevel === 0) {
                return `全體成本 -${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 全體成本 -${currentEffect.toFixed(1)}% → -${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '💰',
        effect: 'global_cost'
    },
    stable_normal_production: {
        category: 'stable',
        name: '普通專精',
        description: () => {
            const currentLevel = Math.round(((game?.data?.enhancementEffects?.typeProductionMultipliers?.normal || 1) - 1) / ENHANCEMENT_VALUES.stable.type_production);
            const nextLevel = currentLevel + 1;
            const currentEffect = currentLevel * ENHANCEMENT_VALUES.stable.type_production * 100;
            const nextEffect = nextLevel * ENHANCEMENT_VALUES.stable.type_production * 100;
            
            if (currentLevel === 0) {
                return `普通系產量 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 普通系產量 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '🌱',
        effect: 'normal_production'
    },
    stable_element_production: {
        category: 'stable',
        name: '元素掌控',
        description: () => {
            const currentLevel = Math.round(((game?.data?.enhancementEffects?.typeProductionMultipliers?.element || 1) - 1) / ENHANCEMENT_VALUES.stable.type_production);
            const nextLevel = currentLevel + 1;
            const currentEffect = currentLevel * ENHANCEMENT_VALUES.stable.type_production * 100;
            const nextEffect = nextLevel * ENHANCEMENT_VALUES.stable.type_production * 100;
            
            if (currentLevel === 0) {
                return `元素系產量 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 元素系產量 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '🔥',
        effect: 'element_production'
    },
    stable_animal_production: {
        category: 'stable',
        name: '動物親和',
        description: () => {
            const currentLevel = Math.round(((game?.data?.enhancementEffects?.typeProductionMultipliers?.animal || 1) - 1) / ENHANCEMENT_VALUES.stable.type_production);
            const nextLevel = currentLevel + 1;
            const currentEffect = currentLevel * ENHANCEMENT_VALUES.stable.type_production * 100;
            const nextEffect = nextLevel * ENHANCEMENT_VALUES.stable.type_production * 100;
            
            if (currentLevel === 0) {
                return `動物系產量 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 動物系產量 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
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
        description: () => {
            const currentLevel = Math.round(((1 - (game?.data?.enhancementEffects?.rewardCdMultiplier || 1)) / ENHANCEMENT_VALUES.reward.cd_reduction));
            const nextLevel = currentLevel + 1;
            const currentEffect = currentLevel * ENHANCEMENT_VALUES.reward.cd_reduction * 100;
            const nextEffect = nextLevel * ENHANCEMENT_VALUES.reward.cd_reduction * 100;
            
            if (currentLevel === 0) {
                return `獎勵冷卻時間 -${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 獎勵冷卻時間 -${currentEffect.toFixed(1)}% → -${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '⏰',
        effect: 'reward_cd'
    },
    reward_capacity_increase: {
        category: 'reward',
        name: '儲備擴充',
        description: () => {
            const currentLevel = (game?.data?.enhancementEffects?.bonusRewardCapacity || 0) / ENHANCEMENT_VALUES.reward.capacity_increase;
            const nextLevel = currentLevel + 1;
            const currentCapacity = (game?.data?.maxPendingRewards || 2);
            const nextCapacity = currentCapacity + ENHANCEMENT_VALUES.reward.capacity_increase;
            
            if (currentLevel === 0) {
                return `獎勵累積上限 +${ENHANCEMENT_VALUES.reward.capacity_increase}`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 獎勵累積上限 ${currentCapacity} → ${nextCapacity}`;
            }
        },
        icon: '📦',
        effect: 'reward_capacity'
    },
    reward_rarity_boost: {
        category: 'reward',
        name: '幸運之星',
        description: () => {
            const currentLevel = Math.round((game?.data?.enhancementEffects?.rewardRarityBoost || 0) / ENHANCEMENT_VALUES.reward.rarity_boost);
            const nextLevel = currentLevel + 1;
            const currentEffect = currentLevel * ENHANCEMENT_VALUES.reward.rarity_boost * 100;
            const nextEffect = nextLevel * ENHANCEMENT_VALUES.reward.rarity_boost * 100;
            
            if (currentLevel === 0) {
                return `獎勵稀有度提升 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 獎勵稀有度提升 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '⭐',
        effect: 'reward_rarity'
    },
    
    // Combo類
    combo_quantity_bonus: {
        category: 'combo',
        name: '規模效應',
        description: () => {
            const currentLevel = game?.data?.enhancementEffects?.quantityBonusLevel || 0;
            const nextLevel = currentLevel + 1;
            const currentEffect = ENHANCEMENT_VALUES.combo.per_10_bonus * currentLevel * 100;
            const nextEffect = ENHANCEMENT_VALUES.combo.per_10_bonus * nextLevel * 100;
            
            if (currentLevel === 0) {
                return `每10株曼德拉草：全體產量 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 每10株曼德拉草：</br>全體產量 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '🔢',
        effect: 'quantity_bonus'
    },
    combo_type_synergy: {
        category: 'combo',
        name: '同系協同',
        description: () => {
            const currentLevel = game?.data?.enhancementEffects?.typeSynergyLevel || 0;
            const nextLevel = currentLevel + 1;
            const currentEffect = ENHANCEMENT_VALUES.combo.same_type_bonus * currentLevel * 100;
            const nextEffect = ENHANCEMENT_VALUES.combo.same_type_bonus * nextLevel * 100;
            
            if (currentLevel === 0) {
                return `同類型每額外1株產量 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 同類型每額外1株產量 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '🤝',
        effect: 'type_synergy'
    },
    combo_diversity_bonus: {
        category: 'combo',
        name: '多元發展',
        description: () => {
            const currentLevel = game?.data?.enhancementEffects?.diversityBonusLevel || 0;
            const nextLevel = currentLevel + 1;
            const currentEffect = ENHANCEMENT_VALUES.combo.three_type_bonus * currentLevel * 100;
            const nextEffect = ENHANCEMENT_VALUES.combo.three_type_bonus * nextLevel * 100;
            
            if (currentLevel === 0) {
                return `三系齊全時全體產量 +${nextEffect.toFixed(1)}%`;
            } else {
                return `<b>[Lv.${nextLevel}]</b> 三系齊全時全體產量 ${currentEffect.toFixed(1)}% → ${nextEffect.toFixed(1)}%`;
            }
        },
        icon: '🌈',
        effect: 'diversity_bonus'
    }
};

class EnhancementSystem {
    /**
     * 🔧 修改：檢查總株數解鎖條件
     */
    static checkUnlockConditions() {
        // 確保數據結構存在
        if (!game.data.enhancements.lastCheckedTotalCount) {
            game.data.enhancements.lastCheckedTotalCount = 0;
        }
        
        const currentTotalCount = Game.getTotalMandrakeCount();
        const lastCheckedCount = game.data.enhancements.lastCheckedTotalCount;
        
        // 🔧 直接從 config.js 讀取里程碑數據
        const totalCountMilestones = ENHANCEMENT_UNLOCK_CONDITIONS.map(condition => condition.threshold);
        
        let hasNewMilestone = false;
        
        // 檢查新跨越的里程碑
        for (const milestone of totalCountMilestones) {
            if (milestone > lastCheckedCount && currentTotalCount >= milestone) {
                // 真正的新里程碑！
                game.data.enhancements.lastCheckedTotalCount = milestone;
                hasNewMilestone = true;
                
                console.log(`🎉 總曼德拉草數量達到 ${milestone} 株里程碑！`);
                
                // 每個里程碑只觸發一次強化
                this.addPendingEnhancement();
                break; // 一次只處理一個里程碑
            }
        }
        
        return hasNewMilestone;
    }
    
    /**
     * 添加待處理的強化
     */
    static addPendingEnhancement() {
        // 增加待處理強化計數
        if (!game.data.enhancements.pendingCount) {
            game.data.enhancements.pendingCount = 0;
        }
        game.data.enhancements.pendingCount++;
        
        console.log(`📈 新增強化機會，總計待處理：${game.data.enhancements.pendingCount}`);
        
        // 只有在沒有強化窗口時才顯示
        if (!game.data.enhancements.pendingEnhancement) {
            this.triggerEnhancementChoice();
        }
        
        // 更新UI顯示強化可用狀態
        if (typeof UI !== 'undefined') {
            UI.updateEnhancementStatus();
        }
    }
    
    /**
     * 觸發強化選擇
     */
    static triggerEnhancementChoice() {
        // 檢查是否真的有待處理的強化
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
        // 檢查是否有有效的強化選擇狀態
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

        // 生成詳細通知信息
        const enhancement = ENHANCEMENTS[enhancementId];
        const notificationMessage = this.generateEnhancementNotification(enhancementId, enhancement);

        // 強化選擇後立即更新產量顯示
        if (game.forceProductionUpdate) {
            game.forceProductionUpdate('enhancement');
        }
        
        // 正確清理狀態
        game.data.enhancements.pendingEnhancement = false;
        game.data.enhancements.currentChoices = [];
        game.data.enhancements.pendingCount--;
        
        console.log(`✅ 選擇強化：${ENHANCEMENTS[enhancementId].name}，剩餘：${game.data.enhancements.pendingCount}`);
        
        // 如果還有待處理的強化，延遲觸發下一個
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
            UI.updateEnhancementStatus();
            setTimeout(() => {
                UI.updateMandrakeList();
                UI.updateButtonStates();
                UI.updateProgressBars();
            }, 100);
            
            // 使用詳細通知信息
            UI.showNotification(notificationMessage, 'success', 4000);
        }
    }
    
    /**
     * 生成強化通知信息
     */
    static generateEnhancementNotification(enhancementId, enhancement) {
        const effects = game.data.enhancementEffects;
        
        switch (enhancement.effect) {
            case 'global_production':
                const globalProdLevel = Math.round(((effects.globalProductionMultiplier - 1) / ENHANCEMENT_VALUES.stable.global_production));
                const globalProdPercent = ((effects.globalProductionMultiplier - 1) * 100).toFixed(1);
                return `📈 獲得強化：${enhancement.name} [Lv.${globalProdLevel}]！全體產量現在 +${globalProdPercent}%`;
                
            case 'global_cost':
                const globalCostLevel = Math.round(((1 - effects.globalCostMultiplier) / ENHANCEMENT_VALUES.stable.global_cost));
                const globalCostPercent = ((1 - effects.globalCostMultiplier) * 100).toFixed(1);
                return `💰 獲得強化：${enhancement.name} [Lv.${globalCostLevel}]！全體成本現在 -${globalCostPercent}%`;
                
            case 'normal_production':
                const normalLevel = Math.round(((effects.typeProductionMultipliers.normal - 1) / ENHANCEMENT_VALUES.stable.type_production));
                const normalPercent = ((effects.typeProductionMultipliers.normal - 1) * 100).toFixed(1);
                return `🌱 獲得強化：${enhancement.name} [Lv.${normalLevel}]！普通系產量現在 +${normalPercent}%`;
                
            case 'element_production':
                const elementLevel = Math.round(((effects.typeProductionMultipliers.element - 1) / ENHANCEMENT_VALUES.stable.type_production));
                const elementPercent = ((effects.typeProductionMultipliers.element - 1) * 100).toFixed(1);
                return `🔥 獲得強化：${enhancement.name} [Lv.${elementLevel}]！元素系產量現在 +${elementPercent}%`;
                
            case 'animal_production':
                const animalLevel = Math.round(((effects.typeProductionMultipliers.animal - 1) / ENHANCEMENT_VALUES.stable.type_production));
                const animalPercent = ((effects.typeProductionMultipliers.animal - 1) * 100).toFixed(1);
                return `🐱 獲得強化：${enhancement.name} [Lv.${animalLevel}]！動物系產量現在 +${animalPercent}%`;
                
            case 'production_variance':
                const variancePercent = ((effects.globalProductionVariance - 1) * 100).toFixed(1);
                const varianceSign = variancePercent >= 0 ? '+' : '';
                return `📊 獲得強化：${enhancement.name}！產量波動結果：${varianceSign}${variancePercent}%`;
                
            case 'purchase_crit':
                return `💥 獲得強化：${enhancement.name}！購買時有 ${(ENHANCEMENT_VALUES.luck.purchase_crit_chance * 100)}% 機率獲得雙倍`;
                
            case 'cost_variance':
                const costVariancePercent = ((effects.globalCostMultiplier - 1) * 100).toFixed(1);
                const costVarianceSign = costVariancePercent >= 0 ? '+' : '';
                return `🎲 獲得強化：${enhancement.name}！成本波動結果：${costVarianceSign}${costVariancePercent}%`;
                
            case 'reward_cd':
                const cdLevel = Math.round(((1 - effects.rewardCdMultiplier) / ENHANCEMENT_VALUES.reward.cd_reduction));
                const cdPercent = ((1 - effects.rewardCdMultiplier) * 100).toFixed(1);
                return `⏰ 獲得強化：${enhancement.name} [Lv.${cdLevel}]！獎勵冷卻現在 -${cdPercent}%`;
                
            case 'reward_capacity':
                const capacityLevel = effects.bonusRewardCapacity / ENHANCEMENT_VALUES.reward.capacity_increase;
                return `📦 獲得強化：${enhancement.name} [Lv.${capacityLevel}]！獎勵容量現在：${game.data.maxPendingRewards}`;
                
            case 'reward_rarity':
                const rarityLevel = Math.round(effects.rewardRarityBoost / ENHANCEMENT_VALUES.reward.rarity_boost);
                const rarityPercent = (effects.rewardRarityBoost * 100).toFixed(1);
                return `⭐ 獲得強化：${enhancement.name} [Lv.${rarityLevel}]！稀有度提升現在 +${rarityPercent}%`;
                
            case 'quantity_bonus':
                const quantityLevel = effects.quantityBonusLevel;
                const currentMandrakes = Game.getTotalMandrakeCount();
                const currentBonus = Math.floor(currentMandrakes / 10) * ENHANCEMENT_VALUES.combo.per_10_bonus * quantityLevel;
                const bonusPercent = (currentBonus * 100).toFixed(1);
                return `🔢 獲得強化：${enhancement.name} [Lv.${quantityLevel}]！當前效果：+${bonusPercent}% (${currentMandrakes}株)`;
                
            case 'type_synergy':
                const synergyLevel = effects.typeSynergyLevel;
                const effectPerStack = (ENHANCEMENT_VALUES.combo.same_type_bonus * synergyLevel * 100).toFixed(1);
                return `🤝 獲得強化：${enhancement.name} [Lv.${synergyLevel}]！每額外同類型1株：+${effectPerStack}%`;
                
            case 'diversity_bonus':
                const diversityLevel = effects.diversityBonusLevel;
                const diversityPercent = (ENHANCEMENT_VALUES.combo.three_type_bonus * diversityLevel * 100).toFixed(1);
                return `🌈 獲得強化：${enhancement.name} [Lv.${diversityLevel}]！三系齊全時：+${diversityPercent}%`;
                
            default:
                return `✨ 獲得強化：${enhancement.name}！`;
        }
    }
    
    /**
     * 應用強化效果（不變）
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
                    
                    const variancePercent = ((prodFinalFactor - 1) * 100).toFixed(1);
                    const varianceSign = variancePercent >= 0 ? '+' : '';
                    console.log(`🎲 產量波動結果: ${varianceSign}${variancePercent}%`);
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
                    
                    const costVariancePercent = ((costFinalFactor - 1) * 100).toFixed(1);
                    const costVarianceSign = costVariancePercent >= 0 ? '+' : '';
                    console.log(`🎲 成本波動結果: ${costVarianceSign}${costVariancePercent}%`);
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
                
            // Combo類強化改為疊加型
            case 'quantity_bonus':
                effects.hasQuantityBonus = true;
                if (!effects.quantityBonusLevel) effects.quantityBonusLevel = 0;
                effects.quantityBonusLevel++;
                console.log(`📈 規模效應等級提升至: ${effects.quantityBonusLevel}`);
                break;
                
            case 'type_synergy':
                effects.hasTypeSynergy = true;
                if (!effects.typeSynergyLevel) effects.typeSynergyLevel = 0;
                effects.typeSynergyLevel++;
                console.log(`🤝 同系協同等級提升至: ${effects.typeSynergyLevel}`);
                break;
                
            case 'diversity_bonus':
                effects.hasDiversityBonus = true;
                if (!effects.diversityBonusLevel) effects.diversityBonusLevel = 0;
                effects.diversityBonusLevel++;
                console.log(`🌈 多元發展等級提升至: ${effects.diversityBonusLevel}`);
                break;
        }
    }

    /**
     * 🔧 修改：獲取下個里程碑信息 - 改為總株數
     */
    static getNextMilestone() {
        // 🔧 直接從 config.js 讀取里程碑數據
        const totalCountMilestones = ENHANCEMENT_UNLOCK_CONDITIONS.map(condition => condition.threshold);
        
        const currentTotalCount = Game.getTotalMandrakeCount();
        const lastCheckedCount = game.data.enhancements.lastCheckedTotalCount || 0;
        
        for (let i = 0; i < totalCountMilestones.length; i++) {
            const milestone = totalCountMilestones[i];
            if (milestone > lastCheckedCount) {
                const previousMilestone = i > 0 ? totalCountMilestones[i - 1] : 0;
                
                return {
                    type: 'total_count',
                    currentCount: currentTotalCount,
                    targetMilestone: milestone,
                    previousMilestone: previousMilestone,
                    // 🔧 階段內進度 (0-1)
                    progress: Math.max(0, Math.min(1, (currentTotalCount - previousMilestone) / (milestone - previousMilestone))),
                    remaining: milestone - currentTotalCount,
                    description: `總曼德拉草數量達到 ${milestone} 株`
                };
            }
        }
        
        return null;
    }

    /**
     * 獲取強化系統狀態
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

    /**
     * 顯示產量波動情況
     */
    static getProductionVarianceDisplay() {
        const variance = game.data.enhancementEffects.globalProductionVariance;
        if (variance === 1.0) return "無波動";
        
        const percentage = ((variance - 1) * 100).toFixed(1);
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage}%`;
    }

    /**
     * 獲取所有已獲得強化的詳細信息
     */
    static getObtainedEnhancements() {
        const obtained = [];
        
        for (const [enhancementId, level] of Object.entries(game.data.enhancements.obtained || {})) {
            const enhancement = ENHANCEMENTS[enhancementId];
            if (enhancement && level > 0) {
                obtained.push({
                    id: enhancementId,
                    name: enhancement.name,
                    icon: enhancement.icon,
                    level: level,
                    category: enhancement.category,
                    description: enhancement.description()
                });
            }
        }
        
        return obtained.sort((a, b) => {
            // 按類別排序，然後按等級排序
            if (a.category !== b.category) {
                const categoryOrder = { stable: 0, luck: 1, reward: 2, combo: 3 };
                return categoryOrder[a.category] - categoryOrder[b.category];
            }
            return b.level - a.level;
        });
    }

    /**
     * 🔧 新增：獲取強化進度信息（用於UI顯示）
     */
    static getEnhancementProgress() {
        const nextMilestone = this.getNextMilestone();
        
        if (!nextMilestone) {
            return {
                hasNext: false,
                message: '已達到所有強化里程碑！'
            };
        }
        
        const progressPercent = Math.min(nextMilestone.progress * 100, 100);
        
        return {
            hasNext: true,
            currentCount: nextMilestone.currentCount,
            targetCount: nextMilestone.targetMilestone,
            remaining: nextMilestone.remaining,
            progressPercent: progressPercent,
            description: nextMilestone.description,
            message: `${nextMilestone.currentCount}/${nextMilestone.targetMilestone} 株 (${progressPercent.toFixed(1)}%)`
        };
    }

    /**
     * 🔧 新增：調試功能 - 手動觸發強化
     */
    static debugTriggerEnhancement() {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            this.addPendingEnhancement();
            console.log('🔧 調試：手動觸發強化');
        }
    }

    /**
     * 🔧 新增：獲取里程碑列表（用於顯示進度）
     */
    static getAllMilestones() {
        const totalCountMilestones = [25, 60, 120, 200, 300, 420, 560, 720, 900, 1100, 1320, 1560, 1850, 2200, 2600, 3100, 3700, 4400, 5300, 6500];
        const currentTotalCount = Game.getTotalMandrakeCount();
        const lastCheckedCount = game.data.enhancements.lastCheckedTotalCount || 0;
        
        return totalCountMilestones.map(milestone => ({
            threshold: milestone,
            isCompleted: lastCheckedCount >= milestone,
            isCurrent: currentTotalCount >= milestone && lastCheckedCount < milestone,
            progress: Math.min(currentTotalCount / milestone, 1.0),
            description: `總數達到 ${milestone} 株`
        }));
    }
}

// 暴露到全局
window.EnhancementSystem = EnhancementSystem;
window.ENHANCEMENTS = ENHANCEMENTS;

console.log('✅ ENHANCEMENTS 載入:', Object.keys(ENHANCEMENTS).length, '個強化');
console.log('✅ EnhancementSystem 總株數版本載入完成');
console.log('🔮 enhancement.js 載入完成！');