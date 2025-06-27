// ========== 輪播系統 ==========

console.log('📰 carousel.js 開始載入...');

// 🔧 分階段輪播系統 - 使用CSV數據
// 定義各階段的輪播內容
const CAROUSEL_STAGES = {
    // 新手階段：0-299 曼德拉草
    0: [
        "曼德拉草真的存在嗎？",
        "附近居民訝異有人開墾這片農田",
        "聽說這片農田有稀有植物",
        "這果實看起來很奇特",
        "附近居民都說這塊地不好開墾",
        "書上寫說這果實是曼德拉草的果實",
        "曼德拉草拔起來真的會尖叫嗎？",
        "這果實到底能不能吃",
        "漢斯爺爺好心地拿了舊鋤頭給你",
        "這植物的葉子好特別",
        "正值開墾的季節"
    ],
    
    // 進階階段：300-999 曼德拉草
    300: [
        "曼德拉草似乎變多了",
        "曼德拉草的果實還挺美味的",
        "鎮上村民想要購買曼德拉草的果實",
        "你是第一個吃下曼德拉草果實的人",
        "我的肚子怪怪的",
        "葉子的顏色變了",
        "漢斯爺爺又拿了舊的水桶給你",
        "你賣出了第一顆曼德拉草的果實",
        "曼德拉草的果實獲得好評",
        "這果實看起來非常美味",
        "最近午後雷陣雨變多了"
    ],
    
    // 專家階段：1000+ 曼德拉草
    1000: [
        "曼德拉草快速生長",
        "隔壁鎮的人也跑來買曼德拉草的果實",
        "據說曼德拉草果實大受歡迎",
        "吃過曼德拉草果實的人都說好吃",
        "葉子的形狀越來越不一樣",
        "鎮上居民也想要開墾你附近的農田",
        "你親切地和漢斯爺爺打了聲招呼",
        "漢斯爺爺邀請你去他家喝杯茶",
        "現在最受歡迎的農產物：曼德拉草果實",
        "披著長袍斗篷的人接連出現在鎮上"
    ]
};

class CarouselManager {
    constructor() {
        this.currentIndex = 0;
        this.interval = null;
        this.currentStageTexts = [];
        this.elementId = 'carousel-text';
        this.intervalTime = 6000; // 6秒
    }

    /**
     * 根據曼德拉草數量獲取當前階段
     */
    getCurrentStage() {
        if (typeof game === 'undefined' || !game.data) {
            return 0;
        }
        
        const totalMandrakes = Game.getTotalMandrakeCount();
        
        if (totalMandrakes >= 1000) return 1000;
        if (totalMandrakes >= 300) return 300;
        return 0;
    }

    /**
     * 更新當前階段的文本內容
     */
    updateStageTexts() {
        const currentStage = this.getCurrentStage();
        const baseTexts = CAROUSEL_STAGES[currentStage] || CAROUSEL_STAGES[0];
        
        // 複製基礎文本
        this.currentStageTexts = [...baseTexts];
        
        // 添加動態內容
        this.addDynamicTexts();
        
        // 如果當前索引超出範圍，重置為0
        if (this.currentIndex >= this.currentStageTexts.length) {
            this.currentIndex = 0;
        }
    }

    /**
     * 添加動態文本（基於遊戲狀態）
     */
    addDynamicTexts() {
        if (typeof game === 'undefined' || !game.data) {
            return;
        }

        const data = game.data;
        
        // 天氣相關提示
        if (data.weather === 'rainy') {
            this.currentStageTexts.push("雨天對元素系曼德拉草特別有利！");
        } else if (data.weather === 'stormy') {
            this.currentStageTexts.push("暴風天氣下，普通系曼德拉草表現更佳！");
        } else if (data.weather === 'misty') {
            this.currentStageTexts.push("迷霧天氣雖然降低產量，但能提升獎勵稀有度！");
        }

        // 獎勵提示
        if (data.pendingRewards > 0) {
            this.currentStageTexts.push("別忘了領取你的獎勵！有些效果有時間限制！");
        }

        // 成就相關提示
        const production = game.getTotalProduction();
        if (production >= 50) {
            this.currentStageTexts.push("優秀的產量！繼續優化你的農場配置！");
        }
        if (production >= 200) {
            this.currentStageTexts.push("驚人的產量！你的農場運作得非常高效！");
        }

        // 移除重複項
        this.currentStageTexts = [...new Set(this.currentStageTexts)];
    }

    /**
     * 檢查是否需要更新階段
     */
    checkStageChange() {
        const newStage = this.getCurrentStage();
        const currentStage = this.getStageFromTexts();
        
        if (newStage !== currentStage) {
            console.log(`輪播階段變更：${currentStage} -> ${newStage}`);
            this.updateStageTexts();
            this.updateDisplay();
            
            // 顯示階段變更通知
            if (newStage === 300) {
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('🎉 解鎖進階農場主階段！', 'success', 5000);
                }
            } else if (newStage === 1000) {
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('🏆 成為專家級農場主！', 'success', 5000);
                }
            }
        }
    }

    /**
     * 從當前文本推斷階段
     */
    getStageFromTexts() {
        if (this.currentStageTexts.includes("曼德拉草快速生長")) {
            return 1000;
        } else if (this.currentStageTexts.includes("曼德拉草似乎變多了")) {
            return 300;
        }
        return 0;
    }

    /**
     * 更新進度狀態
     */
    updateByProgress() {
        // 檢查階段變更
        this.checkStageChange();
        
        // 更新動態文本
        this.addDynamicTexts();
    }

    /**
     * 添加文本
     */
    addText(text) {
        if (!this.currentStageTexts.includes(text)) {
            this.currentStageTexts.push(text);
        }
    }

    /**
     * 移除文本
     */
    removeText(text) {
        const index = this.currentStageTexts.indexOf(text);
        if (index > -1) {
            this.currentStageTexts.splice(index, 1);
            if (this.currentIndex >= this.currentStageTexts.length) {
                this.currentIndex = 0;
                this.updateDisplay();
            }
        }
    }

    /**
     * 下一張
     */
    next() {
        if (this.currentStageTexts.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.currentStageTexts.length;
        this.updateDisplay();
    }

    /**
     * 更新顯示
     */
    updateDisplay() {
        const carouselElement = document.getElementById(this.elementId);
        if (carouselElement && this.currentStageTexts.length > 0) {
            carouselElement.textContent = this.currentStageTexts[this.currentIndex];
        }
    }

    /**
     * 開始自動輪播
     */
    start(seconds = 6) {
        this.intervalTime = seconds * 1000;
        this.stop(); // 先停止現有的
        
        this.interval = setInterval(() => {
            this.next();
        }, this.intervalTime);
    }

    /**
     * 停止自動輪播
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * 刷新輪播系統
     */
    refresh() {
        this.updateStageTexts();
        this.updateByProgress();
        
        if (this.currentStageTexts.length === 0) {
            this.currentStageTexts = ["歡迎來到曼德拉草農場！"];
        }
    }

    /**
     * 初始化輪播系統
     */
    init(elementId = 'carousel-text') {
        this.elementId = elementId;
        this.refresh();
        this.start(6);
        this.updateDisplay();
        
        // 每10秒檢查一次進度變更
        setInterval(() => {
            this.refresh();
        }, 10000);
        
        console.log('✅ 輪播系統初始化完成');
    }

    /**
     * 獲取階段信息（用於調試）
     */
    getStageInfo() {
        const stage = this.getCurrentStage();
        const totalMandrakes = typeof game !== 'undefined' && game.data ? 
            Game.getTotalMandrakeCount() : 0;
        
        return {
            currentStage: stage,
            totalMandrakes: totalMandrakes,
            textsCount: this.currentStageTexts.length,
            nextStage: stage === 0 ? 300 : (stage === 300 ? 1000 : 'MAX'),
            currentText: this.currentStageTexts[this.currentIndex] || '無內容'
        };
    }
}

// 創建全局輪播管理器實例
const carouselManager = new CarouselManager();

// 暴露到全局供其他模組使用
window.CarouselManager = carouselManager;
window.CAROUSEL_STAGES = CAROUSEL_STAGES;

// 初始化函數供main.js調用
window.initCarousel = function() {
    carouselManager.init();
};

console.log('✅ CarouselManager 載入完成');
console.log('📰 carousel.js 載入完成！');