// ========== 遊戲配置文件 ==========

console.log('📋 config.js 開始載入...');

// 遊戲基本設定
const GAME_CONFIG = {
    // 時間設定 (毫秒)
    REWARD_INTERVAL: 3600000,        // 獎勵間隔 (測試用30秒，正式版3600000)
    AUTOSAVE_INTERVAL: 30000,      // 自動存檔間隔
    WEATHER_CHANGE_INTERVAL: 300000, // 天氣變化間隔 (5分鐘)
    
    // 獎勵累計系統
    MAX_PENDING_REWARDS: 2,       // 預設上限2次
    
    // 重生設定
    REBIRTH_COST_DIVISOR: 10000,  // 重生點數計算除數
    
    // UI 設定
    NOTIFICATION_DURATION: 3000,   // 通知顯示時間
    ANIMATION_SPEED: 300,          // 動畫速度
    
    // 版本信息
    VERSION: "1.0.0",
    SAVE_KEY: "mandrakeGameSave",

    // 點擊系統配置
    CLICK_BASE_REWARD: 1,          // 基礎點擊獎勵
    CLICK_CRIT_CHANCE: 0.05,         // 暴擊機率 (5%)
    CLICK_CRIT_MULTIPLIER: 2.0,      // 暴擊倍率 (2倍)
    CLICK_ANIMATION_DURATION: 150,   // 點擊動畫持續時間
    CLICK_REWARD_SHOW_DURATION: 1000 // 獎勵數字顯示時間
};

const TIER_BASE_COSTS = {
    1: 10,        // 第1階基礎成本
    2: 80,        // 第2階基礎成本
    3: 1000,      // 第3階基礎成本
    4: 12000,     // 第4階基礎成本
    5: 100000,    // 第5階基礎成本
    6: 1200000    // 第6階基礎成本
};

// 解鎖百分比配置 (想改成5%就改成0.05)
const TIER_UNLOCK_PERCENTAGE = 0.01;  // 10%

// 曼德拉草數據配置 (使用統一成本)
const MANDRAKE_CONFIG = {
    // 第1階 - 
    original: { 
        tier: 1, type: 'normal', name: '曼德拉草', icon: '🌱',
        baseCost: TIER_BASE_COSTS[1], baseProduction: 0.1, costGrowth: 1.12, prodGrowth: 1,
        description: '常見的曼德拉草'
    },
    
    // 第2階 - 
    fire: { 
        tier: 2, type: 'element', name: '火曼德拉草', icon: '🔥',
        baseCost: TIER_BASE_COSTS[2], baseProduction: 1, costGrowth: 1.12, prodGrowth: 1,
        description: '看起來很燙'
    },
    cat: { 
        tier: 2, type: 'animal', name: '貓曼德拉草', icon: '🐱',
        baseCost: TIER_BASE_COSTS[2], baseProduction: 1, costGrowth: 1.12, prodGrowth: 1,
        description: '睡著會發出呼嚕呼嚕聲'
    },
    fat: { 
        tier: 2, type: 'normal', name: '胖曼德拉草', icon: '🟢',
        baseCost: TIER_BASE_COSTS[2], baseProduction: 1, costGrowth: 1.12, prodGrowth: 1,
        description: '比一般的曼德拉草更加圓潤'
    },
    
    // 第3階 - 
    water: { 
        tier: 3, type: 'element', name: '水曼德拉草', icon: '💧',
        baseCost: TIER_BASE_COSTS[3], baseProduction: 10, costGrowth: 1.12, prodGrowth: 1,
        description: '不知道為什麼很受歡迎'
    },
    dried: { 
        tier: 3, type: 'normal', name: '枯乾曼德拉草', icon: '🟤',
        baseCost: TIER_BASE_COSTS[3], baseProduction: 10, costGrowth: 1.12, prodGrowth: 1,
        description: '好幾天沒喝水'
    },
    rabbit: { 
        tier: 3, type: 'animal', name: '兔曼德拉草', icon: '🐰',
        baseCost: TIER_BASE_COSTS[3], baseProduction: 10, costGrowth: 1.12, prodGrowth: 1,
        description: '主食是牧草'
    },
    
    // 第4階 - 
    wind: { 
        tier: 4, type: 'element', name: '風曼德拉草', icon: '💨',
        baseCost: TIER_BASE_COSTS[4], baseProduction: 100, costGrowth: 1.12, prodGrowth: 1,
        description: '覺得自己是一種反向噴射器'
    },
    mouse: { 
        tier: 4, type: 'animal', name: '鼠曼德拉草', icon: '🐭',
        baseCost: TIER_BASE_COSTS[4], baseProduction: 100, costGrowth: 1.12, prodGrowth: 1,
        description: '小巧靈活的曼德拉草'
    },
    mini: { 
        tier: 4, type: 'normal', name: '迷你曼德拉草', icon: '🟡',
        baseCost: TIER_BASE_COSTS[4], baseProduction: 100, costGrowth: 1.12, prodGrowth: 1,
        description: '體型嬌小但產量驚人'
    },
    
    // 第5階 - 
    electric: { 
        tier: 5, type: 'element', name: '電曼德拉草', icon: '⚡',
        baseCost: TIER_BASE_COSTS[5], baseProduction: 1000, costGrowth: 1.12, prodGrowth: 1,
        description: '帶有強烈電流的曼德拉草'
    },
    fear: { 
        tier: 5, type: 'normal', name: '恐懼曼德拉草', icon: '😨',
        baseCost: TIER_BASE_COSTS[5], baseProduction: 1000, costGrowth: 1.12, prodGrowth: 1,
        description: '散發著不安氣息的曼德拉草'
    },
    bear: { 
        tier: 5, type: 'animal', name: '熊曼德拉草', icon: '🐻',
        baseCost: TIER_BASE_COSTS[5], baseProduction: 1000, costGrowth: 1.12, prodGrowth: 1,
        description: '體型巨大且力大無窮'
    },
    
    // 第6階 - 
    ice: { 
        tier: 6, type: 'element', name: '冰曼德拉草', icon: '🧊',
        baseCost: TIER_BASE_COSTS[6], baseProduction: 10000, costGrowth: 1.12, prodGrowth: 1,
        description: '散發著極寒氣息的曼德拉草'
    },
    white: { 
        tier: 6, type: 'normal', name: '白曼德拉草', icon: '⚪',
        baseCost: TIER_BASE_COSTS[6], baseProduction: 10000, costGrowth: 1.12, prodGrowth: 1,
        description: '純白無瑕的神秘曼德拉草'
    },
    bat: { 
        tier: 6, type: 'animal', name: '蝙蝠曼德拉草', icon: '🦇',
        baseCost: TIER_BASE_COSTS[6], baseProduction: 10000, costGrowth: 1.12, prodGrowth: 1,
        description: '夜行性的神秘曼德拉草'
    }
};

// 解鎖條件配置
const TIER_UNLOCK_CONDITIONS = {};
for (let tier = 2; tier <= 6; tier++) {
    TIER_UNLOCK_CONDITIONS[tier] = () => {
        const requiredFruit = TIER_BASE_COSTS[tier] * TIER_UNLOCK_PERCENTAGE;
        return window.game && window.game.data && window.game.data.fruit >= requiredFruit;
    };
}

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

// ========== 新的獎勵系統配置 ==========

// ✅ 新的獎勵模板配置 - 8種平衡獎勵
const REWARD_TEMPLATES = {
    // 💪 強力檔 - 流派導向
    harvest_burst: {
        name: '收穫爆發',
        description: function(tier) {
            return `立即獲得你擁有最多曼德拉草${tier.hours}小時的產量`;
        },
        icon: '💥',
        category: 'instant',
        tiers: {
            common: { hours: 2 },
            rare: { hours: 4 },
            epic: { hours: 8 },
            legendary: { hours: 16 }
        }
    },
    
    purchase_boost: {
        name: '購買狂潮',
        description: function(tier) {
            return `接下來${tier.count}次購買，成本減少${tier.discount}%`;
        },
        icon: '💰',
        category: 'boost',
        tiers: {
            common: { count: 3, discount: 20 },
            rare: { count: 5, discount: 30 },
            epic: { count: 8, discount: 40 },
            legendary: { count: 10, discount: 50 }
        }
    },

    // 💪 中強檔 - 平衡發展
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
    
    // 🎯 中等檔 - 系別特化
    element_boost: {
        name: '元素共鳴',
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
    
    animal_boost: {
        name: '野性爆發',
        description: function(tier) {
            return `1小時內動物系產量 +${tier.bonus}%`;
        },
        icon: '🐾',
        category: 'boost',
        tiers: {
            common: { bonus: 20, duration: 3600000 },
            rare: { bonus: 35, duration: 3600000 },
            epic: { bonus: 60, duration: 3600000 },
            legendary: { bonus: 100, duration: 3600000 }
        }
    },
    
    normal_boost: {
        name: '返璞歸真',
        description: function(tier) {
            return `1小時內普通系產量 +${tier.bonus}%`;
        },
        icon: '🌿',
        category: 'boost',
        tiers: {
            common: { bonus: 20, duration: 3600000 },
            rare: { bonus: 35, duration: 3600000 },
            epic: { bonus: 60, duration: 3600000 },
            legendary: { bonus: 100, duration: 3600000 }
        }
    },

    // 🍀 輕度檔 - 即時滿足與趣味
    instant_fruit: {
        name: '即時果實',
        description: function(tier) {
            return `立即獲得當前${tier.minutes}分鐘產量的果實`;
        },
        icon: '🍎',
        category: 'instant',
        tiers: {
            common: { minutes: 10 },
            rare: { minutes: 20 },
            epic: { minutes: 40 },
            legendary: { minutes: 60 }
        }
    },
    
    lucky_streak: {
        name: '幸運連擊',
        description: function(tier) {
            return `接下來${tier.count}次產量結算，有${tier.chance}%機率獲得雙倍產量`;
        },
        icon: '🍀',
        category: 'special',
        tiers: {
            common: { count: 10, chance: 30 },
            rare: { count: 15, chance: 35 },
            epic: { count: 20, chance: 40 },
            legendary: { count: 30, chance: 50 }
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