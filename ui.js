// ========== UI 管理系統 ==========

class UI {
    static notificationContainer = null;

    /**
     * 初始化UI系統
     */
    static init() {
        this.notificationContainer = document.getElementById('notification-container');
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
        if (count === 0) return 0;

        const config = MANDRAKE_CONFIG[id];
        const singleProduction = config.baseProduction * Math.pow(config.prodGrowth, count);
        const weatherMultiplier = game.getWeatherMultiplier(config.type);
        const tempBoost = game.getTempBoostMultiplier('production');
        const typeBoost = game.getTempBoostMultiplier(config.type);

        return count * singleProduction * weatherMultiplier * tempBoost * typeBoost;
    }

    /**
     * 創建曼德拉草行
     */
    static createMandrakeRow(id, config, count, cost, production) {
        const row = document.createElement('div');
        row.className = `plant-row ${config.type}`;

        // 創建圖標元素
        const iconElement = imageManager.createImageElement(config.icon, config.name, 'plant-icon');

        row.innerHTML = `
        <div class="plant-info">
            <div class="plant-name">
                <span class="plant-icon-container"></span>
                ${config.name}：${count} 株
            </div>
            <div class="plant-production">產量：${this.formatNumber(production)}/秒</div>
        </div>
        <button class="plant-buy-btn" onclick="buyMandrake('${id}')" ${game.data.fruit < cost ? 'disabled' : ''}>
            種植 (${this.formatNumber(cost)})  
        </button>
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
            return Math.floor(number).toString();
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
        // 更新所有購買按鈕的可用性
        const buyButtons = document.querySelectorAll('.plant-buy-btn');
        buyButtons.forEach(button => {
            const onclick = button.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/buyMandrake\('(.+)'\)/);
                if (match) {
                    const id = match[1];
                    const cost = game.getCurrentCost(id);
                    const canAfford = game.data.fruit >= cost;
                    
                    // 更新按鈕狀態
                    button.disabled = !canAfford;
                    
                    // 更新按鈕文字中的價格（確保價格是最新的）
                    const formattedCost = this.formatNumber(cost);
                    const newButtonText = `種植 (${formattedCost})`;
                    
                    // 只有在文字需要更新時才更新，避免不必要的DOM操作
                    if (button.textContent !== newButtonText) {
                        button.textContent = newButtonText;
                    }
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

// 暴露UI類供其他模組使用
window.UI = UI;