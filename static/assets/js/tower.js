class Tower {
    constructor() {
        this.lastBossDefeated = 0;
        this.bossFound = false;
        this.floors = this.initializeFloors();
    }

    initializeFloors() {
        const monsterList = monsters.getMonsterList();
        return monsterList.map((_, index) => index === 0 ? 
            { size: 100, explored: 100, canAdvance: true, stairsPosition: 0, monsterDensity: 0 } : 
            {
                size: 2 * monsterList[index - 1].size,
                explored: 0,
                canAdvance: false,
                stairsPosition: Math.floor(Math.random() * (2 * monsterList[index - 1].size)),
                monsterDensity: Math.floor(10 + Math.random() * 40)
            });
    }

    save() {
        try {
            const towerSave = JSON.stringify({
                savedFloors: this.floors,
                savedLastBossDefeated: this.lastBossDefeated,
                savedBossFound: this.bossFound
            });
            localStorage.setItem("towerSave", towerSave);
        } catch (error) {
            console.error("Error saving tower data:", error);
        }
    }

    load() {
        try {
            const towerSave = JSON.parse(localStorage.getItem("towerSave"));
            if (towerSave) {
                this.floors = towerSave.savedFloors || this.floors;
                this.lastBossDefeated = towerSave.savedLastBossDefeated || this.lastBossDefeated;
                this.bossFound = towerSave.savedBossFound || this.bossFound;
            }
        } catch (error) {
            console.error("Error loading tower data:", error);
        }
    }

    loadFloors(savedFloors) {
        this.floors = savedFloors.map((floor, index) => ({
            ...this.floors[index],
            ...floor
        }));
    }

    getFloorMonsterDensity(floor) {
        return this.floors[floor].monsterDensity;
    }

    getMaxFloor() {
        return this.floors.reduce((maxFloor, floor, i) => floor.explored === floor.size ? i : maxFloor, 0);
    }

    setBossFound(boolean) {
        this.bossFound = boolean;
    }

    setLastBossDefeated(floor) {
        this.lastBossDefeated = floor;
    }

    floorExplorationComplete(floor) {
        return this.floors[floor].explored === this.floors[floor].size;
    }

    loadTowerScreen() {
        const currentFloor = player.getCurrentFloor();
        const floorElement = document.getElementById("floor");
        const explorationPercentageElement = document.getElementById("explperc");
        const floorBarElement = document.getElementById("floorbar");
        const advanceButtonElement = document.getElementById("advbut");
        const returnButtonElement = document.getElementById("retbut");

        floorElement.innerHTML = currentFloor;
        const exploredPercentage = (this.floors[currentFloor].explored / this.floors[currentFloor].size) * 100;
        explorationPercentageElement.innerHTML = `${exploredPercentage.toFixed(2)}%`;
        explorationPercentageElement.style.display = exploredPercentage < 5 ? "none" : "block";
        floorBarElement.style.width = `${exploredPercentage}%`;

        advanceButtonElement.innerHTML = this.generateAdvanceButtonHTML(currentFloor);
		returnButtonElement.innerHTML = createButtonHTML({
			text: "Previous Floor",
			classes: "btn btn-default btn-block",
			action: "tower.changeFloor(-1)",
			condition: currentFloor !== 0
		});

    }

	generateAdvanceButtonHTML(currentFloor) {
		const monsterListLength = monsters.getMonsterList().length;
		const canAdvance = this.floors[currentFloor].canAdvance && currentFloor < monsterListLength;
		const isBossFloor = currentFloor % 10 === 0 && currentFloor > this.lastBossDefeated;
		const bossFoundCondition = this.bossFound && isBossFloor;
	
		// Generate "Next Floor" button
		if (canAdvance) {
			return createButtonHTML({
				text: "Next Floor",
				classes: "btn btn-default btn-block",
				action: "tower.changeFloor(1)"
			});
		}
	
		// Generate "Fight Floor Boss" button
		if (bossFoundCondition) {
			return createButtonHTML({
				text: "Fight Floor Boss",
				classes: "btn btn-danger btn-block",
				action: "tower.startBossBattle()"
			});
		}
	
		// Default case, no button
		return '';
	}

    startBossBattle() {
        if (!player.getInBattle()) {
            monsters.setInstancedMonster(monsters.getBossMonster((player.getCurrentFloor() / 10) - 1));
            monsters.setInBossBattle(true);
            monsters.battle(monsters.getInstancedMonster(), false);
        }
    }

    bossDefeated() {
        this.floors[player.getCurrentFloor()].canAdvance = true;
        this.loadTowerScreen();
    }

    changeFloor(floorsChanged) {
        if (!player.getInBattle()) {
            player.setCurrentFloor(player.getCurrentFloor() + floorsChanged);
            this.loadTowerScreen();
            player.loadRestButton();
            player.loadExploreButton();
        }
    }

    exploreFloor() {
        const currentFloor = player.getCurrentFloor();
        player.setManaCurrentValue(player.getManaCurrentValue() + characterBuffs.get('ManaPerSecond'));
        if (!this.floorExplorationComplete(currentFloor)) {
            let explored = characterBuffs.get('ExplorationSpeedMultiplier') * ((player.getSpeedLevel() + player.getSpeedBonus()) / 10);
            const explorationLeft = this.floors[currentFloor].size - this.floors[currentFloor].explored;
            if (explored > explorationLeft) {
                explored = explorationLeft;
            }
            this.floors[currentFloor].explored += explored;
            if (this.hasFoundStairs(currentFloor) && !this.floors[currentFloor].canAdvance && currentFloor < monsters.getMonsterList().length) {
                if (currentFloor % 10 !== 0) {
                    this.floors[currentFloor].canAdvance = true;
                } else {
                    this.bossFound = true;
                }
            }
            player.setSpeedExperience(player.getSpeedExperience() + 5 * explored * characterBuffs.get('LevelingSpeedMultiplier') / characterBuffs.get('ExplorationSpeedMultiplier'));
            this.loadTowerScreen();
            if (!this.checkFloorEvent()) {
                monsters.battleChance(false);
            }
        } else {
            monsters.battleChance(true);
        }
    }

    hasFoundStairs(currentFloor) {
        return this.floors[currentFloor].explored > this.floors[currentFloor].stairsPosition;
    }

	checkFloorEvent() {
		const eventChance = 10;
		let eventRoll = Math.floor(Math.random() * 100);
		if (eventRoll <= eventChance) {
			eventRoll = Math.random() * 100;
			if (eventRoll < 5) {
				const rarity = player.getCurrentFloor() + Math.floor(Math.random() * player.getCurrentFloor());
				logToFloor("You turn a corner, finding a treasure chest.");
				inventory.findChest(rarity);
			} else {
				const gold = Math.round(Math.random() * 50 * player.getCurrentFloor()) + 1;
				logToFloor(`You find the body of another adventurer. You check their pockets, obtaining ${gold} gold.`);
				inventory.setGold(inventory.getGold() + gold);
			}
			return true;
		} else {
			logToFloor("You walk around for a bit, finding nothing of interest.");
			return false;
		}
	}
}

const tower = new Tower();
