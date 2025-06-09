// ========== 遊戲配置文件 ==========

console.log('📋 config.js 開始載入...');

// 遊戲基本設定
const GAME_CONFIG = {
    // 時間設定 (毫秒)
    REWARD_INTERVAL: 30000,        // 獎勵間隔 (測試用30秒，正式版3600000)
    AUTOSAVE_INTERVAL: 30000,      // 自動存檔間隔
    WEATHER_CHANGE_INTERVAL: 300000, // 天氣變化間隔 (5分鐘)
    
    // 農場設定
    FARM_GRID_COLS: 8,            // 農場列數
    FARM_GRID_ROWS: 6,            // 農場行數
    FARM_TOTAL_SLOTS: 48,         // 總格子數
    
    // 獎勵累計系統
    MAX_PENDING_REWARDS: 2,       // 預設上限2次
    
    // 重生設定
    REBIRTH_COST_DIVISOR: 10000,  // 重生點數計算除數
    
    // UI 設定
    NOTIFICATION_DURATION: 3000,   // 通知顯示時間
    ENABLE_NOTIFICATIONS: false,   // 是否啟用通知彈窗
    ANIMATION_SPEED: 300,          // 動畫速度
    
    // 版本信息
    VERSION: "1.0.0",
    SAVE_KEY: "mandrakeGameSave"
};

// 曼德拉草數據配置
const MANDRAKE_CONFIG = {
    // 第1階
    original: { 
        tier: 1, type: 'normal', name: '原始曼德拉草', icon: '🌱',
        baseCost: 10, baseProduction: 0.1, costGrowth: 1.15, prodGrowth: 1 
    },
    
    // 第2階
    fat: { 
        tier: 2, type: 'normal', name: '胖曼德拉草', icon: '🟢',
        baseCost: 50, baseProduction: 1, costGrowth: 1.20, prodGrowth: 1 
    },
    fire: { 
        tier: 2, type: 'element', name: '火曼德拉草', icon: '🔥',
        baseCost: 60, baseProduction: 1, costGrowth: 1.22, prodGrowth: 1 
    },
    cat: { 
        tier: 2, type: 'animal', name: '貓曼德拉草', icon: '🐱',
        baseCost: 55, baseProduction: 1, costGrowth: 1.18, prodGrowth: 1 
    },
    
    // 第3階
    thin: { 
        tier: 3, type: 'normal', name: '瘦曼德拉草', icon: '🟡',
        baseCost: 200, baseProduction: 10, costGrowth: 1.25, prodGrowth: 1 
    },
    water: { 
        tier: 3, type: 'element', name: '水曼德拉草', icon: '💧',
        baseCost: 250, baseProduction: 10, costGrowth: 1.28, prodGrowth: 1 
    },
    bird: { 
        tier: 3, type: 'animal', name: '鳥曼德拉草', icon: '🐦',
        baseCost: 220, baseProduction: 10, costGrowth: 1.23, prodGrowth: 1 
    },
    
    // 第4階 (未來擴展)
    giant: { 
        tier: 4, type: 'normal', name: '巨型曼德拉草', icon: '🟤',
        baseCost: 1000, baseProduction: 100, costGrowth: 1.30, prodGrowth: 1
    },
    lightning: { 
        tier: 4, type: 'element', name: '雷曼德拉草', icon: '⚡',
        baseCost: 1200, baseProduction: 12.0, costGrowth: 1.32, prodGrowth: 1
    },
    dragon: { 
        tier: 4, type: 'animal', name: '龍曼德拉草', icon: '🐲',
        baseCost: 1100, baseProduction: 100, costGrowth: 1.31, prodGrowth: 1
    }
};

// 階層解鎖條件配置
const TIER_UNLOCK_CONDITIONS = {
    2: () => Game.getTotalMandrakeCount() >= 10,
    3: () => Game.getTotalMandrakeCount() >= 50,
    4: () => Game.getTotalMandrakeCount() >= 200,
    5: () => Game.getTotalMandrakeCount() >= 500
};

// 天氣系統配置
const WEATHER_CONFIG = {
    sunny: { 
        name: '晴天', 
        icon: '☀️',
        effect: '所有產量 +10%', 
        multiplier: 1.1 
    },
    rainy: { 
        name: '雨天', 
        icon: '🌧️',
        effect: '元素系 +50%, 其他 -10%', 
        getMultiplier: (type) => type === 'element' ? 1.5 : 0.9 
    },
    stormy: { 
        name: '暴風', 
        icon: '⛈️',
        effect: '動物系暫停, 普通系 +30%', 
        getMultiplier: (type) => type === 'animal' ? 0 : type === 'normal' ? 1.3 : 1 
    },
    misty: { 
        name: '迷霧', 
        icon: '🌫️',
        effect: '產量 -20%, 但增加稀有獎勵機率', 
        multiplier: 0.8,
        bonusRarity: 1.5  // 稀有度加成
    },
    perfect: { 
        name: '完美天氣', 
        icon: '🌈',
        effect: '所有產量 +100%', 
        multiplier: 2.0,
        isSpecial: true  // 特殊天氣，不會自然出現
    }
};

// 稀有度系統配置
const RARITY_CONFIG = {
    common: { 
        name: '普通', 
        color: '#9e9e9e', 
        weight: 60,
        glow: false
    },
    rare: { 
        name: '稀有', 
        color: '#2196f3', 
        weight: 30,
        glow: true
    },
    epic: { 
        name: '史詩', 
        color: '#9c27b0', 
        weight: 8,
        glow: true
    },
    legendary: { 
        name: '傳說', 
        color: '#ff9800', 
        weight: 2,
        glow: true,
        sparkle: true
    }
};

// ✅ 獎勵模板配置 - 完整版本
const REWARD_TEMPLATES = {
    production_boost: {
        name: '生產力提升',
        description: function(tier) {
            return `1小時內所有產量 +${tier.bonus}%`;
        },
        icon: '⚡',
        category: 'boost',
        tiers: {
            common: { bonus: 10, duration: 3600000 },
            rare: { bonus: 15, duration: 3600000 },
            epic: { bonus: 25, duration: 3600000 },
            legendary: { bonus: 50, duration: 3600000 }
        }
    },
    
    element_boost: {
        name: '元素加速',
        description: function(tier) {
            return `1小時內元素系產量 +${tier.bonus}%`;
        },
        icon: '🔥',
        category: 'boost',
        tiers: {
            common: { bonus: 20, duration: 3600000 },
            rare: { bonus: 35, duration: 3600000 },
            epic: { bonus: 60, duration: 3600000 },
            legendary: { bonus: 100, duration: 3600000 }
        }
    },
    
    instant_fruit: {
        name: '即時果實',
        description: function(tier) {
            return `立即獲得當前${tier.hours}小時產量的果實`;
        },
        icon: '🍎',
        category: 'instant',
        tiers: {
            common: { hours: 1 },
            rare: { hours: 2 },
            epic: { hours: 4 },
            legendary: { hours: 8 }
        }
    },
    
    force_type: {
        name: '類型保證',
        description: function(tier) {
            return `下次解鎖${tier.guarantee}`;
        },
        icon: '🎯',
        category: 'unlock',
        tiers: {
            common: { guarantee: '有30%機率是指定類型', chance: 0.3 },
            rare: { guarantee: '有60%機率是指定類型', chance: 0.6 },
            epic: { guarantee: '必定是指定類型', chance: 1.0 },
            legendary: { guarantee: '必定是指定類型，且獲得額外效果', chance: 1.0, bonus: true }
        }
    },
    
    talent_points: {
        name: '天賦點數',
        description: function(tier) {
            return `獲得 ${tier.points} 點天賦點數`;
        },
        icon: '⭐',
        category: 'special',
        tiers: {
            common: { points: 1 },
            rare: { points: 2 },
            epic: { points: 4 },
            legendary: { points: 8 }
        }
    },
    
    weather_control: {
        name: '天氣操控',
        description: function(tier) {
            return tier.description;
        },
        icon: '🌤️',
        category: 'special',
        tiers: {
            common: { 
                description: '下次重骰天氣免費', 
                effect: 'free_reroll' 
            },
            rare: { 
                description: '可以選擇下一個天氣', 
                effect: 'choose_weather' 
            },
            epic: { 
                description: '鎖定當前天氣2小時', 
                effect: 'lock_weather',
                duration: 7200000
            },
            legendary: { 
                description: '創造完美天氣4小時', 
                effect: 'perfect_weather',
                duration: 14400000
            }
        }
    }
};

// 類型顏色配置
const TYPE_COLORS = {
    normal: '#28a745',   // 綠色
    element: '#dc3545',  // 紅色
    animal: '#ffc107'    // 黃色
};

// ✅ 驗證配置是否正確載入
console.log('✅ GAME_CONFIG 載入:', typeof GAME_CONFIG !== 'undefined');
console.log('✅ MANDRAKE_CONFIG 載入:', typeof MANDRAKE_CONFIG !== 'undefined');
console.log('✅ WEATHER_CONFIG 載入:', typeof WEATHER_CONFIG !== 'undefined');
console.log('✅ RARITY_CONFIG 載入:', typeof RARITY_CONFIG !== 'undefined');
console.log('✅ REWARD_TEMPLATES 載入:', typeof REWARD_TEMPLATES !== 'undefined');
console.log('✅ REWARD_TEMPLATES 內容:', Object.keys(REWARD_TEMPLATES));

console.log('📋 config.js 載入完成！');

// ========== 強化系統配置 ==========

// 強化數值配置
const ENHANCEMENT_VALUES = {
    stable: {
        global_production: 0.10,    // 全體生產 +10%
        global_cost: 0.08,          // 全體成本 -8%
        type_production: 0.20,      // 特定系生產 +20%
        type_cost: 0.15             // 特定系成本 -15%
    },
    luck: {
        production_variance: 0.30,   // 產量波動 ±30%
        production_boost: 0.15,      // 期望值 +15%
        perfect_weather_chance: 0.30, // 完美天氣機率 30%
        lucky_moment_chance: 0.05,   // 幸運時刻機率 5%
        purchase_crit_chance: 0.10,  // 購買暴擊機率 10%
        cost_variance_min: -0.20,    // 成本波動最小 -20%
        cost_variance_max: 0.10      // 成本波動最大 +10%
    },
    reward: {
        cd_reduction: 0.25,         // CD減少 -25%
        capacity_increase: 1,       // 累積上限 +1
        rarity_boost: 0.50         // 稀有度提升 +50%
    },
    combo: {
        per_10_bonus: 0.03,        // 每10株 +3%
        same_type_bonus: 0.05,     // 同類型每株額外 +5%
        three_type_bonus: 0.25,    // 三系全有 +25%
        first_type_bonus: 0.50     // 每系第1株 +50%
    }
};

// 強化解鎖條件
const ENHANCEMENT_UNLOCK_CONDITIONS = [
    { threshold: 1, description: '任意曼德拉草達到 1 株' },
    { threshold: 10, description: '任意曼德拉草達到 10 株' },
    { threshold: 50, description: '任意曼德拉草達到 50 株' },
    { threshold: 100, description: '任意曼德拉草達到 100 株' },
    { threshold: 200, description: '任意曼德拉草達到 200 株' }
];

console.log('✅ ENHANCEMENT_VALUES 載入完成');
console.log('✅ ENHANCEMENT_UNLOCK_CONDITIONS 載入完成');
