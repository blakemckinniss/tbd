class Inventory {
    constructor(player) {
        this.player = player;
        this.items = {
            gold: 10,
            potions: 5,
            keys: 10,
            maps: 10,
            roses: 10,
        };
        this.bag = []; 
        this.keyPrice = 100;
        this.consumablePrice = 1000;
        this.equippedWeapon = null;
        this.equippedArmor = null;
        this.equippedAccessory = null;
        this.sellMode = false;
        this.load();
    }

    load() {
        const inventorySave = StateManager.load(STORAGE_KEYS.INVENTORY);
        if (inventorySave) {
            this.items = inventorySave.savedItems ?? this.items;
            this.bag = inventorySave.savedBag ?? this.bag;
            this.equippedWeapon = inventorySave.savedEquippedWeapon ?? this.equippedWeapon;
            this.equippedArmor = inventorySave.savedEquippedArmor ?? this.equippedArmor;
            this.equippedAccessory = inventorySave.savedEquippedAccessory ?? this.equippedAccessory;
            console.log("Inventory loaded successfully.");
        }
    }

    save() {
        const inventorySave = {
            savedItems: this.items,
            savedGold: this.items.gold,
            savedBag: this.bag,
            savedKeys: this.items.keys,
            savedEquippedWeapon: this.equippedWeapon,
            savedEquippedArmor: this.equippedArmor,
            savedEquippedAccessory: this.equippedAccessory,
        };
        StateManager.save(STORAGE_KEYS, JSON.stringify(inventorySave));
    }

    addItem(itemType, quantity) {
        if (this.items.hasOwnProperty(itemType)) {
            this.items[itemType] += quantity;
            console.log(`${itemType} added. You now have ${this.items[itemType]}.`);
            this.save();
        } else {
            console.error(`Item type ${itemType} not recognized.`);
        }
    }

    useItem(itemType, quantity = 1) {
        if (this.items[itemType] && this.items[itemType] >= quantity) {
            this.items[itemType] -= quantity;
            console.log(`${quantity} ${itemType}(s) used.`);
            this.save();
            return true;
        } else {
            console.error(`Not enough ${itemType} to use.`);
            return false;
        }
    }

    updateInventoryHTML() {
        const goldElement = document.getElementById("pGold");
        const keysElement = document.getElementById("pKeys");
        if (goldElement) goldElement.textContent = this.items.gold;
        if (keysElement) keysElement.textContent = this.items.keys;
		setSync("#pGold");
		setSync("#pKeys");
		setSync("#pMaps");
		setSync("#pRoses");
        setSync("#pSkills");
        setSync("#arcania");
    }
    
    equipWeapon(index) {
        if (index < this.bag.length && this.bag[index].type === 'weapon') {
            const weapon = this.bag[index];
            if (this.equippedWeapon) {
                this.bag.push(this.equippedWeapon); 
            }
            this.equippedWeapon = weapon;
            this.bag.splice(index, 1); 
            console.log(`${weapon.name} equipped as weapon.`);
            this.save();
        }
    }
    
    equipArmor(index) {
        if (index < this.bag.length && this.bag[index].type === 'armor') {
            const armor = this.bag[index];
            if (this.equippedArmor) {
                this.bag.push(this.equippedArmor); 
            }
            this.equippedArmor = armor;
            this.bag.splice(index, 1); 
            console.log(`${armor.name} equipped as armor.`);
            this.save();
        }
    }
    
    sellItem(index, price) {
        if (index < this.bag.length && this.sellMode) {
            const item = this.bag.splice(index, 1)[0];
            this.items.gold += price;
            console.log(`${item.name} sold for ${price} gold.`);
            this.save();
        }
    }
    
    buyKey() {
        if (this.items.gold >= this.keyPrice) {
            this.items.gold -= this.keyPrice;
            this.items.keys++;
            console.log(`Key purchased for ${this.keyPrice} gold.`);
            this.save();
        } else {
            console.log("Not enough gold to buy a key.");
        }
    }
    
    useConsumable(index) {
        if (index < this.bag.length && this.bag[index].type === 'consumable') {
            const consumable = this.bag.splice(index, 1)[0];
            console.log(`${consumable.name} used.`);
            this.save();
        }
    }
    
    toggleSellMode() {
        this.sellMode = !this.sellMode;
        console.log(`Sell mode ${this.sellMode ? 'enabled' : 'disabled'}.`);
    }
    
    addItemToBag(item) {
        this.bag.push(item);
        console.log(`${item.name} added to bag.`);
        this.save();
    }
    
    createConsumable(name, effect) {
        const consumable = { name, effect, type: 'consumable' };
        this.addItemToBag(consumable);
    }
    
    createWeapon(name, damage) {
        const weapon = { name, damage, type: 'weapon' };
        this.addItemToBag(weapon);
    }
}