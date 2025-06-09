// ========== UI 管理系統 - 關鍵修復 ==========

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
        this.updateEnhancementStatus();
    }

    /**
     * 🔧 修復：更新資源顯示
     */
    static updateResources() {
        // 🔧 添加安全檢查
        if (!game || !game.data) {
            console.warn('updateResources: 遊戲數據不存在');
            return;
        }

        const data = game.data;
        
        // 🔧 修復：確保數值有效性
        const fruit = typeof data.fruit === 'number' ? data.fruit : 0;
        const totalMandrakes = Game.getTotalMandrakeCount();
        const productionRate = game.getTotalProduction();
        const talentPoints = typeof data.talentPoints === 'number' ? data.talentPoints : 0;
        
        // 使用新的格式化函數更新數字
        this.updateNumberWithAnimation('fruit', fruit, true);
        this.updateNumberWithAnimation('total-mandrakes', totalMandrakes, false);
        this.updateNumberWithAnimation('production-rate', productionRate, true);
        this.updateNumberWithAnimation('talent-points', talentPoints, false);
        
        // 更新農場使用情況
        const usedSlots = game.getUsedFarmSlots();
        const farmUsedElement = document.getElementById('farm-used');
        if (farmUsedElement) {
            farmUsedElement.textContent = usedSlots;
        }

        this.updateButtonStates();
    }

    // 🔧 修復：獎勵更新函數
    static updateRewardStatus() {
        // 🔧 添加安全檢查
        if (!game || !game.data) {
            console.warn('updateRewardStatus: 遊戲數據不存在');
            return;
        }

        const pendingElement = document.getElementById('pending-rewards');
        const maxElement = document.getElementById('max-rewards');
        const buttonElement = document.getElementById('claim-reward-btn');
        
        if (pendingElement) {
            pendingElement.textContent = game.data.pendingRewards || 0;
        }
        
        if (maxElement) {
            maxElement.textContent = game.data.maxPendingRewards || 2;
        }
        
        if (buttonElement) {
            const pendingCount = game.data.pendingRewards || 0;
            
            // 更新按鈕狀態
            if (pendingCount > 0) {
                buttonElement.disabled = false;
                buttonElement.classList.add('has-rewards');
                buttonElement.textContent = `領取獎勵 (${pendingCount})`;
                
                // 添加獎勵徽章
                let badge = buttonElement.querySelector('.reward-badge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'reward-badge';
                    buttonElement.appendChild(badge);
                }
                badge.textContent = pendingCount;
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
        if (!game || !game.data) return;
        
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
        if (!container) {
            console.error('找不到 mandrake-list 元素'); 
            return;
        }

        if (!game || !game.data || !game.data.unlockedMandrakes) {
            console.warn('updateMandrakeList: 遊戲數據不完整');
            return;
        }

        console.log('開始更新曼德拉草列表');
        console.log('已解鎖的曼德拉草:', game.data.unlockedMandrakes);

        container.innerHTML = '';

        // 顯示已解鎖的曼德拉草
        for (const id of game.data.unlockedMandrakes) {
            const config = MANDRAKE_CONFIG[id];
            if (!config) {
                console.error('找不到曼德拉草配置:', id);
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
                <button class="plant-buy-btn" onclick="buyMandrakesBulk(this, '${id}', ${this.currentBulkAmount})" ${!canAfford ? 'disabled' : ''}>
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
        if (pointsElement && game && game.calculateRebirthPoints) {
            const points = game.calculateRebirthPoints();
            pointsElement.textContent = points;
        }
    }

    /**
     * 🔧 修復：更新獎勵倒數計時
     */
    static updateRewardTimer() {
        const countdownElement = document.getElementById('reward-countdown');
        if (!countdownElement || !game || !game.data) return;

        // 🔧 添加安全檢查
        if (!game.data.enhancementEffects || typeof game.data.enhancementEffects.rewardCdMultiplier !== 'number') {
            console.warn('updateRewardTimer: enhancementEffects 不完整');
            return;
        }

        // 如果獎勵已滿，顯示"已滿"狀態
        if (game.data.pendingRewards >= game.data.maxPendingRewards) {
            countdownElement.textContent = '已滿';
            countdownElement.parentElement.style.animation = '';
            countdownElement.style.color = '#ff6b6b'; // 紅色表示已滿
            return;
        }

        const timeSinceReward = Date.now() - game.data.lastRewardTime;
        const remaining = Math.max(
            0,
            GAME_CONFIG.REWARD_INTERVAL * game.data.enhancementEffects.rewardCdMultiplier -
                timeSinceReward
        );

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

    // 🔧 修復：添加帶動畫的數字更新函數
    static updateNumberWithAnimation(elementId, newValue, formatNumber = true) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // 🔧 修復：更嚴格的數值檢查
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
        if (!game || !game.data) return;

        const buyButtons = document.querySelectorAll('.plant-buy-btn');
        buyButtons.forEach(button => {
            const onclick = button.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/buyMandrakesBulk\(this,\s*'([^']+)',\s*(\d+)\)/);
                if (match) {
                    const id = match[1];
                    const amount = parseInt(match[2]);
                    
                    let totalCost = 0;
                    const originalCount = game.data.ownedMandrakes[id] || 0;
                    for (let i = 0; i < amount; i++) {
                        // 模擬逐一購買，依序遞增成本
                        game.data.ownedMandrakes[id] = originalCount + i;
                        totalCost += game.getCurrentCost(id);
                    }
                    // 還原原始持有數量
                    game.data.ownedMandrakes[id] = originalCount;
                    
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
        if (!game || !game.data) return 0;

        const originalCount = game.data.ownedMandrakes[id] || 0;
        let totalCost = 0;

        for (let i = 0; i < amount; i++) {
            // 模擬逐一購買計算成本
            game.data.ownedMandrakes[id] = originalCount + i;
            totalCost += game.getCurrentCost(id);
        }

        // 還原原始持有數量
        game.data.ownedMandrakes[id] = originalCount;
        return totalCost;
    }

    /**
     * 顯示強化選擇界面
     */
    static showEnhancementChoice() {
        // 🔧 新增：檢查是否真的有待處理的強化
        if (!game.data.enhancements.pendingEnhancement || game.data.enhancements.pendingCount <= 0) {
            console.warn('沒有待處理的強化，不應該顯示選擇界面');
            return;
        }
        
        const modal = document.getElementById('enhancement-modal');
        const optionsContainer = document.getElementById('enhancement-options');
        const milestoneElement = document.getElementById('enhancement-milestone');
        
        if (!modal || !optionsContainer) {
            console.error('找不到強化模態框元素');
            return;
        }

        // 🔧 修改：顯示當前強化信息
        if (milestoneElement && typeof EnhancementSystem !== 'undefined') {
            const status = EnhancementSystem.getEnhancementStatus();
            milestoneElement.textContent = `強化可用：${status.pendingCount} 次`;
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
    
        // 🔧 新增：更新強化狀態
        this.updateEnhancementStatus();
    }

    /**
     * 🔧 新增：更新強化系統狀態顯示
     */
    static updateEnhancementStatus() {
        // 更新強化按鈕狀態
        this.updateEnhancementButton();
        
        // 更新強化進度顯示
        this.updateEnhancementProgress();
    }

    /**
     * 🔧 新增：更新強化按鈕狀態
     */
    static updateEnhancementButton() {
        const enhancementButton = document.querySelector('.enhancement-btn');
        if (!enhancementButton || typeof EnhancementSystem === 'undefined') return;
        
        const status = EnhancementSystem.getEnhancementStatus();
        
        if (status.pendingCount > 0) {
            enhancementButton.disabled = false;
            enhancementButton.classList.add('has-enhancement');
            enhancementButton.textContent = `選擇強化 (${status.pendingCount})`;
            
            // 添加強化數量徽章
            let badge = enhancementButton.querySelector('.enhancement-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'enhancement-badge';
                enhancementButton.appendChild(badge);
            }
            badge.textContent = status.pendingCount;
        } else {
            enhancementButton.disabled = true;
            enhancementButton.classList.remove('has-enhancement');
            enhancementButton.textContent = '選擇強化';
            
            // 移除徽章
            const badge = enhancementButton.querySelector('.enhancement-badge');
            if (badge) {
                badge.remove();
            }
        }
    }

    /**
     * 🔧 新增：更新強化進度顯示
     */
    static updateEnhancementProgress() {
        const progressContainer = document.querySelector('.enhancement-progress');
        if (!progressContainer || typeof EnhancementSystem === 'undefined') return;
        
        const nextMilestone = EnhancementSystem.getNextMilestone();
        
        if (nextMilestone) {
            const progressPercent = Math.min(100, nextMilestone.progress * 100);
            const progressBar = progressContainer.querySelector('.progress-bar');
            const progressText = progressContainer.querySelector('.progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
            
            if (progressText) {
                progressText.textContent = 
                    `下個里程碑：${nextMilestone.mandrakeName} ${nextMilestone.currentCount}/${nextMilestone.targetMilestone}株`;
            }
            
            progressContainer.style.display = 'block';
        } else {
            progressContainer.style.display = 'none';
        }
    }
}

// 全局函數（供HTML onclick調用）
window.buyMandrake = function(button, id) {
    if (game.buyMandrake(id)) {
        if (button) {
            UI.addVisualEffect(button, 'bounce');
        }
        
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
window.buyMandrakesBulk = function(button, id, amount) {
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
    
    if (button) {
        UI.addVisualEffect(button, 'bounce');
    }
    setTimeout(() => UI.updateButtonStates(), 100);
};

// 全局函數（供HTML onclick調用）
window.openRewardSelection = function() {
    if (typeof Rewards !== 'undefined') {
        Rewards.openRewardSelection();
    }
};

// 暴露UI類供其他模組使用
window.UI = UI;