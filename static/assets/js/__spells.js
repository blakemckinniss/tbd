var Spells = function () {
	var arcania = 0;
	var spellbook = globalSpellData.sort((a, b) => a.type - b.type) || []; // Use passed data or default to empty array
	console.log("Spells loaded");
	console.log(spellbook);

	var self = this;
	//Save Method
	self.save = function () {
		var spellsSave = {
			savedArcania: arcania,
			savedSpellbook: spellbook
		};
		localStorage.setItem("spellsSave", JSON.stringify(spellsSave));
	};

	//Load Method
	self.load = function () {
		var spellsSave = JSON.parse(localStorage.getItem("spellsSave"));
		if (spellsSave) {
			if (spellsSave.savedArcania !== undefined) {
				arcania = spellsSave.savedArcania;
			}
			if (spellsSave.savedSpellbook !== undefined) {
				loadSpellbook(spellsSave.savedSpellbook);
			}
		}
	};

	var loadSpellbook = function (savedSpellbook) {
		console.log("Loading spellbook");
		var success = false;
		for (var i = 0; i < savedSpellbook.length; i++) {
			if (i == spellbook.length) {
				break;
			}
			for (var j = 0; j < spellbook.length; j++) {
				if (spellbook[j].id == savedSpellbook[i].id) {
					success = true;
					break;
				}
			}
			if (success) {
				if (savedSpellbook[i].learned !== undefined) {
					spellbook[j].learned = savedSpellbook[i].learned;
				}
				if (savedSpellbook[i].experience !== undefined) {
					spellbook[j].experience = savedSpellbook[i].experience;
				}
				if (savedSpellbook[i].nextLevel !== undefined) {
					spellbook[j].nextLevel = savedSpellbook[i].nextLevel;
				}
				if (savedSpellbook[i].level !== undefined) {
					spellbook[j].level = savedSpellbook[i].level;
				}
			}
			success = false;
		}
	};

	//Getters

	//Setters
	self.setArcania = function (number) {
		arcania = number;
		document.getElementById("arcania").innerHTML = Math.round(100 * arcania) / 100;
	};

	function updateSpellDescriptions(spellbook) {
		console.log("Updating spell descriptions");
		console.log(spellbook);
		spellbook.forEach(spell => {
			let potencyValue;
			
			// Determine the potency based on the spell id
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
	
			// Replace the placeholder in the template with the actual potency value
			if (spell.descriptionTemplate) {
				spell.description = spell.descriptionTemplate.replace("{potency}", potencyValue);
			}
		});
	}

	var spellType = function (type) {
		if (type === 0) {
			return "btn-info";
		}
		else if (type == 1) {
			return "btn-danger";
		}
		else if (type == 2) {
			return "btn-warning";
		}
		else if (type == 3) {
			return "btn-success";
		}
	};

	var findSpell = function (spellId) {
		for (var i = 0; i < spellbook.length; i++) {
			if (spellbook[i].id == spellId) {
				return i;
			}
		}
	};

	var spellCost = function (spell) {
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
	};

	var levelSpell = function (spell, experience) {
		spell.experience += experience;
		while (spell.experience >= spell.nextLevel) {
			spell.level++;
			spell.experience -= spell.nextLevel;
			spell.nextLevel = Math.pow(2, spell.level) * spell.baseNextLevel;
			self.updateSpellbook();
		}
		updateSpellHtml(spell, true);
	};

	self.updateSpellbook = function () {
		document.getElementById("spellbook").innerHTML = '';
		for (var i = 0; i <= 3; i++) {
			document.getElementById("spellbook" + i).innerHTML = '';
		}
		updateSpellDescriptions(spellbook);
		for (i = 0; i < spellbook.length; i++) {
			if (player.magic.level >= spellbook[i].requiredMagic && spellbook[i].learned === false) {
				var spellColor = spellType(spellbook[i].type);
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
				updateSpellHtml(spellbook[i], false);
			}
			else if (spellbook[i].learned === true) {
				var spellColor = spellType(spellbook[i].type);
				document.getElementById("spellbook").innerHTML += '<div class="row"><div class="col-xs-12"><button class="btn ' 
				+ spellColor + ' btn-block" data-toggle="tooltip" data-placement="top" title="' 
				+ spellbook[i].description + '" onClick="spells.castSpell(\'' 
				+ spellbook[i].id + '\')">' + spellbook[i].name + ' <sup><span id="'+ spellbook[i].id +'levelall">0</span></sup></button>';

				document.getElementById("spellbook" + spellbook[i].type).innerHTML += '<div class="row"><div class="col-xs-12"><button class="btn ' 
				+ spellColor + ' btn-block" data-toggle="tooltip" data-placement="top" title="' 
				+ spellbook[i].description + '" onClick="spells.castSpell(\'' + spellbook[i].id + '\')">' 
				+ spellbook[i].name + '<sup><span id="'+ spellbook[i].id +'level">0</span></sup></button>';
				spellbook[i].learned = true;
				updateSpellHtml(spellbook[i], true);
			}
		}

		$(document).ready(function () {
			$('[data-toggle="tooltip"]').tooltip();
		});
	};

	var updateSpellHtml = function (spell, hasBought) {
		document.getElementById("arcania").innerHTML = Math.round(100 * arcania) / 100;
		if (!hasBought) {
			document.getElementById(spell.id + "arcaniacost").innerHTML = spell.arcaniaCost;
			document.getElementById(spell.id + "arcaniacostall").innerHTML = spell.arcaniaCost;
		}
		else {
			// document.getElementById(spell.id + "costall").innerHTML = spellCost(spell);
			// document.getElementById(spell.id + "cost").innerHTML = spellCost(spell);
			// document.getElementById(spell.id + "xpall").style.width = 100*(spell.experience/spell.nextLevel) + "%";
			// document.getElementById(spell.id + "progall").innerHTML = Math.round(100 * (100 * (spell.experience/spell.nextLevel)))/100 + "%";
			document.getElementById(spell.id + "levelall").innerHTML = spell.level + 1;
			// document.getElementById(spell.id + "xp").style.width = 100*(spell.experience/spell.nextLevel) + "%";
			// document.getElementById(spell.id + "prog").innerHTML = Math.round(100 * (100 * (spell.experience/spell.nextLevel)))/100 + "%";
			document.getElementById(spell.id + "level").innerHTML = spell.level + 1;
		}
	};

	self.isSpellLearned = function (spellId) {
		if (spellId === "") {
			return true;
		}
		else {
			for (var i = 0; i < spellbook.length; i++) {
				if (spellbook[i].id == spellId) {
					return spellbook[i].learned;
				}
			}
			return false;
		}
	};

	self.castSpell = function (spellId) {
		var spell = findSpell(spellId);
		var manaCost = spellCost(spellbook[spell]);

		if (player.mana.currentValue >= manaCost && characterBuffs.get('RageTimeLeft') === 0 && self.isSpellLearned(spellId)) {
			var castSuccessful;
			if (spellbook[spell].id == "cure") {
				castSuccessful = castCure(spellbook[spell]);
			}
			else if (spellbook[spell].id == "fireball") {
				castSuccessful = castFireball(spellbook[spell]);
			}
			else if (spellbook[spell].id == "barrier") {
				castSuccessful = castBarrier(spellbook[spell]);
			}
			else if (spellbook[spell].id == "slow") {
				castSuccessful = castSlow(spellbook[spell]);
			}
			else if (spellbook[spell].id == "aegis") {
				castSuccessful = castAegis(spellbook[spell]);
			}
			else if (spellbook[spell].id == "rage") {
				castSuccessful = castRage(spellbook[spell]);
			}
			else if (spellbook[spell].id == "transmutation") {
				castSuccessful = castTransmutation(spellbook[spell]);
			}
			else if (spellbook[spell].id == "shadowball") {
				castSuccessful = castShadowBall(spellbook[spell]);
			}
			if (castSuccessful) {
				if (spellbook[spell].id !== "transmutation") {
					arcania += spellbook[spell].level + manaCost / 100;
				}
				player.manaValue.currentValue(player.mana.currentValue - manaCost);
				levelSpell(spellbook[spell], characterBuffs.get('SpellLevelingMultiplier') * manaCost);
				player.magicValue.experience = player.magic.experience + characterBuffs.get('LevelingSpeedMultiplier') * (spellbook[spell].level + 1 + manaCost / 10);
				return true;
			}
		}
		return false;
	};

	self.buySpell = function (spellId) {
		var spell = findSpell(spellId);
		if (arcania >= spellbook[spell].arcaniaCost) {
			self.setArcania(arcania - spellbook[spell].arcaniaCost);
			spellbook[spell].learned = true;
		}
		self.updateSpellbook();
	}

	var castCure = function (cure) {
		var currentHealth = player.health.currentValue;
		var maximumHealth = player.mana.maximumValue;
		if (currentHealth == maximumHealth) {
			return false;
		}
		else {
			var cureValue = curePotency(cure);
			if (maximumHealth - currentHealth < cureValue) {
				cureValue = maximumHealth - currentHealth;
			}
			player.health.currentValue(currentHealth + cureValue);
			if (player.inBattle) {
				document.getElementById("combatLog").innerHTML = '';
				document.getElementById("combatLog").innerHTML += "You healed yourself for " + Math.round(cureValue) + " HP with Cure.<br>";
				enemies.battle(enemies.getInstancedEnemy(), true);
			}
			return true;
		}
	};

	var curePotency = function (cure) {
		var cureBasePotency = 25;
		var cureLevelPotency = 15 * cure.level;
		var cureMagicPotency = 3 * (player.magic.level + player.magic.bonus - 5);
		return Math.floor(cureBasePotency + cureLevelPotency + cureMagicPotency);
	};

	var castFireball = function (fireball) {
		if (!player.inBattle) {
			return false;
		}
		else {
			var enemy = enemies.getInstancedEnemy();
			var fireballDamage = fireballPotency(fireball);
			if (enemy.currentHealth <= fireballDamage) {
				fireballDamage = enemy.currentHealth;
			}
			document.getElementById("combatLog").innerHTML = '';
			document.getElementById("combatLog").innerHTML += "Your fireball hit the " + enemy.name + " for " + Math.floor(fireballDamage) + " damage.<br>";
			if (!enemies.enemyTakeDamage(enemies.getInstancedEnemy(), fireballDamage)) {
				enemies.battle(enemies.getInstancedEnemy(), true);
			}
			return true;
		}
	};

	var fireballPotency = function (fireball) {
		var fireballBasePotency = 15;
		var fireballLevelPotency = 5 * fireball.level;
		var fireballMagicPotency = 1 * (player.magic.level + player.magic.bonus - 5);
		return Math.floor(fireballBasePotency + fireballLevelPotency + fireballMagicPotency);
	};

	var castBarrier = function (barrier) {
		var barrierValue = barrierPotency(barrier);
		if (characterBuffs.get('BarrierLeft') == barrierValue) {
			return false;
		}
		else {
			characterBuffs.set('BarrierLeft', barrierValue);
			buffs.updateTemporaryBuffs(false);
			if (player.inBattle) {
				document.getElementById("combatLog").innerHTML = '';
				document.getElementById("combatLog").innerHTML += "You created a magical barrier.<br>";
				enemies.battle(enemies.getInstancedEnemy(), true);
			}
			return true;
		}
	};

	var barrierPotency = function (barrier) {
		var barrierBasePotency = 50;
		var barrierLevelPotency = 50 * barrier.level;
		var barrierMagicPotency = 10 * (player.magic.level + player.magic.bonus - 10);
		return Math.floor(barrierBasePotency + barrierLevelPotency + barrierMagicPotency);
	};

	var castAegis = function (aegis) {
		if (characterBuffs.get('AegisTimeLeft') !== 0) {
			return false;
		}
		else {
			characterBuffs.set('AegisTimeLeft', aegisPotency(aegis));
			buffs.updateTemporaryBuffs(false);
			if (player.inBattle) {
				document.getElementById("combatLog").innerHTML = '';
				document.getElementById("combatLog").innerHTML += "You summon the heavenly shield, Aegis.<br>";
				enemies.battle(enemies.getInstancedEnemy(), true);
			}
			return true;
		}
	};

	var aegisPotency = function (aegis) {
		var aegisBasePotency = 5;
		var aegisLevelPotency = 1 * aegis.level;
		var aegisMagicPotency = 0.2 * (player.magic.level + player.magic.bonus - 50);
		return Math.floor(aegisBasePotency + aegisLevelPotency + aegisMagicPotency);
	};

	var castSlow = function (slow) {
		var enemy = enemies.getInstancedEnemy();
		if (!player.inBattle || enemy.dexterity <= 1) {
			return false;
		}
		else {
			var slowEffect = slowPotency(slow);
			if (enemy.dexterity <= slowEffect) {
				slowEffect = enemy.dexterity - 1;
			}
			enemy.dexterity -= slowEffect;
			document.getElementById("enemyDex").innerHTML = enemy.dexterity;
			document.getElementById("combatLog").innerHTML = '';
			document.getElementById("combatLog").innerHTML += "You have cast slow on the " + enemy.name + ". Its dexterity has been lowered by " + slowEffect + ".<br>";
			enemies.setInstancedEnemy(enemy);
			enemies.battle(enemies.getInstancedEnemy(), true);
			return true;
		}
	};

	var slowPotency = function (slow) {
		var slowBasePotency = 5;
		var slowLevelPotency = 1 * slow.level;
		var slowMagicPotency = 0.2 * (player.magic.level + player.magic.bonus - 20);
		return Math.floor(slowBasePotency + slowLevelPotency + slowMagicPotency);
	};

	var castRage = function (rage) {
		if (!player.inBattle) {
			return false;
		}
		else {
			characterBuffs.set('RageTimeLeft', ragePotency(rage));
			buffs.updateTemporaryBuffs(false);
			document.getElementById("combatLog").innerHTML = '';
			document.getElementById("combatLog").innerHTML += "You have entered a state of frenzy!<br>";
			enemies.battle(enemies.getInstancedEnemy(), true);
			return true;
		}
	};

	var ragePotency = function (rage) {
		var rageBasePotency = 5;
		var rageLevelPotency = 1 * rage.level;
		var rageMagicPotency = 0.2 * (player.magic.level + player.magic.bonus - 25);
		return Math.floor(rageBasePotency + rageLevelPotency + rageMagicPotency);
	};

	var castTransmutation = function (transmutation) {
		if (arcania < 100 || player.inBattle) {
			return false;
		}
		else {
			self.setArcania(arcania - 100);
			inventory.setGold(inventory.getGold() + transmutationPotency(transmutation));
			return true;
		}
	};

	var transmutationPotency = function (transmutation) {
		var transmutationBasePotency = 1;
		var transmutationLevelPotency = 1 * transmutation.level;
		var transmutationMagicPotency = 0.2 * (player.magic.level + player.magic.bonus - 5);
		return Math.floor(transmutationBasePotency + transmutationLevelPotency + transmutationMagicPotency);
	};

	var castShadowBall = function (shadowBall) {
		if (!player.inBattle) {
			return false;
		}
		else {
			var enemy = enemies.getInstancedEnemy();
			var shadowBallDamage = shadowBallPotency(shadowBall);
			if (enemy.currentHealth <= shadowBallDamage) {
				shadowBallDamage = enemy.currentHealth;
			}
			document.getElementById("combatLog").innerHTML = '';
			document.getElementById("combatLog").innerHTML += "Your shadow ball hit the " + enemy.name + " for " + Math.floor(shadowBallDamage) + " damage.<br>";
			if (!enemies.enemyTakeDamage(enemies.getInstancedEnemy(), shadowBallDamage)) {
				enemies.battle(enemies.getInstancedEnemy(), true);
			}
			return true;
		}
	};

	var shadowBallPotency = function (shadowBall) {
		var shadowBallBasePotency = 300;
		var shadowBallLevelPotency = 50 * shadowBall.level;
		var shadowBallMagicPotency = 10 * (player.magic.level + player.magic.bonus - 30);
		return Math.floor(shadowBallBasePotency + shadowBallLevelPotency + shadowBallMagicPotency);
	};
};
