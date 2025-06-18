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
    6: 1200000    // 第6階基礎成本
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
        baseProduction: 10, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    4: { 
        baseCost: TIER_BASE_COSTS[4], 
        baseProduction: 100, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    5: { 
        baseCost: TIER_BASE_COSTS[5], 
        baseProduction: 1000, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    },
    6: { 
        baseCost: TIER_BASE_COSTS[6], 
        baseProduction: 10000, 
        costGrowth: 1.12, 
        prodGrowth: 1 
    }
};

// 解鎖百分比配置
const TIER_UNLOCK_PERCENTAGE = 0.01;  // 1%

// 🔧 按屬性分類的名稱池（包含描述）
const NAME_POOLS = {
    normal: [
        { 
            name: '曼德拉草', 
            icon: '🌱', 
            description: '常見的曼德拉草' 
        },
        { 
            name: '胖曼德拉草', 
            icon: '🟢', 
            description: '比一般的曼德拉草更加圓潤' 
        },
        { 
            name: '枯乾曼德拉草', 
            icon: '🟤', 
            description: '好幾天沒喝水' 
        },
        { 
            name: '迷你曼德拉草', 
            icon: '🟡', 
            description: '體型嬌小但產量驚人' 
        },
        { 
            name: '恐懼曼德拉草', 
            icon: '😨', 
            description: '散發著不安氣息的曼德拉草' 
        },
        { 
            name: '白曼德拉草', 
            icon: '⚪', 
            description: '純白無瑕的神秘曼德拉草' 
        },
        { 
            name: '苗條曼德拉草', 
            icon: '🌿', 
            description: '身材修長的優雅曼德拉草' 
        },
        { 
            name: '古老曼德拉草', 
            icon: '🗿', 
            description: '存在了數百年的智慧曼德拉草' 
        },
        { 
            name: '閃亮曼德拉草', 
            icon: '✨', 
            description: '表面散發著微弱光芒' 
        },
        { 
            name: '神秘曼德拉草', 
            icon: '🔮', 
            description: '來歷不明的神秘品種' 
        }
    ],
    
    element: [
        { 
            name: '火曼德拉草', 
            icon: '🔥', 
            description: '看起來很燙' 
        },
        { 
            name: '水曼德拉草', 
            icon: '💧', 
            description: '不知道為什麼很受歡迎' 
        },
        { 
            name: '風曼德拉草', 
            icon: '💨', 
            description: '覺得自己是一種反向噴射器' 
        },
        { 
            name: '電曼德拉草', 
            icon: '⚡', 
            description: '帶有強烈電流的曼德拉草' 
        },
        { 
            name: '冰曼德拉草', 
            icon: '🧊', 
            description: '散發著極寒氣息的曼德拉草' 
        },
        { 
            name: '土曼德拉草', 
            icon: '⛰️', 
            description: '堅實如岩石的土系曼德拉草' 
        },
        { 
            name: '光曼德拉草', 
            icon: '☀️', 
            description: '自帶光環的神聖曼德拉草' 
        },
        { 
            name: '暗曼德拉草', 
            icon: '🌑', 
            description: '吸收光線的黑暗曼德拉草' 
        },
        { 
            name: '毒曼德拉草', 
            icon: '☣️', 
            description: '散發危險毒素的曼德拉草' 
        },
        { 
            name: '雷曼德拉草', 
            icon: '⛈️', 
            description: '能召喚雷暴的強力曼德拉草' 
        }
    ],
    
    animal: [
        { 
            name: '貓曼德拉草', 
            icon: '🐱', 
            description: '睡著會發出呼嚕呼嚕聲' 
        },
        { 
            name: '兔曼德拉草', 
            icon: '🐰', 
            description: '主食是牧草' 
        },
        { 
            name: '鼠曼德拉草', 
            icon: '🐭', 
            description: '小巧靈活的曼德拉草' 
        },
        { 
            name: '熊曼德拉草', 
            icon: '🐻', 
            description: '體型巨大且力大無窮' 
        },
        { 
            name: '蝙蝠曼德拉草', 
            icon: '🦇', 
            description: '夜行性的神秘曼德拉草' 
        },
        { 
            name: '狗曼德拉草', 
            icon: '🐕', 
            description: '忠誠友善的好夥伴' 
        },
        { 
            name: '狐狸曼德拉草', 
            icon: '🦊', 
            description: '狡猾機智的橘色曼德拉草' 
        },
        { 
            name: '龍曼德拉草', 
            icon: '🐉', 
            description: '擁有遠古血脈的傳說曼德拉草' 
        },
        { 
            name: '鳥曼德拉草', 
            icon: '🐦', 
            description: '喜歡在枝頭歌唱的曼德拉草' 
        },
        { 
            name: '魚曼德拉草', 
            icon: '🐠', 
            description: '需要生長在水中的奇特品種' 
        }
    ]
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

// ========== 獎勵系統配置 ==========

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

// 🔧 隨機選擇曼德拉草的函數
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