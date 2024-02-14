/**
 * Logs a message to the floor log element.
 * @param {string} message - The message to log.
 * @param {boolean} [append=false] - Whether to append the message or replace the content.
 */
function logToFloor (message, append = false) {
  const floorLogElement = document.getElementById('floorlog')
  if (!floorLogElement) {
    console.warn("logToFloor: 'floorlog' element not found.")
    return
  }

  if (append) {
    floorLogElement.innerHTML += message + '<br>' // Appends message with a line break for separation.
  } else {
    floorLogElement.innerHTML = message // Replaces the current content with the new message.
  }
}

/**
 * Creates HTML for a button based on provided specifications.
 * @param {Object} options - The options for button creation.
 * @param {string} options.text - The text to display on the button.
 * @param {string} options.classes - The CSS classes for styling the button.
 * @param {string} options.action - The JavaScript function to call onClick.
 * @param {boolean} [options.condition=true] - Condition to determine if button should be created.
 * @returns {string} The HTML string for the button or an empty string if condition is not met.
 */
function createButtonHTML ({ text, classes, action, condition = true }) {
  if (!condition) return '' // Do not create the button if condition is false.

  return `<button class="${classes}" onClick="${action}">${text}</button>`
}

// Function to load a component
async function loadComponent (path, elementId) {
  const response = await fetch(path)
  const html = await response.text()
  document.getElementById(elementId).innerHTML = html
}

// Assuming you have a global variable to hold the spells data
var globalSpellData = []
var spells = ''

// Fetch the JSON data as soon as the page starts loading
fetch('/assets/json/spells.json')
  .then(response => response.json())
  .then(data => {
    globalSpellData = data
    spells = new Spells()
    // Trigger any dependent initialization here
    // initializeSpells();
  })
  .catch(error => console.error('Failed to load spells:', error))

// On Load
$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('#tabSelect').change(function () {
    var selectedTab = $(this).val()
    console.log(selectedTab)

    // Hide all sections initially
    $('.tab-pane').each(function () {
      $(this).hide()
    })

    if (selectedTab === 'all') {
      // Show all sections
      $('.tab-pane').each(function () {
        $(this).show()
      })
    } else {
      // Show only the selected section
      $('#' + selectedTab).show()
    }
  })
})

class System {
  constructor () {
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

  save () {
    const systemSave = { savedTicks: this.ticks }
    localStorage.setItem('systemSave', JSON.stringify(systemSave))
  }

  load () {
    const systemSave = JSON.parse(localStorage.getItem('systemSave'))
    if (systemSave?.savedTicks !== undefined) {
      this.ticks = systemSave.savedTicks
    }
  }

  saveAll () {
    this.save()
    player.save()
    spells.save()
    upgrades.save()
    buffs.save()
    monsters.save()
    tower.save()
    inventory.save()
  }

  loadAll () {
    this.load()
    player.load()
    spells.load()
    upgrades.load()
    buffs.load()
    monsters.load()
    tower.load()
    inventory.load()
  }

  getIdleMode () {
    return this.idleMode
  }

  runGame () {
    this.theGame = setInterval(() => this.main(), this.refreshSpeed)
  }

  gameSpeed (number) {
    if (this.idleMode) {
      this.refreshSpeed = number
      clearInterval(this.theGame)
      this.runGame()
      document.getElementById('speed').innerHTML = 1000 / number
    }
  }

  hardReset () {
    clearInterval(this.theGame)
    if (confirm('Are you sure you want to wipe all your progress?')) {
      localStorage.clear()
      location.reload()
    } else {
      this.runGame()
    }
  }

  updateTime (number) {
    document.getElementById('seconds').innerHTML = number % 60
    number = Math.floor(number / 60)
    document.getElementById('minutes').innerHTML = number % 60
    number = Math.floor(number / 60)
    document.getElementById('hours').innerHTML = number % 24
    number = Math.floor(number / 24)
    document.getElementById('days').innerHTML = number
  }

  main () {
    if (!this.init) {
      this.startTheEngine()
    }
    this.ticks++
    if (player.getResting()) {
      player.rest()
    }
    if (!player.getInBattle()) {
      document.querySelector('#battleScreen').style.display = 'none'
      document.querySelector('#theTower').style.display = 'block'
    } else {
      document.querySelector('#battleScreen').style.display = 'block'
      document.querySelector('#theTower').style.display = 'none'
    }
    if (this.idleMode) {
      if (!player.getInBattle()) {
        if (buffs.getBarrierLeft() === 0 && buffs.getAutoBarrierCast()) {
          spells.castSpell('barrier')
        }
        if (
          100 *
            (player.getHealthCurrentValue() / player.getHealthMaximumValue()) >=
            idleHealthSlider.getValue() &&
          100 * (player.getManaCurrentValue() / player.getManaMaximumValue()) >=
            idleManaSlider.getValue() &&
          !player.getResting()
        ) {
          tower.exploreFloor()
        } else if (!player.getResting() || player.isFullyRested()) {
          player.toggleRest()
        }
      } else {
        monsters.attackMelee()
      }
    }
    this.updateTime(this.ticks)
    this.saveAll()
  }

  toggleIdle () {
    this.idleMode = !this.idleMode
    this.gameSpeed(this.idleMode ? 100 : 1000)
    if (player.getCurrentFloor() === 0) {
      return false
    }
    if (idleMode) {
      self.gameSpeed(1000)
      idleMode = false
      loadIdleButton()
    } else {
      idleMode = true
      loadIdleButton()
    }
  }

  loadIdleHealthSlider () {
    this.idleHealthSlider = new Slider('#idleRest', {
      ticks: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      ticks_snap_bounds: 10,
      value: 100
    })
  }

  loadIdleManaSlider () {
    this.idleManaSlider = new Slider('#idleMpRest', {
      ticks: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      ticks_snap_bounds: 10,
      value: 100
    })
  }

  loadIdleButton () {
    if (this.idleMode) {
      document.getElementById('idleSwitch').innerHTML =
        '<button class="btn btn-success" onClick="system.toggleIdle()">Idle ON</button>'
    } else {
      document.getElementById('idleSwitch').innerHTML =
        '<button class="btn btn-danger" onClick="system.toggleIdle()">Idle OFF</button>'
    }
  }

  startTheEngine () {
    this.loadAll()

    // Assuming loadIdleHealthSlider, loadIdleManaSlider, and loadIdleButton are methods of this class.
    // If they're not, you'll need to define them in this class or ensure they're correctly referenced.
    this.loadIdleHealthSlider()
    this.loadIdleManaSlider()
    this.loadIdleButton()

    // Assuming player, spells, upgrades, buffs, monsters, tower, and inventory
    // are external objects that have been correctly instantiated and are accessible in this context.
    // If they're part of this class, you should call them with 'this' prefix.
    player.loadPlayerScreen()
    player.loadExploreButton()
    player.loadRestButton()
    spells.updateSpellbook()
    upgrades.loadExcelia()
    upgrades.updateUpgrades()
    upgrades.loadTimeUpgrades()
    buffs.updateTemporaryBuffs(false)
    buffs.updateToggleableBuffs()
    buffs.updatePermanentBuffs()

    if (player.getInBattle()) {
      monsters.loadMonsterInfo(monsters.getInstancedMonster())
    }

    tower.loadTowerScreen()
    inventory.updateInventoryHTML()
    inventory.updateInventory()
    inventory.updateEquipment()

    // Correctly use 'this' to call a method within the same class
    this.gameSpeed(1000)

    this.init = true
    this.runGame()
  }
}

const system = new System()
system.runGame()

loadComponent("components/inventoryTab.html", "inventoryTab");
loadComponent("components/towerTab.html", "towerTab");
loadComponent("components/upgradesTab.html", "upgradesTab");
loadComponent("components/idleTab.html", "idleTab");
loadComponent("components/towerTabC1.html", "towerTabC1");
loadComponent("components/towerTabC2.html", "towerTabC2");
loadComponent("components/battleScreen.html", "battleScreen");
loadComponent("components/theTower.html", "theTower");
loadComponent("components/statusScreen.html", "statusScreen");
loadComponent("components/spellBook.html", "spellBook");
loadComponent("components/spellEffects.html", "spellEffects");
loadComponent("components/inventoryKeys.html", "inventoryKeys");
loadComponent("components/equipmentLoot.html", "equipmentLoot");