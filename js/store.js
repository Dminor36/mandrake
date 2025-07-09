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
                    const name = this.getUpgradeName(id, level-1);
                    UI.showNotification(`解鎖 ${name}`, 'info');
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
            const name = this.getUpgradeName(id, level);
            UI.showNotification(`購買 ${name}`, 'success');
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
            if (!this.isUnlocked(id)) continue;
            const cost = this.getUpgradeCost(id);
            const name = this.getUpgradeName(id, level);
            const btn = document.createElement('button');
            btn.className = 'store-item';
            const notEnough = game.data.fruit < cost;
            btn.disabled = notEnough;
            if (notEnough) btn.classList.add('disabled');
            else btn.classList.remove('disabled');
            btn.onclick = () => StoreSystem.buyUpgrade(id);
            btn.innerHTML = `
                <div class="store-name">${mandrake.icon} ${name}</div>
                <div class="store-info">
                    <span class="store-desc">${mandrake.name}產量 +${STORE_CONFIG.productionBonus*100}%</span>
                    <span class="store-price">${UI.formatNumber(cost)}</span>
            `;
            container.appendChild(btn);
        }
        this.updatePurchasedDisplay();
    }

    static getUpgradeName(id, index) {
        const custom = STORE_CONFIG.customNames[id] || [];
        if (custom[index]) return custom[index];
        const base = custom.length > 0 ? custom[custom.length - 1] : MANDRAKE_CONFIG[id].name;
        const suffix = STORE_CONFIG.levelNames[index] || `Lv.${index+1}`;
        return `${base} ${suffix}`;
    }

    static updatePurchasedDisplay() {
        const container = document.getElementById('purchased-container');
        if (!container) return;
        container.innerHTML = '';
        for (const id in game.data.store.upgrades) {
            const level = game.data.store.upgrades[id];
            if (level <= 0) continue;
            const mandrake = MANDRAKE_CONFIG[id];
            for (let i = 1; i <= level; i++) {
                const div = document.createElement('div');
                div.className = 'purchased-item';
                const name = this.getUpgradeName(id, i - 1);
                div.innerHTML = `
                    <span class="purchased-icon">${mandrake.icon}</span>
                    <span class="level-badge">${StoreSystem.toRoman(i)}</span>
                    <div class="hover-tooltip">${name}<br>${mandrake.name}產量 +${STORE_CONFIG.productionBonus * 100}%</div>
                `;
                container.appendChild(div);
            }
        }
    }

    static toRoman(num) {
        const map = [
            [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'],
            [5, 'V'], [4, 'IV'], [1, 'I']
        ];
        let result = '';
        for (const [value, roman] of map) {
            while (num >= value) {
                result += roman;
                num -= value;
            }
        }
        return result;
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