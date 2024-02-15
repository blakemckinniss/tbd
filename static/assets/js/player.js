var Player = function() {
	var name = "Crawler";
	var health = {currentValue: 100, maximumValue: 100};
	var mana = {currentValue: 50, maximumValue: 50};
	var strength = {level: 5, experience: 0, nextLevel: 100, bonus: 0};
	var dexterity = {level: 5, experience: 0, nextLevel: 100, bonus: 0};
	var constitution = {level: 5, experience: 0, nextLevel: 100, bonus: 0};
	var speed = {level: 5, experience: 0, nextLevel: 100, bonus: 0};
	var magic = {level: 5, experience: 0, nextLevel: 100, bonus: 0};
	var currentFloor = 1;
	var inBattle = false;
	var resting = false;
	var self = this;
	self.save = function() {
		var playerSave = {
			savedName: name,
			savedHealth: health,
			savedMana: mana,
			savedStrength: strength,
			savedDexterity: dexterity,
			savedConstitution: constitution,
			savedSpeed: speed,
			savedMagic: magic,
			savedCurrentFloor: currentFloor,
			savedInBattle: inBattle
		};
		localStorage.setItem("playerSave",JSON.stringify(playerSave));
	};
	self.load = function() {
		var playerSave = JSON.parse(localStorage.getItem("playerSave"));
		if (playerSave) {
			if (playerSave.savedName !== undefined) name = playerSave.savedName;
			else name = prompt("Please, enter your name:", "Crawler");
			if (playerSave.savedHealth !== undefined) loadHealth(playerSave.savedHealth);
			if (playerSave.savedMana !== undefined) loadMana(playerSave.savedMana);
			if (playerSave.savedStrength !== undefined) loadStrength(playerSave.savedStrength);
			if (playerSave.savedDexterity !== undefined) loadDexterity(playerSave.savedDexterity);
			if (playerSave.savedConstitution !== undefined) loadConstitution(playerSave.savedConstitution);
			if (playerSave.savedSpeed !== undefined) loadSpeed(playerSave.savedSpeed);
			if (playerSave.savedMagic !== undefined) loadMagic(playerSave.savedMagic);
			if (playerSave.savedCurrentFloor !== undefined) currentFloor = playerSave.savedCurrentFloor;
			if (playerSave.savedInBattle !== undefined) inBattle = playerSave.savedInBattle;
		} else {
			name = prompt("Please, enter your name:", "Crawler");
		}
	};
	var loadHealth = function(savedHealth) {
		if (savedHealth.currentValue !== undefined) health.currentValue = savedHealth.currentValue;
		if (savedHealth.maximumValue !== undefined) health.maximumValue = savedHealth.maximumValue;
	};
	var loadMana = function(savedMana) {
		if (savedMana.currentValue !== undefined) mana.currentValue = savedMana.currentValue;
		if (savedMana.maximumValue !== undefined) mana.maximumValue = savedMana.maximumValue;
	};
	var loadStrength = function(savedStrength) {
		if (savedStrength.level !== undefined) strength.level = savedStrength.level;
		if (savedStrength.experience !== undefined) strength.experience = savedStrength.experience;
		if (savedStrength.nextLevel !== undefined) strength.nextLevel = savedStrength.nextLevel;
		if (savedStrength.bonus !== undefined) strength.bonus = savedStrength.bonus;
	};
	var loadDexterity = function(savedDexterity) {
		if (savedDexterity.level !== undefined) dexterity.level = savedDexterity.level;
		if (savedDexterity.experience !== undefined) dexterity.experience = savedDexterity.experience;
		if (savedDexterity.nextLevel !== undefined) dexterity.nextLevel = savedDexterity.nextLevel;
		if (savedDexterity.bonus !== undefined) dexterity.bonus = savedDexterity.bonus;
	};
	var loadConstitution = function(savedConstitution) {
		if (savedConstitution.level !== undefined) constitution.level = savedConstitution.level;
		if (savedConstitution.experience !== undefined) constitution.experience = savedConstitution.experience;
		if (savedConstitution.nextLevel !== undefined) constitution.nextLevel = savedConstitution.nextLevel;
		if (savedConstitution.bonus !== undefined) constitution.bonus = savedConstitution.bonus;
	};
	var loadSpeed = function(savedSpeed) {
		if (savedSpeed.level !== undefined) speed.level = savedSpeed.level;
		if (savedSpeed.experience !== undefined) speed.experience = savedSpeed.experience;
		if (savedSpeed.nextLevel !== undefined) speed.nextLevel = savedSpeed.nextLevel;
		if (savedSpeed.bonus !== undefined) speed.bonus = savedSpeed.bonus;
	};
	var loadMagic = function(savedMagic) {
		if (savedMagic.level !== undefined) magic.level = savedMagic.level;
		if (savedMagic.experience !== undefined) magic.experience = savedMagic.experience;
		if (savedMagic.nextLevel !== undefined) magic.nextLevel = savedMagic.nextLevel;
		if (savedMagic.bonus !== undefined) magic.bonus = savedMagic.bonus;
	};

	//Getters
	self.getName = function() {
		return name;
	};

	self.getInBattle = function() {
		return inBattle;
	};

	self.getResting = function() {
		return resting;
	};

	self.getCurrentFloor = function() {
		return currentFloor;
	};

	self.getHealthCurrentValue = function() {
		return health.currentValue;
	};

	self.getHealthMaximumValue = function() {
		return health.maximumValue;
	};

	self.getManaCurrentValue = function() {
		return mana.currentValue;
	};

	self.getManaMaximumValue = function() {
		return mana.maximumValue;
	};

	self.getStrengthLevel = function() {
		return strength.level;
	};

	self.getDexterityLevel = function() {
		return dexterity.level;
	};

	self.getConstitutionLevel = function() {
		return constitution.level;
	};

	self.getSpeedLevel = function() {
		return speed.level;
	};

	self.getMagicLevel = function() {
		return magic.level;
	};

	self.getStrengthExperience = function() {
		return strength.experience;
	};

	self.getDexterityExperience = function() {
		return dexterity.experience;
	};

	self.getConstitutionExperience = function() {
		return constitution.experience;
	};

	self.getSpeedExperience = function() {
		return speed.experience;
	};

	self.getMagicExperience = function() {
		return magic.experience;
	};

	self.getStrengthBonus = function() {
		return strength.bonus;
	};

	self.getDexterityBonus = function() {
		return dexterity.bonus;
	};

	self.getConstitutionBonus = function() {
		return constitution.bonus;
	};

	self.getSpeedBonus = function() {
		return speed.bonus;
	};

	self.getMagicBonus = function() {
		return magic.bonus;
	};

	//Setters
	self.setInBattle = function(boolean) {
		inBattle = boolean;
	};

	self.setCurrentFloor = function(newFloor) {
		currentFloor = newFloor;
	};

	self.setHealthCurrentValue = function(newHealth) {
		if (newHealth > health.maximumValue) {
			newHealth = health.maximumValue;
		}
		health.currentValue = newHealth;
		loadConditionScreen("hp", health);
	};

	self.setHealthMaximumValue = function(newHealth) {
		health.maximumValue = newHealth;
		loadConditionScreen("hp", health);
	};

	self.setManaCurrentValue = function(newMana) {
		if (newMana > mana.maximumValue) {
			newMana = mana.maximumValue;
		}
		mana.currentValue = newMana;
		loadConditionScreen("mp", mana);
	};

	self.setManaMaximumValue = function(newMana) {
		mana.maximumValue = newMana;
		loadConditionScreen("mp", mana);
	};

	self.setStrengthExperience = function(experience) {
		strength.experience = experience;
		while (strength.experience >= strength.nextLevel) {
			strength.experience -= strength.nextLevel;
			setStrengthLevel(strength.level+1);
		}
		loadStatScreen("str", strength);
	};

	self.setDexterityExperience = function(experience) {
		dexterity.experience = experience;
		while (dexterity.experience >= dexterity.nextLevel) {
			dexterity.experience -= dexterity.nextLevel;
			setDexterityLevel(dexterity.level+1);
		}
		loadStatScreen("dex", dexterity);
	};

	self.setConstitutionExperience = function(experience) {
		constitution.experience = experience;
		while (constitution.experience >= constitution.nextLevel) {
			constitution.experience -= constitution.nextLevel;
			setConstitutionLevel(constitution.level+1);
		}
		loadStatScreen("con", constitution);
	};

	self.setSpeedExperience = function(experience) {
		speed.experience = experience;
		while (speed.experience >= speed.nextLevel) {
			speed.experience -= speed.nextLevel;
			setSpeedLevel(speed.level+1);
		}
		loadStatScreen("spd", speed);
	};

	self.setMagicExperience = function(experience) {
		magic.experience = experience;
		while (magic.experience >= magic.nextLevel) {
			magic.experience -= magic.nextLevel;
			setMagicLevel(magic.level+1);
		}
		loadStatScreen("mgc", magic);
	};

	var setStrengthLevel = function(newLevel) {
		strength.level = newLevel;
		strength.nextLevel = neededExperience(strength.level + 1);
		loadStatScreen("str", strength);
	};

	var setDexterityLevel = function(newLevel) {
		dexterity.level = newLevel;
		dexterity.nextLevel = neededExperience(dexterity.level + 1);
		loadStatScreen("dex", dexterity);
	};

	var setConstitutionLevel = function(newLevel) {
		constitution.level = newLevel;
		constitution.nextLevel = neededExperience(constitution.level + 1);
		self.setHealthMaximumValue(Math.pow(constitution.level + constitution.bonus,2) * 4);
		loadStatScreen("con", constitution);
	};

	var setSpeedLevel = function(newLevel) {
		speed.level = newLevel;
		speed.nextLevel = neededExperience(speed.level + 1);
		loadStatScreen("spd", speed);
	};

	var setMagicLevel = function(newLevel) {
		magic.level = newLevel;
		magic.nextLevel = neededExperience(magic.level + 1);
		spells.updateSpellbook();
		self.setManaMaximumValue(Math.pow(magic.level + magic.bonus,2) * 2);
		loadStatScreen("mgc", magic);
	};

	self.setStrengthBonus = function(bonus) {
		strength.bonus = bonus;
		loadStatScreen("str", strength);
	};

	self.setDexterityBonus = function(bonus) {
		dexterity.bonus = bonus;
		loadStatScreen("dex", dexterity);
	};

	self.setConstitutionBonus = function(bonus) {
		constitution.bonus = bonus;
		self.setHealthMaximumValue(Math.pow(constitution.level + constitution.bonus,2) * 4);
		loadStatScreen("con", constitution);
	};

	self.setSpeedBonus = function(bonus) {
		speed.bonus = bonus;
		loadStatScreen("spd", speed);
	};

	self.setMagicBonus = function(bonus) {
		magic.bonus = bonus;
		self.setManaMaximumValue(Math.pow(magic.level + magic.bonus,2) * 2);
		loadStatScreen("mgc", magic);
	};

	//Other Methods
	self.loadPlayerScreen = function() {
		// document.getElementById("name").innerHTML = name;
		loadStatScreen("str", strength);
		loadStatScreen("dex", dexterity);
		loadStatScreen("con", constitution);
		loadStatScreen("spd", speed);
		loadStatScreen("mgc", magic);
		loadConditionScreen("hp", health);
		loadConditionScreen("mp", mana);
	};

	var loadStatScreen = function(statId, statName) {
		document.getElementById(statId).innerHTML = Math.round(100*(statName.level + statName.bonus))/100;
		if ((Math.round(100*(100*(statName.experience/statName.nextLevel)))/100) > 5) {
			document.getElementById(statId + "per").innerHTML = Math.round(100*(100*(statName.experience/statName.nextLevel))/100) + "%";
			document.getElementById(statId + "per").style.display = "block";
		} else {
			document.getElementById(statId + "per").style.display = "none";
		}
		document.getElementById(statId + "prog").style.width = 100*(statName.experience/statName.nextLevel) + "%";
	};

	var loadConditionScreen = function(conditionId, conditionName) {
		document.getElementById(conditionId).innerHTML = Math.round(conditionName.currentValue);
		document.getElementById(conditionId + "max").innerHTML = Math.round(conditionName.maximumValue);
		document.getElementById(conditionId + "bar").style.width = 100*(conditionName.currentValue/conditionName.maximumValue) + "%";
	};

	var neededExperience = function(level) {
		return ((Math.pow(level, 2) + level) * 3);
	};

	self.rest = function() {
		console.log("Resting?");
		console.log("Resting: " + resting);
		if (resting) {
			console.log("Resting");
			console.log("Health: " + health.currentValue + "/" + health.maximumValue);
			self.setHealthCurrentValue(health.currentValue + (5*constitution.level * characterBuffs.get('RestingMultiplier')));
			self.setManaCurrentValue(mana.currentValue + (5*magic.level * characterBuffs.get('RestingMultiplier')));
			if (self.isFullyRested()) {
				self.toggleRest();
			}
		}
	};

	self.isFullyRested = function() {
		if (health.currentValue == health.maximumValue && mana.currentValue == mana.maximumValue) {
			return true;
		}
		return false;
	};

	self.loadExploreButton = function() {
		// Assuming 'inSession' and 'session' properties are accessible, possibly through a method or directly
		// Adjust the access method based on your actual implementation
		const inSession = tower.inSession;
		const sessionComplete = tower.session && tower.session.explored >= tower.session.size;
	
		const exploreButton = document.getElementById("exploreButton");
	
		// Check if the player is in a session and not currently in battle or resting
		if (inSession && !inBattle && !resting) {
			if (sessionComplete) {
				// If the session is complete, offer to claim the reward or find a monster (if applicable to your game design)
				exploreButton.innerHTML = '<button class="btn btn-default btn-block" onClick="tower.claimReward()">Claim Reward</button>';
			} else {
				// If the session is not complete, allow continuing exploration
				exploreButton.innerHTML = '<button class="btn btn-default btn-block" onClick="tower.explore()">Explore</button>';
			}
		} else if (inSession) {
			// If in a session but either in battle or resting, disable the explore button
			exploreButton.innerHTML = sessionComplete ?
				'<button class="btn btn-danger btn-block" disabled="disabled">Find Monster</button>' :
				'<button class="btn btn-danger btn-block" disabled="disabled">Explore</button>';
		} else {
			// If not in a session, clear the explore button or set it to a default state
			exploreButton.innerHTML = '';
		}
	};
	

	self.loadRestButton = function() {
		if (currentFloor !== 0) {
			if (inBattle) {
				document.getElementById("restButton").innerHTML = '<button class="btn btn-danger btn-block" disabled="disabled">Rest</button>';
			}
			else if (resting) {
				document.getElementById("restButton").innerHTML = '<button class="btn btn-success btn-block" onClick="player.toggleRest()">Stop Resting</button>';
			}
			else {
				document.getElementById("restButton").innerHTML = '<button class="btn btn-default btn-block" onClick="player.toggleRest()">Rest</button>';
			}
		}
		else {
			document.getElementById("restButton").innerHTML = '';
		}
	};

	self.gainExperience = function(monster, attacking) {
		var multiplier = characterBuffs.get('LevelingSpeedMultiplier');
		if (attacking) {
			self.setStrengthExperience(strength.experience + multiplier*(monster.strength/constitution.level));
			self.setDexterityExperience(dexterity.experience + multiplier*(monster.dexterity/dexterity.level));
		}
		else {
			self.setConstitutionExperience(constitution.experience + multiplier*(monster.strength/constitution.level));
		}
	};

	self.death = function(monster) {
		inBattle = false;
		if (monsters.getInBossBattle()) {
			monsters.setInBossBattle(false);
		}
		document.getElementById("combatLog").innerHTML += "You have been defeated by the " + monster.name + "!";
		if (system.getIdleMode()) {
			system.toggleIdle();
		}
		tower.abandonSession();
		upgrades.updateExcelia(-((100 - characterBuffs.get('ExceliaSavedOnDeath')) * upgrades.getExcelia())/100);
		loseStats(10 - characterBuffs.get('DeathPenaltyReduction'));
		loseAllExperience();
		monsters.loadMonsterInfo();
		spells.updateSpellbook();
		player.toggleRest();
	};

	var loseStats = function(percentage) {
		setStrengthLevel(strength.level - Math.floor(strength.level * (percentage/100)));
		setDexterityLevel(dexterity.level - Math.floor(dexterity.level * (percentage/100)));
		setConstitutionLevel(constitution.level - Math.floor(constitution.level * (percentage/100)));
		setSpeedLevel(speed.level - Math.floor(speed.level * (percentage/100)));
		setMagicLevel(magic.level - Math.floor(magic.level * (percentage/100)));
	};

	var loseAllExperience = function() {
		self.setStrengthExperience(0);
		self.setDexterityExperience(0);
		self.setConstitutionExperience(0);
		self.setSpeedExperience(0);
		self.setMagicExperience(0);
	};

	self.toggleRest = function() {
		resting = !resting;
		self.loadRestButton();
		self.loadExploreButton();
	};
};

var player = new Player();