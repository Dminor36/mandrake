// ========== 獎勵系統 ==========

class Rewards {
    // 打開獎勵選擇的函數
static openRewardSelection() {
    if (game.data.pendingRewards <= 0) {
        UI.showNotification('目前沒有獎勵可以領取', 'warning');
        return;
    }

    if (game.data.generatedRewards.length === 0) {
            UI.showNotification('獎勵數據異常，請重新整理頁面', 'error');
            return;
        }
    
    this.showRewardChoice();
}
    
    /**
     * 顯示獎勵選擇界面
     */
    static showRewardChoice() {
        const modal = document.getElementById('reward-modal');
        const optionsContainer = document.getElementById('reward-options');
        
        if (!modal || !optionsContainer) {
            console.error('找不到獎勵模態框元素');
            return;
        }

        // 檢查是否已經有獎勵窗口在顯示
        if (modal && modal.classList.contains('show')) {
            return;
        }

        // 取第一個預生成的獎勵組（包含3個選項）
    const rewardGroup = game.data.generatedRewards[0];
    
    if (!rewardGroup || !rewardGroup.options || rewardGroup.options.length === 0) {
        UI.showNotification('沒有可用的獎勵', 'warning');
        return;
    }

        // 清空之前的選項
        optionsContainer.innerHTML = '';

        // ✅ 顯示這一組的3個選項
        rewardGroup.options.forEach((option, index) => {
            const optionElement = this.createRewardOption(option, index, rewardGroup.id);
            optionsContainer.appendChild(optionElement);
        });

        // 顯示模態框
        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    



    /**
     * 創建獎勵選項元素
     * @param {Object} reward - 獎勵對象
     * @param {number} index - 索引
     * @returns {HTMLElement} 獎勵選項元素
     */
    static createRewardOption(option, index, rewardGroupId) {

        // 添加安全檢查
        if (!option || !option.template || !option.tier || !option.rarityInfo) {
            console.error('獎勵選項數據不完整:', option);
            return document.createElement('div'); // 返回空div避免錯誤
        }

        const optionElement = document.createElement('div');
        optionElement.className = 'reward-option';
        optionElement.style.borderColor = option.rarityInfo.color;
    
    // 添加發光效果（稀有及以上）
    if (option.rarityInfo.glow) {
        optionElement.style.boxShadow = `0 0 15px ${option.rarityInfo.color}40`;
    }

    // ✅ 安全調用 description 函數
    let description = '';
    try {
        if (typeof option.template.description === 'function') {
            description = option.template.description(option.tier);
        } else {
            description = option.template.description || '無描述';
        }
    } catch (error) {
        console.error('描述生成錯誤:', error);
        description = '描述錯誤';
    }

    optionElement.innerHTML = `
        <div class="reward-rarity ${option.rarity}" style="color: ${option.rarityInfo.color};">
            ${option.template.icon} ${option.rarityInfo.name}
        </div>
        <h4>${option.template.name}</h4>
        <p>${description}</p> 
    `;

    // 點擊時傳遞選中的選項和獎勵組ID
    optionElement.onclick = () => this.selectReward(option, rewardGroupId);

    // 添加閃爍效果（傳說級）
    if (option.rarityInfo.sparkle) {
        this.addSparkleEffect(optionElement);
    }

        return optionElement;
    }

   /**
 * 選擇獎勵 - 從3個選項中選擇1個
 */
static selectReward(selectedOption, rewardGroupId) {
    // 執行獎勵效果
    this.applyRewardEffect(selectedOption);
    
    // 從預生成獎勵列表中移除整個獎勵組
    const rewardIndex = game.data.generatedRewards.findIndex(r => r.id === rewardGroupId);
    if (rewardIndex !== -1) {
        game.data.generatedRewards.splice(rewardIndex, 1);
    }
    
    // 減少待領取獎勵數量
    game.data.pendingRewards = Math.max(0, game.data.pendingRewards - 1);

    // 如果之前是滿額狀態（2個獎勵），現在變成1個，需要重新計時
    // 如果之前是1個獎勵，現在變成0個，不需要重新計時
    if (game.data.pendingRewards + 1 >= game.data.maxPendingRewards && 
        game.data.pendingRewards < game.data.maxPendingRewards) {
        // 從滿額狀態變為未滿，重新開始計時
        game.data.lastRewardTime = Date.now();
    }
    // 其他情況保持原本的計時狀態不變
    
    // 隱藏模態框
    this.hideRewardModal();
    
    // 保存遊戲
    game.saveGame();
    
    // 顯示獲得獎勵的通知
    const message = `獲得 ${selectedOption.rarityInfo.name} ${selectedOption.template.name}！`;
    UI.showNotification(message, 'success');
    
    // 更新UI
    UI.updateAll();
}

    /**
 * 應用獎勵效果
 */
static applyRewardEffect(selectedOption) {
    const { template, tier, rarity } = selectedOption;

    switch (template.name) {
        case '生產力提升':
            game.applyTempBoost('production', 1 + tier.bonus/100, tier.duration);
            if (game.forceProductionUpdate) {
            game.forceProductionUpdate('reward_boost');
            }
            break;
            
        case '元素共鳴':
            game.applyTempBoost('element', 1 + tier.bonus/100, tier.duration);
            if (game.forceElementUpdate) {
                game.forceElementUpdate('reward_boost');
            }
            break;
            
        case '野性爆發':
            game.applyTempBoost('animal', 1 + tier.bonus/100, tier.duration);
            if (game.forceAnimalUpdate) {
                game.forceAnimalUpdate('reward_boost');
            }
            break;
            
        case '返璞歸真':
            game.applyTempBoost('normal', 1 + tier.bonus/100, tier.duration);
            if (game.forceNormalUpdate) {
                game.forceNormalUpdate('reward_boost');
            }
            break;
            
        case '即時果實':
            const minuteProduction = game.getTotalProduction() * 60 * tier.minutes;
            game.data.fruit += minuteProduction;
            const formattedAmount = UI.formatNumber(minuteProduction);
            UI.showNotification(`獲得 ${tier.minutes} 分鐘產量的果實！(${formattedAmount})`, 'success');
            break;
            
        case '收穫爆發':
            // 找到擁有最多的曼德拉草
            let maxCount = 0;
            let maxType = null;
            
            for (const [id, count] of Object.entries(game.data.ownedMandrakes)) {
                if (count > maxCount) {
                    maxCount = count;
                    maxType = id;
                }
            }
            
            if (maxType && maxCount > 0) {
                const singleProduction = game.calculateSingleMandrakeProduction(maxType, 1);
                const burstAmount = singleProduction * maxCount * 3600 * tier.hours;
                game.data.fruit += burstAmount;
                
                const config = MANDRAKE_CONFIG[maxType];
                const formattedAmount = UI.formatNumber(burstAmount);
                UI.showNotification(`${config.name} 收穫爆發！獲得 ${tier.hours} 小時產量！(${formattedAmount})`, 'success');
            } else {
                UI.showNotification('沒有曼德拉草可以爆發收穫', 'warning');
            }
            break;
            
        case '購買狂潮':
            game.data.purchaseBoost = {
                remainingPurchases: tier.count,
                discount: tier.discount / 100,
                endTime: Date.now() + 3600000
            };
            UI.showNotification(`購買狂潮啟動！接下來 ${tier.count} 次購買享 ${tier.discount}% 折扣！`, 'success');
            break;
            
        case '幸運連擊':
            game.data.luckyStreak = {
                remainingTriggers: tier.count,
                chance: tier.chance / 100,
                endTime: Date.now() + 3600000
            };
            UI.showNotification(`幸運連擊啟動！接下來 ${tier.count} 次有 ${tier.chance}% 機率雙倍產量！`, 'success');
            break;

        default:
            console.warn('未知的獎勵類型:', template.name);
            UI.showNotification(`獲得了 ${template.name}，但效果尚未實作`, 'warning');
    }

    // 更新UI
    UI.updateAll();
}

    /**
     * 應用類型保證效果
     * @param {Object} tier - 獎勵階層配置
     */
    static applyTypeGuarantee(tier) {
        // 隨機選擇一個類型
        const types = ['normal', 'element', 'animal'];
        const selectedType = types[Math.floor(Math.random() * types.length)];
        
        // 根據機率決定是否成功
        if (Math.random() < tier.chance) {
            game.data.forceNextType = selectedType;
            
            if (tier.bonus) {
                game.data.nextUnlockBonus = true;
            }
            
            const typeNames = {
                normal: '普通系',
                element: '元素系',
                animal: '動物系'
            };
            
            UI.showNotification(`下次解鎖將是 ${typeNames[selectedType]}！`, 'info');
        } else {
            UI.showNotification('運氣不佳，類型保證失敗...', 'warning');
        }
    }

    /**
     * 應用天氣操控效果
     * @param {Object} tier - 獎勵階層配置
     */
    static applyWeatherControl(tier) {
        switch (tier.effect) {
            case 'free_reroll':
                game.data.freeWeatherReroll = true;
                UI.showNotification('下次重骰天氣免費！', 'info');
                break;

            case 'choose_weather':
                this.showWeatherChoiceModal();
                break;

            case 'lock_weather':
                game.data.weatherLocked = Date.now() + tier.duration;
                UI.showNotification('天氣已鎖定2小時！', 'info');
                break;

            case 'perfect_weather':
                game.data.weather = 'perfect';
                game.data.weatherLocked = Date.now() + tier.duration;
                UI.showNotification('完美天氣降臨4小時！', 'success');
                break;
        }
    }

    /**
     * 顯示天氣選擇模態框
     */
    static showWeatherChoiceModal() {
        const modal = document.getElementById('reward-modal');
        const optionsContainer = document.getElementById('reward-options');
        
        optionsContainer.innerHTML = '<h4>選擇天氣</h4>';
        
        // 獲取可選天氣（排除特殊天氣）
        const availableWeathers = Object.entries(WEATHER_CONFIG)
            .filter(([type, config]) => !config.isSpecial);

        availableWeathers.forEach(([type, config]) => {
            const option = document.createElement('div');
            option.className = 'reward-option';
            option.innerHTML = `
                <div>${config.icon}</div>
                <h4>${config.name}</h4>
                <p>${config.effect}</p>
            `;
            
            option.onclick = () => {
                game.data.weather = type;
                this.hideRewardModal();
                UI.showNotification(`天氣變為 ${config.name}！`, 'success');
                UI.updateWeather();
            };
            
            optionsContainer.appendChild(option);
        });
    }

    /**
     * 隱藏獎勵模態框
     */
    static hideRewardModal() {
        const modal = document.getElementById('reward-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }

    /**
     * 添加閃爍效果
     * @param {HTMLElement} element - 目標元素
     */
    static addSparkleEffect(element) {
        const sparkles = ['✨', '⭐', '💫', '🌟'];
        
        setInterval(() => {
            const sparkle = document.createElement('span');
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            sparkle.style.cssText = `
                position: absolute;
                pointer-events: none;
                animation: sparkle 2s ease-out forwards;
                font-size: 12px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            element.style.position = 'relative';
            element.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 2000);
        }, 500);
    }

    /**
     * 獲取獎勵統計信息
     * @returns {Object} 統計信息
     */
    static getRewardStats() {
        let nextRewardIn =
            GAME_CONFIG.REWARD_INTERVAL *
                game.data.enhancementEffects.rewardCdMultiplier -
            (Date.now() - game.data.lastRewardTime);

        if (game.data.pendingRewards >= game.data.maxPendingRewards) {
            nextRewardIn = 0;
        } else {
            nextRewardIn = Math.max(0, nextRewardIn);
        }

        return {
            totalTemplates: Object.keys(REWARD_TEMPLATES).length,
            totalRarities: Object.keys(RARITY_CONFIG).length,
            nextRewardIn,
            activeBoosts: Object.keys(game.data.tempBoosts).length
        };
    }

    /**
     * 檢查是否有活躍的臨時效果
     * @param {string} type - 效果類型
     * @returns {Object|null} 效果信息
     */
    static getActiveBoost(type) {
        const boost = game.data.tempBoosts[type];
        if (boost && Date.now() < boost.endTime) {
            return {
                multiplier: boost.multiplier,
                remaining: boost.endTime - Date.now(),
                endTime: new Date(boost.endTime)
            };
        }
        return null;
    }

    /**
     * 獲取所有活躍效果
     * @returns {Array} 活躍效果列表
     */
    static getAllActiveBoosts() {
        const activeBoosts = [];
        
        for (const [type, boost] of Object.entries(game.data.tempBoosts)) {
            if (Date.now() < boost.endTime) {
                activeBoosts.push({
                    type: type,
                    multiplier: boost.multiplier,
                    remaining: boost.endTime - Date.now(),
                    endTime: new Date(boost.endTime)
                });
            }
        }
        
        return activeBoosts;
    }

    /**
     * 強制觸發獎勵（調試用）
     */
    static debugTriggerReward() {
        console.log('調試觸發獎勵');
        
        if (!game || !game.data) {
            console.error('遊戲未初始化');
            return;
        }
        
        try {
            // 增加待領取獎勵
            const oldCount = game.data.pendingRewards;
            game.data.pendingRewards = Math.min(oldCount + 1, game.data.maxPendingRewards || 2);
            
            // 生成新獎勵
            game.generateNewReward();
            
            // 更新UI
            UI.updateRewardStatus();
            UI.showNotification('調試：強制觸發獎勵！', 'success');
            
            console.log(`獎勵觸發成功：${oldCount} → ${game.data.pendingRewards}`);
            
        } catch (error) {
            console.error('觸發獎勵失敗:', error);
        }
    }
}
// 添加CSS動畫（如果不存在）
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkle {
            0% {
                opacity: 0;
                transform: translateY(0) scale(0.5);
            }
            50% {
                opacity: 1;
                transform: translateY(-20px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-40px) scale(0.5);
            }
        }
        
        .reward-option.legendary {
            animation: legendaryGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes legendaryGlow {
            from {
                box-shadow: 0 0 15px #ff980040;
            }
            to {
                box-shadow: 0 0 25px #ff980080;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// 暴露Rewards類供其他模組使用
window.Rewards = Rewards;

