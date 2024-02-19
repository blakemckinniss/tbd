class Player {
    constructor() {
        this.initAttributes();
        this.load();
    }

    load() {
        const playerSave = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYER));
        if (playerSave) {
            Object.keys(playerSave).forEach(key => {
                if (this[key] !== undefined) this[key] = playerSave[key];
            });
        }
    }

    save() {
        const saveData = {};
        Object.keys(this).forEach(key => {
            if (typeof this[key] !== 'function') {
                saveData[key] = this[key];
            }
        });
        localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(saveData));
    }

    loadAttribute(savedData, attributeName) {
        if (savedData !== undefined) this[attributeName] = savedData;
    }

    defaultStat() {
        return { level: 5, experience: 0, nextLevel: 100, bonus: 0 };
    }

    initAttributes() {
        console.log("Initializing player attributes:");
        this.hero = { level: 1, experience: 0, nextLevel: 1000, bonus: 0 };
        ['strength', 'dexterity', 'constitution', 'speed', 'magic', 'luck'].forEach(stat => {
            this[stat] = this.defaultStat();
        });
        this.currentMap = { size: 0, explored: 0, tier: 0, quantity: 0, quality: 0, density: 0, mapComplete: false };

        this.name = "Jinx";
        this.health = { currentValue: 100, maximumValue: 100 };
        this.mana = { currentValue: 50, maximumValue: 50 };
        this.inBattle = false;
        this.inMap = false;
        this.resting = false;
    }


    loadPlayerScreen() {
        ['strength', 'dexterity', 'constitution', 'speed', 'magic'].forEach(stat => {
            this.loadStatScreen(stat, this[stat]);
        });
        this.loadConditionScreen("hp", this.health);
        this.loadConditionScreen("mp", this.mana);
    }

    loadStatScreen(statId, stat) {
        const percentage = 100 * (stat.experience / stat.nextLevel);
        // console.log("Stat ID: ", stat);
        document.getElementById(`${statId}`).textContent = Math.round(100 * (stat.level + stat.bonus)) / 100;
        document.getElementById(`${statId}per`).textContent = `${Math.round(percentage)}%`;
        document.getElementById(`${statId}per`).style.display = percentage > 5 ? "inline-flex" : "none";
        document.getElementById(`${statId}prog`).style.width = `${percentage}%`;
    }

    loadConditionScreen(conditionId, condition) {
        document.getElementById(`${conditionId}`).textContent = Math.round(condition.currentValue);
        document.getElementById(`${conditionId}max`).textContent = Math.round(condition.maximumValue);
        document.getElementById(`${conditionId}bar`).style.width = `${100 * (condition.currentValue / condition.maximumValue)}%`;
    }

    gainExperience(expPoints) {
        this.experience += expPoints;
        this.checkLevelUp();
        this.save();
    }

    checkLevelUp() {
        const levelUpThreshold = 100 * this.level;
        while (this.experience >= levelUpThreshold) {
            this.level++;
            this.experience -= levelUpThreshold;
            this.health.maximumValue += 10;
            this.mana.maximumValue += 5;
        }
        this.save();
    }

    toggleRest() {
        this.resting = !this.resting;
        if (this.resting) {
            console.log("Player is now resting...");
        } else {
            console.log("Player stopped resting.");
        }
    }

    rest() {
        if (this.resting) {
            const restingMultiplier = 1; 
            this.health.currentValue += 5 * this.constitution.level * restingMultiplier;
            this.mana.currentValue += 5 * this.magic.level * restingMultiplier;

            if (this.isFullyRested()) {
                this.toggleRest();
            }
        }
    }

    isFullyRested() {
        return this.health.currentValue >= this.health.maximumValue && this.mana.currentValue >= this.mana.maximumValue;
    }

    exploreMap() {
        if (this.inMap && this.currentMap) {
            console.log("Exploring the map...");
            this.save();
        } else {
            console.error("No active map to explore.");
        }
    }

    claimMapReward() {
        if (this.inMap && this.currentMap.mapComplete) {
            console.log("Claiming map reward...");
            this.inMap = false;
            this.save();
        } else {
            console.error("Map is not fully explored or no active map to claim rewards from.");
        }
    }

    abandonCurrentMap() {
        if (this.inMap) {
            console.log("Abandoning current map...");
            this.inMap = false;
            this.save();
        } else {
            console.error("No active map to abandon.");
        }
    }
}