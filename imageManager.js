// ========== 圖片管理系統 ==========

class ImageManager {
    constructor() {
        this.basePath = './images/';
        this.cache = new Map();
        this.loadPromises = new Map();
        this.fallbackEnabled = true;
    }

    /**
     * 設定圖片基礎路徑
     * @param {string} path - 圖片資料夾路徑
     */
    setBasePath(path) {
        this.basePath = path.endsWith('/') ? path : path + '/';
    }

    /**
     * 載入曼德拉草圖片
     * @param {string} mandrakeId - 曼德拉草ID
     * @returns {Promise<string>} 圖片路徑或emoji
     */
    async loadMandrakeImage(mandrakeId) {
        // 檢查快取
        if (this.cache.has(mandrakeId)) {
            return this.cache.get(mandrakeId);
        }

        // 檢查是否正在載入
        if (this.loadPromises.has(mandrakeId)) {
            return this.loadPromises.get(mandrakeId);
        }

        // 開始載入
        const loadPromise = this._loadImage(mandrakeId);
        this.loadPromises.set(mandrakeId, loadPromise);

        try {
            const result = await loadPromise;
            this.cache.set(mandrakeId, result);
            this.loadPromises.delete(mandrakeId);
            return result;
        } catch (error) {
            this.loadPromises.delete(mandrakeId);
            console.warn(`Failed to load image for ${mandrakeId}:`, error);
            
            // 返回emoji作為備用
            const mandrakeConfig = MANDRAKE_CONFIG[mandrakeId];
            const fallback = mandrakeConfig ? mandrakeConfig.icon : '❓';
            this.cache.set(mandrakeId, fallback);
            return fallback;
        }
    }

    /**
     * 實際載入圖片的私有方法
     * @param {string} mandrakeId - 曼德拉草ID
     * @returns {Promise<string>} 圖片路徑
     */
    _loadImage(mandrakeId) {
        return new Promise((resolve, reject) => {
            const mandrakeConfig = MANDRAKE_CONFIG[mandrakeId];
            if (!mandrakeConfig) {
                reject(new Error(`Unknown mandrake: ${mandrakeId}`));
                return;
            }

            const tier = mandrakeConfig.tier;
            const imagePath = `${this.basePath}mandrakes/tier${tier}/${mandrakeId}.png`;
            
            // 檢查圖片是否存在
            const img = new Image();
            
            img.onload = () => {
                resolve(imagePath);
            };
            
            img.onerror = () => {
                // 嘗試jpg格式
                const jpgPath = `${this.basePath}mandrakes/tier${tier}/${mandrakeId}.jpg`;
                const jpgImg = new Image();
                
                jpgImg.onload = () => resolve(jpgPath);
                jpgImg.onerror = () => reject(new Error(`Image not found: ${imagePath}`));
                jpgImg.src = jpgPath;
            };
            
            img.src = imagePath;
        });
    }

    /**
     * 預載入指定階層的所有圖片
     * @param {number} tier - 階層數
     */
    async preloadTier(tier) {
        const mandrakes = Object.entries(MANDRAKE_CONFIG)
            .filter(([id, config]) => config.tier === tier)
            .map(([id, config]) => id);

        const loadPromises = mandrakes.map(id => this.loadMandrakeImage(id));
        
        try {
            await Promise.all(loadPromises);
            console.log(`Tier ${tier} images preloaded successfully`);
        } catch (error) {
            console.warn(`Failed to preload some tier ${tier} images:`, error);
        }
    }

    /**
     * 預載入所有已解鎖的曼德拉草圖片
     * @param {string[]} unlockedMandrakes - 已解鎖的曼德拉草ID列表
     */
    async preloadUnlocked(unlockedMandrakes) {
        const loadPromises = unlockedMandrakes.map(id => this.loadMandrakeImage(id));
        
        try {
            await Promise.all(loadPromises);
            console.log('Unlocked mandrake images preloaded successfully');
        } catch (error) {
            console.warn('Failed to preload some unlocked images:', error);
        }
    }

    /**
     * 獲取天氣圖示
     * @param {string} weatherType - 天氣類型
     * @returns {string} 天氣圖示路徑或emoji
     */
    getWeatherIcon(weatherType) {
        const weatherConfig = WEATHER_CONFIG[weatherType];
        if (!weatherConfig) return '❓';

        // 檢查是否有自定義天氣圖片
        const imagePath = `${this.basePath}weather/${weatherType}.png`;
        
        // 暫時返回emoji，可以後續擴展為實際圖片載入
        return weatherConfig.icon;
    }

    /**
     * 創建圖片元素
     * @param {string} src - 圖片來源
     * @param {string} alt - 替代文字
     * @param {string} className - CSS類名
     * @returns {HTMLElement} 圖片或文字元素
     */
    createImageElement(src, alt = '', className = '') {
        // 如果是emoji（單字符且不包含路徑分隔符）
        if (src.length <= 4 && !src.includes('/') && !src.includes('.')) {
            const span = document.createElement('span');
            span.textContent = src;
            span.className = className;
            span.setAttribute('data-emoji', 'true');
            return span;
        }

        // 如果是圖片路徑
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.className = className;
        
        // 載入失敗時顯示emoji
        img.onerror = () => {
            const fallbackSpan = document.createElement('span');
            fallbackSpan.textContent = alt || '❓';
            fallbackSpan.className = className;
            fallbackSpan.setAttribute('data-emoji', 'true');
            
            if (img.parentNode) {
                img.parentNode.replaceChild(fallbackSpan, img);
            }
        };
        
        return img;
    }

    /**
     * 清理快取
     */
    clearCache() {
        this.cache.clear();
        this.loadPromises.clear();
    }

    /**
     * 獲取快取統計信息
     * @returns {Object} 快取統計
     */
    getCacheStats() {
        return {
            cached: this.cache.size,
            loading: this.loadPromises.size,
            entries: Array.from(this.cache.keys())
        };
    }

    /**
     * 檢查圖片是否已快取
     * @param {string} mandrakeId - 曼德拉草ID
     * @returns {boolean} 是否已快取
     */
    isCached(mandrakeId) {
        return this.cache.has(mandrakeId);
    }

    /**
     * 批量載入圖片
     * @param {string[]} mandrakeIds - 曼德拉草ID列表
     * @param {Function} onProgress - 進度回調
     * @returns {Promise<Object>} 載入結果
     */
    async batchLoad(mandrakeIds, onProgress = null) {
        const results = {};
        let loaded = 0;

        for (const id of mandrakeIds) {
            try {
                results[id] = await this.loadMandrakeImage(id);
                loaded++;
                
                if (onProgress) {
                    onProgress({
                        loaded,
                        total: mandrakeIds.length,
                        current: id,
                        progress: (loaded / mandrakeIds.length) * 100
                    });
                }
            } catch (error) {
                console.warn(`Failed to load ${id}:`, error);
                results[id] = MANDRAKE_CONFIG[id]?.icon || '❓';
            }
        }

        return results;
    }
}

// 創建全局圖片管理器實例
window.imageManager = new ImageManager();

// 輸出到全局作用域以便其他模組使用
window.ImageManager = ImageManager;