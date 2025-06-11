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
        this.updateWeatherTimer();
        this.updateMandrakeList();
        this.updateFarmVisual();
        this.updateRebirthInfo();
        this.updateRewardStatus(); 
        this.updateEnhancementStatus();
    }

    /**
     * 🔧 優化：更新資源顯示 - 增加進度條更新
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

        // 🔧 新增：更新進度條
        this.updateProgressBars();

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
    // 🔧 更新 updateWeather 函數
    static updateWeather() {
        if (!game || !game.data) return;
        
        const weatherConfig = WEATHER_CONFIG[game.data.weather];
        if (!weatherConfig) return;

        // 更新天氣名稱（菱形中）
        const nameElement = document.getElementById('current-weather-name');
        if (nameElement) nameElement.textContent = weatherConfig.name;

        // 更新效果描述
        const effectElement = document.getElementById('weather-effect-desc');
        if (effectElement) effectElement.textContent = weatherConfig.effect;

        // 更新重骰成本
        const costElement = document.getElementById('weather-cost');
        if (costElement) costElement.textContent = game.data.freeWeatherReroll ? '免費' : '100';
    }

    // 🔧 新增天氣刷新倒數計時功能
    static updateWeatherTimer() {
        const timerElement = document.getElementById('weather-refresh-timer');
        if (!timerElement || !game || !game.data) return;

        // 計算距離下次天氣變化的時間
        const now = Date.now();
        const weatherChangeInterval = GAME_CONFIG.WEATHER_CHANGE_INTERVAL; // 5分鐘
        const lastWeatherChange = game.data.lastWeatherChange || now;
        const nextWeatherChange = lastWeatherChange + weatherChangeInterval;
        const remaining = Math.max(0, nextWeatherChange - now);

        if (remaining === 0) {
            timerElement.textContent = '即將刷新';
            timerElement.style.color = '#e74c3c';
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerElement.style.color = '#666';
        }
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
     * 🔧 修正：計算進度條寬度 - 果實 ÷ 購買成本
     */
    static calculateProgressWidth(id, currentFruit) {
        // 使用當前的批量購買數量計算成本
        const bulkCost = this.calculateBulkCost(id, this.currentBulkAmount);
        
        if (bulkCost === 0) return 100; // 避免除以零
        
        // 進度 = 當前果實 ÷ 批量購買成本，最大100%
        const progress = Math.min((currentFruit / bulkCost) * 100, 100);
        return progress;
    }

    /**
     * 🔧 優化：批量更新進度條，避免重複計算
     */
    static updateProgressBars() {
        if (!game || !game.data) return;
        
        const currentFruit = game.data.fruit;
        const rows = document.querySelectorAll('.plant-row[data-mandrake-id]');
        
        rows.forEach(row => {
            const mandrakeId = row.getAttribute('data-mandrake-id');
            if (mandrakeId) {
                const progressWidth = this.calculateProgressWidth(mandrakeId, currentFruit);
                
                // 只在進度有明顯變化時才更新（減少DOM操作）
                const currentWidth = parseFloat(row.style.getPropertyValue('--progress-width')) || 0;
                if (Math.abs(progressWidth - currentWidth) > 1) { // 差異超過1%才更新
                    row.style.setProperty('--progress-width', `${progressWidth}%`);
                    
                    // 更新高進度特效
                    if (progressWidth > 80) {
                        row.classList.add('high-progress');
                    } else {
                        row.classList.remove('high-progress');
                    }
                }
            }
        });
    }

    /**
     * 🔧 修正：創建曼德拉草行 - 簡化佈局
     */
    static createMandrakeRow(id, config, count, cost, production) {
        const row = document.createElement('div');
        row.className = `plant-row ${config.type}`;
        
        // 設置 data 屬性用於進度條更新
        row.setAttribute('data-mandrake-id', id);

        // 計算批量購買的成本和收益
        const bulkCost = this.calculateBulkCost(id, this.currentBulkAmount);
        const nextProduction = game.calculateSingleMandrakeProduction(id, count + this.currentBulkAmount);
        const productionIncrease = nextProduction - production;
        
        const formattedIncrease = this.formatNumber(productionIncrease);
        const formattedCost = this.formatNumber(bulkCost);
        const formattedProduction = this.formatNumber(production);
        
        // 檢查是否能負擔完整批量
        const canAfford = game.data.fruit >= bulkCost;
        
        // 🔧 修正：適應更小按鈕的更緊湊文字
       const buttonHtml = this.currentBulkAmount > 1 ? 
            `<div style="font-size: 0.8em; line-height: 0.9;">種植</div>
            <div style="font-size: 0.7em; line-height: 1.2;">${formattedCost}</div>
            <div class="hover-tooltip">
                <div>產量: +${formattedIncrease}/秒</div>
            </div>` : 
            `<div style="font-size: 0.8em; line-height: 0.9;">種植</div>
            <div style="font-size: 0.7em; line-height: 1.2;">${formattedCost}</div>
            <div class="hover-tooltip">
                <div>產量: +${formattedIncrease}/秒</div>
            </div>`;
                // 計算進度條
        const progressWidth = this.calculateProgressWidth(id, game.data.fruit);
        const isHighProgress = progressWidth > 80;
        
        if (isHighProgress) {
            row.classList.add('high-progress');
        }

        // 🔧 修正：簡化佈局，移除圖標，移除多餘成本顯示
        row.innerHTML = `
            <!-- 左側：大數字顯示數量 -->
            <div class="plant-count-section">
                <div class="plant-count-large">${count}</div>
            </div>
            
            <!-- 中間：曼德拉草信息（無圖標） -->
            <div class="plant-info-section">
                <div class="plant-name">${config.name}</div>
                <div class="plant-production">產量：${formattedProduction}/秒</div>
            </div>
            
            <!-- 右側：購買按鈕（內含成本，無額外成本顯示） -->
            <div class="plant-buy-section">
                <button class="plant-buy-btn" onclick="buyMandrakesBulk(this, '${id}', ${this.currentBulkAmount})" ${!canAfford ? 'disabled' : ''}>
                    ${buttonHtml}
                </button>
            </div>
        `;

        // 設置進度條寬度
        row.style.setProperty('--progress-width', `${progressWidth}%`);

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
                        `種植 ${amount}個 ${formattedCost}` : 
                        `種植 ${formattedCost}`;
                    const textDivs = button.querySelectorAll('div:not(.hover-tooltip)');
                    if (textDivs.length >= 2) {
                        textDivs[0].textContent = amount > 1 ? '種植' : '種植';
                        textDivs[1].textContent = formattedCost;
                    } else {
                        // 如果結構不符合預期，重新生成整個按鈕內容
                        button.innerHTML = amount > 1 ? 
                            `<div style="font-size: 0.8em; line-height: 0.9;">種植</div>
                            <div style="font-size: 0.7em; line-height: 1.2;">${formattedCost}</div>
                            <div class="hover-tooltip">
                                <div>購買 ${amount} 株</div>
                                <div>成本: ${formattedCost}</div>
                                <div>產量: +${this.formatNumber((totalCost * 0.1))}/秒</div>
                            </div>` : 
                            `<div style="font-size: 0.8em; line-height: 0.9;">種植</div>
                            <div style="font-size: 0.7em; line-height: 1.2;">${formattedCost}</div>
                            <div class="hover-tooltip">
                                <div>購買 1 株</div>
                                <div>成本: ${formattedCost}</div>
                                <div>產量: +${this.formatNumber((totalCost * 0.1))}/秒</div>
                            </div>`;
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

        // 更新進度條以反映新的批量成本
        this.updateProgressBars();
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
     * 🔧 修改2：更新強化按鈕狀態 - 適配系統按鈕位置
     */
    static updateEnhancementButton() {
        const enhancementButton = document.getElementById('enhancement-btn');
        if (!enhancementButton || typeof EnhancementSystem === 'undefined') return;
        
        const status = EnhancementSystem.getEnhancementStatus();
        
        if (status.pendingCount > 0) {
            enhancementButton.disabled = false;
            enhancementButton.classList.add('has-enhancement');
            enhancementButton.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
            enhancementButton.textContent = `🔮 強化 (${status.pendingCount})`;
            
            // 添加強化數量徽章
            let badge = enhancementButton.querySelector('.enhancement-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'enhancement-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ff3838;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    border: 2px solid white;
                `;
                enhancementButton.appendChild(badge);
            }
            badge.textContent = status.pendingCount;
        } else {
            enhancementButton.disabled = true;
            enhancementButton.classList.remove('has-enhancement');
            enhancementButton.style.background = 'linear-gradient(45deg, #9b59b6, #8e44ad)';
            enhancementButton.textContent = '🔮 強化';
            
            // 移除徽章
            const badge = enhancementButton.querySelector('.enhancement-badge');
            if (badge) {
                badge.remove();
            }
        }
    }

    /**
     * 🔧 修改2：簡化強化進度顯示 - 移除進度條相關
     */
    static updateEnhancementProgress() {
        // 由於強化系統已移到右上角，不再需要進度條顯示
        // 保留此函數以免其他地方調用時出錯，但內容為空
    }

    static showInlineEnhancementChoice() {
    const enhancementSection = document.querySelector('.enhancement-options');
    if (!enhancementSection) return;

    enhancementSection.innerHTML = `
        <h4>🔮 選擇強化</h4>
        <div class="inline-enhancement-choices"></div>
        <div style="text-align: center; margin-top: 15px;">
            <button onclick="UI.cancelEnhancementChoice()" 
                    style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">
                稍後選擇
            </button>
        </div>
    `;

    const choicesContainer = enhancementSection.querySelector('.inline-enhancement-choices');
    const choices = game.data.enhancements.currentChoices;

    choices.forEach((enhancementId) => {
        const enhancement = ENHANCEMENTS[enhancementId];
        if (enhancement) {
            // 創建選項元素（使用內聯樣式）
            const optionElement = document.createElement('div');
            optionElement.style.cssText = `
                padding: 15px; margin: 10px 0; background: white; 
                border: 2px solid #ddd; border-radius: 8px; cursor: pointer; 
                transition: all 0.3s ease; display: flex; align-items: center; gap: 15px;
                border-left: 4px solid #27ae60;
            `;
            
            optionElement.innerHTML = `
                <div style="font-size: 2em;">${enhancement.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${enhancement.name}</div>
                    <div style="font-size: 0.9em; color: #666;">${enhancement.description()}</div>
                </div>
            `;

            optionElement.onclick = () => {
                EnhancementSystem.selectEnhancement(enhancementId);
            };

            choicesContainer.appendChild(optionElement);
        }
    });
}

    // ========== 簡單獎勵系統修復 ==========

    // 顯示內嵌式獎勵選擇
    static showInlineRewardChoice() {
        console.log('showInlineRewardChoice 被呼叫');
        
        if (!game || !game.data || game.data.pendingRewards <= 0) {
            this.showNotification('目前沒有獎勵可以領取', 'warning');
            return;
        }

        // 找到獎勵區域
        const rewardSection = document.querySelector('.reward-info-container');
        if (!rewardSection) {
            console.error('找不到獎勵區域');
            return;
        }

        // 移除已存在的選擇
        const existing = document.getElementById('inline-reward-choices');
        if (existing) existing.remove();

        // 確保有獎勵數據
        if (!game.data.generatedRewards || game.data.generatedRewards.length === 0) {
            game.generateNewReward();
        }

        const rewardGroup = game.data.generatedRewards[0];
        if (!rewardGroup) return;

        // 創建獎勵選擇界面
        const container = document.createElement('div');
        container.id = 'inline-reward-choices';
        container.innerHTML = `
            <div style="background: #fff3cd; border: 2px solid #f39c12; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <h4 style="text-align: center; margin: 0 0 15px 0;">🎁 選擇你的獎勵</h4>
                <div id="reward-options-container" style="display: flex; gap: 15px; flex-wrap: wrap;"></div>
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="document.getElementById('inline-reward-choices').remove()" 
                            style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">
                        稍後領取
                    </button>
                </div>
            </div>
        `;

        const optionsContainer = container.querySelector('#reward-options-container');
        
        // 創建3個獎勵選項
        rewardGroup.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.style.cssText = `
                flex: 1; min-width: 200px; padding: 15px; background: white; 
                border: 2px solid #ddd; border-radius: 8px; cursor: pointer; 
                text-align: center; transition: all 0.3s ease;
            `;
            
            // 生成描述
            let description = '';
            try {
                if (typeof option.template.description === 'function') {
                    description = option.template.description(option.tier);
                } else {
                    description = option.template.description || '無描述';
                }
            } catch (error) {
                description = '描述錯誤';
            }

            optionEl.innerHTML = `
                <div style="font-size: 2em; margin-bottom: 10px;">${option.template.icon}</div>
                <div style="font-weight: bold; margin-bottom: 5px;">${option.template.name}</div>
                <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">${description}</div>
                <div style="font-size: 0.8em; font-weight: bold; color: ${option.rarityInfo.color};">${option.rarityInfo.name}</div>
            `;

            optionEl.onclick = () => {
                this.selectInlineReward(option, rewardGroup.id);
                container.remove();
            };

            optionEl.onmouseenter = () => {
                optionEl.style.transform = 'translateY(-3px)';
                optionEl.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            };

            optionEl.onmouseleave = () => {
                optionEl.style.transform = 'translateY(0)';
                optionEl.style.boxShadow = 'none';
            };

            optionsContainer.appendChild(optionEl);
        });

        // 插入到獎勵區域下方
        rewardSection.parentNode.insertBefore(container, rewardSection.nextSibling);
    }

    // 選擇獎勵的方法
    static selectInlineReward(selectedOption, rewardGroupId) {
        try {
            // 直接使用現有的 Rewards 系統
            if (typeof Rewards !== 'undefined' && Rewards.selectReward) {
                Rewards.selectReward(selectedOption, rewardGroupId);
            } else {
                // 手動處理獎勵效果
                this.applyRewardEffectSimple(selectedOption);
                
                // 更新遊戲數據
                const rewardIndex = game.data.generatedRewards.findIndex(r => r.id === rewardGroupId);
                if (rewardIndex !== -1) {
                    game.data.generatedRewards.splice(rewardIndex, 1);
                }
                game.data.pendingRewards = Math.max(0, game.data.pendingRewards - 1);
                
                game.saveGame();
                this.updateAll();
                this.showNotification(`獲得 ${selectedOption.template.name}！`, 'success');
            }
        } catch (error) {
            console.error('獎勵處理錯誤:', error);
            this.showNotification('獎勵處理失敗', 'error');
        }
    }

    // 簡化的獎勵效果處理
    static applyRewardEffectSimple(selectedOption) {
        const { template, tier } = selectedOption;
        
        switch (template.name) {
            case '生產力提升':
                game.applyTempBoost('production', 1 + tier.bonus/100, tier.duration);
                break;
            case '元素加速':
                game.applyTempBoost('element', 1 + tier.bonus/100, tier.duration);
                break;
            case '即時果實':
                const production = game.getTotalProduction() * 3600 * tier.hours;
                game.data.fruit += production;
                break;
            case '天賦點數':
                game.data.talentPoints += tier.points;
                break;
            default:
                console.log('未處理的獎勵類型:', template.name);
        }
    }

    // 重置強化區域
static resetEnhancementSection() {
    // 🔧 修改2：由於強化按鈕已移到遊戲區右上角，此函數不再需要重置UI
    // 保留函數以免其他地方調用時出錯
}

// 取消強化選擇
static cancelEnhancementChoice() {
    // 🔧 修改2：同樣簡化，不再需要重置區域
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
    const points = game.calculateRebirthPoints();
    if (points === 0) {
        UI.showNotification('需要獲得更多果實才能重生！', 'warning');
        return;
    }
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
    console.log('領取獎勵按鈕被點擊');
    
    if (!game || !game.data) {
        console.error('遊戲數據不存在');
        return;
    }
    
    if (game.data.pendingRewards <= 0) {
        UI.showNotification('目前沒有獎勵可以領取', 'warning');
        return;
    }
    
    UI.showInlineRewardChoice();
};

// 暴露UI類供其他模組使用
window.UI = UI;

// 🔧 新增：統計功能
window.showStats = function() {
    if (!game || !game.getGameStats) {
        UI.showNotification('統計功能暫時無法使用', 'warning');
        return;
    }

    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');
    
    if (!modal || !content) {
        console.error('找不到統計模態框元素');
        return;
    }

    // 獲取遊戲統計
    const stats = game.getGameStats();
    
    // 生成統計內容
    content.innerHTML = `
        <div class="stats-section">
            <h4>📊 基礎統計</h4>
            <div class="stats-grid">
                <div class="stats-item">
                    <span>當前果實：</span>
                    <span class="stats-value">${UI.formatNumber(stats.totalFruit)}</span>
                </div>
                <div class="stats-item">
                    <span>總曼德拉草：</span>
                    <span class="stats-value">${stats.totalMandrakes}</span>
                </div>
                <div class="stats-item">
                    <span>每秒產量：</span>
                    <span class="stats-value">${UI.formatNumber(stats.productionPerSecond)}</span>
                </div>
                <div class="stats-item">
                    <span>天賦點數：</span>
                    <span class="stats-value">${stats.talentPoints}</span>
                </div>
                <div class="stats-item">
                    <span>重生次數：</span>
                    <span class="stats-value">${stats.rebirthCount}</span>
                </div>
                <div class="stats-item">
                    <span>當前階層：</span>
                    <span class="stats-value">${stats.currentTier}</span>
                </div>
            </div>
        </div>
        
        <div class="stats-section">
            <h4>🌱 農場狀況</h4>
            <div class="stats-grid">
                <div class="stats-item">
                    <span>農場使用率：</span>
                    <span class="stats-value">${stats.farmUsage}</span>
                </div>
                <div class="stats-item">
                    <span>已解鎖品種：</span>
                    <span class="stats-value">${stats.unlockedCount}/${Object.keys(MANDRAKE_CONFIG).length}</span>
                </div>
                <div class="stats-item">
                    <span>當前天氣：</span>
                    <span class="stats-value">${WEATHER_CONFIG[stats.currentWeather]?.name || '未知'}</span>
                </div>
                <div class="stats-item">
                    <span>活躍效果：</span>
                    <span class="stats-value">${stats.activeBoosts}個</span>
                </div>
            </div>
        </div>
        
        <div class="stats-section">
            <h4>💎 強化系統</h4>
            <div class="stats-grid">
                <div class="stats-item">
                    <span>已獲得強化：</span>
                    <span class="stats-value">${Object.keys(game.data.enhancements.obtained || {}).length}種</span>
                </div>
                <div class="stats-item">
                    <span>強化總等級：</span>
                    <span class="stats-value">${Object.values(game.data.enhancements.obtained || {}).reduce((sum, level) => sum + level, 0)}</span>
                </div>
                <div class="stats-item">
                    <span>待處理強化：</span>
                    <span class="stats-value">${game.data.enhancements.pendingCount || 0}</span>
                </div>
            </div>
        </div>
    `;
    
    // 顯示模態框
    modal.classList.add('show');
    modal.style.display = 'flex';
};

window.hideStats = function() {
    const modal = document.getElementById('stats-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
};