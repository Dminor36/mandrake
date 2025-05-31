// ========== UI 管理系統 ==========

class UI {
    static notificationContainer = null;
    static currentBulkAmount = 1;

    /**
     * 初始化UI系統
     */
    static init() {
        this.notificationContainer = document.getElementById('notification-container');
        this.setupBulkBuyControls(); 
        console.log('UI系統初始化完成');
    }

    /**
     * 更新所有UI元素
     */
    static updateAll() {
        this.updateResources();
        this.updateWeather();
        this.updateMandrakeList();
        this.updateFarmVisual();
        this.updateRebirthInfo();
        this.updateRewardStatus(); 
    }

    /**
     * 更新資源顯示
     */
    static updateResources() {
        const data = game.data;
        
        // 使用新的格式化函數更新數字
        this.updateNumberWithAnimation('fruit', data.fruit, true);
        this.updateNumberWithAnimation('total-mandrakes', Game.getTotalMandrakeCount(), false);
        this.updateNumberWithAnimation('production-rate', game.getTotalProduction(), true);
        this.updateNumberWithAnimation('talent-points', data.talentPoints, false);
        
        // 更新農場使用情況
        const usedSlots = game.getUsedFarmSlots();
        const farmUsedElement = document.getElementById('farm-used');
        if (farmUsedElement) {
            farmUsedElement.textContent = usedSlots;
        }

        this.updateButtonStates();
    }

    // 獎勵更新函數
static updateRewardStatus() {
    const pendingElement = document.getElementById('pending-rewards');
    const maxElement = document.getElementById('max-rewards');
    const buttonElement = document.getElementById('claim-reward-btn');
    
    if (pendingElement) {
        pendingElement.textContent = game.data.pendingRewards;
    }
    
    if (maxElement) {
        maxElement.textContent = game.data.maxPendingRewards;
    }
    
    if (buttonElement) {
        // 更新按鈕狀態
        if (game.data.pendingRewards > 0) {
            buttonElement.disabled = false;
            buttonElement.classList.add('has-rewards');
            buttonElement.textContent = `領取獎勵 (${game.data.pendingRewards})`;
            
            // 添加獎勵徽章
            let badge = buttonElement.querySelector('.reward-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'reward-badge';
                buttonElement.appendChild(badge);
            }
            badge.textContent = game.data.pendingRewards;
        } else {
            buttonElement.disabled = true;
            buttonElement.classList.remove('has-rewards');
            buttonElement.textContent = '暫無獎勵';
            
            // 移除徽章
            const badge = buttonElement.querySelector('.reward-badge');
            if (badge) {
                badge.remove();
            }
        }
    }
}

    /**
     * 更新天氣顯示
     */
    static updateWeather() {
        const weatherConfig = WEATHER_CONFIG[game.data.weather];
        if (!weatherConfig) return;

        const iconElement = document.getElementById('weather-icon');
        const nameElement = document.getElementById('current-weather');
        const effectElement = document.getElementById('weather-effect');
        const costElement = document.getElementById('weather-cost');

        if (iconElement) iconElement.textContent = weatherConfig.icon;
        if (nameElement) nameElement.textContent = weatherConfig.name;
        if (effectElement) effectElement.textContent = weatherConfig.effect;
        if (costElement) costElement.textContent = game.data.freeWeatherReroll ? '免費' : '100';
    }

    /**
     * 更新曼德拉草列表
     */
    static updateMandrakeList() {
        const container = document.getElementById('mandrake-list');
        if (!container) {console.error('找不到 mandrake-list 元素'); 
            return;
        }

    console.log('開始更新曼德拉草列表'); // 加入這行來調試
    console.log('已解鎖的曼德拉草:', game.data.unlockedMandrakes); // 加入這行來調試

        container.innerHTML = '';

        // 顯示已解鎖的曼德拉草
        for (const id of game.data.unlockedMandrakes) {
            const config = MANDRAKE_CONFIG[id];
            if (!config) {
            console.error('找不到曼德拉草配置:', id); // 加入這行來調試
            continue;
        }

            const count = game.data.ownedMandrakes[id] || 0;
            const cost = game.getCurrentCost(id);
            const production = this.calculateMandrakeProduction(id, count);
            // 同時顯示升級後的產量提升

            const row = this.createMandrakeRow(id, config, count, cost, production);
            container.appendChild(row);
        }

        // 顯示下一階層解鎖進度
        this.addTierUnlockProgress(container);
    }

    /**
     * 計算曼德拉草產量
     */
    static calculateMandrakeProduction(id, count) {
        // 直接從遊戲的計算結果取得
        return game.individualProductions?.[id] || 0;
    }

    /**
     * 創建曼德拉草行
     */
    static createMandrakeRow(id, config, count, cost, production) {
        const row = document.createElement('div');
        row.className = `plant-row ${config.type}`;

        // 創建圖標元素
        const iconElement = imageManager.createImageElement(config.icon, config.name, 'plant-icon');

        // 計算批量購買的成本和收益
        const bulkCost = this.calculateBulkCost(id, this.currentBulkAmount);
        const nextProduction = game.calculateSingleMandrakeProduction(id, count + this.currentBulkAmount);
        const productionIncrease = nextProduction - production;
        
        const formattedIncrease = this.formatNumber(productionIncrease);
        const formattedCost = this.formatNumber(bulkCost);
        
        // 檢查是否能負擔完整批量
        const canAfford = game.data.fruit >= bulkCost;
        const buttonText = this.currentBulkAmount > 1 ? 
            `種植 ${this.currentBulkAmount}個 (${formattedCost})` : 
            `種植 (${formattedCost})`;

        row.innerHTML = `
            <div class="plant-info">
                <div class="plant-name">
                    <span class="plant-icon-container"></span>
                    ${config.name}：${count} 株
                </div>
                <div class="plant-production">產量：${this.formatNumber(production)}/秒</div>
            </div>
            <div class="plant-upgrade-info">
                <div class="upgrade-benefit">+${formattedIncrease}/秒</div>
                <button class="plant-buy-btn" onclick="buyMandrakesBulk('${id}', ${this.currentBulkAmount})" ${!canAfford ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;

        // 插入圖標
        const iconContainer = row.querySelector('.plant-icon-container');
        iconContainer.appendChild(iconElement);

        return row;
    }

    /**
     * 添加階層解鎖進度
     */
    static addTierUnlockProgress(container) {
        const nextTier = game.data.currentTier + 1;
        const unlockCondition = TIER_UNLOCK_CONDITIONS[nextTier];

        if (unlockCondition) {
            const row = document.createElement('div');
            row.className = 'plant-row locked';

            const progress = Game.getTotalMandrakeCount();
            const needed = this.getTierRequirement(nextTier);

            row.innerHTML = `🔒 第${nextTier}階解鎖 (${progress}/${needed} 曼德拉草)`;
            container.appendChild(row);
        }
    }

    /**
     * 獲取階層解鎖要求
     */
    static getTierRequirement(tier) {
        const requirements = {
            2: 10,
            3: 50,
            4: 200,
            5: 500
        };
        return requirements[tier] || 1000;
    }

    /**
     * 更新農場視覺效果
     */
    static updateFarmVisual() {
        const farmArea = document.getElementById('farm-area');
        if (!farmArea) return;

        farmArea.innerHTML = '';

        // 為每個格子創建元素
        game.data.farmSlots.forEach((slot, index) => {
            const slotElement = this.createFarmSlot(slot, index);
            farmArea.appendChild(slotElement);
        });
    }

    /**
     * 創建農場格子
     */
    static createFarmSlot(slot, index) {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'farm-slot';
        slotDiv.setAttribute('data-slot-index', index);

        if (slot) {
            // 有曼德拉草的格子
            slotDiv.classList.add('occupied');
            const config = MANDRAKE_CONFIG[slot.type];
            
            if (config) {
                const visualElement = this.createMandrakeVisual(slot.type, config);
                slotDiv.appendChild(visualElement);

                // 添加數量徽章（如果同類型曼德拉草數量大於1）
                const count = game.data.ownedMandrakes[slot.type] || 0;
                if (count > 1) {
                    const countBadge = this.createCountBadge(count);
                    slotDiv.appendChild(countBadge);
                }
            }
        } else {
            // 空格子
            slotDiv.classList.add('empty');
            slotDiv.textContent = '🌱';
            slotDiv.title = '空地';
        }

        return slotDiv;
    }

    /**
     * 創建曼德拉草視覺元素
     */
    static createMandrakeVisual(type, config) {
        const visual = document.createElement('div');
        visual.className = 'mandrake-visual';

        // 創建圖像或emoji
        const imageElement = imageManager.createImageElement(config.icon, config.name, 'mandrake-image');
        visual.appendChild(imageElement);

        // 添加工具提示
        visual.title = `${config.name} (第${config.tier}階)`;

        return visual;
    }

    /**
     * 創建數量徽章
     */
    static createCountBadge(count) {
        const badge = document.createElement('div');
        badge.className = 'mandrake-count';
        badge.textContent = count;
        badge.title = `共有 ${count} 株`;
        return badge;
    }

    /**
     * 更新重生信息
     */
    static updateRebirthInfo() {
        const pointsElement = document.getElementById('rebirth-points');
        if (pointsElement) {
            const points = game.calculateRebirthPoints();
            pointsElement.textContent = points;
        }
    }

    /**
     * 更新獎勵倒數計時
     */
    static updateRewardTimer() {
    const countdownElement = document.getElementById('reward-countdown');
    if (!countdownElement) return;

    // ✅ 如果獎勵已滿，顯示"已滿"狀態
    if (game.data.pendingRewards >= game.data.maxPendingRewards) {
        countdownElement.textContent = '已滿';
        countdownElement.parentElement.style.animation = '';
        countdownElement.style.color = '#ff6b6b'; // 紅色表示已滿
        return;
    }

    const timeSinceReward = Date.now() - game.data.lastRewardTime;
    const remaining = Math.max(0, GAME_CONFIG.REWARD_INTERVAL - timeSinceReward);

    if (remaining === 0) {
        countdownElement.textContent = '00:00';
        countdownElement.parentElement.style.animation = 'bounce 1s infinite';
        countdownElement.style.color = '#4CAF50'; // 綠色表示可領取
    } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        countdownElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        countdownElement.parentElement.style.animation = '';
        countdownElement.style.color = '#666'; // 正常顏色
    }
}

    /**
     * 顯示通知
     */
    static showNotification(message, type = 'info', duration = GAME_CONFIG.NOTIFICATION_DURATION) {
        if (!this.notificationContainer) {
            this.notificationContainer = document.getElementById('notification-container');
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // 添加關閉按鈕
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            float: right;
            margin-left: 10px;
            cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.onclick = () => notification.remove();
        notification.appendChild(closeBtn);

        this.notificationContainer.appendChild(notification);

        // 自動移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        // 限制通知數量
        const notifications = this.notificationContainer.children;
        if (notifications.length > 5) {
            notifications[0].remove();
        }
    }

    /**
     * 顯示載入指示器
     */
    static showLoading(element, show = true) {
        if (show) {
            element.classList.add('loading');
            element.disabled = true;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }

    /**
     * 顯示確認對話框
     */
    static showConfirm(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }

    /**
     * 格式化數字顯示
     */
    static formatNumber(num) {
         // 確保是數字
        const number = parseFloat(num);
        if (isNaN(number)) return '0';
        
        // 小於1000直接顯示
         if (number < 1000) {
            return number.toFixed(1);
        }   
    
        // 定義單位
        const units = [
            { value: 1e15, symbol: 'P' },   // Quadrillion 千兆
            { value: 1e12, symbol: 'T' },   // Trillion 兆
            { value: 1e9,  symbol: 'B' },   // Billion 十億
            { value: 1e6,  symbol: 'M' },   // Million 百萬
            { value: 1e3,  symbol: 'K' }    // Thousand 千
        ];
        
        // 找到合適的單位
        for (const unit of units) {
            if (number >= unit.value) {
                const formatted = (number / unit.value).toFixed(2);
                // 移除末尾的零
                return formatted.replace(/\.?0+$/, '') + unit.symbol;
            }
        }
    
    return Math.floor(number).toString();
    }

    // 添加帶動畫的數字更新函數
    static updateNumberWithAnimation(elementId, newValue, formatNumber = true) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // 🔥 添加 null/undefined 檢查
        if (newValue === null || newValue === undefined || isNaN(newValue)) {
                console.warn(`updateNumberWithAnimation: ${elementId} 收到無效數值:`, newValue);
                newValue = 0; // 設為默認值
            }
        const displayValue = formatNumber ? this.formatNumber(newValue) : newValue.toString();
        
        // 如果數值有變化，添加動畫效果
        if (element.textContent !== displayValue) {
            element.textContent = displayValue;
            
            // 添加閃爍動畫
            element.style.animation = 'numberUpdate 0.3s ease-out';
            
            // 移除動畫效果
            setTimeout(() => {
                element.style.animation = '';
            }, 300);
        }
    }

    /**
     * 格式化時間顯示
     */
    static formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
    }

    /**
     * 添加視覺效果
     */
    static addVisualEffect(element, effect) {
        switch (effect) {
            case 'shake':
                element.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => element.style.animation = '', 500);
                break;
            case 'glow':
                element.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
                setTimeout(() => element.style.boxShadow = '', 2000);
                break;
            case 'bounce':
                element.style.animation = 'bounce 0.6s ease-out';
                setTimeout(() => element.style.animation = '', 600);
                break;
        }
    }

    /**
     * 更新按鈕狀態
     */
    static updateButtonStates() {
        const buyButtons = document.querySelectorAll('.plant-buy-btn');
        buyButtons.forEach(button => {
            const onclick = button.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/buyMandrakesBulk\('(.+?)',\s*(\d+)\)/);
                if (match) {
                    const id = match[1];
                    const amount = parseInt(match[2]);
                    
                    // 🔥 直接使用遊戲的成本計算，不要用 calculateBulkCost
                    let totalCost = 0;
                    for (let i = 0; i < amount; i++) {
                        // 模擬購買第 i 個的成本
                        const currentCount = game.data.ownedMandrakes[id] || 0;
                        const tempOriginal = game.data.ownedMandrakes[id];
                        game.data.ownedMandrakes[id] = currentCount + i;
                        totalCost += game.getCurrentCost(id);
                        game.data.ownedMandrakes[id] = tempOriginal;
                    }
                    
                    const canAfford = game.data.fruit >= totalCost;
                    button.disabled = !canAfford;
                    
                    const formattedCost = this.formatNumber(totalCost);
                    const buttonText = amount > 1 ? 
                        `種植 ${amount}個 (${formattedCost})` : 
                        `種植 (${formattedCost})`;
                    button.textContent = buttonText;
                }
            }
        });
        

        // 更新重骰天氣按鈕
        const weatherBtn = document.querySelector('.weather-reroll-btn');
        if (weatherBtn) {
            const cost = game.data.freeWeatherReroll ? 0 : 100;
            const canAfford = cost === 0 || game.data.fruit >= cost;
            weatherBtn.disabled = !canAfford;
        }
    }

        /**
     * 設置批量購買控制
     */
    static setupBulkBuyControls() {
        const bulkButtons = document.querySelectorAll('.bulk-btn');
        bulkButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                this.setBulkAmount(amount);
            });
        });
    }

    /**
     * 設置批量購買數量
     */
    static setBulkAmount(amount) {
        this.currentBulkAmount = amount;
        
        // 更新按鈕狀態
        document.querySelectorAll('.bulk-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.amount) === amount) {
                btn.classList.add('active');
            }
        });
        
        // 更新所有購買按鈕的顯示
        this.updateMandrakeList();
    }

    /**
     * 計算批量購買成本
     */
    static calculateBulkCost(id, amount) {
        const config = MANDRAKE_CONFIG[id];
        const currentCount = game.data.ownedMandrakes[id] || 0;
        const effects = game.data.enhancementEffects;
        let totalCost = 0;
        
        for (let i = 0; i < amount; i++) {
            // 計算基礎成本
            let cost = Math.floor(config.baseCost * Math.pow(config.costGrowth, currentCount + i));
            
            // 🔥 應用所有強化效果（複製 getCurrentCost 的邏輯）
            cost *= effects.globalCostMultiplier;
            cost *= effects.typeCostMultipliers[config.type] || 1.0;
            
            // 運氣效果：成本波動（如果有的話）
            if (effects.hasCostVariance) {
                const min = ENHANCEMENT_VALUES.luck.cost_variance_min;
                const max = ENHANCEMENT_VALUES.luck.cost_variance_max;
                const randomFactor = 1 + (Math.random() * (max - min) + min);
                cost *= Math.max(0.1, randomFactor);
            }
            
            totalCost += Math.floor(Math.max(1, cost));
        }
        
        return totalCost;
    }

        /**
     * 顯示強化選擇界面
     */
    static showEnhancementChoice() {
        const modal = document.getElementById('enhancement-modal');
        const optionsContainer = document.getElementById('enhancement-options');
        const milestoneElement = document.getElementById('enhancement-milestone');
        
        if (!modal || !optionsContainer) {
            console.error('找不到強化模態框元素');
            return;
        }

        // 顯示當前里程碑信息
        const currentMilestone = game.data.enhancements.nextMilestone;
        if (milestoneElement && currentMilestone < ENHANCEMENT_UNLOCK_CONDITIONS.length) {
            const condition = ENHANCEMENT_UNLOCK_CONDITIONS[currentMilestone];
            milestoneElement.textContent = `達成里程碑：${condition.description}`;
        }

        // 清空之前的選項
        optionsContainer.innerHTML = '';

        // 顯示當前的三選一選項
        const choices = game.data.enhancements.currentChoices;
        choices.forEach((enhancementId, index) => {
            const enhancement = ENHANCEMENTS[enhancementId];
            if (enhancement) {
                const optionElement = this.createEnhancementOption(enhancement, enhancementId, index);
                optionsContainer.appendChild(optionElement);
            }
        });

        // 顯示模態框
        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    /**
     * 創建強化選項元素
     */
    static createEnhancementOption(enhancement, enhancementId, index) {
        const optionElement = document.createElement('div');
        optionElement.className = `enhancement-option ${enhancement.category}`;

        // 獲取類別顯示名稱
        const categoryNames = {
            stable: '穩穩強化',
            luck: '運氣強化', 
            reward: '獎勵強化',
            combo: 'Combo強化'
        };

        optionElement.innerHTML = `
            <div class="enhancement-category ${enhancement.category}">
                ${categoryNames[enhancement.category]}
            </div>
            <div class="enhancement-icon">${enhancement.icon}</div>
            <h4>${enhancement.name}</h4>
            <p>${enhancement.description()}</p>
        `;

        // 點擊事件
        optionElement.onclick = () => this.selectEnhancement(enhancementId);

        return optionElement;
    }

    /**
     * 選擇強化
     */
    static selectEnhancement(enhancementId) {
        if (typeof EnhancementSystem !== 'undefined') {
            EnhancementSystem.selectEnhancement(enhancementId);
        }
    }

    /**
     * 隱藏強化選擇界面
     */
    static hideEnhancementChoice() {
        const modal = document.getElementById('enhancement-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }
}



// 全局函數（供HTML onclick調用）
window.buyMandrake = function(id) {
    if (game.buyMandrake(id)) {
        UI.addVisualEffect(event.target, 'bounce');
        
        // 更新按鈕狀態
        setTimeout(() => UI.updateButtonStates(), 100);
    }
};

window.rerollWeather = function() {
    game.rerollWeather();
};

window.rebirth = function() {
    game.rebirth();
};

// 批量購買函數
window.buyMandrakesBulk = function(id, amount) {
    // 先檢查是否能買得起完整批量
    const totalCost = UI.calculateBulkCost(id, amount);
    
    if (game.data.fruit < totalCost) {
        UI.showNotification('果實不足，無法購買完整批量！', 'warning');
        return;
    }
    
    // 只有在能買得起完整批量時才執行購買
    let successCount = 0;
    for (let i = 0; i < amount; i++) {
        if (game.buyMandrake(id)) {
            successCount++;
        } else {
            console.warn('批量購買中斷，已購買:', successCount);
            break;
        }
    }
    
    if (successCount === amount) {
        UI.showNotification(`成功種植 ${amount} 個！`, 'success');
    } else {
        UI.showNotification(`只成功種植 ${successCount} 個`, 'warning');
    }
    
    UI.addVisualEffect(event.target, 'bounce');
    setTimeout(() => UI.updateButtonStates(), 100);
};

// ========== 統計系統 ==========

/**
 * 顯示統計界面
 */
window.showStats = function() {
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');
    
    if (!modal || !content) return;
    
    // 生成統計內容
    content.innerHTML = generateStatsContent();
    
    // 顯示模態框
    modal.classList.add('show');
    modal.style.display = 'flex';
};

/**
 * 隱藏統計界面
 */
window.hideStats = function() {
    const modal = document.getElementById('stats-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
};

/**
 * 生成統計內容 - 專注於曼德拉草詳細計算
 */
function generateStatsContent() {
    return `
        <div class="mandrake-details-container">
            ${generateMandrakeDetailsCards()}
        </div>
    `;
}

/**
 * 創建統計區段
 */
function createStatsSection(title, items) {
    const itemsHtml = items.map(([label, value]) => 
        `<div class="stats-item">
            <span>${label}</span>
            <span class="stats-value">${value}</span>
        </div>`
    ).join('');
    
    return `
        <div class="stats-section">
            <h4>${title}</h4>
            <div class="stats-grid">
                ${itemsHtml}
            </div>
        </div>
    `;
}

/**
 * 獲取強化統計
 */
function getEnhancementStats() {
    const obtained = game.data.enhancements.obtained;
    const effects = game.data.enhancementEffects;
    
    return {
        totalEnhancements: Object.keys(obtained).length,
        totalLevels: Object.values(obtained).reduce((sum, level) => sum + level, 0),
        categoryBreakdown: getCategoryBreakdown(obtained)
    };
}

/**
 * 獲取類別分解
 */
function getCategoryBreakdown(obtained) {
    const breakdown = { stable: 0, luck: 0, reward: 0, combo: 0 };
    
    for (const [enhancementId, level] of Object.entries(obtained)) {
        const enhancement = ENHANCEMENTS[enhancementId];
        if (enhancement) {
            breakdown[enhancement.category] += level;
        }
    }
    
    return breakdown;
}

/**
 * 創建強化詳情
 */
function createEnhancementDetails() {
    const obtained = game.data.enhancements.obtained;
    
    if (Object.keys(obtained).length === 0) {
        return `
            <div class="stats-section">
                <h4>強化詳情</h4>
                <p style="text-align: center; color: #666;">尚未獲得任何強化</p>
            </div>
        `;
    }
    
    const enhancementItems = Object.entries(obtained)
        .map(([enhancementId, level]) => {
            const enhancement = ENHANCEMENTS[enhancementId];
            if (!enhancement) return '';
            
            return `
                <div class="enhancement-item">
                    <span>
                        <span class="enhancement-category ${enhancement.category}">
                            ${enhancement.icon}
                        </span>
                        ${enhancement.name}
                    </span>
                    <span class="stats-value">Lv.${level}</span>
                </div>
            `;
        })
        .filter(item => item !== '')
        .join('');
    
    return `
        <div class="stats-section">
            <h4>已獲得強化</h4>
            <div class="enhancement-list">
                ${enhancementItems}
            </div>
        </div>
    `;
}

/**
 * 獲取產量統計
 */
function getProductionStats() {
    const productions = {};
    
    for (const [id, count] of Object.entries(game.data.ownedMandrakes)) {
        if (count > 0) {
            productions[id] = game.calculateSingleMandrakeProduction(id, count);
        }
    }
    
    return productions;
}

/**
 * 創建產量分解
 */
function createProductionBreakdown() {
    const productions = getProductionStats();
    
    if (Object.keys(productions).length === 0) {
        return `
            <div class="stats-section">
                <h4>產量分解</h4>
                <p style="text-align: center; color: #666;">尚未種植任何曼德拉草</p>
            </div>
        `;
    }
    
    const productionItems = Object.entries(productions)
        .filter(([id, production]) => production > 0)
        .sort(([, a], [, b]) => b - a) // 按產量排序
        .map(([id, production]) => {
            const config = MANDRAKE_CONFIG[id];
            const count = game.data.ownedMandrakes[id];
            
            return `
                <div class="stats-item">
                    <span>
                        <span style="margin-right: 8px;">${config.icon}</span>
                        ${config.name} (${count}株)
                    </span>
                    <span class="stats-value">${UI.formatNumber(production)}/秒</span>
                </div>
            `;
        })
        .join('');
    
    return `
        <div class="stats-section">
            <h4>產量分解</h4>
            <div class="stats-grid">
                ${productionItems}
            </div>
        </div>
    `;
}

/**
 * 生成所有曼德拉草的詳細計算卡片
 */
function generateMandrakeDetailsCards() {
    const cards = [];
    
    for (const [id, config] of Object.entries(MANDRAKE_CONFIG)) {
        // 檢查是否已解鎖
        const isUnlocked = game.data.unlockedMandrakes.includes(id);
        if (!isUnlocked) continue;
        
        const owned = game.data.ownedMandrakes[id] || 0;
        const calculations = calculateDetailedProduction(id, owned);
        
        cards.push(createMandrakeDetailCard(id, config, owned, calculations));
    }
    
    return cards.join('');
}

/**
 * 計算詳細產量數據
 */
function calculateDetailedProduction(mandrakeId, currentCount) {
    const config = MANDRAKE_CONFIG[mandrakeId];
    const baseProduction = config.baseProduction;
    
    // 獲取所有影響因子
    const factors = getProductionFactors(mandrakeId, currentCount);
    
    // 計算當前產量
    const currentProduction = currentCount > 0 ? 
        game.calculateSingleMandrakeProduction(mandrakeId, currentCount) : 0;
    
    // 計算下一株的產量增益
    const nextProduction = game.calculateSingleMandrakeProduction(mandrakeId, currentCount + 1);
    const nextIncrease = nextProduction - currentProduction;
    
    // 計算投資回報
    const cost = game.getCurrentCost(mandrakeId);
    const paybackTime = nextIncrease > 0 ? cost / nextIncrease : Infinity;
    
    // 計算性價比
    const efficiency = nextIncrease / cost;
    
    return {
        baseProduction,
        factors,
        currentProduction,
        nextProduction,
        nextIncrease,
        cost,
        paybackTime,
        efficiency,
        totalMultiplier: factors.total
    };
}

/**
 * 獲取所有產量影響因子 - 完全匹配遊戲邏輯
 */
function getProductionFactors(mandrakeId, currentCount) {
    const config = MANDRAKE_CONFIG[mandrakeId];
    const effects = game.data.enhancementEffects;
    const factors = {
        base: config.baseProduction,
        details: []
    };
    
    // 1. 全體產量加成
    if (effects.globalProductionMultiplier !== 1.0) {
        factors.details.push({
            name: '全面發展',
            value: effects.globalProductionMultiplier,
            display: `×${effects.globalProductionMultiplier.toFixed(2)}`,
            category: 'enhancement',
            level: game.data.enhancements.obtained['stable_global_production'] || 0
        });
    }
    
    // 2. 類型特定加成
    const typeMultiplier = effects.typeProductionMultipliers[config.type] || 1.0;
    if (typeMultiplier !== 1.0) {
        const typeName = {normal: '普通', element: '元素', animal: '動物'}[config.type];
        const enhancementKey = `stable_${config.type}_production`;
        factors.details.push({
            name: `${typeName}專精`,
            value: typeMultiplier,
            display: `×${typeMultiplier.toFixed(2)}`,
            category: 'enhancement',
            level: game.data.enhancements.obtained[enhancementKey] || 0
        });
    }
    
    // 3. 多元發展加成
    if (effects.hasDiversityBonus) {
        const hasNormal = Object.entries(game.data.ownedMandrakes).some(([id, count]) => 
            count > 0 && MANDRAKE_CONFIG[id]?.type === 'normal'
        );
        const hasElement = Object.entries(game.data.ownedMandrakes).some(([id, count]) => 
            count > 0 && MANDRAKE_CONFIG[id]?.type === 'element'
        );
        const hasAnimal = Object.entries(game.data.ownedMandrakes).some(([id, count]) => 
            count > 0 && MANDRAKE_CONFIG[id]?.type === 'animal'
        );
        
        if (hasNormal && hasElement && hasAnimal) {
            const bonus = 1 + ENHANCEMENT_VALUES.combo.three_type_bonus;
            factors.details.push({
                name: '多元發展',
                value: bonus,
                display: `×${bonus.toFixed(2)}`,
                category: 'enhancement',
                level: game.data.enhancements.obtained['combo_diversity_bonus'] || 0
            });
        }
    }
    
    // 4. 規模效應加成
    if (effects.hasQuantityBonus) {
        const totalMandrakes = Game.getTotalMandrakeCount();
        const bonusLevels = Math.floor(totalMandrakes / 10);
        if (bonusLevels > 0) {
            const bonus = 1 + (bonusLevels * ENHANCEMENT_VALUES.combo.per_10_bonus);
            factors.details.push({
                name: '規模效應',
                value: bonus,
                display: `×${bonus.toFixed(2)}`,
                category: 'enhancement',
                level: game.data.enhancements.obtained['combo_quantity_bonus'] || 0,
                detail: `${totalMandrakes}株 → ${bonusLevels}×10株`
            });
        }
    }
    
    // 5. 同系協同加成
    if (effects.hasTypeSynergy) {
        const sameTypeCount = Object.entries(game.data.ownedMandrakes)
            .filter(([id, count]) => count > 0 && MANDRAKE_CONFIG[id]?.type === config.type)
            .reduce((sum, [, count]) => sum + count, 0);
        
        if (sameTypeCount > 1) {
            const bonus = 1 + ((sameTypeCount - 1) * ENHANCEMENT_VALUES.combo.same_type_bonus);
            const typeName = {normal: '普通', element: '元素', animal: '動物'}[config.type];
            factors.details.push({
                name: '同系協同',
                value: bonus,
                display: `×${bonus.toFixed(2)}`,
                category: 'enhancement',
                level: game.data.enhancements.obtained['combo_type_synergy'] || 0,
                detail: `${typeName}系${sameTypeCount}株`
            });
        }
    }
    
    // 6. 產量波動
    if (effects.globalProductionVariance !== 1.0) {
        factors.details.push({
            name: '產量波動',
            value: effects.globalProductionVariance,
            display: `×${effects.globalProductionVariance.toFixed(2)}`,
            category: 'enhancement',
            level: game.data.enhancements.obtained['luck_production_variance'] || 0,
            detail: `固定波動 ${((effects.globalProductionVariance - 1) * 100).toFixed(1)}%`
        });
    }
    
    // 7. 天氣效果
    const weatherMultiplier = game.getWeatherMultiplier(config.type);
    if (weatherMultiplier !== 1.0) {
        const weatherConfig = WEATHER_CONFIG[game.data.weather];
        factors.details.push({
            name: `天氣效果`,
            value: weatherMultiplier,
            display: `×${weatherMultiplier.toFixed(2)}`,
            category: 'weather',
            detail: `${weatherConfig.name} (${weatherConfig.effect})`
        });
    }
    
    // 8. 臨時加成
    const tempBoost = game.getTempBoostMultiplier('production');
    const typeBoost = game.getTempBoostMultiplier(config.type);
    const totalTempBoost = tempBoost * typeBoost;
    if (totalTempBoost !== 1.0) {
        factors.details.push({
            name: '臨時加成',
            value: totalTempBoost,
            display: `×${totalTempBoost.toFixed(2)}`,
            category: 'temp',
            detail: '獎勵效果'
        });
    }
    
    // 計算總倍數 - 按照遊戲邏輯順序相乘
    factors.total = factors.details.reduce((total, factor) => total * factor.value, 1);
    
    return factors;
}

/**
 * 創建曼德拉草詳細計算卡片
 */
function createMandrakeDetailCard(id, config, owned, calculations) {
    const { baseProduction, factors, currentProduction, nextIncrease, cost, paybackTime, efficiency } = calculations;
    
    return `
        <div class="mandrake-detail-card ${config.type}">
            <div class="card-header">
                <div class="mandrake-info">
                    <span class="mandrake-icon">${config.icon}</span>
                    <div class="mandrake-title">
                        <h4>${config.name}</h4>
                        <span class="mandrake-type">${getTypeName(config.type)} · 擁有 ${owned} 株</span>
                    </div>
                </div>
                <div class="current-production">
                    <span class="production-label">總產量</span>
                    <span class="production-value">${UI.formatNumber(currentProduction)}/秒</span>
                </div>
            </div>
            
            <div class="card-body">
                <div class="calculation-section">
                    <h5>📊 產量計算公式</h5>
                    <div class="formula-breakdown">
                        <div class="formula-line base">
                            <span class="factor-name">基礎產量</span>
                            <span class="factor-value">${UI.formatNumber(baseProduction)}</span>
                        </div>
                        ${generateFactorLines(factors)}
                        <div class="formula-line total">
                            <span class="factor-name">單株產量</span>
                            <span class="factor-value">${UI.formatNumber(baseProduction * factors.total)}/秒</span>
                        </div>
                        <div class="formula-line final">
                            <span class="factor-name">總產量 (${owned}株)</span>
                            <span class="factor-value">${UI.formatNumber(currentProduction)}/秒</span>
                        </div>
                    </div>
                </div>
                
                <div class="investment-section">
                    <h5>💰 投資分析</h5>
                    <div class="investment-grid">
                        <div class="investment-item">
                            <span class="item-label">下一株成本</span>
                            <span class="item-value">${UI.formatNumber(cost)} 果實</span>
                        </div>
                        <div class="investment-item">
                            <span class="item-label">產量增益</span>
                            <span class="item-value">${UI.formatNumber(nextIncrease)}/秒</span>
                        </div>
                        <div class="investment-item">
                            <span class="item-label">回本時間</span>
                            <span class="item-value">${formatPaybackTime(paybackTime)}</span>
                        </div>
                        <div class="investment-item">
                            <span class="item-label">性價比</span>
                            <span class="item-value efficiency-${getEfficiencyLevel(efficiency)}">${UI.formatNumber(efficiency * 1000)}‰</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 生成影響因子行
 */
function generateFactorLines(factors) {
    return factors.details.map(factor => `
        <div class="formula-line factor">
            <span class="factor-name">${factor.name}</span>
            <span class="factor-value">${factor.display}</span>
        </div>
    `).join('');
}

/**
 * 獲取類型名稱
 */
function getTypeName(type) {
    const typeNames = {
        normal: '普通',
        element: '元素',
        animal: '動物',
        rare: '稀有',
        legendary: '傳說'
    };
    return typeNames[type] || type;
}

/**
 * 格式化回本時間
 */
function formatPaybackTime(seconds) {
    if (seconds === Infinity) return '無法回本';
    if (seconds < 60) return `${seconds.toFixed(1)} 秒`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} 分鐘`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} 小時`;
    return `${(seconds / 86400).toFixed(1)} 天`;
}

/**
 * 獲取效率等級
 */
function getEfficiencyLevel(efficiency) {
    if (efficiency > 0.01) return 'excellent';
    if (efficiency > 0.005) return 'good';
    if (efficiency > 0.001) return 'average';
    return 'poor';
}

// 擴展函數（預留給未來使用）
/**
 * 計算數量加成（預留）
 */
function calculateQuantityBonus(count) {
    // 例如：每10株增加5%產量
    // return 1 + Math.floor(count / 10) * 0.05;
    return 1;
}

/**
 * 計算其他加成（預留）
 */
function calculateOtherBonuses(mandrakeId) {
    // 未來可以添加：
    // - 特殊建築加成
    // - 時間加成
    // - 成就加成
    // - 季節加成等
    return 1;
}


// 暴露UI類供其他模組使用
window.UI = UI;