class Player {
    constructor() {
        this.initAttributes();
        this.load();
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

    load() {
        const playerSave = JSON.parse(localStorage.getItem("playerSave"));
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
        localStorage.setItem("playerSave", JSON.stringify(saveData));
    }

	getStatValue(statName) {
		const self = this;
		return {
			get level() {
				return self[statName].level;
			},
			set level(newLevel) {
				self[statName].level = newLevel;
				self[statName].nextLevel = self.neededExperience(self[statName].level + 1);
				self.loadStatScreen(statName, self[statName]);
			},
			get experience() {
				return self[statName].experience;
			},
			set experience(experienceGain) {
				let stat = self[statName];
				stat.experience += experienceGain;
				while (stat.experience >= stat.nextLevel) {
					stat.experience -= stat.nextLevel;
					stat.level++;
					stat.nextLevel = self.neededExperience(stat.level + 1);
				}
				self.loadStatScreen(statName, stat);
			},
			get bonus() {
				return self[statName].bonus;
			},
			set bonus(newBonus) {
				self[statName].bonus = newBonus;
				self.loadStatScreen(statName, self[statName]);
			}
		};
	}

    setExperienceAndLevel(_stat, experienceGain) {
        const stat = this[_stat];
        if (!stat) return; 
        stat.experience += experienceGain;
        while (stat.experience >= stat.nextLevel) {
            stat.experience -= stat.nextLevel;
            this.setLevel(_stat, stat.level + 1);
        }
    }

    setLevel(_stat, newLevel) {
        const stat = this[_stat];
        if (!stat) return; 
        stat.level = newLevel;
        stat.nextLevel = this.neededExperience(stat.level + 1);

        if (_stat === 'constitution') {
            this.health.maximumValue = Math.pow(stat.level + stat.bonus, 2) * 4;
        } else if (_stat === 'magic') {
            this.mana.maximumValue = Math.pow(stat.level + stat.bonus, 2) * 2;
        }
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
        console.log("Stat ID: ", statId);
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

    gainExperience(enemy, attacking) {
        let multiplier = 1; 
        if (attacking) {
            this.strength.experience += multiplier * (enemy.strength / this.constitution.level);
            this.dexterity.experience += multiplier * (enemy.dexterity / this.dexterity.level);
        } else {
            this.constitution.experience += multiplier * (enemy.strength / this.constitution.level);
        }
    }

    neededExperience(level) {
        return (Math.pow(level, 2) + level) * 3;
    }

    isFullyRested() {
        return this.health.currentValue === this.health.maximumValue && this.mana.currentValue === this.mana.maximumValue;
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

	toggleRest() {
        this.resting = !this.resting;
        
    }

    exploreMap() {
        if (this.inMap && this.currentMap) {
            map.explore(); // Assuming 'map' is accessible here. If not, pass the map instance to the player or use an event system.
        } else {
            console.error("No active map to explore.");
        }
    }

    claimMapReward() {
        if (this.inMap && this.currentMap && this.currentMap.explored >= this.currentMap.size) {
            map.claimReward();
        } else {
            console.error("Map is not fully explored or no active map to claim rewards from.");
        }
    }

    abandonCurrentMap() {
        if (this.inMap) {
            map.abandonMap();
        } else {
            console.error("No active map to abandon.");
        }
    }

    updateButton(buttonId, options) {
        const button = document.getElementById(buttonId);
        if (!button) return; 
        let innerHTML = '';
        if (options.condition) {
            const { enabled, text, onClick } = options.stateTrue;
            innerHTML = `<button class="btn ${enabled ? 'btn-primary' : 'btn-secondary'}" ${enabled ? '' : 'disabled'} onclick="${onClick}">${text}</button>`;
        } else {
            const { enabled, text, onClick } = options.stateFalse;
            innerHTML = `<button class="btn ${enabled ? 'btn-primary' : 'btn-secondary'}" onclick="${onClick}">${text}</button>`;
        }
        button.innerHTML = innerHTML;
    }

    loadExploreButton() {
        this.updateButton("exploreButton", {
            condition: this.inMap,
            stateTrue: {
                enabled: this.currentMap && this.currentMap.explored < this.currentMap.size,
                text: "Explore",
                onClick: "player.exploreMap()"
            },
            stateFalse: {
                enabled: false,
                text: "Explore",
                onClick: ""
            }
        });
    }

    loadRestButton() {
        this.updateButton("restButton", {
            condition: this.inMap,
            stateTrue: {
                enabled: !this.inBattle,
                text: this.resting ? "Stop Resting" : "Rest",
                onClick: "player.toggleRest()"
            },
            stateFalse: {
                enabled: false,
                text: "Unavailable",
                onClick: ""
            }
        });
    }

    
    get healthValue() {
        const self = this; 
        return {
            get currentValue() {
                return self.health.currentValue;
            },
            set currentValue(newHealth) {
                if (newHealth > self.health.maximumValue) {
                    newHealth = self.health.maximumValue;
                }
                self.health.currentValue = newHealth;
                self.loadConditionScreen("hp", self.health);
            },
            get maximumValue() {
                return self.health.maximumValue;
            },
            set maximumValue(newMaxHealth) {
                self.health.maximumValue = newMaxHealth;
                self.loadConditionScreen("hp", self.health);
            }
        };
    }

	get manaValue() {
        const self = this;
        return {
            get currentValue() {
                return self.mana.currentValue;
            },
            set currentValue(newMana) {
                if (newMana > self.mana.maximumValue) {
                    newMana = self.mana.maximumValue;
                }
                self.mana.currentValue = newMana;
                self.loadConditionScreen("mp", self.mana);
            },
            get maximumValue() {
                return self.mana.maximumValue;
            },
            set maximumValue(newMaxMana) {
                self.mana.maximumValue = newMaxMana;
                self.loadConditionScreen("mp", self.mana);
            }
        };
    }

	getStatValue(statName) {
		const self = this; // Ensure 'this' is correctly referenced
		return {
			get level() {
				return self[statName].level;
			},
			set level(newLevel) {
				self[statName].level = newLevel;
				self[statName].nextLevel = self.neededExperience(self[statName].level + 1);
				self.loadStatScreen(statName, self[statName]);
			},
			get experience() {
				return self[statName].experience;
			},
			set experience(experienceGain) {
				let stat = self[statName];
				stat.experience += experienceGain;
				while (stat.experience >= stat.nextLevel) {
					stat.experience -= stat.nextLevel;
					stat.level++;
					stat.nextLevel = self.neededExperience(stat.level + 1);
				}
				self.loadStatScreen(statName, stat);
			},
			get bonus() {
				return self[statName].bonus;
			},
			set bonus(newBonus) {
				self[statName].bonus = newBonus;
				self.loadStatScreen(statName, self[statName]);
			}
		};
	}
	
	claimReward() {
		if (this.inMap && this.currentMap.mapComplete) {
			console.log("Claiming reward...");
			const reward = { experience: 100, items: ["Gold", "Potion"] }; 
			console.log(`You received ${reward.experience} experience points and found items: ${reward.items.join(", ")}.`);
			this.currentMap = { size: 0, explored: 0, tier: 0, quantity: 0, quality: 0, density: 0, mapComplete: false };
			this.inMap = false;
		} else {
			console.log("You must complete the map exploration before claiming a reward.");
		}
	}

    toggleRest() {
        this.resting = !this.resting;
        if (this.resting) {
            console.log("Player is now resting...");
        } else {
            console.log("Player stopped resting.");
        }
    }
}
var player = new Player();
