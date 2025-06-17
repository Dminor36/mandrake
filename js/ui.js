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
        this.updateWeatherRerollButton(); 
        this.updateMandrakeList();
        this.updateRebirthInfo();
        this.updateRewardStatus(); 
        this.updateEnhancementStatus();
    }

    // ========== 資源和顯示更新 ==========

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
        
        // 🔧 新增：更新進度條
        this.updateProgressBars();

        this.updateButtonStates();
    }

    /**
     * 🔧 修復：添加帶動畫的數字更新函數
     */
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

    // ========== 天氣系統更新 ==========

    /**
     * 更新天氣顯示
     */
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
    
        const weatherDisplay = document.getElementById('current-weather');
        if (!weatherDisplay || !game.data) return;
    
        const weather = WEATHER_CONFIG[game.data.weather];
        if (weather) {
            weatherDisplay.innerHTML = `
                <div class="weather-info">
                    <span class="weather-icon">${weather.icon}</span>
                    <span class="weather-name">${weather.name}</span>
                    <small class="weather-effect">${weather.effect}</small>
                </div>
            `;
        }
    }

    /**
     * 🔧 新增天氣刷新倒數計時功能
     */
    static updateWeatherTimer() {
        const timerElement = document.getElementById('weather-refresh-timer');
        if (!timerElement || !game.data) return;
        
        const seconds = game.data.weatherTimer || 0;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        // 時間緊急時添加視覺效果
        if (seconds <= 10) {
            timerElement.style.color = '#e74c3c';
            timerElement.style.fontWeight = 'bold';
        } else if (seconds <= 30) {
            timerElement.style.color = '#f39c12';
        } else {
            timerElement.style.color = '';
            timerElement.style.fontWeight = '';
        }
    }

    /**
     * 更新天氣重骰按鈕狀態
     */
    static updateWeatherRerollButton() {
        const button = document.querySelector('.weather-reroll-btn');
        if (!button || !game.data) return;
        
        const isLocked = game.data.weatherLocked && Date.now() < game.data.weatherLocked;
        const cost = game.data.freeWeatherReroll ? 0 : 100;
        const canAfford = game.data.fruit >= cost;
        
        if (isLocked) {
            // 🔧 天氣被鎖定時
            button.disabled = true;
            button.textContent = '被鎖定';
            button.className = 'weather-reroll-btn disabled';
            
            // 🔧 顯示剩餘鎖定時間
            const remainingTime = Math.ceil((game.data.weatherLocked - Date.now()) / 60000);
            button.title = `天氣被鎖定，剩餘 ${remainingTime} 分鐘`;
            
        } else if (!canAfford && cost > 0) {
            // 🔧 果實不足時
            button.disabled = true;
            button.textContent = `重骰 ${cost}`;
            button.className = 'weather-reroll-btn expensive';
            button.title = '果實不足';
            
        } else {
            // 🔧 正常狀態
            button.disabled = false;
            button.className = cost === 0 ? 'weather-reroll-btn free' : 'weather-reroll-btn';
            button.textContent = cost === 0 ? '免費重骰' : `重骰 ${cost}`;
            button.title = cost === 0 ? '免費重骰天氣' : `花費 ${cost} 果實重骰天氣`;
        }
    }

    // ========== 曼德拉草列表管理 ==========

    /**
     * 更新曼德拉草列表（支持插槽顯示）
     */
    static updateMandrakeList() {
        const container = document.getElementById('mandrake-list');
        if (!container) {
            console.error('找不到 mandrake-list 元素'); 
            return;
        }

        if (!game || !game.data) {
            console.warn('updateMandrakeList: 遊戲數據不完整');
            return;
        }

        console.log('開始更新曼德拉草列表（包含插槽）');
        container.innerHTML = '';

        // 🔧 先顯示已解鎖的曼德拉草
        if (game.data.unlockedMandrakes) {
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
        }

        // 🔧 修正：插槽顯示在最後面
        if (game.data.unconfirmedTierSlots) {
            for (const slot of game.data.unconfirmedTierSlots) {
                if (slot.status === 'pending') {
                    const slotRow = this.createSlotRow(slot);
                    if (slotRow) {
                        container.appendChild(slotRow);
                    }
                }
            }
        }
    }


    /**
     * 🔧 修正：創建插槽行（修復工具提示）
     */
    // 在 ui.js 中修改 createMandrakeRow 函數，給整個行添加 title 屬性

    static createMandrakeRow(id, config, count, cost, production) {
        const row = document.createElement('div');
        row.className = `plant-row ${config.type}`;
        
        // 設置 data 屬性用於進度條更新
        row.setAttribute('data-mandrake-id', id);

        // 計算批量購買的成本和收益
        const bulkCost = this.calculateBulkCost(id, this.currentBulkAmount);
        
        // 🔧 修正：使用正確的計算方法
        const productionIncrease = this.calculateProductionIncrease(id, count, this.currentBulkAmount);
        
        // 🔧 新增：獲取詳細分解（用於高級工具提示）
        const detailedIncrease = this.getDetailedProductionIncrease(id, count, this.currentBulkAmount);
        
        const formattedIncrease = this.formatNumber(productionIncrease);
        const formattedCost = this.formatNumber(bulkCost);
        const formattedProduction = this.formatNumber(production);
        
        // 🔧 調試：檢查成本計算
        console.log(`${config.name} - 批量成本: ${bulkCost}, 格式化: ${formattedCost}`);
        
        // 檢查是否能負擔完整批量
        const canAfford = game.data.fruit >= bulkCost;
        
        // 🔧 修正：工具提示顯示詳細的產量分解
        let tooltipContent = `總產量增加: +${formattedIncrease}/秒\n`;
        
        if (detailedIncrease && detailedIncrease.secondaryBenefit > 0.001) {
            tooltipContent += `├ 基礎提升: +${this.formatNumber(detailedIncrease.primaryBenefit)}/秒\n`;
            tooltipContent += `└ 其它效益: +${this.formatNumber(detailedIncrease.secondaryBenefit)}/秒\n`;
        }
        
        // 計算進度條
        const progressWidth = this.calculateProgressWidth(id, game.data.fruit);
        const isHighProgress = progressWidth > 80;
        
        if (isHighProgress) {
            row.classList.add('high-progress');
        }

        // 🔧 修改：整個行添加 title 屬性來顯示提示信息
        row.title = tooltipContent;

        // 🔧 保持原有的佈局
        row.innerHTML = `
            <!-- 左側：大數字顯示數量 -->
            <div class="plant-count-section">
                <div class="plant-count-large">${count}</div>
            </div>
            
            <!-- 中間：曼德拉草信息 -->
            <div class="plant-info-section">
                <div class="plant-name">${config.icon} ${config.name}</div>
                <div class="plant-production">產量：${formattedProduction}/秒</div>
            </div>
            
            <!-- 右側：成本顯示 -->
            <div class="plant-cost-section">
                <div class="plant-cost" onclick="buyMandrakesBulk(this, '${id}', ${this.currentBulkAmount})" style="cursor: pointer; color: ${canAfford ? '#27ae60' : '#e74c3c'}; font-size: 1.5em; font-weight: bold; text-align: center; ${!canAfford ? 'opacity: 0.6;' : ''}">
                    ${formattedCost}
                </div>
            </div>
        `;

        // 設置進度條寬度
        row.style.setProperty('--progress-width', `${progressWidth}%`);

        return row;
    }

    // 同樣修改插槽行的函數
    static createSlotRow(slot) {
        const row = document.createElement('div');
        row.className = 'plant-row normal';
        row.setAttribute('data-slot-id', slot.id);

        // 獲取插槽顯示信息
        const displayInfo = game.getSlotDisplayInfo(slot.id);
        if (!displayInfo) {
            console.error('無法獲取插槽顯示信息:', slot.id);
            return null;
        }

        const cost = displayInfo.cost;
        const canAfford = displayInfo.canAfford;
        const formattedCost = this.formatNumber(cost);
        
        // 🔧 修改：插槽也添加 title 屬性
        const tooltipContent = `種植時隨機決定品種\n成本: ${formattedCost}`;
        row.title = tooltipContent;

        // 🔧 完全按照原本曼德拉草的格式
        row.innerHTML = `
            <!-- 左側：大數字顯示數量 (插槽顯示0) -->
            <div class="plant-count-section">
                <div class="plant-count-large">0</div>
            </div>
            
            <!-- 中間：曼德拉草信息 -->
            <div class="plant-info-section">
                <div class="plant-name">❓ 第${slot.tier}階曼德拉草</div>
                <div class="plant-production">種植時隨機決定品種</div>
            </div>
            
            <!-- 右側：購買區域 -->
            <div class="plant-buy-section">
                <div class="slot-cost-display" onclick="buySlot(this, '${slot.id}')" style="
                    cursor: pointer; 
                    color: ${canAfford ? '#27ae60' : '#e74c3c'}; 
                    font-size: 1.5em; 
                    font-weight: bold; 
                    text-align: center; 
                    width: 100%; 
                    height: 100%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    ${!canAfford ? 'opacity: 0.6;' : ''}
                ">
                    ${formattedCost}
                </div>
            </div>
        `;

        // 🔧 修改文字顏色為灰色
        const plantName = row.querySelector('.plant-name');
        const plantProduction = row.querySelector('.plant-production');
        if (plantName) plantName.style.color = '#666';
        if (plantProduction) plantProduction.style.color = '#999';

        // 🔧 新增：計算並設定進度條
        const progressWidth = this.calculateSlotProgressWidth(slot.id, game.data.fruit);
        row.style.setProperty('--progress-width', `${progressWidth}%`);
        
        // 高進度特效
        if (progressWidth > 80) {
            row.classList.add('high-progress');
        }

        return row;
    }



    // ========== 計算和更新函數 ==========

    /**
     * 計算購買指定數量曼德拉草後的產量增加
     */
    static calculateProductionIncrease(id, currentCount, purchaseAmount) {
        if (!game || !game.data) return 0;
        
        // 保存原始遊戲狀態
        const originalOwnedMandrakes = JSON.parse(JSON.stringify(game.data.ownedMandrakes));
        const originalTotalProduction = game.getTotalProduction();
        
        try {
            // 模擬購買後的狀態
            game.data.ownedMandrakes[id] = (game.data.ownedMandrakes[id] || 0) + purchaseAmount;
            
            // 計算購買後的總產量
            const newTotalProduction = game.getTotalProduction();
            
            // 產量增加 = 新總產量 - 原總產量
            const productionIncrease = newTotalProduction - originalTotalProduction;
            
            // 還原原始狀態
            game.data.ownedMandrakes = originalOwnedMandrakes;
            
            return productionIncrease;
            
        } catch (error) {
            console.error('計算產量增加時發生錯誤:', error);
            
            // 還原原始狀態
            game.data.ownedMandrakes = originalOwnedMandrakes;
            
            // 備用簡單計算
            return this.fallbackProductionCalculation(id, currentCount, purchaseAmount);
        }
    }

    /**
     * 🔧 新增：獲取詳細的產量增加分解（用於調試和顯示）
     */
    static getDetailedProductionIncrease(id, currentCount, purchaseAmount) {
        if (!game || !game.data) return null;
        
        // 保存原始狀態
        const originalOwnedMandrakes = JSON.parse(JSON.stringify(game.data.ownedMandrakes));
        const originalProductions = JSON.parse(JSON.stringify(game.individualProductions || {}));
        
        try {
            // 計算購買前各品種的產量
            const beforeProductions = {};
            game.getTotalProduction(); // 更新 individualProductions
            for (const [mandrakeId, production] of Object.entries(game.individualProductions || {})) {
                beforeProductions[mandrakeId] = production;
            }
            
            // 模擬購買
            game.data.ownedMandrakes[id] = (game.data.ownedMandrakes[id] || 0) + purchaseAmount;
            
            // 計算購買後各品種的產量
            const afterProductions = {};
            game.getTotalProduction(); // 重新計算
            for (const [mandrakeId, production] of Object.entries(game.individualProductions || {})) {
                afterProductions[mandrakeId] = production;
            }
            
            // 計算每個品種的產量變化
            const productionChanges = {};
            let totalIncrease = 0;
            
            for (const mandrakeId of Object.keys(game.data.ownedMandrakes)) {
                const before = beforeProductions[mandrakeId] || 0;
                const after = afterProductions[mandrakeId] || 0;
                const change = after - before;
                
                if (Math.abs(change) > 0.001) {
                    productionChanges[mandrakeId] = {
                        before: before,
                        after: after,
                        change: change,
                        name: MANDRAKE_CONFIG[mandrakeId]?.name || mandrakeId
                    };
                    totalIncrease += change;
                }
            }
            
            // 還原狀態
            game.data.ownedMandrakes = originalOwnedMandrakes;
            game.individualProductions = originalProductions;
            
            return {
                totalIncrease: totalIncrease,
                changes: productionChanges,
                primaryBenefit: productionChanges[id]?.change || 0,
                secondaryBenefit: totalIncrease - (productionChanges[id]?.change || 0)
            };
            
        } catch (error) {
            console.error('詳細產量計算錯誤:', error);
            
            // 還原狀態
            game.data.ownedMandrakes = originalOwnedMandrakes;
            game.individualProductions = originalProductions;
            
            return null;
        }
    }

    /**
     * 🔧 修正：計算當前曼德拉草產量（用於顯示）
     */
    static calculateMandrakeProduction(id, count) {
        // 直接使用遊戲的產量計算函數，確保包含所有效果
        return game.calculateSingleMandrakeProduction(id, count);
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
     * 計算插槽進度條寬度
     */
    static calculateSlotProgressWidth(slotId, currentFruit) {
        // 找到對應的插槽
        const slot = game.data.unconfirmedTierSlots.find(s => s.id === slotId);
        if (!slot) return 0;
        
        // 獲取插槽的基礎成本
        const baseCost = TIER_BASE_COSTS[slot.tier] || 100;
        
        if (baseCost === 0) return 100; // 避免除以零
        
        // 進度 = 當前果實 ÷ 插槽成本，最大100%
        const progress = Math.min((currentFruit / baseCost) * 100, 100);
        return progress;
    }

    /**
     * 批量更新進度條，避免重複計算
     */
    static updateProgressBars() {
        if (!game || !game.data) return;
        
        const currentFruit = game.data.fruit;
        
        // 曼德拉草進度條
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

        // 插槽的進度條
        const slotRows = document.querySelectorAll('.plant-row[data-slot-id]');
        slotRows.forEach(row => {
            const slotId = row.getAttribute('data-slot-id');
            if (slotId) {
                const progressWidth = this.calculateSlotProgressWidth(slotId, currentFruit);
                
                // 更新進度條
                const currentWidth = parseFloat(row.style.getPropertyValue('--progress-width')) || 0;
                if (Math.abs(progressWidth - currentWidth) > 1) {
                    row.style.setProperty('--progress-width', `${progressWidth}%`);
                    
                    // 高進度特效
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
     * 🔧 新增：更新行工具提示內容
     */
    static updateRowTooltip(row, mandrakeId) {
        const tooltip = row.querySelector('.hover-tooltip');
        if (!tooltip) return;
        
        const currentCount = game.data.ownedMandrakes[mandrakeId] || 0;
        const productionIncrease = this.calculateProductionIncrease(mandrakeId, currentCount, this.currentBulkAmount);
        const detailedIncrease = this.getDetailedProductionIncrease(mandrakeId, currentCount, this.currentBulkAmount);
        const bulkCost = this.calculateBulkCost(mandrakeId, this.currentBulkAmount);
        
        const formattedIncrease = this.formatNumber(productionIncrease);
        
        let tooltipContent = `<div>總產量增加: +${formattedIncrease}/秒</div>`;
        
        if (detailedIncrease && detailedIncrease.secondaryBenefit > 0.001) {
            tooltipContent += `<div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                <div>├ 本項提升: +${this.formatNumber(detailedIncrease.primaryBenefit)}/秒</div>
                <div>└ 其它效益: +${this.formatNumber(detailedIncrease.secondaryBenefit)}/秒</div>
            </div>`;
        }
             
        tooltip.innerHTML = tooltipContent;
    }

    // ========== 用戶交互處理 ==========

    /**
     * 🔧 新增：處理曼德拉草行點擊
     */
    static handlePlantRowClick(id, amount) {
        // 先檢查是否能買得起完整批量
        const totalCost = this.calculateBulkCost(id, amount);
        
        if (game.data.fruit < totalCost) {
            this.showNotification('果實不足，無法購買完整批量！', 'warning');
            return;
        }
        
        // 執行批量購買
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
            this.showNotification(`成功種植 ${amount} 個 ${MANDRAKE_CONFIG[id].name}！`, 'success');
        } else {
            this.showNotification(`只成功種植 ${successCount} 個`, 'warning');
        }
        
        // 視覺反饋和UI更新
        this.addVisualEffect(document.querySelector(`[data-mandrake-id="${id}"]`), 'bounce');
        setTimeout(() => {
            this.updateAll();
        }, 100);
    }

    /**
     * 🔧 新增：處理插槽行點擊
     */
    static handleSlotRowClick(slotId) {
        console.log('嘗試購買插槽:', slotId);
        
        if (!game || !game.buyTierSlot) {
            this.showNotification('遊戲系統錯誤', 'error');
            return;
        }

        const success = game.buyTierSlot(slotId);
        
        if (success) {
            this.showNotification('插槽購買成功！品種已確定！', 'success');
            
            // 視覺反饋
            this.addVisualEffect(document.querySelector(`[data-slot-id="${slotId}"]`), 'bounce');
            
            // 延遲更新UI，讓動畫完成
            setTimeout(() => {
                this.updateAll();
            }, 300);
        } else {
            this.showNotification('購買失敗，請檢查果實是否足夠', 'warning');
        }
    }

    /**
     * 🔧 同樣修正 updateButtonStates 中的計算
     */
    static updateButtonStates() {
        if (!game || !game.data) return;

        // 更新曼德拉草行狀態
        const plantRows = document.querySelectorAll('.plant-row[data-mandrake-id]');
        plantRows.forEach(row => {
            const mandrakeId = row.getAttribute('data-mandrake-id');
            if (mandrakeId) {
                const totalCost = this.calculateBulkCost(mandrakeId, this.currentBulkAmount);
                const canAfford = game.data.fruit >= totalCost;
                
                // 更新價格顯示
                const priceElement = row.querySelector('.plant-price');
                if (priceElement) {
                    priceElement.textContent = this.formatNumber(totalCost);
                    priceElement.className = `plant-price ${canAfford ? 'affordable' : 'expensive'}`;
                }
                
                // 更新批量指示器
                const bulkIndicator = row.querySelector('.bulk-indicator');
                if (bulkIndicator) {
                    bulkIndicator.textContent = this.currentBulkAmount > 1 ? `×${this.currentBulkAmount}` : '';
                }
                
                // 更新行狀態
                if (canAfford) {
                    row.classList.remove('disabled');
                    row.onclick = () => this.handlePlantRowClick(mandrakeId, this.currentBulkAmount);
                } else {
                    row.classList.add('disabled');
                    row.onclick = null;
                }
                
                // 更新工具提示
                this.updateRowTooltip(row, mandrakeId);
            }
        });

        // 更新插槽行狀態
        const slotRows = document.querySelectorAll('.plant-row[data-slot-id]');
        slotRows.forEach(row => {
            const slotId = row.getAttribute('data-slot-id');
            if (slotId) {
                const displayInfo = game.getSlotDisplayInfo(slotId);
                
                if (displayInfo) {
                    const canAfford = game.data.fruit >= displayInfo.cost;
                    
                    // 更新價格顯示
                    const priceElement = row.querySelector('.plant-price');
                    if (priceElement) {
                        priceElement.textContent = this.formatNumber(displayInfo.cost);
                        priceElement.className = `plant-price ${canAfford ? 'affordable' : 'expensive'}`;
                    }
                    
                    // 更新行狀態
                    if (canAfford) {
                        row.classList.remove('disabled');
                        row.onclick = () => this.handleSlotRowClick(slotId);
                    } else {
                        row.classList.add('disabled');
                        row.onclick = null;
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

    // ========== 批量購買控制 ==========

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

    // ========== 獎勵系統更新 ==========

    /**
     * 🔧 修復：獎勵更新函數
     */
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
                
                // 🔧 修復：確保onclick事件正確綁定
                if (!buttonElement.onclick && !buttonElement.getAttribute('onclick')) {
                    buttonElement.onclick = openRewardSelection;
                }
                
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

    // ========== 強化系統 ==========

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
            enhancementButton.textContent = `🔮 強化`;
            
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

    // ========== 重生系統 ==========

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

    // ========== 輔助函數 ==========

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
                return formatted + unit.symbol;
            }
        }
    
        return Math.floor(number).toString();
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
        if (!element) return;
        
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
     * 顯示通知
     */
    static showNotification(message, type = 'info', duration = 3000) {
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

    // ========== 內嵌獎勵系統 ==========

    /**
     * 顯示內嵌式獎勵選擇
     */
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

    /**
     * 選擇獎勵的方法
     */
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

    /**
     * 簡化的獎勵效果處理
     */
    static applyRewardEffectSimple(selectedOption) {
        const { template, tier } = selectedOption;
        
        switch (template.name) {
            case '生產力提升':
                game.applyTempBoost('production', 1 + tier.bonus/100, tier.duration);
                break;
                
            case '元素共鳴':
                game.applyTempBoost('element', 1 + tier.bonus/100, tier.duration);
                break;
                
            case '野性爆發':
                game.applyTempBoost('animal', 1 + tier.bonus/100, tier.duration);
                break;
                
            case '返璞歸真':
                game.applyTempBoost('normal', 1 + tier.bonus/100, tier.duration);
                break;
                
            case '即時果實':
                const minuteProduction = game.getTotalProduction() * 60 * tier.minutes;
                game.data.fruit += minuteProduction;
                this.showNotification(`獲得 ${tier.minutes} 分鐘產量的果實！`, 'success');
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
                    this.showNotification(`${config.name} 收穫爆發！獲得 ${tier.hours} 小時產量！`, 'success');
                } else {
                    this.showNotification('沒有曼德拉草可以爆發收穫', 'warning');
                }
                break;
                
            case '購買狂潮':
                game.data.purchaseBoost = {
                    remainingPurchases: tier.count,
                    discount: tier.discount / 100,
                    endTime: Date.now() + 3600000 // 1小時後過期
                };
                this.showNotification(`購買狂潮啟動！接下來 ${tier.count} 次購買享 ${tier.discount}% 折扣！`, 'success');
                break;
                
            case '幸運連擊':
                game.data.luckyStreak = {
                    remainingTriggers: tier.count,
                    chance: tier.chance / 100,
                    endTime: Date.now() + 3600000 // 1小時後過期
                };
                this.showNotification(`幸運連擊啟動！接下來 ${tier.count} 次有 ${tier.chance}% 機率雙倍產量！`, 'success');
                break;
                
            default:
                console.log('未處理的獎勵類型:', template.name);
                this.showNotification(`獲得了 ${template.name}，但效果尚未實作`, 'warning');
        }
    }
}

// ========== 全局函數（供HTML onclick調用）==========

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
    
    // 🔧 修改：使用Rewards系統的模態框
    if (typeof Rewards !== 'undefined') {
        Rewards.openRewardSelection();
    } else {
        UI.showNotification('獎勵系統未載入', 'error');
    }
};

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

// 全局函數：購買插槽
window.buySlot = function(button, slotId) {
    console.log('嘗試購買插槽:', slotId);
    
    if (!game || !game.buyTierSlot) {
        UI.showNotification('遊戲系統錯誤', 'error');
        return;
    }

    const success = game.buyTierSlot(slotId);
    
    if (success) {
        UI.showNotification('插槽購買成功！品種已確定！', 'success');
        
        if (button) {
            UI.addVisualEffect(button, 'bounce');
        }
        
        // 延遲更新UI，讓動畫完成
        setTimeout(() => {
            UI.updateAll();
        }, 300);
    } else {
        UI.showNotification('購買失敗，請檢查果實是否足夠', 'warning');
    }
};

// 暴露UI類供其他模組使用
window.UI = UI;