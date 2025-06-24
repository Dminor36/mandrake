// ========== 遊戲配置文件 - 隨機名稱系統修正版 ==========

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
    VERSION: "1.1.0",              // 🔧 更新版本號
    SAVE_KEY: "mandrakeGameSave_v1_1", // 🔧 新存檔KEY，強制重置

    // 點擊系統配置
    CLICK_BASE_REWARD: 1,          // 基礎點擊獎勵
    CLICK_CRIT_CHANCE: 0.05,         // 暴擊機率 (5%)
    CLICK_CRIT_MULTIPLIER: 2.0,      // 暴擊倍率 (2倍)
    CLICK_ANIMATION_DURATION: 150,   // 點擊動畫持續時間
    CLICK_REWARD_SHOW_DURATION: 1000 // 獎勵數字顯示時間
};

// 階層數值配置
const TIER_BASE_COSTS = {
    1: 10,        // 第1階基礎成本
    2: 80,        // 第2階基礎成本
    3: 1000,      // 第3階基礎成本
    4: 12000,     // 第4階基礎成本
    5: 100000,    // 第5階基礎成本
    6: 1200000,   // 第6階基礎成本
    7: 14000000,   // 第7階基礎成本
    8: 160000000, // 第8階基礎成本
    9: 1800000000, // 第9階基礎成本
    10: 20000000000 // 第10階基礎成本
};

// 🔧 每個階層的數值模板
const TIER_STATS = {
    1: { 
        baseCost: TIER_BASE_COSTS[1], 
        baseProduction: 0.1, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    2: { 
        baseCost: TIER_BASE_COSTS[2], 
        baseProduction: 1, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    3: { 
        baseCost: TIER_BASE_COSTS[3], 
        baseProduction: 9, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    4: { 
        baseCost: TIER_BASE_COSTS[4], 
        baseProduction: 81, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    5: { 
        baseCost: TIER_BASE_COSTS[5], 
        baseProduction: 648, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    6: { 
        baseCost: TIER_BASE_COSTS[6], 
        baseProduction: 5184, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    7: { 
        baseCost: TIER_BASE_COSTS[7], 
        baseProduction: 41472, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    8: { 
        baseCost: TIER_BASE_COSTS[8], 
        baseProduction: 331776, 
        costGrowth: 1.12,
        prodGrowth: 1 
    },
    9: { 
        baseCost: TIER_BASE_COSTS[9], 
        baseProduction: 2621440, 
        costGrowth: 1.12,
        prodGrowth: 1 
    },
    10: { 
        baseCost: TIER_BASE_COSTS[10], 
        baseProduction: 20971520, 
        costGrowth: 1.12,
        prodGrowth: 1 
    }

    
};

// 解鎖百分比配置
const TIER_UNLOCK_PERCENTAGE = 0.05;  // 5%

// 🔧 按屬性分類的名稱池（包含描述）
const EXTENDED_NAME_POOLS = {
    normal: [
        { name: '曼德拉草', icon: '🌱', description: '常見的曼德拉草' },
        { name: '胖曼德拉草', icon: '🟢', description: '比一般的曼德拉草更加圓潤' },
        { name: '枯乾曼德拉草', icon: '🟤', description: '好幾天沒喝水' },
        { name: '迷你曼德拉草', icon: '🟡', description: '體型嬌小但產量驚人' },
        { name: '恐懼曼德拉草', icon: '😨', description: '散發著不安氣息的曼德拉草' },
        { name: '白曼德拉草', icon: '⚪', description: '純白無瑕的神秘曼德拉草' },
        { name: '苗條曼德拉草', icon: '🌿', description: '身材修長的優雅曼德拉草' },
        { name: '古老曼德拉草', icon: '🗿', description: '存在了數百年的智慧曼德拉草' },
        { name: '閃亮曼德拉草', icon: '✨', description: '表面散發著微弱光芒' },
        { name: '透明曼德拉草', icon: '👻', description: '幾乎看不見的神秘曼德拉草' },
        { name: '糖霜曼德拉草', icon: '🧁', description: '表面覆蓋著甜美糖霜的曼德拉草' },
        { name: '綠茶曼德拉草', icon: '🍵', description: '散發著淡雅茶香的曼德拉草' },
        { name: '碳曼德拉草', icon: '⚫', description: '漆黑如炭，質地堅硬的曼德拉草' },
        { 
            name: '平衡曼德拉草', 
            icon: '⚖️', 
            description: '三系和諧的完美體現',
            prerequisites: ['胖曼德拉草', '火曼德拉草', '貓曼德拉草'] // 需要三系各一個
        }
    ],
    
    element: [
        { name: '火曼德拉草', icon: '🔥', description: '看起來很燙' },
        { name: '水曼德拉草', icon: '💧', description: '不知道為什麼很受歡迎' },
        { name: '風曼德拉草', icon: '💨', description: '覺得自己是一種反向噴射器' },
        { name: '電曼德拉草', icon: '⚡', description: '帶有強烈電流的曼德拉草' },
        { 
            name: '冰曼德拉草', 
            icon: '🧊', description: '散發著極寒氣息的曼德拉草', 
            prerequisites: ['水曼德拉草', '風曼德拉草'] // 需要水+風
        }, 
        { name: '土曼德拉草', icon: '⛰️', description: '堅實如岩石的土系曼德拉草' },
        { name: '光曼德拉草', icon: '☀️', description: '自帶光環的神聖曼德拉草' },
        { name: '暗曼德拉草', icon: '🌑', description: '吸收光線的黑暗曼德拉草' },
        { 
            name: '雷曼德拉草', 
            icon: '⛈️', 
            description: '能召喚雷暴的強力曼德拉草',
            prerequisites: ['火曼德拉草', '風曼德拉草'] // 需要火+風
        },
        { 
            name: '暴風雪曼德拉草', 
            icon: '🌨️', 
            description: '冰與風的完美結合',
            prerequisites: ['冰曼德拉草', '風曼德拉草'] // 需要冰+風
        },
        { 
            name: '蒸汽曼德拉草', 
            icon: '💨', 
            description: '水火相容的神奇存在',
            prerequisites: ['水曼德拉草', '火曼德拉草'] // 需要水+火
        },
        {
            name: '毒曼德拉草',
            icon: '☠️',
            description: '散發著致命氣息的曼德拉草',
            prerequisites: ['火曼德拉草'] // 需要火
        },
        {
            name: '熔岩曼德拉草',
            icon: '🌋',
            description: '火與土的極致結合',
            prerequisites: ['火曼德拉草', '土曼德拉草'] // 需要火+土
        },
        { name: '燈泡曼德拉草', icon: '💡', description: '會發光的電系曼德拉草，照亮周圍環境' },
        { name: '鋰曼德拉草', icon: '🔋', description: '充滿電能的高科技曼德拉草，可儲存大量電力' }
    ],
    
    animal: [
        { name: '貓曼德拉草', icon: '🐱', description: '睡著會發出呼嚕呼嚕聲' },
        { name: '兔曼德拉草', icon: '🐰', description: '主食是牧草' },
        { name: '鼠曼德拉草', icon: '🐭', description: '小巧靈活的曼德拉草' },
        { name: '熊曼德拉草', icon: '🐻', description: '體型巨大且力大無窮' },
        { name: '蝙蝠曼德拉草', icon: '🦇', description: '夜行性的神秘曼德拉草' },
        { name: '狗曼德拉草', icon: '🐕', description: '忠誠友善的好夥伴' },
        { name: '狐狸曼德拉草', icon: '🦊', description: '狡猾機智的橘色曼德拉草' },
        { name: '鳥曼德拉草', icon: '🐦', description: '喜歡在枝頭歌唱的曼德拉草' },
        { name: '魚曼德拉草', icon: '🐠', description: '需要生長在水中的奇特品種' },
        { name: '幽靈曼德拉草', icon: '👻', description: '來自異世界的神秘生物，只在夜晚現身' },
        { name: '浣熊曼德拉草', icon: '🦝', description: '喜歡洗東西的可愛曼德拉草，有著標誌性的黑眼圈' },
        { 
            name: '龍曼德拉草', 
            icon: '🐉', 
            description: '擁有遠古血脈的傳說曼德拉草',
            prerequisites: ['蝙蝠曼德拉草', '火曼德拉草'] // 需要蝙蝠+火
        }
    ]
};

// 🔧 更新NAME_TO_ID_MAP，包含新增的曼德拉草
const NAME_TO_ID_MAP = {
    // Normal
    '曼德拉草': 'original',
    '胖曼德拉草': 'fat',
    '枯乾曼德拉草': 'dried',
    '迷你曼德拉草': 'mini',
    '恐懼曼德拉草': 'fear',
    '白曼德拉草': 'white',
    '苗條曼德拉草': 'slim',
    '古老曼德拉草': 'ancient',
    '閃亮曼德拉草': 'shiny',
    '透明曼德拉草': 'transparent',
    '糖霜曼德拉草': 'frosted',
    '綠茶曼德拉草': 'green_tea',
    '碳曼德拉草': 'carbon',
    '平衡曼德拉草': 'balance',
    
    // Element
    '火曼德拉草': 'fire',
    '水曼德拉草': 'water',
    '風曼德拉草': 'wind',
    '電曼德拉草': 'electric',
    '冰曼德拉草': 'ice',
    '土曼德拉草': 'earth',
    '光曼德拉草': 'light',
    '暗曼德拉草': 'dark',
    '雷曼德拉草': 'thunder',
    '暴風雪曼德拉草': 'blizzard',
    '蒸汽曼德拉草': 'steam',
    '毒曼德拉草': 'poison',
    '熔岩曼德拉草': 'lava',
    '燈泡曼德拉草': 'bulb',
    '鋰曼德拉草': 'lithium',
    
    // Animal
    '貓曼德拉草': 'cat',
    '兔曼德拉草': 'rabbit',
    '鼠曼德拉草': 'mouse',
    '熊曼德拉草': 'bear',
    '蝙蝠曼德拉草': 'bat',
    '狗曼德拉草': 'dog',
    '狐狸曼德拉草': 'fox',
    '鳥曼德拉草': 'bird',
    '魚曼德拉草': 'fish',
    '幽靈曼德拉草': 'ghost',
    '浣熊曼德拉草': 'raccoon',
    '龍曼德拉草': 'dragon'
};

// 🔧 保留：第一個曼德拉草固定為原始品種
const FIXED_FIRST_MANDRAKE = {
    id: 'original',
    tier: 1,
    type: 'normal',
    name: '曼德拉草',
    icon: '🌱',
    description: '常見的曼德拉草',
    baseCost: TIER_STATS[1].baseCost,
    baseProduction: TIER_STATS[1].baseProduction,
    costGrowth: TIER_STATS[1].costGrowth,
    prodGrowth: TIER_STATS[1].prodGrowth
};


// 🔧 修改：動態生成 MANDRAKE_CONFIG 的函數
function generateMandrakeConfig(id, tier, type, nameData) {
    return {
        tier: tier,
        type: type,
        name: nameData.name,
        icon: nameData.icon,
        description: nameData.description,
        baseCost: TIER_STATS[tier].baseCost,
        baseProduction: TIER_STATS[tier].baseProduction,
        costGrowth: TIER_STATS[tier].costGrowth,
        prodGrowth: TIER_STATS[tier].prodGrowth
    };
}

// 🔧 初始化時只包含第一個曼德拉草
const MANDRAKE_CONFIG = {
    original: FIXED_FIRST_MANDRAKE
};

// 解鎖條件配置
const TIER_UNLOCK_CONDITIONS = {};
for (let tier = 2; tier <= 50; tier++) {
    TIER_UNLOCK_CONDITIONS[tier] = () => {
        const baseCost = TIER_BASE_COSTS[tier];
        if (!baseCost) return false;  // 🔧 添加這個安全檢查

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

// ========== 獎勵系統配置 ==========

const REWARD_TEMPLATES = {
    // 💪 強力檔 - 大幅削弱數值
    harvest_burst: {
        name: '收穫爆發',
        description: function(tier) {
            return `立即獲得你擁有最多曼德拉草${tier.minutes}分鐘的產量`;  // 🔧 改為分鐘
        },
        icon: '💥',
        category: 'instant',
        tiers: {
            common: { minutes: 15 },      // 🔧 從2小時降至15分鐘
            rare: { minutes: 30 },        // 🔧 從4小時降至30分鐘  
            epic: { minutes: 60 },        // 🔧 從8小時降至1小時
            legendary: { minutes: 120 }   // 🔧 從16小時降至2小時
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
            common: { count: 3, discount: 15 },    // 🔧 從20%降至15%
            rare: { count: 5, discount: 20 },      // 🔧 從30%降至20%
            epic: { count: 8, discount: 25 },      // 🔧 從40%降至25%
            legendary: { count: 10, discount: 30 } // 🔧 從50%降至30%
        }
    },

    // 💪 中強檔 - 降低持續時間或效果
    production_boost: {
        name: '生產力提升',
        description: function(tier) {
            return `${tier.duration/60000}分鐘內所有產量 +${tier.bonus}%`;  // 🔧 改為分鐘顯示
        },
        icon: '⚡',
        category: 'boost',
        tiers: {
            common: { bonus: 15, duration: 1800000 },   // 🔧 30分鐘，+15%
            rare: { bonus: 25, duration: 1800000 },     // 🔧 30分鐘，+25%
            epic: { bonus: 35, duration: 2400000 },     // 🔧 40分鐘，+35%
            legendary: { bonus: 50, duration: 3000000 } // 🔧 50分鐘，+50%
        }
    },
    
    // 🎯 中等檔 - 三系平衡，相同強度
    element_boost: {
        name: '元素共鳴',
        description: function(tier) {
            return `${Math.floor(tier.duration/60000)}分鐘內元素系產量 +${tier.bonus}%`;
        },
        icon: '🔥',
        category: 'boost',
        tiers: {
            common: { bonus: 25, duration: 1800000 },   // 30分鐘
            rare: { bonus: 40, duration: 1800000 },     // 30分鐘
            epic: { bonus: 60, duration: 2400000 },     // 40分鐘
            legendary: { bonus: 80, duration: 3000000 } // 50分鐘
        }
    },
    
    animal_boost: {
        name: '野性爆發',
        description: function(tier) {
            return `${Math.floor(tier.duration/60000)}分鐘內動物系產量 +${tier.bonus}%`;
        },
        icon: '🐾',
        category: 'boost',
        tiers: {
            common: { bonus: 25, duration: 1800000 },   // 🔧 統一數值
            rare: { bonus: 40, duration: 1800000 },     // 🔧 統一數值
            epic: { bonus: 60, duration: 2400000 },     // 🔧 統一數值
            legendary: { bonus: 80, duration: 3000000 } // 🔧 統一數值
        }
    },
    
    normal_boost: {
        name: '返璞歸真',
        description: function(tier) {
            return `${Math.floor(tier.duration/60000)}分鐘內普通系產量 +${tier.bonus}%`;
        },
        icon: '🌿',
        category: 'boost',
        tiers: {
            common: { bonus: 25, duration: 1800000 },   // 🔧 統一數值
            rare: { bonus: 40, duration: 1800000 },     // 🔧 統一數值
            epic: { bonus: 60, duration: 2400000 },     // 🔧 統一數值
            legendary: { bonus: 80, duration: 3000000 } // 🔧 統一數值
        }
    },

    // 🍀 輕度檔 - 保持現狀或小幅提升
    instant_fruit: {
        name: '即時果實',
        description: function(tier) {
            return `立即獲得當前${tier.minutes}分鐘產量的果實`;
        },
        icon: '🍎',
        category: 'instant',
        tiers: {
            common: { minutes: 5 },      // 🔧 從10分鐘提升至15分鐘
            rare: { minutes: 7 },        // 🔧 從20分鐘提升至25分鐘
            epic: { minutes: 10 },        // 🔧 維持40分鐘
            legendary: { minutes: 15 }    // 🔧 維持60分鐘
        }
    },
    
    // 🆕 新增：更平衡的獎勵類型
    click_power: {
        name: '點擊狂熱',
        description: function(tier) {
            return `${tier.duration/60000}分鐘內點擊獎勵 +${tier.bonus}%，暴擊率 +${tier.critBonus}%`;
        },
        icon: '👆',
        category: 'boost',
        tiers: {
            common: { bonus: 100, critBonus: 5, duration: 600000 },   // 10分鐘
            rare: { bonus: 200, critBonus: 10, duration: 900000 },    // 15分鐘
            epic: { bonus: 300, critBonus: 15, duration: 1200000 },   // 20分鐘
            legendary: { bonus: 500, critBonus: 25, duration: 1800000 } // 30分鐘
        }
    },

    tier_boost: {
        name: '階層共鳴',
        description: function(tier) {
            return `${tier.duration/60000}分鐘內第${tier.targetTier}階及以下曼德拉草產量 +${tier.bonus}%`;
        },
        icon: '🎯',
        category: 'boost',
        tiers: {
            common: { targetTier: 3, bonus: 30, duration: 1800000 },
            rare: { targetTier: 5, bonus: 40, duration: 1800000 },
            epic: { targetTier: 7, bonus: 50, duration: 2400000 },
            legendary: { targetTier: 10, bonus: 60, duration: 3000000 }
        }
    }
};

// 類型顏色配置
const TYPE_COLORS = {
    normal: '#28a745',   // 綠色
    element: '#dc3545',  // 紅色
    animal: '#ffc107'    // 黃色
};

// ========== 強化系統配置 ==========

// 強化數值配置
const ENHANCEMENT_VALUES = {
    stable: {
        global_production: 0.15,    // 🔧 從 0.2 降至 0.15 (每級+15%)
        global_cost: 0.08,          // 🔧 從 0.1 降至 0.08 (每級-8%)
        type_production: 0.25       // 🔧 從 0.2 提升至 0.25 (讓專精更有價值)
    },
    luck: {
        production_variance: 0.3,   // 維持 ±30%
        production_boost: 0.15,     // 🔧 從 0.1 提升至 0.15 (期望值更好)
        cost_variance_min: -0.4,    // 🔧 從 -0.3 提升至 -0.4 (更大折扣可能)
        cost_variance_max: 0.2,     // 🔧 從 0.3 降至 0.2 (減少懲罰)
        purchase_crit_chance: 0.15  // 🔧 從 0.1 提升至 0.15 (15%暴擊率)
    },
    reward: {
        cd_reduction: 0.15,         // 🔧 從 0.1 提升至 0.15 (更有價值)
        capacity_increase: 2,       // 🔧 從 1 提升至 2 (每級+2容量)
        rarity_boost: 0.3          // 🔧 從 0.2 提升至 0.3 (更明顯效果)
    },
    combo: {
        per_10_bonus: 0.001,        // 🔧 從 0.1 降至 0.08 (每10株+8%)
        same_type_bonus: 0.002,     // 🔧 從 0.05 大幅降至 0.03 (防止爆炸)
        three_type_bonus: 0.5      // 🔧 從 0.3 大幅提升至 0.5 (獎勵多樣化)
    }
};

// 強化解鎖條件
const ENHANCEMENT_UNLOCK_CONDITIONS = [
    { threshold: 25, description: '總曼德拉草數量達到 25 株' },
    { threshold: 60, description: '總曼德拉草數量達到 60 株' },
    { threshold: 120, description: '總曼德拉草數量達到 120 株' },
    { threshold: 200, description: '總曼德拉草數量達到 200 株' },
    { threshold: 300, description: '總曼德拉草數量達到 300 株' },
    { threshold: 420, description: '總曼德拉草數量達到 420 株' },
    { threshold: 560, description: '總曼德拉草數量達到 560 株' },
    { threshold: 720, description: '總曼德拉草數量達到 720 株' },
    { threshold: 900, description: '總曼德拉草數量達到 900 株' },
    { threshold: 1100, description: '總曼德拉草數量達到 1100 株' },
    { threshold: 1320, description: '總曼德拉草數量達到 1320 株' },
    { threshold: 1560, description: '總曼德拉草數量達到 1560 株' },
    { threshold: 1850, description: '總曼德拉草數量達到 1850 株' },
    { threshold: 2200, description: '總曼德拉草數量達到 2200 株' },
    { threshold: 2600, description: '總曼德拉草數量達到 2600 株' },
    { threshold: 3100, description: '總曼德拉草數量達到 3100 株' },
    { threshold: 3700, description: '總曼德拉草數量達到 3700 株' },
    { threshold: 4400, description: '總曼德拉草數量達到 4400 株' },
    { threshold: 5300, description: '總曼德拉草數量達到 5300 株' },
    { threshold: 6500, description: '總曼德拉草數量達到 6500 株' }
];

/* 🔧 隨機選擇曼德拉草的函數
function selectRandomMandrake(tier, usedNames = new Set()) {
    const types = ['normal', 'element', 'animal'];
    
    // 隨機打亂屬性順序，避免總是優先選擇 normal
    const shuffledTypes = types.sort(() => Math.random() - 0.5);
    
    for (const type of shuffledTypes) {
        // 篩選該屬性中未使用的名稱
        const availableNames = NAME_POOLS[type].filter(
            nameData => !usedNames.has(nameData.name)
        );
        
        if (availableNames.length > 0) {
            // 隨機選擇一個可用名稱
            const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
            
            // 🔧 修正：生成真正穩定的ID（基於名稱內容）
            const nameMapping = {
                '曼德拉草': 'original',
                '胖曼德拉草': 'fat', '枯乾曼德拉草': 'dried', '迷你曼德拉草': 'mini',
                '恐懼曼德拉草': 'fear', '白曼德拉草': 'white', '苗條曼德拉草': 'slim',
                '古老曼德拉草': 'ancient', '閃亮曼德拉草': 'shiny', '神秘曼德拉草': 'mystery',
                
                '火曼德拉草': 'fire', '水曼德拉草': 'water', '風曼德拉草': 'wind',
                '電曼德拉草': 'electric', '冰曼德拉草': 'ice', '土曼德拉草': 'earth',
                '光曼德拉草': 'light', '暗曼德拉草': 'dark', '毒曼德拉草': 'poison',
                '雷曼德拉草': 'thunder',
                
                '貓曼德拉草': 'cat', '兔曼德拉草': 'rabbit', '鼠曼德拉草': 'mouse',
                '熊曼德拉草': 'bear', '蝙蝠曼德拉草': 'bat', '狗曼德拉草': 'dog',
                '狐狸曼德拉草': 'fox', '龍曼德拉草': 'dragon', '鳥曼德拉草': 'bird',
                '魚曼德拉草': 'fish'
            };
            
            const nameKey = nameMapping[selectedName.name] || selectedName.name.replace(/[^a-zA-Z0-9]/g, '');
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
    
    // 如果所有屬性都沒有可用名稱，返回null
    console.warn(`第${tier}階無法找到未使用的名稱！`);
    return null;
}
*/

// 🔧 程序生成備用名稱的函數（當名稱池用完時）
function generateBackupName(tier, type, index) {
    const typeNames = {
        normal: '普通',
        element: '元素', 
        animal: '動物'
    };
    
    const icons = {
        normal: ['🌱', '🟢', '🟡', '⚪', '🔘'],
        element: ['🔥', '💧', '⚡', '💨', '🧊'],
        animal: ['🐱', '🐭', '🐰', '🐻', '🦊']
    };
    
    const randomIcon = icons[type][Math.floor(Math.random() * icons[type].length)];
    
    return {
        name: `${typeNames[type]}曼德拉草 #${String(index).padStart(3, '0')}`,
        icon: randomIcon,
        description: `程序生成的第${tier}階${typeNames[type]}系曼德拉草`
    };
}

// ✅ 驗證配置載入
console.log('✅ GAME_CONFIG 載入:', typeof GAME_CONFIG !== 'undefined');
console.log('✅ TIER_STATS 載入:', typeof TIER_STATS !== 'undefined');
console.log('✅ NAME_POOLS 載入:', typeof NAME_POOLS !== 'undefined');
console.log('✅ MANDRAKE_CONFIG 載入:', typeof MANDRAKE_CONFIG !== 'undefined');
console.log('✅ WEATHER_CONFIG 載入:', typeof WEATHER_CONFIG !== 'undefined');
console.log('✅ RARITY_CONFIG 載入:', typeof RARITY_CONFIG !== 'undefined');
console.log('✅ REWARD_TEMPLATES 載入:', typeof REWARD_TEMPLATES !== 'undefined');
console.log('✅ ENHANCEMENT_VALUES 載入完成');
console.log('✅ ENHANCEMENT_UNLOCK_CONDITIONS 載入完成');

console.log('📋 config.js 載入完成！');