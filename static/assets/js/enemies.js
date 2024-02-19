class Enemies {
    constructor() {
        this.instancedEnemy = '';
    }

    save() {
        const enemiesSave = {
            savedInstancedEnemy: this.instancedEnemy
        };
        localStorage.setItem(STORAGE_KEYS.ENEMIES, JSON.stringify(enemiesSave));
    }

    load() {
        const enemiesSave = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENEMIES));
        if (enemiesSave) {
            if (enemiesSave.savedInstancedEnemy !== undefined) {
                this.loadInstancedEnemy(enemiesSave.savedInstancedEnemy);
            }
        }
    }

    loadInstancedEnemy(savedInstancedEnemy) {
        const keys = ['name', 'currentHealth', 'maximumHealth', 'strength', 'dexterity', 'constitution', 'status'];
        keys.forEach(key => {
            if (savedInstancedEnemy[key] !== undefined) {
                this.instancedEnemy[key] = savedInstancedEnemy[key];
            }
        });
    }

    getEnemyList() {
        return player.currentMap.enemies;
    }

    getInstancedEnemy() {
        return this.instancedEnemy;
    }

    setInstancedEnemy(updatedEnemy) {
        this.instancedEnemy = updatedEnemy;
    }

    attackMelee() {
        if(player.inBattle) {
            this.battle(this.instancedEnemy, false);
        }
    }

    loadEnemyInfo(enemy = {}) {
        const elements = {
            enemyName: enemy.name || "None",
            enemyHp: Math.round(enemy.currentHealth) || "0",
            enemyStr: enemy.strength || "0",
            enemyDex: enemy.dexterity || "0",
            enemyCon: enemy.constitution || "0",
            enemyBar: `${100 * (enemy.currentHealth / enemy.maximumHealth) || 0}%`
        };
        Object.keys(elements).forEach(id => {
            if (id === 'enemyBar') {
                document.getElementById(id).style.width = elements[id];
            } else {
                document.getElementById(id).innerHTML = elements[id];
            }
        });
        if (enemy.name) {
            combatLog(`You are attacked by a ${enemy.name}!<br>`);
            player.inBattle = true;
            
        }
    }

    battle(enemy, spellCast) {
        if(!player.inBattle) {
            player.inBattle = true;
            this.loadEnemyInfo(enemy);
            if (characterBuffs.get('CastFireballInBattle')) {
                spells.castSpell("fireball");
            }
        } else {
            let isDead = spellCast ? false : this.playerAttacks(enemy);
            if (!isDead) {
                isDead = this.enemyAttacks(enemy);
            }
            buffs.updateTemporaryBuffs(true);
        }
    }

    playerAttacks(enemy) {
        let damage = this.damageFormula(player.strengthLevel + player.strengthValue.bonus, player.dexterityLevel + player.dexterity.bonus, enemy.constitution, enemy.currentHealth);
        if (characterBuffs.get('RageTimeLeft') !== 0) {
            damage *= 5;
        }
        document.getElementById("combatLog").innerHTML += `You dealt ${Math.round(damage)} damage to the ${enemy.name}.<br>`;
        player.gainExperience(enemy, true);
        return this.enemyTakeDamage(enemy, damage);
    }

    enemyTakeDamage(enemy, damage) {
        enemy.currentHealth -= damage;
        document.getElementById("enemyHp").innerHTML = Math.floor(enemy.currentHealth);
        document.getElementById("enemyBar").style.width = `${100 * (enemy.currentHealth / enemy.maximumHealth)}%`;
        if (enemy.currentHealth <= 0) {
            this.enemyDeath(enemy);
            return true;
        }
        return false;
    }

    enemyDeath(enemy) {
        player.inBattle(false);
        document.getElementById("combatLog").innerHTML += `You have defeated the ${enemy.name}!<br>`;
        if (Math.floor(Math.random() * 100) < 10) {
            this.enemyCrystalDrop(enemy);
            inventory.updateInventory();
        }
        upgrades.gainExcelia(enemy);
        player.loadRestButton();
        player.loadExploreButton();
        this.loadEnemyInfo();
    }

    enemyCrystalDrop(enemy) {
        const type = Math.floor(Math.random() * 5);
        const experience = enemy.strength + enemy.dexterity + enemy.constitution;
        const types = ["Strength", "Dexterity", "Constitution", "Speed", "Magic"];
        if (type < types.length) {
            inventory.createCrystal(types[type], experience);
        }
        document.getElementById("combatLog").innerHTML += `The ${enemy.name} has left an experience crystal behind!<br>`;
    }

    damageFormula(attackerStrength, attackerDexterity, defenderConstitution, defenderHealth) {
        const strengthWeight = 2, dexterityWeight = 0.1, constitutionWeight = 0.5;
        let damage = ((attackerStrength * strengthWeight) - (defenderConstitution * constitutionWeight)) * (attackerDexterity * dexterityWeight);
        damage = Math.max(0, Math.min(damage, defenderHealth));
        return damage;
    }

    enemyAttacks(enemy) {
        let damage = this.damageFormula(enemy.strength, enemy.dexterity, player.constitutionLevel + player.constitution.bonus, player.health.currentValue);
        damage = characterBuffs.get('RageTimeLeft') !== 0 ? damage * 2 : damage;
        if (characterBuffs.get('AegisTimeLeft') === 0) {
            this.applyDamage(damage, enemy);
        } else {
            document.getElementById("combatLog").innerHTML += `Aegis absorbed ${Math.round(damage)} damage from ${enemy.name}'s attack.<br>`;
        }
        player.gainExperience(enemy, false);
        return false;
    }

    applyDamage(damage, enemy) {
        let barrier = characterBuffs.get('BarrierLeft');
        if (barrier > 0) {
            if (barrier >= damage) {
                characterBuffs.set('BarrierLeft', barrier - damage);
                document.getElementById("combatLog").innerHTML += `Your barrier absorbed ${Math.round(damage)} damage from ${enemy.name}'s attack.<br>`;
            } else {
                document.getElementById("combatLog").innerHTML += `Your barrier absorbed ${Math.round(barrier)} damage from ${enemy.name}'s attack.<br>`;
                document.getElementById("combatLog").innerHTML += "Your barrier has shattered.<br>";
                damage -= barrier;
                characterBuffs.set('BarrierLeft', 0);
            }
            buffs.updateTemporaryBuffs(false);
            return;
        }
        player.healthValue.currentValue = player.health.currentValue - damage;
        document.getElementById("combatLog").innerHTML += `You took ${Math.round(damage)} damage from the ${enemy.name}'s attack.<br>`;
        if (player.health.currentValue <= 0) {
            player.death(enemy);
        }
    }

    battleChance(boolean) {
        if (boolean) {
            this.battle(this.getEnemy(), false);
            return true;
        } else {
            const check = Math.random() * 100;
            if (check <= Math.floor(10 + Math.random() * 40)) {
                this.battle(this.getEnemy(), false);
                return true;
            }
            return false;
        }
    }

    getEnemy() {
        const randomIndex = Math.floor(Math.random() * player.currentMap.enemies.length);
        const item = player.currentMap.enemies[randomIndex];
        player.currentMap.enemies.splice(randomIndex, 1);
        this.instancedEnemy = item;
        return item;
    }

    runAway() {
        if (player.inBattle) {
            combatLog("");
            const runRoll = Math.random() * (this.instancedEnemy.strength + this.instancedEnemy.dexterity + this.instancedEnemy.constitution);
            if (runRoll < player.speedLevel) {
                document.getElementById("combatLog").innerHTML += `You escaped from the battle against ${this.instancedEnemy.name}.`;
                this.loadEnemyInfo();
                player.speedValue.experience = player.speed.experience + runRoll;
                player.inBattle = false;
                document.querySelector("#battleScreen").style.display = "none";
                player.loadExploreButton();
                player.loadRestButton();
            } else {
                document.getElementById("combatLog").innerHTML += "You failed to run away.<br>";
                this.battle(this.instancedEnemy, true);
            }
        }
    }
}