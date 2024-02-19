class Inventory {
    constructor() {
        this.gold = 10;
        this.maps = 10;
        this.roses = 10;
        this.keys = 10;
        this.bag = [];
        this.keyPrice = 100;
        this.consumablePrice = 1000;
        this.equippedWeapon = null;
        this.equippedArmor = null;
        this.equippedAccessory = null;
        this.sellMode = false;
    }
    
    save() {
        const inventorySave = {
            savedGold: this.gold,
            savedBag: this.bag,
            savedKeys: this.keys,
            savedEquippedWeapon: this.equippedWeapon,
            savedEquippedArmor: this.equippedArmor,
            savedEquippedAccessory: this.equippedAccessory,
        };
        localStorage.setItem("inventorySave", JSON.stringify(inventorySave));
    }
    
    load() {
        const inventorySave = JSON.parse(localStorage.getItem("inventorySave"));
        if (inventorySave) {
            this.gold = inventorySave.savedGold ?? this.gold;
            this.bag = inventorySave.savedBag ?? this.bag;
            this.keys = inventorySave.savedKeys ?? this.keys;
            this.equippedWeapon = inventorySave.savedEquippedWeapon ?? this.equippedWeapon;
            this.equippedArmor = inventorySave.savedEquippedArmor ?? this.equippedArmor;
            this.equippedAccessory = inventorySave.savedEquippedAccessory ?? this.equippedAccessory;
        }
    }
    
    getGold() {
        return this.gold;
    }

    getKeys() {
        return this.keys;
    }

    getMaps() {
        return this.maps;
    }

    getRoses() {
        return this.roses;
    }

    getBag() {
        return this.bag;
    }
    
    setGold(newGold) {
        this.gold = newGold;
        this.updateInventoryHTML();
    }

    setKeys(newKeys) {
        this.keys = newKeys;
        this.updateInventoryHTML();
    }
    
    printItem(item, index, sellMode) {
        const tooltip = this.generateTooltip(item);
        const price = this.calculatePrice(item, sellMode);
        const badgeText = sellMode ? price : this.getBadgeText(item.type);
        const action = sellMode ? `inventory.sell(${index}, ${price})` : this.getAction(item.type, index);
        const buttonClass = sellMode ? "list-group-item list-group-item-success" : "list-group-item";
        const itemName = sellMode ? item.name : this.getItemName(item);
        const buttonHTML = `<button type="button" class="${buttonClass}" data-toggle="tooltip" title="${tooltip}" onClick="${action}"><span class="badge">${badgeText}</span> ${itemName}</button>`;
        return buttonHTML;
    }

    updateInventoryHTML() {
        const goldElement = document.getElementById("pGold");
        const keysElement = document.getElementById("pKeys");
        if (goldElement) goldElement.textContent = this.getGold();
        if (keysElement) keysElement.textContent = this.getKeys();

		setSync("#pGold");
		setSync("#pKeys");
		setSync("#pMaps");
		setSync("#pRoses");
        setSync("#pSkills");
        setSync("#arcania");

    }

    updateShop() {
        const sellButton = document.getElementById("sellbutton");
        const keyPriceElement = document.getElementById("keyprice");
        const consumablePriceElement = document.getElementById("consumableprice");
        
        if (sellButton) {
            sellButton.onclick = null;
            sellButton.onclick = () => {
                this.updateInventory(!this.sellMode); 
                this.updateShopUI(); 
            };
            sellButton.textContent = this.sellMode ? "Exit Sell Mode" : "Enter Sell Mode";
        }
    
        if (keyPriceElement) {
            keyPriceElement.textContent = `Key Price: ${this.keyPrice}`;
        }
    
        if (consumablePriceElement) {
            consumablePriceElement.textContent = `Consumable Price: ${this.consumablePrice}`;
        }
        
        this.updateShopUI();
    }

    updateInventory(sellMode) {
        this.sellMode = sellMode;
        this.updateShop();
        let inventoryHTML = "";
    
        this.bag.slice(0, 50).forEach((item, index) => {
            inventoryHTML += this.printItem(item, index, this.sellMode);
        });
    
        const inventoryElement = document.getElementById("inventory");
        if (inventoryElement) {
            inventoryElement.innerHTML = inventoryHTML;
        }
    
        $(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip({html: true});
        });
    }

    updateShopUI() {
        const sellButton = document.getElementById("sellbutton");
        if (sellButton) {
            sellButton.innerHTML = this.sellMode
                ? '<button class="btn btn-block btn-success" onClick="inventory.toggleSellMode()">Exit Sell Mode</button>'
                : '<button class="btn btn-block btn-success" onClick="inventory.toggleSellMode()">Enter Sell Mode</button>';
        }
        
        const keyPriceElement = document.getElementById("keyprice");
        const consumablePriceElement = document.getElementById("consumableprice");
    
        if (keyPriceElement) {
            keyPriceElement.textContent = `Key Price: ${this.keyPrice}`;
        }
        if (consumablePriceElement) {
            consumablePriceElement.textContent = `Consumable Price: ${this.consumablePrice}`;
        }
        this.attachEventListeners();
    }

    attachEventListeners() {
        const sellButton = document.getElementById("sellbutton");
        if (sellButton) {
            sellButton.addEventListener('click', () => this.toggleSellMode());
        }
    }

    toggleSellMode() {
        this.sellMode = !this.sellMode;
        this.updateInventory(this.sellMode);
        this.updateShopUI();
    }


    generateTooltip(item) {
        switch (item.type) {
            case "chest":
                return `Chest rarity: ${item.rarity}<br>The higher the rarity, the better the stats of the item inside will be.`;
            case "weapon":
            case "armor":
                return `Bonus STR: ${this.formatStat(item.damage * item.rarity)}<br>Bonus DEX: ${this.formatStat(item.speed * item.rarity)}<br>Bonus CON: ${this.formatStat(item.defense * item.rarity)}<br>Bonus MGC: ${this.formatStat(item.magic * item.rarity)}`;
            case "consumable":
                return `This consumable will grant ${item.experience} experience in ${item.stat}.`;
            default:
                return "";
        }
    }

    calculatePrice(item, sellMode) {
        if (!sellMode) return "";
        switch (item.type) {
            case "chest":
                return item.rarity;
            case "weapon":
            case "armor":
                return Math.round((item.damage + item.speed + item.defense + item.magic) * 5 * item.rarity);
            case "consumable":
                return Math.round(item.experience / 2);
            default:
                return 0;
        }
    }

    getBadgeText(type) {
        switch (type) {
            case "chest": return "Open";
            case "weapon": return "Weapon";
            case "armor": return "Armor";
            case "consumable": return "Consumable";
            default: return "";
        }
    }

    getAction(type, index) {
        switch (type) {
            case "chest": return `inventory.openChest(${index})`;
            case "weapon": return `inventory.equipWeapon(${index})`;
            case "armor": return `inventory.equipArmor(${index})`;
            case "consumable": return `inventory.useConsumable(${index})`;
            default: return "";
        }
    }

    getItemName(item) {
        return item.name + (item.type === "consumable" ? " Experience Consumable" : "");
    }

    formatStat(stat) {
        return Math.round(100 * stat) / 100;
    }

    openChest(index) {
        if (this.keys > 0) {
            const type = Math.floor(Math.random() * 4); 
            const rarity = this.bag[index].rarity;

            switch (type) {
                case 0:
                    this.bag.push(this.createWeapon(rarity));
                    break;
                case 1:
                    this.bag.push(this.createArmor(rarity));
                    break;
                case 2:
                    this.createAccessory(rarity); 
                    break;
                case 3:
                    this.createEnhancingStone(rarity); 
                    break;
            }

            this.bag.splice(index, 1); 
            this.updateInventory(this.sellMode);
            this.setKeys(this.keys - 1);
        }
    }

    createWeapon(points) {
        let weapon = this.initializeItem("weapon");
        this.distributePoints(weapon, points, ["damage", "speed", "defense", "magic"]);
        weapon.name = this.nameItem(weapon);
        return weapon;
    }

    createArmor(points) {
        let armor = this.initializeItem("armor");
        this.distributePoints(armor, points, ["defense", "movement", "magic"]);
        armor.name = this.nameItem(armor);
        return armor;
    }

    initializeItem(type) {
        return { type, name: "", damage: 0, speed: 0, defense: 0, magic: 0, movement: 0, rarity: this.equipmentRarity() };
    }

    distributePoints(item, points, attributes) {
        while (points > 0) {
            const roll = Math.floor(Math.random() * attributes.length);
            const attr = attributes[roll];
            item[attr] += 0.1 * Math.round(points / 2);
            points -= Math.round(points / 2);
        }
    }

    equipmentRarity() {
        const rarity = Math.floor(Math.random() * 101);
        return rarity;
    }

    nameItem(item) {
        const highestStat = Math.max(...Object.values(item).filter(value => typeof value === "number"));
        const baseName = this.nameRarity(item) + this.nameBasedOnStat(highestStat, item);
        item.name = baseName + this.typeSpecificName(item);
        return item.name;
    }

    nameRarity(item) {
        const rarity = this.equipmentRarity();
        item.rarity = rarity;
        if (rarity < 50) return "";
        if (rarity < 75) return "Uncommon ";
        if (rarity < 90) return "Rare ";
        if (rarity < 100) return "Epic ";
        return "Legendary ";
    }

    nameBasedOnStat(stat, item) {
        let name = "";
        const adjustedStat = stat * 10;
        name += this.nameAdjective(Math.floor(adjustedStat % 10));

        if (item.type === "weapon") {
            name += this.nameMaterialAttribute(adjustedStat, ["Wooden", "Copper", "Iron", "Steel"]);
        } else if (item.type === "armor") {
            name += this.nameMaterialAttribute(adjustedStat, ["Makeshift", "Copper", "Iron", "Steel"]);
        } else if (item.type === "movement") {
            name += this.nameMaterialAttribute(adjustedStat, ["Uncomfortable", "Light", "Heavy", "Resistant"]);
        } else if (item.type === "magic") {
            name += this.nameMaterialAttribute(adjustedStat, ["Useless", "Cotton", "Eerie", "Magical"]);
        }
        return name;
    }

    nameMaterialAttribute(value, materials) {
        if (value < 10) return materials[0] + " ";
        if (value < 20) return materials[1] + " ";
        if (value < 30) return materials[2] + " ";
        if (value < 40) return materials[3] + " ";
        return ""; 
    }

    nameAdjective(index) {
        if (index < 3) return "Weak ";
        if (index < 6) return "Regular ";
        if (index < 9) return "Strong ";
        return "Pristine ";
    }

    
    typeSpecificName(item) {
        switch (item.type) {
            case "weapon":
                return this.determineWeaponType(item);
            case "armor":
                return this.determineArmorType(item);
            
            default:
                return "";
        }
    }

    determineWeaponType(weapon) {
        const highest = Math.max(weapon.damage, weapon.speed, weapon.defense, weapon.magic);
        if (highest === weapon.damage) return "Sword";
        if (highest === weapon.speed) return "Daggers";
        if (highest === weapon.defense) return "Shield";
        if (highest === weapon.magic) return "Staff";
        return ""; 
    }

    determineArmorType(armor) {
        const highest = Math.max(armor.defense, armor.movement, armor.magic);
        if (highest === armor.defense) return "Plate Armor";
        if (highest === armor.movement) return "Leather Vest";
        if (highest === armor.magic) return "Cloth Robe";
        return ""; 
    }


    findChest(rarity) {
        let chest = { type: "chest", name: "", rarity: rarity };
        chest.name = this.nameChest(chest) + " Chest";
        this.bag.push(chest);
        this.updateInventory(this.sellMode);
    }

    clearBag() {
        this.bag = [];
        this.updateInventory(this.sellMode);
    }

    nameChest(chest) {
        let name = this.extraRarity(chest);
        if (chest.rarity < 5) {
            name += "Useless";
        } else if (chest.rarity < 10) {
            name += "Dusty";
        } else if (chest.rarity < 25) {
            name += "Rusty";
        } else if (chest.rarity < 50) {
            name += "Shabby";
        } else if (chest.rarity < 100) {
            name += "Common";
        } else if (chest.rarity < 250) {
            name += "Odd";
        }
        return name;
    }

    extraRarity(chest) {
        let rarityBonus = Math.floor(Math.random() * 101);
        if (rarityBonus < 50) {
            return "Poor ";
        } else if (rarityBonus < 75) {
            chest.rarity += 2;
            return "Regular ";
        } else if (rarityBonus < 90) {
            chest.rarity += 5;
            return "Shiny ";
        } else if (rarityBonus < 100) {
            chest.rarity += 10;
            return "Aetherial ";
        } else if (rarityBonus === 100) {
            chest.rarity += 20;
            return "Heavenly ";
        }
        return ""; 
    }

    equipWeapon(index) {
        const weapon = this.bag[index];
        if (this.equippedWeapon !== undefined) {
            this.unequipWeapon();
        }
        this.equippedWeapon = weapon;
        this.applyEquipmentBonuses(weapon, "add");
        this.bag.splice(index, 1);
        this.updateInventory(this.sellMode);
        this.updateEquipment();
    }

    equipArmor(index) {
        const armor = this.bag[index];
        if (this.equippedArmor !== undefined) {
            this.unequipArmor();
        }
        this.equippedArmor = armor;
        this.applyEquipmentBonuses(armor, "add");
        this.bag.splice(index, 1);
        this.updateInventory(this.sellMode);
        this.updateEquipment();
    }

    updateEquipment() {
        const equipmentElement = document.getElementById("equipment");
        if (equipmentElement) {
            equipmentElement.innerHTML = ''; // Clear existing equipment display
    
            if (this.equippedWeapon !== null) {
                this.printEquippedItem(this.equippedWeapon, 'weapon');
            }
            if (this.equippedArmor !== null) {
                this.printEquippedItem(this.equippedArmor, 'armor');
            }
        }
        
        $(document).ready(function() {
            $('[data-toggle="tooltip"]').tooltip({html: true});
        });
    }

    printEquippedItem(item, itemType) {
        if (!item) return;
    
        let tooltip = '';
        switch (itemType) {
            case 'weapon':
                tooltip = `Bonus STR: ${Math.round(100 * item.damage * item.rarity) / 100}<br>` +
                          `Bonus DEX: ${Math.round(100 * item.speed * item.rarity) / 100}<br>` +
                          `Bonus CON: ${Math.round(100 * item.defense * item.rarity) / 100}<br>` +
                          `Bonus MGC: ${Math.round(100 * item.magic * item.rarity) / 100}`;
                break;
            case 'armor':
                tooltip = `Bonus CON: ${Math.round(100 * item.defense * item.rarity) / 100}<br>` +
                          `Bonus SPD: ${Math.round(100 * item.movement * item.rarity) / 100}<br>` +
                          `Bonus MGC: ${Math.round(100 * item.magic * item.rarity) / 100}`;
                break;
        }

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.className = `list-group-item ${itemType}`;
        button.setAttribute('data-toggle', 'tooltip');
        button.setAttribute('title', tooltip);
        button.innerHTML = `<span class="badge">Equipped</span> ${item.name}`;

        button.addEventListener('click', () => {
            if (itemType === 'weapon') {
                this.unequipWeapon();
            } else if (itemType === 'armor') {
                this.unequipArmor();
            }
        });

        const equipmentElement = document.getElementById("equipment");
        if (equipmentElement) {
            equipmentElement.appendChild(button);
        }
    }

    unequipWeapon() {
        if (!this.equippedWeapon) return;
        this.applyEquipmentBonuses(this.equippedWeapon, "subtract");
        this.bag.push(this.equippedWeapon);
        this.equippedWeapon = undefined;
        this.updateEquipment();
        this.updateInventory(this.sellMode);
    }

    unequipArmor() {
        if (!this.equippedArmor) return;
        this.applyEquipmentBonuses(this.equippedArmor, "subtract");
        this.bag.push(this.equippedArmor);
        this.equippedArmor = undefined;
        this.updateEquipment();
        this.updateInventory(this.sellMode);
    }

    applyEquipmentBonuses(item, action) {
        const multiplier = action === "add" ? 1 : -1;
        const { damage, speed, defense, magic, movement } = item;
        const rarityMultiplier = item.rarity;
    
        if (damage !== undefined) {
            player.strengthValue.bonus = player.strength.bonus + (damage * rarityMultiplier * multiplier);
        }
        if (speed !== undefined) {
            player.dexterityValue.bonus = player.dexterity.bonus + (speed * rarityMultiplier * multiplier);
        }
        if (defense !== undefined) {
            player.constitutionValue.bonus = player.constitution.bonus + (defense * rarityMultiplier * multiplier);
        }
        if (magic !== undefined) {
            player.magicValue.bonus = player.magic.bonus + (magic * rarityMultiplier * multiplier);
        }
        if (movement !== undefined) {
            player.speedValue.bonus = player.speed.bonus + (movement * rarityMultiplier * multiplier);
        }
    }
    

    createConsumable(consumableStat, consumableExperience) {
        this.bag.push({ type: "consumable", stat: consumableStat, experience: consumableExperience, name: `${consumableStat} Experience Consumable` });
        this.updateInventory(this.sellMode);
    }

    useConsumable(slot, all = false) {
        const consumable = this.bag[slot];
        switch (consumable.stat) {
            case "Strength":
                player.strengthValue.experience = player.strength.experience + consumable.experience;
                break;
            case "Dexterity":
                player.dexterityValue.experience = player.dexterity.experience + consumable.experience;
                break;
            case "Constitution":
                player.constitutionValue.experience = player.constitution.experience + consumable.experience;
                break;
            case "Speed":
                player.speedValue.experience = player.speed.experience + consumable.experience;
                break;
            case "Magic":
                player.magicValue.experience = player.magic.experience + consumable.experience;
                break;
            default:
                console.log("Unknown stat type in consumable:", consumable.stat);
                break;
        }
        this.bag.splice(slot, 1); 
        if (!all) {
            this.updateInventory(this.sellMode); 
        }
    }

    buyKey() {
        if (this.getGold() >= this.keyPrice) {
            this.setGold(this.getGold() - this.keyPrice);
            this.setKeys(this.getKeys() + 1);
        }
    }

    cheatKey() {
        this.setKeys(this.getKeys() + 1);
    }

    buyConsumable(stat) {
        let price = this.consumablePrice;
        if (!stat) {
            price /= 2;
            const types = ["Strength", "Dexterity", "Constitution", "Speed", "Magic"];
            stat = types[Math.floor(Math.random() * types.length)];
        }
        if (this.gold >= price) {
            this.setGold(this.gold - price);
            this.createConsumable(stat, 1000);
        }
    }

    sell(number, price) {
        this.setGold(this.gold + price);
        this.bag.splice(number, 1);
        this.updateInventory(this.sellMode);
    }

    useAllConsumables() {
        for (let i = this.bag.length - 1; i >= 0; i--) {
            if (this.bag[i].type === "consumable") {
                this.useConsumable(i, true);
            }
        }
        this.updateInventory(this.sellMode);
    }
};

var inventory = new Inventory(player);
