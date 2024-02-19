class Spells {
    constructor(player, inventory) {
        this.player = player;
        this.inventory = inventory;
        this.spellbook = [
            { id: 1, type: 0, name: "Fireball", cost: 10, effect: "damage", power: 25, learned: true, level: 0, nextLevel: 100, experience: 0 },
            { id: 2, type: 1, name: "Heal", cost: 5, effect: "heal", power: 20, learned: true, level: 0, nextLevel: 100, experience: 0 },
        ];
        this.arcania = 0; 
        this.load();
    }

    load() {
        const savedData = StateManager.load(STORAGE_KEYS.SPELLS);
        if (savedData) {
            this.spellbook = savedData.spellbook || this.spellbook;
            this.arcania = savedData.arcania || 0;
            debugLog("Spellbook and arcania loaded successfully.");
        }
    }

    save() {
        StateManager.save(STORAGE_KEYS.SPELLS, { spellbook: this.spellbook, arcania: this.arcania });
    }

    spellType(type) {
        return "btn-info";
		// 	return "btn-info";
		// 	return "btn-danger";
		// 	return "btn-warning";
		// 	return "btn-success";
	}

    spellCost(spell) {
		var i;
		var cost = spell.baseMana;
		if (spell.type == 2) {
			for (i = 0; i < spell.level; i++) {
				cost -= 0.1 * cost;
			}
			if (cost <= 10) {
				cost = 10;
			}
		}
		else {
			for (i = 0; i < spell.level; i++) {
				cost += 0.1 * cost;
			}
		}
		return Math.round(cost);
	}

    updateSpellbook() {
        let spellbook = this.spellbook;
        let player = this.player;
		document.getElementById("spellbook").innerHTML = '';
		for (var i = 0; i <= 3; i++) {
			document.getElementById("spellbook" + i).innerHTML = '';
		}
		this.updateSpellDescriptions(spellbook);
		for (i = 0; i < spellbook.length; i++) {
            spellbook[i].learned = true;
			if (player.magic.level >= spellbook[i].requiredMagic && spellbook[i].learned === false) {
				var spellColor = this.spellType(spellbook[i].type);
				document.getElementById(
					"spellbook").innerHTML += '<div class="row"><div class="col-xs-12"><button class="btn ' 
					+ spellColor + ' btn-block" data-toggle="tooltip" data-placement="top" title="' 
					+ spellbook[i].description + '" onClick="spells.buySpell(\'' 
					+ spellbook[i].id + '\')"> Buy ' 
					+ spellbook[i].name + '</button></div><div class="col-xs-7"><p class="text-right">Arcania Cost: <span id="' 
					+ spellbook[i].id + 'arcaniacostall">0</span></p></div></div>';

				document.getElementById("spellbook" 
				+ spellbook[i].type).innerHTML += '<div class="row"><div class="col-xs-12"><button class="btn ' 
				+ spellColor + ' btn-block" data-toggle="tooltip" data-placement="top" title="' 
				+ spellbook[i].description + '" onClick="spells.buySpell(\'' 
				+ spellbook[i].id + '\')"> Buy ' 
				+ spellbook[i].name + '</button></div><div class="col-xs-7"><p class="text-right">Arcania Cost: <span id="' 
				+ spellbook[i].id + 'arcaniacost">0</span></p></div></div>';
				this.updateSpellHtml(spellbook[i], false);
			}
			else if (spellbook[i].learned === true) {
				var spellColor = this.spellType(spellbook[i].type);
				document.getElementById("spellbook").innerHTML += '<div class="row"><div class="col-xs-12"><button class="btn ' 
				+ spellColor + ' btn-block" data-toggle="tooltip" data-placement="top" title="' 
				+ spellbook[i].description + '" onClick="spells.castSpell(\'' 
				+ spellbook[i].id + '\')">' + spellbook[i].name + ' <sup><span id="'+ spellbook[i].id +'levelall">0</span></sup></button>';
				spellbook[i].learned = true;
				this.updateSpellHtml(spellbook[i], true);
			}
		}
	}

    updateSpellHtml(spell, hasBought) {
		document.getElementById("arcania").innerHTML = Math.round(100 * arcania) / 100;
		if (!hasBought) {
			document.getElementById(spell.id + "arcaniacost").innerHTML = spell.arcaniaCost;
			document.getElementById(spell.id + "arcaniacostall").innerHTML = spell.arcaniaCost;
		}
		else {
			document.getElementById(spell.id + "levelall").innerHTML = spell.level + 1;
		}
	}

    updateSpellDescriptions(spellbook) {
		spellbook.forEach(spell => {
			let potencyValue;
			switch(spell.id) {
				case "cure":
					potencyValue = curePotency(spell);
					break;
				case "fireball":
					potencyValue = fireballPotency(spell);
					break;
				case "barrier":
					potencyValue = barrierPotency(spell);
					break;
				case "aegis":
					potencyValue = aegisPotency(spell);
					break;
				case "slow":
					potencyValue = slowPotency(spell);
					break;
				case "rage":
					potencyValue = ragePotency(spell);
					break;
				case "transmutation":
					potencyValue = transmutationPotency(spell);
					break;
				case "shadowball":
					potencyValue = shadowBallPotency(spell);
					break;
				default:
					potencyValue = "N/A"; // Default or error handling
			}
			if (spell.descriptionTemplate) {
				spell.description = spell.descriptionTemplate.replace("{potency}", potencyValue);
			}
		});
	}

    addSpell(spell) {
        if (!this.spellbook.find(s => s.name === spell.name)) {
            this.spellbook.push({ ...spell, learned: false, level: 0, nextLevel: 100, experience: 0 });
            debugLog(`Spell added: ${spell.name}`);
            this.save();
        } else {
            debugError(`Spell ${spell.name} already exists.`);
        }
    }

    castSpell(spellName, target) {
        const spell = this.spellbook.find(s => s.name === spellName && s.learned);
        if (spell) {
            if (this.player.mana >= spell.cost) {
                this.player.mana -= spell.cost;
                debugLog(`Casting ${spell.name}.`);
                switch (spell.effect) {
                    case "damage":
                        target.takeDamage(this.calculateSpellPower(spell));
                        break;
                    case "heal":
                        this.player.health = Math.min(this.player.health + this.calculateSpellPower(spell), this.player.health.maximumValue);
                        break;
                    default:
                        debugLog(`Spell ${spell.name} has an unrecognized effect.`);
                }
                this.gainExperience(spell, spell.cost);
                this.save();
            } else {
                debugError(`Not enough mana to cast ${spell.name}.`);
            }
        } else {
            debugError(`Spell ${spellName} not found or not learned.`);
        }
    }

    buySpell(spellId) {
        const spell = this.spellbook.find(s => s.id === spellId);
        if (spell && !spell.learned && this.arcania >= spell.cost) {
            spell.learned = true;
            this.arcania -= spell.cost;
            debugLog(`Spell ${spell.name} learned!`);
            this.save();
        } else {
            debugError(`Cannot learn spell ${spell ? spell.name : spellId} - insufficient arcania or already learned.`);
        }
    }

    calculateSpellPower(spell) {
        return spell.power + (spell.level * 5); 
    }

    gainExperience(spell, experience) {
        spell.experience += experience;
        while (spell.experience >= spell.nextLevel) {
            spell.experience -= spell.nextLevel;
            spell.level++;
            spell.nextLevel *= 2; 
            debugLog(`Spell ${spell.name} leveled up to ${spell.level}!`);
        }
    }
}