var characterBuffs = (function () {
	let properties = {
		CastFireballInBattle: false,
		RageTimeLeft: 0,
		SpellLevelingMultiplier: 1,
		BarrierLeft: 0,
		AegisTimeLeft: 0,
		CastCureInBattle: false,
		ExceliaMultiplier: 1,
		ManaPerSecond: 0,
		ExceliaSavedOnDeath: 0,
		RestingMultiplier: 1,
		DeathPenaltyReduction: 0,
		AutoBarrierCast: false,
		LevelingSpeedMultiplier: 1,
		ExplorationSpeedMultiplier: 1
	};

	return {
		get: function (propertyName) {
			return properties[propertyName];
		},
		set: function (propertyName, value) {
			properties[propertyName] = value;
		}
	};
})();


class Buffs {
    constructor() {
        // Multipliers
        this.exceliaMultiplier = 1;
        this.spellLevelingMultiplier = 1;
        this.restingMultiplier = 1;
        this.levelingSpeedMultiplier = 1;
        this.explorationSpeedMultiplier = 1;

        // Adders
        this.manaPerSecond = 0;

        // Percenters
        this.exceliaSavedOnDeath = 0;
        this.deathPenaltyReduction = 0;

        // Toggleables
        this.castCureInBattle = false;
        this.castFireballInBattle = false;
        this.autoBarrierCast = false;

        // Timed Buffs
        this.aegisTimeLeft = 0;
        this.rageTimeLeft = 0;

        // Non-timed Temporary Buffs
        this.barrierLeft = 0;

        // Ensure methods are bound correctly
        this.updateTemporaryBuffs = this.updateTemporaryBuffs.bind(this);
        this.updateToggleableBuffs = this.updateToggleableBuffs.bind(this);
        this.updatePermanentBuffs = this.updatePermanentBuffs.bind(this);
        this.toggleBuff = this.toggleBuff.bind(this);
    }

    save() {
        const buffsSave = JSON.stringify(this);
        localStorage.setItem("buffsSave", buffsSave);
    }

    load() {
        const buffsSave = JSON.parse(localStorage.getItem("buffsSave"));
        if (buffsSave) {
            Object.assign(this, buffsSave);
        }
    }

    updateTemporaryBuffs(decrease) {
        document.getElementById("temporary").innerHTML = '';

        if (characterBuffs.get("AegisTimeLeft") !== 0) {
            if (decrease) {
                characterBuffs.set("AegisTimeLeft", characterBuffs.get("AegisTimeLeft") - 1);
            }
            document.getElementById("temporary").innerHTML += `<li class="list-group-item list-group-item-info"><span class="badge">${Math.round(characterBuffs.get("AegisTimeLeft"))}</span>Aegis</li>`;
        }

        if (characterBuffs.get("BarrierLeft") !== 0) {
            document.getElementById("temporary").innerHTML += `<li class="list-group-item list-group-item-info"><span class="badge">${Math.round(characterBuffs.get("BarrierLeft"))}</span>Barrier</li>`;
        }

        if (characterBuffs.get("RageTimeLeft") !== 0) {
            if (decrease) {
                characterBuffs.set("RageTimeLeft", characterBuffs.get("RageTimeLeft") - 1);
            }
            document.getElementById("temporary").innerHTML += `<li class="list-group-item list-group-item-info"><span class="badge">${Math.round(characterBuffs.get("RageTimeLeft"))}</span>Rage</li>`;
        }
    }

    updateToggleableBuffs() {
        document.getElementById("toggleable").innerHTML = '';
        var toggleStatusText;

        const updateButton = (condition, buffId, label) => {
            if (condition) {
                toggleStatusText = "ON";
            } else {
                toggleStatusText = "OFF";
            }
            document.getElementById("toggleable").innerHTML += `<button type="button" class="list-group-item" onClick="buffs.toggleBuff('${buffId}')"><span class="badge">${toggleStatusText}</span>${label}</button>`;
        };

        updateButton(this.castFireballInBattle || upgrades.isUpgradePurchased("autoshoot"), "castFireballInBattle", "Auto-Shooting");
        updateButton(this.castCureInBattle || upgrades.isUpgradePurchased("battlehealing"), "castCureInBattle", "Battle Healing");
        updateButton(this.autoBarrierCast || upgrades.isUpgradePurchased("barriercast"), "autoBarrierCast", "Barrier Casting");
    }

    updatePermanentBuffs() {
        document.getElementById("permanent").innerHTML = '';
        const updateListItem = (condition, label, value, isMultiplier = false) => {
            if (condition !== 0) {
                const badgeText = isMultiplier ? `x${value}` : `+${value}`;
                document.getElementById("permanent").innerHTML += `<li class="list-group-item"><span class="badge">${badgeText}</span>${label}</li>`;
            }
        };

        updateListItem(this.deathPenaltyReduction !== 0, "Death Penalty Reduction", this.deathPenaltyReduction + '%');
        updateListItem(this.exceliaMultiplier !== 1, "Excelia Gain", this.exceliaMultiplier, true);
        updateListItem(this.exceliaSavedOnDeath !== 0, "Excelia Saved Upon Death", this.exceliaSavedOnDeath + '%');
        updateListItem(this.manaPerSecond !== 0, "Exploration Mana per Second", this.manaPerSecond);
        updateListItem(this.explorationSpeedMultiplier !== 1, "Exploration Speed", this.explorationSpeedMultiplier, true);
        updateListItem(this.restingMultiplier !== 1, "Rest Speed", this.restingMultiplier, true);
        updateListItem(this.spellLevelingMultiplier !== 1, "Spell Level Gain", this.spellLevelingMultiplier, true);
        updateListItem(this.levelingSpeedMultiplier !== 1, "Stats Experience Gain", this.levelingSpeedMultiplier, true);
    }

    toggleBuff(buffId) {
        this[buffId] = !this[buffId];
        this.updateToggleableBuffs();
    }
}

var buffs = new Buffs();
