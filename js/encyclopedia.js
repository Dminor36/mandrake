// ========== 圖鑑系統 - 完整重寫版 ==========

console.log('📖 encyclopedia.js 開始載入...');

/**
 * 圖鑑系統主類
 */
class EncyclopediaSystem {
    
    /**
     * 初始化圖鑑數據
     */
    static initializeEncyclopedia() {
        if (!game.data.encyclopedia) {
            game.data.encyclopedia = {
                discoveredSpecies: new Set(), // 曾經擁有過的品種名稱
                unlockedEntries: new Set(),   // 圖鑑中已解鎖的條目
                viewedConditions: new Set()   // 已查看過解鎖條件的品種
            };
        }
        
        // 確保數據類型正確（從存檔載入時可能是數組）
        if (Array.isArray(game.data.encyclopedia.discoveredSpecies)) {
            game.data.encyclopedia.discoveredSpecies = new Set(game.data.encyclopedia.discoveredSpecies);
        }
        if (Array.isArray(game.data.encyclopedia.unlockedEntries)) {
            game.data.encyclopedia.unlockedEntries = new Set(game.data.encyclopedia.unlockedEntries);
        }
        if (Array.isArray(game.data.encyclopedia.viewedConditions)) {
            game.data.encyclopedia.viewedConditions = new Set(game.data.encyclopedia.viewedConditions);
        }
        
        // 確保初始曼德拉草始終在圖鑑中
        if (!game.data.encyclopedia.discoveredSpecies.has('曼德拉草')) {
            game.data.encyclopedia.discoveredSpecies.add('曼德拉草');
            console.log('✅ 已將初始曼德拉草添加到圖鑑');
        }
    }
    
    /**
     * 記錄發現新品種
     */
    static discoverSpecies(speciesName) {
        this.initializeEncyclopedia();
        game.data.encyclopedia.discoveredSpecies.add(speciesName);
        console.log(`🔍 發現新品種: ${speciesName}`);
    }
    
    /**
     * 檢查是否可以解鎖品種（前置條件檢查）
     */
    static canUnlockSpecies(speciesData) {
        if (!speciesData.prerequisites) {
            return true; // 沒有前置條件的可以直接解鎖
        }
        
        // 檢查是否同時擁有所有前置品種
        for (const prerequisiteName of speciesData.prerequisites) {
            const prerequisiteId = NAME_TO_ID_MAP[prerequisiteName];
            if (!prerequisiteId) {
                console.warn(`⚠️ 找不到前置品種ID: ${prerequisiteName}`);
                return false;
            }
            
            // 檢查是否當前擁有該品種
            const currentCount = game.data.ownedMandrakes[prerequisiteId] || 0;
            if (currentCount <= 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 選擇隨機曼德拉草（帶前置條件檢查）
     */
    static selectRandomMandrakeWithPrerequisites(tier, usedNames = new Set()) {
        const types = ['normal', 'element', 'animal'];
        const shuffledTypes = types.sort(() => Math.random() - 0.5);
        
        for (const type of shuffledTypes) {
            // 篩選該屬性中可用的名稱（未使用 + 符合前置條件）
            const availableNames = EXTENDED_NAME_POOLS[type].filter(nameData => {
                // 1. 名稱未被使用
                if (usedNames.has(nameData.name)) {
                    return false;
                }
                
                // 2. 檢查前置條件
                if (!this.canUnlockSpecies(nameData)) {
                    return false;
                }
                
                return true;
            });
            
            if (availableNames.length > 0) {
                const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
                
                // 記錄發現
                this.discoverSpecies(selectedName.name);
                
                // 生成配置
                const nameKey = NAME_TO_ID_MAP[selectedName.name] || selectedName.name.replace(/[^a-zA-Z0-9]/g, '');
                const uniqueId = `${type}_t${tier}_${nameKey}`;
                
                return {
                    id: uniqueId,
                    tier: tier,
                    type: type,
                    name: selectedName.name,
                    icon: selectedName.icon,
                    description: selectedName.description,
                    ...TIER_STATS[tier]
                };
            }
        }
        
        console.warn(`⚠️ 第${tier}階無法找到符合條件的名稱！`);
        return null;
    }
    
    /**
     * 建立擁有的曼德拉草名稱映射
     */
    static buildOwnedMandrakeMap() {
        const ownedMap = new Map();
        
        // 遍歷所有已擁有的曼德拉草
        for (const [mandrakeId, count] of Object.entries(game.data.ownedMandrakes)) {
            if (count > 0) {
                const config = MANDRAKE_CONFIG[mandrakeId];
                if (config && config.name) {
                    ownedMap.set(config.name, {
                        id: mandrakeId,
                        count: count,
                        config: config
                    });
                }
            }
        }
        
        return ownedMap;
    }
    
    /**
     * 獲取圖鑑顯示數據
     */
    static getEncyclopediaDisplayData() {
        this.initializeEncyclopedia();
        
        const encyclopediaData = { types: {} };
        
        // 建立擁有的曼德拉草映射
        const ownedMap = this.buildOwnedMandrakeMap();
        
        // 處理每個類型的品種
        for (const [typeName, species] of Object.entries(EXTENDED_NAME_POOLS)) {
            const filteredSpecies = [];
            
            species.forEach(speciesData => {
                const isDiscovered = game.data.encyclopedia.discoveredSpecies.has(speciesData.name);
                
                // 直接從擁有映射中查找
                const ownedData = ownedMap.get(speciesData.name);
                const isOwned = ownedData !== undefined;
                const ownedCount = isOwned ? ownedData.count : 0;
                
                // 決定顯示狀態
                let status;
                if (isOwned) {
                    status = 'owned';        // 已擁有
                } else if (isDiscovered) {
                    status = 'discovered';   // 已發現但未擁有
                } else {
                    status = 'unknown';       // 未解鎖/未發現
                }
                
                // 計算解鎖條件顯示
                let unlockCondition = null;
                if (speciesData.prerequisites) {
                    const conditions = speciesData.prerequisites.map(prereqName => {
                        const isPrereqDiscovered = game.data.encyclopedia.discoveredSpecies.has(prereqName);
                        // 如果當前品種未發現，前置條件也顯示為 ???
                        return (isDiscovered && isPrereqDiscovered) ? prereqName : '???';
                    });
                    unlockCondition = `需要同時擁有：${conditions.join(', ')}`;
                }
                
                // 所有品種都顯示，不管是否發現
                filteredSpecies.push({
                    name: status === 'unknown' ? '???' : speciesData.name,
                    icon: status === 'unknown' ? '❓' : speciesData.icon,
                    description: status === 'unknown' ? '未知的曼德拉草品種' : speciesData.description,
                    status: status,
                    unlockCondition: unlockCondition,
                    type: typeName,
                    ownedCount: ownedCount,
                    originalName: speciesData.name // 保留原始名稱用於內部邏輯
                });
            });
            
            // 按狀態排序：已擁有 > 已發現 > 未解鎖
            filteredSpecies.sort((a, b) => {
                const statusOrder = { 'owned': 0, 'discovered': 1, 'unknown': 2 };
                const orderA = statusOrder[a.status];
                const orderB = statusOrder[b.status];
                
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                
                // 同狀態內按名稱排序
                return a.originalName.localeCompare(b.originalName);
            });
            
            // 只有當該類型有內容時才添加
            if (filteredSpecies.length > 0) {
                encyclopediaData.types[typeName] = filteredSpecies;
            }
        }
        
        // 特殊處理初始曼德拉草
        if (!encyclopediaData.types.normal) {
            encyclopediaData.types.normal = [];
        }
        
        // 檢查初始曼德拉草是否已經在列表中
        const hasOriginal = encyclopediaData.types.normal.some(species => 
            species.originalName === '曼德拉草' || species.name === '曼德拉草'
        );
        
        if (!hasOriginal) {
            const originalCount = game.data.ownedMandrakes['original'] || 0;
            const originalOwned = originalCount > 0;
            const originalDiscovered = game.data.encyclopedia.discoveredSpecies.has('曼德拉草');
            
            const originalMandrake = {
                name: '曼德拉草',
                icon: '🌱',
                description: '常見的曼德拉草',
                status: originalOwned ? 'owned' : (originalDiscovered ? 'discovered' : 'unknown'),
                unlockCondition: null,
                type: 'normal',
                ownedCount: originalCount,
                originalName: '曼德拉草'
            };
            encyclopediaData.types.normal.unshift(originalMandrake);
        }
        
        return encyclopediaData;
    }
    
    /**
     * 設置工具提示定位
     */
    static setupTooltips() {
        setTimeout(() => {
            if (typeof TooltipPositioner !== 'undefined') {
                TooltipPositioner.initializeTooltips();
                TooltipPositioner.setupResizeListener();
            }
        }, 100);
    }
    
    /**
     * 顯示圖鑑界面
     */
    static showEncyclopedia() {
        const modal = document.getElementById('encyclopedia-modal');
        if (!modal) {
            console.error('❌ 找不到圖鑑模態框');
            return;
        }
        
        const container = document.getElementById('encyclopedia-content');
        if (!container) {
            console.error('❌ 找不到圖鑑內容容器');
            return;
        }
        
        // 清空內容
        container.innerHTML = '';
        
        // 獲取圖鑑數據
        const encyclopediaData = this.getEncyclopediaDisplayData();
        
        // 創建類型區塊
        Object.entries(encyclopediaData.types).forEach(([typeName, species]) => {
            const typeSection = document.createElement('div');
            typeSection.className = 'encyclopedia-type-section';
            
            const typeHeader = document.createElement('h3');
            typeHeader.textContent = {
                normal: `🌿 普通系 (${species.length})`,
                element: `🔥 元素系 (${species.length})`, 
                animal: `🐾 動物系 (${species.length})`
            }[typeName];
            typeHeader.className = `type-header ${typeName}`;
            typeSection.appendChild(typeHeader);
            
            // 創建物種網格
            const speciesGrid = document.createElement('div');
            speciesGrid.className = 'encyclopedia-species-grid';
            
            species.forEach(speciesInfo => {
                const speciesCard = this.createSpeciesCard(speciesInfo);
                speciesGrid.appendChild(speciesCard);
            });
            
            typeSection.appendChild(speciesGrid);
            container.appendChild(typeSection);
        });
        
        // 顯示模態框
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // 設置工具提示定位
        this.setupTooltips();
        
        console.log('📖 圖鑑界面已顯示');
    }
    
    /**
     * 創建物種卡片
     */
    static createSpeciesCard(speciesInfo) {
        const card = document.createElement('div');
        card.className = `encyclopedia-species-card ${speciesInfo.status}`;
        
        // 基本圖標
        card.innerHTML = `
            <div class="species-icon">${speciesInfo.icon}</div>
        `;
        
        // 工具提示內容
        let tooltipContent = `${speciesInfo.name}\n${speciesInfo.description}`;
        
        if (speciesInfo.unlockCondition) {
            tooltipContent += `\n${speciesInfo.unlockCondition}`;
        }
        
        if (speciesInfo.status === 'owned' && speciesInfo.ownedCount > 0) {
            tooltipContent += `\n已擁有：${speciesInfo.ownedCount} 株`;
        }
        
        // 設置 title 屬性
        card.title = tooltipContent;
        
        return card;
    }
    
    /**
     * 隱藏圖鑑界面
     */
    static hideEncyclopedia() {
        const modal = document.getElementById('encyclopedia-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
        console.log('📖 圖鑑界面已隱藏');
    }
    
    /**
     * 強制同步圖鑑狀態
     */
    static syncEncyclopediaWithGame() {
        console.log('🔄 開始同步圖鑑狀態...');
        
        // 確保所有已擁有的曼德拉草都在發現列表中
        for (const [mandrakeId, count] of Object.entries(game.data.ownedMandrakes)) {
            if (count > 0) {
                const config = MANDRAKE_CONFIG[mandrakeId];
                if (config && config.name) {
                    this.discoverSpecies(config.name);
                }
            }
        }
        
        console.log('✅ 圖鑑狀態同步完成');
    }
    
    /**
     * 獲取統計信息
     */
    static getStats() {
        const ownedMap = this.buildOwnedMandrakeMap();
        const discoveredCount = game.data.encyclopedia.discoveredSpecies.size;
        const ownedCount = ownedMap.size;
        
        // 計算總品種數
        let totalSpecies = 1; // 初始曼德拉草
        for (const species of Object.values(EXTENDED_NAME_POOLS)) {
            totalSpecies += species.length;
        }
        
        return {
            discovered: discoveredCount,
            owned: ownedCount,
            total: totalSpecies,
            discoveryRate: ((discoveredCount / totalSpecies) * 100).toFixed(1),
            ownershipRate: ((ownedCount / totalSpecies) * 100).toFixed(1)
        };
    }
    
    /**
     * 調試函數
     */
    static debug() {
        console.log('=== 圖鑑系統調試信息 ===');
        console.log('已擁有的曼德拉草:', game.data.ownedMandrakes);
        console.log('已發現的品種:', Array.from(game.data.encyclopedia.discoveredSpecies));
        
        const ownedMap = this.buildOwnedMandrakeMap();
        console.log('擁有映射表:', ownedMap);
        
        const stats = this.getStats();
        console.log('統計信息:', stats);
        
        // 檢查每個已擁有的曼德拉草
        ownedMap.forEach((data, name) => {
            const isDiscovered = game.data.encyclopedia.discoveredSpecies.has(name);
            console.log(`${name}: ${data.count}株, 已發現: ${isDiscovered}`);
        });
    }
}

/**
 * 工具提示定位系統
 */
class TooltipPositioner {
    
    /**
     * 動態計算並設定工具提示位置
     */
    static positionTooltip(element) {
        if (!element) return;
        
        // 獲取元素位置和尺寸
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 280;
        const tooltipHeight = 80;
        const margin = 8;
        
        // 獲取視窗尺寸
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 清除之前的定位類別
        element.classList.remove(
            'tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right',
            'tooltip-top-left', 'tooltip-top-right', 
            'tooltip-bottom-left', 'tooltip-bottom-right'
        );
        
        // 計算各方向的可用空間
        const spaceTop = rect.top;
        const spaceBottom = viewportHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewportWidth - rect.right;
        
        let positionClass = 'tooltip-top'; // 預設位置
        
        // 智能選擇最佳位置
        if (spaceTop >= tooltipHeight + margin) {
            // 上方有足夠空間
            if (rect.left + rect.width/2 - tooltipWidth/2 < 0) {
                positionClass = 'tooltip-top-left';
            } else if (rect.right - rect.width/2 + tooltipWidth/2 > viewportWidth) {
                positionClass = 'tooltip-top-right';
            } else {
                positionClass = 'tooltip-top';
            }
        } else if (spaceBottom >= tooltipHeight + margin) {
            // 下方有足夠空間
            if (rect.left + rect.width/2 - tooltipWidth/2 < 0) {
                positionClass = 'tooltip-bottom-left';
            } else if (rect.right - rect.width/2 + tooltipWidth/2 > viewportWidth) {
                positionClass = 'tooltip-bottom-right';
            } else {
                positionClass = 'tooltip-bottom';
            }
        } else if (spaceLeft >= tooltipWidth + margin) {
            // 左側有足夠空間
            positionClass = 'tooltip-left';
        } else if (spaceRight >= tooltipWidth + margin) {
            // 右側有足夠空間
            positionClass = 'tooltip-right';
        } else {
            // 空間都不夠，選擇空間最大的方向
            const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
            if (maxSpace === spaceTop) {
                positionClass = 'tooltip-top';
            } else if (maxSpace === spaceBottom) {
                positionClass = 'tooltip-bottom';
            } else if (maxSpace === spaceLeft) {
                positionClass = 'tooltip-left';
            } else {
                positionClass = 'tooltip-right';
            }
        }
        
        // 應用計算出的位置
        element.classList.add(positionClass);
    }
    
    /**
     * 初始化所有圖鑑卡片的工具提示定位
     */
    static initializeTooltips() {
        const cards = document.querySelectorAll('.encyclopedia-species-card');
        
        cards.forEach(card => {
            // 滑鼠進入時計算位置
            card.addEventListener('mouseenter', () => {
                setTimeout(() => {
                    this.positionTooltip(card);
                }, 10);
            });
            
            // 滑鼠離開時清除位置類別
            card.addEventListener('mouseleave', () => {
                card.classList.remove(
                    'tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right',
                    'tooltip-top-left', 'tooltip-top-right', 
                    'tooltip-bottom-left', 'tooltip-bottom-right'
                );
            });
        });
    }
    
    /**
     * 監聽視窗大小變化
     */
    static setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.initializeTooltips();
            }, 100);
        });
    }
}

// ========== 暴露全局函數 ==========

window.EncyclopediaSystem = EncyclopediaSystem;
window.TooltipPositioner = TooltipPositioner;

// 全局函數供 HTML onclick 調用
window.showEncyclopedia = () => {
    // 先同步狀態，確保圖鑑是最新的
    EncyclopediaSystem.syncEncyclopediaWithGame();
    EncyclopediaSystem.showEncyclopedia();
};

window.hideEncyclopedia = () => {
    EncyclopediaSystem.hideEncyclopedia();
};

// 調試函數
window.debugEncyclopedia = () => {
    EncyclopediaSystem.debug();
};

console.log('✅ 圖鑑系統載入完成');
console.log('📖 encyclopedia.js 載入完成！');