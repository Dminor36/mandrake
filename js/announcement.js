// ========== 公告系統 - announcement.js ==========

console.log('📢 公告系統載入中...');

class AnnouncementSystem {
    constructor() {
        this.currentVersion = "1.3.1"; // 🔧 修改這裡來更新當前版本
        this.lastReadVersion = this.getLastReadVersion();
        this.announcements = this.getAnnouncementData();
    }

    /**
     * 初始化公告系統
     */
    init() {
        this.updateButtonState();
        console.log('✅ 公告系統初始化完成');
    }

    /**
     * 獲取公告數據（你可以在這裡添加新的更新內容）
     */
    getAnnouncementData() {

        return [
                        {
                version: "1.3.2",
                date: "2025/06/30",
                status: "new", // new, current, old
                updates: {
                    features: [
                        "商店功能建構中, 可於批量購買右方找到",
                    ],  
                    improvements: [
                        "左側區域調整, 資源區位置永遠固定在頂端",
                    ],
                }
            },

            {
                version: "1.3.1",
                date: "2025/06/27",
                status: "current", // new, current, old
                updates: {
                    improvements: [
                        "圖鑑樣式調整 - 刪除分類改使用編號顯示, 刪除右上角標籤<br>解鎖條件只要曾經擁有就可見",
                    ],
                    fixes: [
                        "購買區懸停工具顯示正常",
                        "修復獎勵上限重複取得問題"
                    ]
                }
            },


            {
                version: "1.3.0",
                date: "2025/06/25",
                status: "current", // new, current, old
                updates: {
                    features: [
                        "新增公告系統，方便查看更新內容",
                        "新增已獲取強化顯示，位於天氣系統下方<br>（強化系統目前僅顯示已獲取的強化）",
                    ],
                    improvements: [
                        "調整強化系統獲取方式",
                        "強化進度條顯示於輪播區背景",
                        "更改系統按鈕配置，新增公告按鈕",
                        "調整通知位置",
                        "暴風改為動物-50%（原為-100%）",
                    ],
                    fixes: [
                        "修復強化系統顯示異常問題",
                    ],
                    bugs: [
                        "購買條停駐時詳細資料沒有運作",]
                }
            },

        ];
    }

    /**
     * 顯示公告模態框
     */
    showAnnouncement() {
        const modal = document.getElementById('announcement-modal');
        if (!modal) {
            console.error('找不到公告模態框元素');
            return;
        }

        // 生成公告內容
        this.generateAnnouncementContent();
        
        // 顯示模態框
        modal.classList.add('show');
        modal.style.display = 'flex';

        // 標記為已讀
        this.markAsRead();
    }

    /**
     * 隱藏公告模態框
     */
    hideAnnouncement() {
        const modal = document.getElementById('announcement-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }

    /**
     * 生成公告內容
     */
    generateAnnouncementContent() {
        const container = document.getElementById('announcement-version-list');
        if (!container) return;

        container.innerHTML = '';

        this.announcements.forEach(announcement => {
            const versionElement = this.createVersionElement(announcement);
            container.appendChild(versionElement);
        });
    }

    /**
     * 創建版本元素
     */
    createVersionElement(announcement) {
        const versionDiv = document.createElement('div');
        versionDiv.className = 'version-item';
        versionDiv.onclick = () => this.toggleVersion(versionDiv);

        // 狀態標籤
        const statusText = {
            'new': 'NEW',
            'current': '  ', 
            'old': '舊版本'
        };

        const statusClass = {
            'new': 'new',
            'current': 'current',
            'old': 'old'
        };

        // 更新分類
        const updateSections = [];

        // 🆕 定義類別的顯示配置
        const categoryConfig = {
            // 原有類別
            features: { title: '✨ 新功能', order: 1 },
            improvements: { title: '🔧 改進', order: 3 },
            fixes: { title: '🐛 修復', order: 2 },    
            bugs: { title: '⚠️ 待處理BUG', order: 10 },
            balance: { title: '⚖️ 平衡調整', order: 4 },

        };

        // 🆕 處理所有類別（自動偵測）
        for (const [categoryKey, items] of Object.entries(announcement.updates)) {
            if (items && Array.isArray(items) && items.length > 0) {
                const config = categoryConfig[categoryKey];
                updateSections.push({
                    title: config ? config.title : `📋 ${categoryKey}`,
                    items: items,
                    order: config ? config.order : 999
                });
            }
        }

// 🆕 按 order 排序（數字小的排前面）
updateSections.sort((a, b) => a.order - b.order);

        versionDiv.innerHTML = `
            <div class="version-header">
                <div class="version-title">
                    <span class="version-number">${announcement.version}</span>
                    <span class="version-date">${announcement.date}</span>
                </div>
                <div class="version-status">
                    <span class="version-badge ${statusClass[announcement.status]}">${statusText[announcement.status]}</span>
                    <span class="expand-icon">▼</span>
                </div>
            </div>
            <div class="version-details">
                ${updateSections.map(section => `
                    <div class="update-section">
                        <div class="update-section-title">${section.title}</div>
                        <ul class="update-list">
                            ${section.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;

        return versionDiv;
    }

    /**
     * 切換版本展開/收合
     */
    toggleVersion(element) {
        element.classList.toggle('expanded');
    }

    /**
     * 更新按鈕狀態
     */
    updateButtonState() {
        const button = document.getElementById('announcement-btn');
        const badge = document.getElementById('announcement-badge');
        
        if (!button || !badge) return;

        const unreadCount = this.getUnreadCount();
        
        if (unreadCount > 0) {
            button.classList.add('has-new');
            badge.style.display = 'flex';
            badge.textContent = unreadCount;
        } else {
            button.classList.remove('has-new');
            badge.style.display = 'none';
        }
    }

    /**
     * 獲取未讀公告數量
     */
    getUnreadCount() {
        if (!this.lastReadVersion) return this.announcements.length;
        
        const lastReadIndex = this.announcements.findIndex(a => a.version === this.lastReadVersion);
        return lastReadIndex === -1 ? this.announcements.length : lastReadIndex;
    }

    /**
     * 標記為已讀
     */
    markAsRead() {
        localStorage.setItem('lastReadAnnouncementVersion', this.currentVersion);
        this.lastReadVersion = this.currentVersion;
        this.updateButtonState();
    }

    /**
     * 獲取上次已讀版本
     */
    getLastReadVersion() {
        return localStorage.getItem('lastReadAnnouncementVersion');
    }

    /**
     * 🔧 新增公告的方法（開發者使用）
     */
    addNewAnnouncement(version, date, updates) {
        const newAnnouncement = {
            version: version,
            date: date,
            status: "new",
            updates: updates
        };

        // 將舊的 "new" 改為 "current"，"current" 改為 "old"
        this.announcements.forEach(announcement => {
            if (announcement.status === "new") {
                announcement.status = "current";
            } else if (announcement.status === "current") {
                announcement.status = "old";
            }
        });

        // 添加新公告到最前面
        this.announcements.unshift(newAnnouncement);
        
        // 更新當前版本
        this.currentVersion = version;
        
        // 更新按鈕狀態
        this.updateButtonState();
        
        console.log(`📢 新增公告: ${version}`);
    }
}

// ========== 全局函數 ==========

let announcementSystem;

/**
 * 初始化公告系統
 */
function initAnnouncementSystem() {
    announcementSystem = new AnnouncementSystem();
    announcementSystem.init();
}

/**
 * 顯示公告（供 HTML onclick 調用）
 */
window.showAnnouncement = function() {
    if (announcementSystem) {
        announcementSystem.showAnnouncement();
    }
};

/**
 * 隱藏公告（供 HTML onclick 調用）
 */
window.hideAnnouncement = function() {
    if (announcementSystem) {
        announcementSystem.hideAnnouncement();
    }
};

/**
 * 切換版本展開（供 HTML onclick 調用）
 */
window.toggleAnnouncementVersion = function(element) {
    element.classList.toggle('expanded');
};

// ========== 自動初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    // 等待一下確保其他系統載入完成
    setTimeout(() => {
        initAnnouncementSystem();
    }, 500);
});

// 暴露系統供其他模組使用
window.AnnouncementSystem = AnnouncementSystem;
window.announcementSystem = announcementSystem;

console.log('✅ announcement.js 載入完成');