const STORAGE_KEYS = {
  PLAYER: 'playerSave',
  GAME_MAP: 'gameMapSave',
  BUFFS: 'buffsSave',
  INVENTORY: 'inventorySave',
  SPELLS: 'spellsSave',
  ENEMIES: 'enemiesSave'
};

const stats = [
  { id: 'strength', label: 'STR', tooltip: 'Strength. Allows you to hit harder.' },
  { id: 'constitution', label: 'CON', tooltip: 'Constitution. Increase your this.health and decrease damage taken.' },
  { id: 'magic', label: 'MGC', tooltip: 'Magic. Increase your this.mana and slightly boost your spell efficiency. Also unlocks new spells.' },
  { id: 'dexterity', label: 'DEX', tooltip: 'Dexterity. Slight damage increase.' },
  { id: 'speed', label: 'SPD', tooltip: 'Speed. Allows you to explore the floor faster, and also increases the chance of running away.' }
];

const elements = ["fire", "water", "earth", "air", "light", "dark"]; 

const UIComponents = [
  { path: "components/inventoryTab.html", elementId: "inventoryTab" },
  { path: "components/mapTab.html", elementId: "mapTab" },
  { path: "components/mapTabC1.html", elementId: "mapTabC1" },
  { path: "components/mapTabC2.html", elementId: "mapTabC2" },
  { path: "components/battleScreen.html", elementId: "battleScreen" },
  { path: "components/theMap.html", elementId: "theMap" },
  { path: "components/statusScreen.html", elementId: "statusScreen" },
  { path: "components/spellBook.html", elementId: "spellBook" },
  { path: "components/spellEffects.html", elementId: "spellEffects" },
  { path: "components/inventoryKeys.html", elementId: "inventoryKeys" },
  { path: "components/equipmentLoot.html", elementId: "equipmentLoot" },
];

let characterBuffs = (function () {
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

const DEBUG_MODE = true;

function debugLog(...messages) {
  if (DEBUG_MODE) {
    console.log(...messages);
  }
}

function debugError(...messages) {
  if (DEBUG_MODE) {
    console.error(...messages);
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
    return await response.json();
  } catch (error) {
    debugError(`Failed to fetch data from ${url}:`, error);
    throw error;
  }
}

async function loadUIComponents(player, inventory) {
  const uiComponentPromises = UIComponents.map(async (component) => {
    try {
      await loadComponent(component.path, component.elementId);
    } catch (error) {
      console.error(`Failed to load component ${component.elementId}:`, error);
      throw error;
    }
  });
  await Promise.all(uiComponentPromises);
  console.log("All UI components are successfully loaded.");
  UIsetup();
  console.log("UI is setup.");
  player.loadPlayerScreen();
  inventory.updateInventoryHTML();
  if (player.inBattle) {
    enemies.loadEnemyInfo(enemies.getInstancedEnemy());
    document.querySelector("#battleScreen").style.display = "block";
  } else {
    document.querySelector("#battleScreen").style.display = "none";
  }
  console.log("Player screen is loaded.");
}

async function loadComponent(path, elementId) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Network response was not ok.');
  const html = await response.text();
  document.getElementById(elementId).innerHTML = html;
  console.log(`Component ${elementId} is successfully loaded.`);
}

class StateManager {
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      debugError(`Error saving data for ${key}:`, error);
    }
  }

  static load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      debugError(`Error loading data for ${key}:`, error);
      return null;
    }
  }
}

class GameSystem {
  constructor() {
    this.player = new Player();
    this.inventory = new Inventory(this.player);
    this.buffs = new Buffs(this.player);
    this.enemies = new Enemies(this.player);
    this.gameMap = new GameMap(this.player);
    this.spells = new Spells(this.player, this.inventory);
    this.gameInitializer = new GameInitializer(this);
    this.system = new System(this.player);
  }

  async initialize() {
    try {
      await this.gameInitializer.initialize();
      loadUIComponents(this.player, this.inventory);
      this.system.startTheEngine(this.player, this.spells);
      debugLog("Game is ready.");
    } catch (error) {
      debugError("Game initialization failed:", error);
    }
  }

  saveGameState() {
    StateManager.save("gameState", {
      player: this.player.save(),
      inventory: this.inventory.save(),
      buffs: this.buffs.save(),
      enemies: this.enemies.save(),
      gameMap: this.gameMap.save(),
      spells: this.spells.save(),
      system: this.system.save()
    });
  }

  loadGameState() {
    const gameState = StateManager.load("gameState");
    if (gameState) {
      this.player.load(gameState.player);
      this.inventory.load(gameState.inventory);
      this.buffs.load(gameState.buffs);
      this.enemies.load(gameState.enemies);
      this.gameMap.load(gameState.gameMap);
      this.spells.load(gameState.spells);
      this.system.load(gameState.system);
    }
  }
}

class GameInitializer {
  constructor(gameSystem) {
    this.gameSystem = gameSystem;
    this.gameDataUrls = {
      spellbook: '/assets/json/spells.json',
      mapTiers: '/assets/json/mapTiers.json',
    };
  }

  async initialize() {
    try {
      await this.loadGameData();
      debugLog("All components initialized successfully.");
    } catch (error) {
      debugError(`GameInitializer failed: ${error.message}`);
      throw error;
    }
  }

  async loadGameData() {
    const gameDataPromises = Object.entries(this.gameDataUrls).map(async ([key, url]) => {
      try {
        this.gameSystem[key] = await fetchData(url);
        debugLog(`Loaded game data for ${key} from ${url}`);
      } catch (error) {
        debugError(`Failed to fetch game data for ${key}:`, error);
        throw error;
      }
    });

    try {
      await Promise.all(gameDataPromises);
    } catch (error) {
      debugError("Error loading game data:", error);
      throw error;
    }
  }
}

class System {
  constructor() {
    this.ticks = 0;
    this.refreshSpeed = 1000;
    this.init = false;
    this.theGame = null;
    this.startTheEngine = this.startTheEngine.bind(this);
    this.runGame = this.runGame.bind(this);
  }

  save() {
    const systemSave = {
      ticks: this.ticks,
      refreshSpeed: this.refreshSpeed
    };
    StateManager.save('systemState', systemSave);
  }

  load() {
    const systemSave = StateManager.load('systemState');
    if (systemSave) {
      this.ticks = systemSave.ticks;
      this.refreshSpeed = systemSave.refreshSpeed;
      this.idleMode = systemSave.idleMode;
    }
  }

  startTheEngine(player, spells) {
    this.runGame(player, spells);
    this.init = true;
    console.log("The game engine has started.")
    gameSystem.loadGameState();
    console.log("Game state is loaded.");
    
  }

  runGame(player, spells) {
    if (this.theGame) clearInterval(this.theGame);
    this.theGame = setInterval(() => {
      this.ticks++;
      if (player.resting === true) {
        player.rest();
      }
      player.loadPlayerScreen();
      spells.updateSpellbook();
      gameSystem.saveGameState();
    }, this.refreshSpeed);
  }
}

const gameSystem = new GameSystem();
gameSystem.initialize()
  .then(() => debugLog("Game fully initialized."))
  .catch((error) => debugError("Initialization encountered an error:", error));
window.gameSystem = gameSystem;