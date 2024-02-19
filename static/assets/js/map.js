class GameMap {
    constructor(player) {
        this.player = player;
        this.currentMap = null;
        this.load();
    }

    load() {
        const savedMap = StateManager.load(STORAGE_KEYS.GAME_MAP);
        if (savedMap) {
            this.currentMap = savedMap;
            console.log("Map loaded successfully.");
        }
    }

    save() {
        StateManager.save(STORAGE_KEYS.GAME_MAP, this.currentMap);
    }

    generateRandomMap({ tier = 1, quantity = 30, enemyDensity = 10, eventChance = 5 } = {}) {
        tier = Math.max(1, tier);
        quantity = Math.max(1, quantity);
        enemyDensity = Math.max(1, Math.min(100, enemyDensity));
        eventChance = Math.max(0, Math.min(100, eventChance));

        const finalEnemyDensity = Math.min(100, Math.floor((enemyDensity + tier * 2) * (1 + (this.player.luck.level / 100) * this.player.luck.bonus)));
        const size = 100 + (tier - 1) * 20;
        const encounters = this.generateMapEncounters(finalEnemyDensity, size);

        let enemies = [];
        for (let i = 0; i < finalEnemyDensity; i++) {
            let rarityMultiplier = tier * (enemyDensity / 100);
            let element = this.determineElement();
            enemies.push(this.generateMapEnemy(tier, rarityMultiplier, element));
        }

        this.currentMap = {
            tier,
            size,
            enemyDensity: finalEnemyDensity,
            eventChance,
            quantity,
            explored: 0,
            encounters,
            enemies
        };
        this.save();
    }

    explore(percent = 10) {
        if (this.currentMap) {
            this.currentMap.explored += percent;
            if (this.currentMap.explored > this.currentMap.size) {
                this.currentMap.explored = this.currentMap.size;
                console.log("Map fully explored!");
            } else {
                console.log(`Map explored: ${this.currentMap.explored}%`);
            }
            this.save();
        } else {
            console.log("No active map to explore.");
        }
    }

    resetMap() {
        this.currentMap = null;
        this.save();
        console.log("Map has been reset.");
    }

    generateMapEncounters(finalEnemyDensity, size) {
        const numberOfEvents = Math.floor(size * (finalEnemyDensity / 100));
        let eventTypes = [];
    
        for (let i = 0; i < numberOfEvents; i++) {
            const thisEventChance = Math.random() * 100;
            for (let j = 0; j < globalEventChanceArray.length; j++) {
                if (thisEventChance <= globalEventChanceArray[j]) {
                    eventTypes.push({ type: globalEventTypeArray[j], classification: globalEventClassificationArray[j] });
                    break;
                }
            }
        }
        return eventTypes.length ? eventTypes : [{ type: 'none', classification: 'neutral' }];
    }

    determineElement() {
        const rareElementChance = Math.random();
        if (rareElementChance < 0.85) {
            return elements[Math.floor(Math.random() * 3)]; 
        } else {
            return elements[3 + Math.floor(Math.random() * 2)]; 
        }
    }

    generateMapEnemy(tier, rarityMultiplier, element = null) {
        const rarity = this.determineMapEnemyRarity(rarityMultiplier);
        const baseStats = this.adjustEnemyStatsByTier(tier);
        baseStats.rarity = rarity;
        baseStats.element = element || this.determineElement();
        return baseStats;
    }

    adjustEnemyStatsByTier(tier) {
        const baseStats = {
            name: "Enemy",
            currentHealth: 100,
            maximumHealth: 100,
            strength: 5,
            dexterity: 5,
            constitution: 5,
            speed: 5,
            luck: 0
        };
        const statIncreasePerTier = 10;
        const tierMultiplier = Math.max(1, tier - 1);
        const randomFactor = 0.8 + Math.random() * 0.4;
        return {
            ...baseStats,
            currentHealth: Math.floor(baseStats.currentHealth + (statIncreasePerTier * tierMultiplier * randomFactor)),
            maximumHealth: Math.floor(baseStats.maximumHealth + (statIncreasePerTier * tierMultiplier * randomFactor)),
            strength: Math.floor(baseStats.strength + (tierMultiplier * randomFactor)),
            dexterity: Math.floor(baseStats.dexterity + (tierMultiplier * randomFactor)),
            constitution: Math.floor(baseStats.constitution + (tierMultiplier * randomFactor)),
            speed: Math.floor(baseStats.speed + (tierMultiplier * randomFactor)),
            luck: Math.floor(Math.random() * tierMultiplier)
        };
    }

    determineMapEnemyRarity(rarityMultiplier) {
        const rarityThreshold = Math.random() * rarityMultiplier;
        if (rarityThreshold < 0.3) return 'common';
        if (rarityThreshold < 0.4) return 'uncommon';
        if (rarityThreshold < 0.5) return 'rare';
        if (rarityThreshold < 0.6) return 'epic';
        if (rarityThreshold < 0.8) return 'legendary';
        if (rarityThreshold < 0.9) return 'unique';
        return 'common';
    }
}
