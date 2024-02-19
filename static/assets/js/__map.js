class Map {
    generateRandomMap({tier, quantity, enemyDensity, eventChance}) {
        tier = Math.max(1, tier);
        quantity = Math.max(1, quantity);
        console.log("enemyDensity:", enemyDensity);
        enemyDensity = Math.max(1, Math.min(100, enemyDensity));
        console.log("enemyDensity:", enemyDensity);
        eventChance = Math.max(0, Math.min(100, eventChance));
    
        const finalEnemyDensity = Math.min(100, Math.floor((enemyDensity + tier * 2) * (1 + (player.luck.level / 100) * player.luck.bonus)));
        const size = 100 + (tier - 1) * 20;
        const encounters = this.generateMapEncounters(eventChance, finalEnemyDensity, size);
    
        // Generate enemies based on map's properties
        let enemies = [];
        for (let i = 0; i < finalEnemyDensity; i++) {
            // Assume rarityMultiplier is influenced by tier and density
            let rarityMultiplier = tier * (enemyDensity / 100);
            let element = this.determineElement(); // Function to randomly determine element, based on your game's logic
            enemies.push(this.generateMapEnemy(tier, rarityMultiplier, element));
        }

        player.currentMap = {
            size,
            explored: 0,
            density: finalEnemyDensity,
            eventChance,
            quantity,
            tier,
            encounters,
            enemies
        };

        return {
            size,
            explored: 0,
            density: finalEnemyDensity,
            eventChance,
            quantity,
            tier,
            encounters,
            enemies
        };
    }

    generateMapEncounters(finalEnemyDensity, size) {
        const numberOfEvents = Math.floor(size * (finalEnemyDensity / 100));
        const eventTypes = [];
    
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

    calculateMapLootOutcome(mapTier, mapQuantity, enemyRarity, varianceMultiplier) {
        let baseQuantity = 10;
        let baseQuality = 10;
    
        const tierAdjustment = mapTier * 2; // Higher tier maps increase both Quantity and Quality
        const quantityAdjustment = mapQuantity; // Directly influences the Quantity
        const levelAdjustment = player.hero.level * 0.5; // Player level slightly increases Quality
        const luckAdjustment = player.luck.level * 0.2; // Luck increases both Quantity and Quality but to a lesser extent
        const rarityBonus = getRarityBonus(enemyRarity); // Rarity influences Quality more than Quantity
    
        let finalQuantity = baseQuantity + tierAdjustment + quantityAdjustment + luckAdjustment;
        let finalQuality = baseQuality + tierAdjustment + levelAdjustment + luckAdjustment + rarityBonus;
    
        finalQuantity *= varianceMultiplier;
        finalQuality *= varianceMultiplier;
    
        finalQuantity = Math.round(finalQuantity);
        finalQuality = Math.round(finalQuality);
    
        return [finalQuantity, finalQuality];
    }

    getRarityBonus(rarity) {
        const rarityMultiplier = {
            common: 1,
            uncommon: 2,
            rare: 3,
            epic: 5,
            legendary: 7,
            unique: 10
        };
        return rarityMultiplier[rarity.toLowerCase()] || 1;
    }

    generateMapLoot(mapTier, mapQuantity, playerLevel, playerLuck, enemyRarity, varianceMultiplier) {
        const [quantity, quality] = this.calculateMapLootOutcome(mapTier, mapQuantity, playerLevel, playerLuck, enemyRarity, varianceMultiplier);
        const loot = {
            quantity,
            quality
        };
        return loot;
    }

    determineElement() {
        const rareElementChance = Math.random();
        if (rareElementChance < 0.85) {
            return elements[Math.floor(Math.random() * 3)];
        } else {
            return elements[3 + Math.floor(Math.random() * 2)];
        }
    }

    calculateMapDropsAndDensity(rarity, playerLuck) {
        let dropQuantity = 1;
        let enemyDensity = 10; // Base enemy density percentage
    
        const rarityModifiers = {
            common: { dropQuantity: 1, enemyDensity: 10 },
            uncommon: { dropQuantity: 2, enemyDensity: 20 },
            rare: { dropQuantity: 3, enemyDensity: 30 },
            epic: { dropQuantity: 5, enemyDensity: 40 },
            legendary: { dropQuantity: 8, enemyDensity: 50 },
            unique: { dropQuantity: 12, enemyDensity: 60 }
        };
    
        if (rarityModifiers[rarity]) {
            dropQuantity += rarityModifiers[rarity].dropQuantity;
            enemyDensity += rarityModifiers[rarity].enemyDensity;
        }
      
        const luckAdjustmentFactor = 1 + (playerLuck / 100);
        dropQuantity = Math.round(dropQuantity * luckAdjustmentFactor);
        enemyDensity = Math.round(enemyDensity * luckAdjustmentFactor);
    
        return { dropQuantity, enemyDensity };
    }

    generateMapEnemy(tier, rarityMultiplier, element = null) {
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
    
        const statIncreasePerTier = 10; // Adjust this value to balance the game
        const tierMultiplier = Math.max(1, tier - 1); // Ensure at least tier 1
        const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
    
        const adjustedStats = {
            ...baseStats,
            currentHealth: Math.floor(baseStats.currentHealth + (statIncreasePerTier * tierMultiplier * randomFactor)),
            maximumHealth: Math.floor(baseStats.maximumHealth + (statIncreasePerTier * tierMultiplier * randomFactor)),
            strength: Math.floor(baseStats.strength + (tierMultiplier * randomFactor)),
            dexterity: Math.floor(baseStats.dexterity + (tierMultiplier * randomFactor)),
            constitution: Math.floor(baseStats.constitution + (tierMultiplier * randomFactor)),
            speed: Math.floor(baseStats.speed + (tierMultiplier * randomFactor)),
            luck: Math.floor(Math.random() * tierMultiplier) // Simple example for luck increase
        };
    
        adjustedStats.rarity = this.determineMapEnemyRarity(rarityMultiplier);
        adjustedStats.element = element || this.determineElement();
        return adjustedStats;
    }

    startMap(mapObject = null) {

        if (mapObject) {
            player.currentMap = mapObject;
        } else {
            player.currentMap = this.generateRandomMap({
                tier: 1,
                quantity: 30,
                enemyDensity: 50,
                eventChance: 30
            });
        }

        console.log("inMap:", player.inMap);
        console.log("currentMap:", player.currentMap);
        if (!player.inMap) {
            console.log("Starting map...");
            player.inMap = true;
            this.loadMapScreen();
        } else {
            console.error("Already in a map. Abandon?");
        }
    }

    resumeMap() {
        if (!player.inMap || !player.currentMap) {
            console.error("No active currentMap to resume.");
            return;
        }
        this.loadMapScreen();
    }

    abandonMap() {
        if (!player.inMap) {
            console.error("No active currentMap to abandon.");
            return;
        }
        this.resetMap();
        this.loadMapScreen();
    }

    claimReward() {
        if (!player.inMap || player.currentMap.explored < player.currentMap.size) {
            console.error("currentMap not complete or no currentMap to claim rewards from.");
            return;
        }
        console.log("Reward claimed.");
        this.resetMap();
        this.loadMapScreen();
    }

    resetMap() {
        player.inMap = false;
        player.currentMap = null;
        this.loadMapScreen();
    }

    explore() {
        console.log("inMap:", player.inMap);
        console.log("currentMap:", player.currentMap);
        if (!player.inMap || !player.currentMap) {
            console.error("No active currentMap to explore.");
            return;
        }

        var explored = characterBuffs.get("ExplorationSpeedMultiplier") * ((player.speedLevel + player.speed.bonus) / 10);
        console.log("Explored:", explored);
        player.mana.currentValue += characterBuffs.get("ManaPerSecond");
        player.speed.experience += 5 * explored * characterBuffs.get("LevelingSpeedMultiplier") / characterBuffs.get("ExplorationSpeedMultiplier");

        player.currentMap.explored += explored;
        if (player.currentMap.explored >= player.currentMap.size) {
            console.log("Exploration complete. You can now claim your reward.");
        }
        this.loadMapScreen();
        if (!this.checkMapEvent()) {
            enemies.battleChance(false);
        }
        else {
            enemies.battleChance(true);
        }
    }

    checkMapEvent() {
        var eventChance = 10;
        var eventRoll = Math.floor(Math.random() * 100);
        if (eventRoll <= eventChance) {
            eventRoll = Math.random() * 100;
            if (eventRoll < 5) {
                var rarity = player.currentMap() + Math.floor(Math.random() * player.currentMap());
                mapLog("You turn a corner, finding a treasure chest.")
                inventory.findChest(rarity);
            }
            else {
                var gold = Math.round(Math.random() * 50) + 1;
                mapLog("You find the body of another adventurer. You check their pockets, obtaining " + gold + " gold.");
                inventory.setGold(inventory.getGold() + gold);
            }
            return true;
        }
        else {
            mapLog("You walk around for a bit, finding nothing of interest.")
            return false;
        }
    };

    loadMapScreen() {
        const enterMapButton = document.getElementById("enterMapButton");
        const abandonMapButton = document.getElementById("abandonMapButton");
        const claimRewardButton = document.getElementById("claimRewardButton");

        console.log("enterMapButton:", enterMapButton);
        console.log("inMap:", player.inMap);

        enterMapButton.style.display = player.inMap ? 'none' : 'inline-flex';
        abandonMapButton.style.display = player.inMap ? 'inline-flex' : 'none';
        claimRewardButton.style.display = (player.inMap && player.currentMap && player.currentMap.explored >= player.currentMap.size) ? 'inline-flex' : 'none';


        if (player.inMap) {
            document.getElementById("explorebar").innerHTML = player.currentMap.explored + "%";
            document.getElementById("mapbar").style.width = player.currentMap.explored + "%";
            player.loadExploreButton();
        }
    }
}

const map = new Map();
