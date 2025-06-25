// ========== 強化展示系統 - 修復版 ==========

console.log('🔮 enhancementDisplay.js 開始載入...');

class EnhancementDisplay {
    static isExpanded = false;
    
    /**
     * 初始化強化展示系統
     */
    static init() {
        console.log('🔮 強化展示系統初始化');
        this.updateDisplay();
    }
    
    /**
     * 切換展開/摺疊狀態
     */
    static toggle() {
        this.isExpanded = !this.isExpanded;
        const expandedDiv = document.getElementById('enhancementExpanded');
        
        if (this.isExpanded) {
            expandedDiv.style.display = 'flex';
            this.updateDetailGrid();
        } else {
            expandedDiv.style.display = 'none';
        }
    }
    
    /**
     * 更新強化展示
     */
    static updateDisplay() {
        this.updateMainIcon();
        if (this.isExpanded) {
            this.updateDetailGrid();
        }
    }
    
    /**
     * 更新主圖標的數字 - 只計算已獲得的強化
     */
    static updateMainIcon() {
        const countElement = document.getElementById('enhancementTotalCount');
        if (!countElement || !game || !game.data) return;
        
        const obtained = game.data.enhancements.obtained || {};
        // 只計算等級大於0的強化
        const totalLevels = Object.values(obtained)
            .filter(level => level > 0)
            .reduce((sum, level) => sum + level, 0);
        
        const obtainedCount = Object.values(obtained).filter(level => level > 0).length;
        
        // 顯示格式：總等級數
        countElement.textContent = totalLevels;
        
        // 根據強化數量改變主圖標顏色
        const toggleElement = document.querySelector('.enhancement-toggle');
        if (toggleElement) {
            if (totalLevels === 0) {
                // 未獲得任何強化 - 灰色
                toggleElement.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.6), rgba(75, 85, 99, 0.6))';
                toggleElement.style.opacity = '0.7';
            } else if (totalLevels >= 20) {
                // 大師級 - 金色
                toggleElement.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 193, 7, 0.9))';
                toggleElement.style.opacity = '1';
            } else if (totalLevels >= 10) {
                // 高級 - 紫色
                toggleElement.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(147, 51, 234, 0.9))';
                toggleElement.style.opacity = '1';
            } else {
                // 初級 - 藍色
                toggleElement.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))';
                toggleElement.style.opacity = '1';
            }
        }
    }
    
    /**
     * 更新詳細網格 - 只顯示已獲得的強化
     */
    static updateDetailGrid() {
        const grid = document.getElementById('enhancementDetailGrid');
        if (!grid || !game || !game.data) return;
        
        grid.innerHTML = '';
        
        const obtained = game.data.enhancements.obtained || {};
        // 只顯示等級大於0的強化
        const enhancementKeys = Object.keys(obtained).filter(key => obtained[key] > 0);
        
        if (enhancementKeys.length === 0) {
            grid.innerHTML = '<div class="no-enhancements">尚未獲得任何強化</div>';
            return;
        }
        
        // 按類別分組並排序
        const grouped = this.groupEnhancementsByCategory(enhancementKeys, obtained);
        
        // 按固定順序渲染，但只顯示已獲得的
        ['stable', 'luck', 'reward', 'combo'].forEach(category => {
            if (grouped[category] && grouped[category].length > 0) {
                // 按強化ID排序以保持一致的顯示順序
                grouped[category].sort((a, b) => a.id.localeCompare(b.id));
                
                grouped[category].forEach(({ id, level }) => {
                    const item = this.createEnhancementItem(id, level);
                    if (item) {
                        grid.appendChild(item);
                    }
                });
            }
        });
    }
    
    /**
     * 按類別分組強化 - 只處理已獲得的
     */
    static groupEnhancementsByCategory(enhancementKeys, obtained) {
        const grouped = { stable: [], luck: [], reward: [], combo: [] };
        
        enhancementKeys.forEach(key => {
            const enhancement = ENHANCEMENTS[key];
            const level = obtained[key];
            
            // 確保強化存在且等級大於0
            if (enhancement && level > 0) {
                grouped[enhancement.category].push({
                    id: key,
                    level: level
                });
            }
        });
        
        return grouped;
    }
    
    /**
     * 創建單個強化項目
     */
    static createEnhancementItem(enhancementId, level) {
        const enhancement = ENHANCEMENTS[enhancementId];
        if (!enhancement) return null;
        
        const item = document.createElement('div');
        item.className = `enhancement-item ${enhancement.category}`;
        
        // 高級強化特效
        if (level >= 5) {
            item.classList.add('high-level');
        }
        
        // 獲取當前效果描述
        const description = this.getEnhancementDescription(enhancementId, level);
        
        item.innerHTML = `
            <span class="enhancement-icon">${enhancement.icon}</span>
            ${level > 1 ? `<div class="enhancement-level">${level}</div>` : ''}
            <div class="enhancement-tooltip">
                <div class="tooltip-title">${enhancement.name}</div>
                ${level > 1 ? `<div class="tooltip-level">等級 ${level}</div>` : ''}
                <div class="tooltip-description">${description}</div>
            </div>
        `;
        
        // 調整工具提示位置，避免超出視窗
        item.addEventListener('mouseenter', (e) => {
            this.adjustTooltipPosition(e.currentTarget);
        });
        
        return item;
    }
    
    /**
     * 調整工具提示位置，避免超出視窗
     */
    static adjustTooltipPosition(item) {
        const tooltip = item.querySelector('.enhancement-tooltip');
        if (!tooltip) return;
        
        const rect = item.getBoundingClientRect();
        const tooltipWidth = 160;
        
        // 重置所有位置類
        tooltip.classList.remove('left', 'top');
        
        // 檢查右側空間
        if (rect.right + 8 + tooltipWidth > window.innerWidth) {
            // 右側空間不足，嘗試左側
            if (rect.left - 8 - tooltipWidth > 0) {
                tooltip.classList.add('left');
            } else {
                // 左右都不夠，顯示在上方
                tooltip.classList.add('top');
            }
        }
        // 否則使用默認右側位置
    }
    
    /**
     * 🔧 修復：獲取強化的當前效果描述 - 顯示當前等級效果
     */
    static getEnhancementDescription(enhancementId, level) {
        const enhancement = ENHANCEMENTS[enhancementId];
        if (!enhancement) return '未知效果';
        
        try {
            // 🔧 生成當前等級的效果描述
            const currentDescription = this.generateCurrentLevelDescription(enhancementId, level);
            
            // 計算實際產量影響
            const productionIncrease = this.calculateProductionIncrease(enhancementId, level);
            
            // 🔧 修復：使用 HTML 換行而不是 \n
            return `${currentDescription}<br>📈 總產量增加: ${productionIncrease}`;
            
        } catch (error) {
            console.warn('獲取強化描述失敗:', enhancementId, error);
            return '效果描述錯誤';
        }
    }
    
    /**
     * 🔧 新增：生成當前等級的效果描述
     */
    static generateCurrentLevelDescription(enhancementId, level) {
        const enhancement = ENHANCEMENTS[enhancementId];
        if (!enhancement || !game?.data?.enhancementEffects) return '無效果';
        
        const effects = game.data.enhancementEffects;
        
        // 根據強化ID生成當前等級的描述
        switch (enhancementId) {
            case 'stable_global_production':
                const globalProd = ((effects.globalProductionMultiplier - 1) * 100).toFixed(1);
                return `全體產量 +${globalProd}%`;
                
            case 'stable_global_cost':
                const globalCost = ((1 - effects.globalCostMultiplier) * 100).toFixed(1);
                return `全體成本 -${globalCost}%`;
                
            case 'stable_normal_production':
                const normalProd = ((effects.typeProductionMultipliers.normal - 1) * 100).toFixed(1);
                return `普通系產量 +${normalProd}%`;
                
            case 'stable_element_production':
                const elementProd = ((effects.typeProductionMultipliers.element - 1) * 100).toFixed(1);
                return `元素系產量 +${elementProd}%`;
                
            case 'stable_animal_production':
                const animalProd = ((effects.typeProductionMultipliers.animal - 1) * 100).toFixed(1);
                return `動物系產量 +${animalProd}%`;
                
            case 'luck_production_variance':
                const variance = ((effects.globalProductionVariance - 1) * 100).toFixed(1);
                const sign = variance >= 0 ? '+' : '';
                return `產量波動結果: ${sign}${variance}%`;
                
            case 'luck_purchase_crit':
                const critChance = (ENHANCEMENT_VALUES.luck?.purchase_crit_chance * 100 || 15);
                return `購買暴擊率: ${critChance}%`;
                
            case 'luck_cost_variance':
                const costVariance = ((effects.globalCostMultiplier - 1) * 100).toFixed(1);
                const costSign = costVariance >= 0 ? '+' : '';
                return `成本波動結果: ${costSign}${costVariance}%`;
                
            case 'reward_cd_reduction':
                const cdReduction = ((1 - effects.rewardCdMultiplier) * 100).toFixed(1);
                return `獎勵冷卻 -${cdReduction}%`;
                
            case 'reward_capacity_increase':
                const capacity = game.data.maxPendingRewards || 2;
                return `獎勵容量: ${capacity}`;
                
            case 'reward_rarity_boost':
                const rarityBoost = (effects.rewardRarityBoost * 100).toFixed(1);
                return `稀有度提升 +${rarityBoost}%`;
                
            case 'combo_quantity_bonus':
                const quantityLevel = effects.quantityBonusLevel || level;
                const currentMandrakes = Game?.getTotalMandrakeCount?.() || 0;
                const quantityEffect = Math.floor(currentMandrakes / 10) * 
                    (ENHANCEMENT_VALUES.combo?.per_10_bonus || 0.001) * quantityLevel;
                const quantityPercent = (quantityEffect * 100).toFixed(1);
                return `每10株曼德拉草：全體產量+${ENHANCEMENT_VALUES.combo?.per_10_bonus * quantityLevel * 100}% (${currentMandrakes}株)`;
                
            case 'combo_type_synergy':
                const synergyLevel = effects.typeSynergyLevel || level;
                const synergyEffect = (ENHANCEMENT_VALUES.combo?.same_type_bonus || 0.002) * synergyLevel * 100;
                return `每額外1株 +${synergyEffect.toFixed(1)}%`;
                
            case 'combo_diversity_bonus':
                const diversityLevel = effects.diversityBonusLevel || level;
                const diversityEffect = (ENHANCEMENT_VALUES.combo?.three_type_bonus || 0.5) * diversityLevel * 100;
                return `三系齊全 +${diversityEffect.toFixed(1)}%`;
                
            default:
                // 備用：使用強化名稱
                return `${enhancement.name}`;
        }
    }
    
    /**
     * 🔧 修復：計算強化對總產量的實際增加 - 適配曼德拉草系統
     */
    static calculateProductionIncrease(enhancementId, level) {
        if (!game || !game.data || !game.getTotalProduction) return '+0%';
        
        const enhancement = ENHANCEMENTS[enhancementId];
        if (!enhancement) return '+0%';
        
        // 保存原始強化等級
        const originalLevel = game.data.enhancements.obtained[enhancementId] || 0;
        
        try {
            // 暫時設置為0來計算基礎產量
            game.data.enhancements.obtained[enhancementId] = 0;
            
            // 重建強化效果（不包含此強化）
            if (game.rebuildEnhancementEffects) {
                game.rebuildEnhancementEffects();
            }
            
            // 強制更新產量快取
            if (game.markProductionDirty) {
                game.markProductionDirty('enhancement_calculation');
            }
            
            const baseProduction = game.getTotalProduction();
            
            // 設置為當前等級來計算有強化的產量
            game.data.enhancements.obtained[enhancementId] = level;
            
            // 重建強化效果（包含此強化）
            if (game.rebuildEnhancementEffects) {
                game.rebuildEnhancementEffects();
            }
            
            // 強制更新產量快取
            if (game.markProductionDirty) {
                game.markProductionDirty('enhancement_calculation');
            }
            
            const enhancedProduction = game.getTotalProduction();
            
            // 恢復原始等級
            game.data.enhancements.obtained[enhancementId] = originalLevel;
            
            // 恢復原始強化效果
            if (game.rebuildEnhancementEffects) {
                game.rebuildEnhancementEffects();
            }
            
            // 強制更新產量快取
            if (game.markProductionDirty) {
                game.markProductionDirty('enhancement_restore');
            }
            
            // 計算增加百分比
            if (baseProduction === 0 || !isFinite(baseProduction)) return '+0%';
            
            const increasePercent = ((enhancedProduction - baseProduction) / baseProduction * 100);
            
            if (!isFinite(increasePercent)) return '+0%';
            
            return `+${increasePercent.toFixed(1)}%`;
            
        } catch (error) {
            console.error('計算產量增加時發生錯誤:', error);
            
            // 確保恢復原始狀態
            game.data.enhancements.obtained[enhancementId] = originalLevel;
            if (game.rebuildEnhancementEffects) {
                game.rebuildEnhancementEffects();
            }
            
            // 使用備用計算方法
            return this.fallbackProductionCalculation(enhancementId, level);
        }
    }
    
    /**
     * 🔧 新增：備用產量計算方法
     */
    static fallbackProductionCalculation(enhancementId, level) {
        const enhancement = ENHANCEMENTS[enhancementId];
        if (!enhancement || !ENHANCEMENT_VALUES) return '+0%';
        
        try {
            // 根據強化類型估算影響
            switch (enhancement.effect || enhancement.category) {
                case 'global_production':
                case 'stable':
                    const globalBonus = (ENHANCEMENT_VALUES.stable?.global_production || 0.15) * level * 100;
                    return `+${globalBonus.toFixed(1)}%`;
                    
                case 'normal_production':
                case 'element_production': 
                case 'animal_production':
                    const typeBonus = (ENHANCEMENT_VALUES.stable?.type_production || 0.25) * level * 100;
                    return `+${typeBonus.toFixed(1)}%`;
                    
                case 'quantity_bonus':
                    const currentMandrakes = game?.data?.ownedMandrakes ? 
                        Object.values(game.data.ownedMandrakes).reduce((sum, count) => sum + count, 0) : 0;
                    const quantityBonus = Math.floor(currentMandrakes / 10) * 
                        (ENHANCEMENT_VALUES.combo?.per_10_bonus || 0.001) * level * 100;
                    return `+${quantityBonus.toFixed(1)}%`;
                    
                case 'diversity_bonus':
                    const diversityBonus = (ENHANCEMENT_VALUES.combo?.three_type_bonus || 0.5) * level * 100;
                    return `+${diversityBonus.toFixed(1)}%`;
                    
                case 'type_synergy':
                    const synergyBonus = (ENHANCEMENT_VALUES.combo?.same_type_bonus || 0.002) * level * 100;
                    return `+${synergyBonus.toFixed(1)}%`;
                    
                default:
                    return '+未知%';
            }
        } catch (error) {
            console.error('備用計算失敗:', error);
            return '+未知%';
        }
    }
}

// 全局切換函數
window.toggleEnhancementDisplay = function() {
    EnhancementDisplay.toggle();
};

// 暴露類供其他模組使用
window.EnhancementDisplay = EnhancementDisplay;

console.log('✅ EnhancementDisplay 修復版載入完成');
