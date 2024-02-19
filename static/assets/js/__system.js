class System {
  constructor() {
    this.ticks = 0
    this.refreshSpeed = 1000
    this.init = false
    this.idleMode = false
    this.idleHealthSlider = null
    this.idleManaSlider = null
    this.theGame = null
    this.startTheEngine = this.startTheEngine.bind(this)
    this.toggleIdle = this.toggleIdle.bind(this)
    this.runGame = this.runGame.bind(this)
    this.gameSpeed = this.gameSpeed.bind(this)
    this.hardReset = this.hardReset.bind(this)
  }

  save() {
    const systemSave = { savedTicks: this.ticks }
    localStorage.setItem('systemSave', JSON.stringify(systemSave))
  }

  load() {
    const systemSave = JSON.parse(localStorage.getItem('systemSave'))
    if (systemSave?.savedTicks !== undefined) {
      this.ticks = systemSave.savedTicks
    }
  }

  saveAll() {
    this.save()
    player.save()
    spells.save()
    upgrades.save()
    buffs.save()
    inventory.save()
    enemies.save()
  }

  loadAll() {
    this.load()
    player.load()
    spells.load()
    upgrades.load()
    buffs.load()
    enemies.load()
    map.loadMapScreen()
    inventory.load()
    enemies.load()
  }

  getIdleMode() {
    return this.idleMode
  }

  runGame() {
    this.theGame = setInterval(() => this.main(), this.refreshSpeed)
  }

  gameSpeed(number) {
    if (this.idleMode) {
      this.refreshSpeed = number
      clearInterval(this.theGame)
      this.runGame()
      document.getElementById('speed').innerHTML = 1000 / number
    }
  }

  hardReset() {
    clearInterval(this.theGame)
    if (confirm('Are you sure you want to wipe all your progress?')) {
      localStorage.clear()
      location.reload()
    } else {
      this.runGame()
    }
  }

  updateTime(number) {
    document.getElementById('seconds').innerHTML = number % 60
    number = Math.floor(number / 60)
    document.getElementById('minutes').innerHTML = number % 60
    number = Math.floor(number / 60)
    document.getElementById('hours').innerHTML = number % 24
    number = Math.floor(number / 24)
    document.getElementById('days').innerHTML = number
  }

  main() {
    if (!this.init) {
      this.startTheEngine()
    }
    this.ticks++
    if (player.resting) {
      player.rest()
    }
    this.updateTime(this.ticks)
    this.saveAll()
  }

  startTheEngine() {
    this.loadAll()

    player.loadPlayerScreen()
    player.loadExploreButton()
    player.loadRestButton()
    spells.updateSpellbook()

    upgrades.updateUpgrades();
    upgrades.loadExcelia()
    upgrades.loadTimeUpgrades()
    buffs.updateTemporaryBuffs(false)
    buffs.updateToggleableBuffs()
    buffs.updatePermanentBuffs()

    inventory.updateInventoryHTML()
    inventory.updateInventory()
    inventory.updateEquipment()

    if (player.inBattle) {
      enemies.loadEnemyInfo(enemies.getInstancedEnemy())
    }

    this.gameSpeed(1000)
    this.init = true
    this.runGame()
  }
}

const system = new System()