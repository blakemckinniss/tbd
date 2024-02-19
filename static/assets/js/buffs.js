class Buffs {
    constructor() {
        this.load();
    }

    save() {
        const buffsSave = JSON.stringify(characterBuffs);
        localStorage.setItem(STORAGE_KEYS.BUFFS, buffsSave);
    }

    load() {
        const buffsSave = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUFFS));
        if (buffsSave) {
            Object.entries(buffsSave).forEach(([key, value]) => {
                characterBuffs.set(key, value);
            });
        }
    }

    updateTemporaryBuffs(decrease) {
        document.getElementById("temporary").innerHTML = '';

        ["AegisTimeLeft", "BarrierLeft", "RageTimeLeft"].forEach(buffName => {
            let buffValue = characterBuffs.get(buffName);
            if (buffValue !== 0) {
                if (decrease && ["AegisTimeLeft", "RageTimeLeft"].includes(buffName)) {
                    buffValue -= 1;
                    characterBuffs.set(buffName, buffValue);
                }
                document.getElementById("temporary").innerHTML += `<li class="list-group-item list-group-item-info"><span class="badge">${Math.round(buffValue)}</span>${buffName}</li>`;
            }
        });
    }

    updateToggleableBuffs() {
        document.getElementById("toggleable").innerHTML = '';
        ["CastFireballInBattle", "CastCureInBattle", "AutoBarrierCast"].forEach(buffName => {
            const condition = characterBuffs.get(buffName);
            const toggleStatusText = condition ? "ON" : "OFF";
            const label = buffName.replace(/([A-Z])/g, ' $1').trim();
            document.getElementById("toggleable").innerHTML += `<button type="button" class="list-group-item" onClick="buffs.toggleBuff('${buffName}')"><span class="badge">${toggleStatusText}</span>${label}</button>`;
        });
    }

    updatePermanentBuffs() {
        document.getElementById("permanent").innerHTML = '';
        const permanentBuffs = [
            { name: "DeathPenaltyReduction", label: "Death Penalty Reduction", isPercentage: true },
            { name: "ExceliaMultiplier", label: "Excelia Gain", isMultiplier: true },
            { name: "ExceliaSavedOnDeath", label: "Excelia Saved Upon Death", isPercentage: true },
            { name: "ManaPerSecond", label: "Exploration Mana per Second" },
            { name: "ExplorationSpeedMultiplier", label: "Exploration Speed", isMultiplier: true },
            { name: "RestingMultiplier", label: "Rest Speed", isMultiplier: true },
            { name: "SpellLevelingMultiplier", label: "Spell Level Gain", isMultiplier: true },
            { name: "LevelingSpeedMultiplier", label: "Stats Experience Gain", isMultiplier: true }
        ];

        permanentBuffs.forEach(buff => {
            const value = characterBuffs.get(buff.name);
            if (value !== 0 && value !== 1) {
                const badgeText = buff.isMultiplier ? `x${value}` : (buff.isPercentage ? `${value}%` : `+${value}`);
                document.getElementById("permanent").innerHTML += `<li class="list-group-item"><span class="badge">${badgeText}</span>${buff.label}</li>`;
            }
        });
    }

    toggleBuff(buffId) {
        const current = characterBuffs.get(buffId);
        characterBuffs.set(buffId, !current);
        this.updateToggleableBuffs();
    }
}