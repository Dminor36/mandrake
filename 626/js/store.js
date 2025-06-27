console.log('🛒 store.js 開始載入...');

class StoreSystem {
    static init() {
        if (!game.data.store) {
            game.data.store = { upgrades: {}, notifiedLevels: {} };
        }
    }

    static getLevel(id) {
        return game.data.store.upgrades[id] || 0;
    }

    static getUpgradeCost(id) {
        const level = this.getLevel(id) + 1;
        const base = MANDRAKE_CONFIG[id]?.baseCost || 0;
        return Math.floor(base * STORE_CONFIG.costMultiplier * level);
    }

    static isUnlocked(id) {
        const level = this.getLevel(id) + 1;
        const required = STORE_CONFIG.unlockStep * level;
        return (game.data.ownedMandrakes[id] || 0) >= required;
    }

    static checkUnlock(id) {
        const level = this.getLevel(id) + 1;
        if (level > STORE_CONFIG.levels) return;
        if (this.isUnlocked(id)) {
            if ((game.data.store.notifiedLevels[id] || 0) < level) {
                game.data.store.notifiedLevels[id] = level;
                if (typeof UI !== 'undefined') {
                    const name = STORE_CONFIG.levelNames[level-1] || level;
                    UI.showNotification(`解鎖 ${MANDRAKE_CONFIG[id].name} 強化${name}`, 'info');
                }
            }
        }
    }

    static buyUpgrade(id) {
        const level = this.getLevel(id);
        if (level >= STORE_CONFIG.levels) return;
        if (!this.isUnlocked(id)) {
            UI.showNotification('尚未解鎖此強化', 'warning');
            return;
        }
        const cost = this.getUpgradeCost(id);
        if (game.data.fruit < cost) {
            UI.showNotification('果實不足', 'warning');
            return;
        }
        game.data.fruit -= cost;
        game.data.store.upgrades[id] = level + 1;
        game.forceProductionUpdate('store-upgrade');
        if (typeof UI !== 'undefined') {
            UI.updateAll();
            UI.showNotification(`購買 ${MANDRAKE_CONFIG[id].name} 強化${STORE_CONFIG.levelNames[level]}`, 'success');
        }
        this.updateStore();
    }

    static updateStore() {
        const container = document.getElementById('store-content');
        if (!container) return;
        container.innerHTML = '';
        for (const id of game.data.unlockedMandrakes) {
            const mandrake = MANDRAKE_CONFIG[id];
            const level = this.getLevel(id);
            if (level >= STORE_CONFIG.levels) continue;
            const nextName = STORE_CONFIG.levelNames[level] || `Lv.${level+1}`;
            const cost = this.getUpgradeCost(id);
            const unlocked = this.isUnlocked(id);
            const item = document.createElement('div');
            item.className = 'store-item';
            const info = document.createElement('span');
            info.textContent = `${mandrake.name} 強化${nextName} (+${STORE_CONFIG.productionBonus*100}%)`;
            const btn = document.createElement('button');
            btn.textContent = unlocked ? `購買 (${UI.formatNumber(cost)})` : `未解鎖`;
            btn.disabled = !unlocked || game.data.fruit < cost;
            btn.onclick = () => StoreSystem.buyUpgrade(id);
            item.appendChild(info);
            item.appendChild(btn);
            container.appendChild(item);
        }
    }

    static openStore() {
        this.updateStore();
        const modal = document.getElementById('store-modal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }

    static closeStore() {
        const modal = document.getElementById('store-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }
}

window.openStore = () => StoreSystem.openStore();
window.closeStore = () => StoreSystem.closeStore();

console.log('🛒 store.js 載入完成');