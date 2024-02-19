
let globalSpellData = []
let globalUpgradeData = []
let globalEventChanceArray = [];
let globalEventTypeArray = [];
let globalEventClassificationArray = [];

const elements = ['Fire', 'Water', 'Earth', 'Light', 'Dark'];
let spells = ''
let originalParent = null;
let nextSibling = null;

function createGlobalVariable(name, value) {
  window[name] = value;
}

function mapLog(text) {
  document.getElementById("maplog").innerHTML = text;
}

function combatLog(text) {
  document.getElementById("combatLog").innerHTML = text;
}

fetch('/assets/json/spells.json')
  .then(response => response.json())
  .then(data => {
    globalSpellData = data;
    spells = new Spells();
  })
  .catch(error => console.error('Failed to load spells:', error))

fetch('/assets/json/mapTiers.json')
  .then(response => response.json())
  .then(data => {
    globalMapTiers = data;
  })
  .catch(error => console.error('Failed to load map tiers:', error))

fetch('/assets/json/mapEvents.json') // Replace with the actual path to your JSON file
  .then(response => response.json())
  .then(data => {
    const events = data.events;
    globalEventChanceArray = events.map(event => event.chance);
    globalEventTypeArray = events.map(event => event.type);
    globalEventClassificationArray = events.map(event => event.classification);
  })
  .catch(error => console.error('Error fetching event data:', error));

// fetch('/assets/json/upgrades.json')
//   .then(response => response.json())
//   .then(data => {
//     globalUpgradeData = data;
//     upgrades = new Upgrades();
//   })
//   .catch(error => console.error('Failed to load spells:', error))

// On Load
$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $("#tabSelect").change(function () {
    var selectedTab = $(this).val();
    console.log(selectedTab);

    $(".tab-pane").each(function () {
      $(this).hide();
    });

    if (selectedTab === "all") {
      $(".tab-pane").each(function () {
        $(this).show();
      });
    } else {
      $("#" + selectedTab).show();
    }
  });
});

const callback = (mutationsList, observer) => {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        const targetNode = node.nodeType === 1 && node.classList.contains('sync') ? node :
          node.querySelector ? node.querySelector('.sync') : null;
        if (targetNode) {
          const imgSrc = `assets/images/${targetNode.className.split(' ')[1]}.png`;
          const imgTag = `<img src="${imgSrc}" />`;

          if (!targetNode.innerHTML.includes(imgSrc)) {
            targetNode.innerHTML = imgTag + targetNode.innerHTML;
            console.log(`Image added to ${targetNode.className}`);
          }
        }
      });
    }
  }
  adjustTdVisibility();
};

const observer = new MutationObserver(callback);
const config = { childList: true, subtree: true, characterData: true };
observer.observe(document.body, config);

console.log("Monitoring for changes with integrated td visibility adjustment...");

// FUNCTIONS
function setSync(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const type = selector.replace('#', '');
    element.innerHTML = `<span class="sync ${type}">${element.innerHTML}</span>`;
  }
}

function adjustTdVisibility() {
  const tds = document.querySelectorAll("td");
  tds.forEach(td => {
    if (td.textContent.trim() === "") {
      td.style.display = 'none';
    } else {
      td.style.display = '';
    }
  });
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function toggleElementPositionBattle() {
  const elementToMove = document.querySelector(".spellRow");
  const newParent = document.querySelector("#battleScreen > div.col-xs-5");

  if (elementToMove && newParent) {
    insertAfter(elementToMove, newParent.firstChild);
  }
}

function toggleElementPositionBattleBack() {
  const elementToMove = document.querySelector(".spellRow");
  const newParent = document.querySelector("#statusScreen > div.col-xs-5")

  if (elementToMove && newParent) {
    insertAfter(elementToMove, newParent.firstChild);
  }
}


/**
 * Logs a message to the floor log element.
 * @param {string} message - The message to log.
 * @param {boolean} [append=false] - Whether to append the message or replace the content.
 */
function logToFloor(message, append = false) {
  const mapLogElement = document.getElementById('maplog')
  if (!mapLogElement) {
    console.warn("logToFloor: 'maplog' element not found.")
    return
  }

  if (append) {
    mapLogElement.innerHTML += message + '<br>' // Appends message with a line break for separation.
  } else {
    mapLogElement.innerHTML = message // Replaces the current content with the new message.
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
function createButtonHTML({ text, classes, action, condition = true }) {
  if (!condition) return '' // Do not create the button if condition is false.

  return `<button class="${classes}" onClick="${action}">${text}</button>`
}

// Global variable to store the current active tab's href
// let currentActiveTabHref = '';

// function checkAndUpdateActiveTabHref() {
//     const activeTabHref = document.querySelector('li.active a')?.getAttribute('href');

//     if (activeTabHref !== currentActiveTabHref) {
//         // Update the global variable if there's a change
//         currentActiveTabHref = activeTabHref;
//         console.log('Active tab changed to:', currentActiveTabHref);

//         // if (currentActiveTabHref === '#inventoryTab') {
//         //   inventory.updateInventoryHTML()
//         //   inventory.updateInventory()
//         //   inventory.updateEquipment()
//         // }
//     }
// }
// setInterval(checkAndUpdateActiveTabHref, 100);

let sd_prompt = {
  prompt: "Cute rat girl"
};
let sd_replacement_pos = {
  "Backgrounds/backgrounds_gen": "ocean background"
};
let sd_replacement_neg = {
};
//imgGen({prompt: "Cute lion cub girl"},{"Colors/Color": "Blue"},{"Background": "Desert"});

/**
 * Generates an image based on given overwrite data and replacements.
 * @param {Object} overwrite - Object containing any fields to overwrite in the request.
 * @param {Object} positiveReplacements - Object containing positive terms and their replacements.
 * @param {Object} negativeReplacements - Object containing negative terms and their replacements (optional).
 */
function imgGen(overwrite = sd_prompt, positiveReplacements = sd_replacement_pos, negativeReplacements = sd_replacement_neg, selector = null) {
  if (!selector) {
    if (selector == "enemy") {
      selector = ".enemyArea > img";
    }
    if (selector == "hero") {
      selector = ".heroArea > img";
    }
  }
  const data = {
    overwrite,
    positive_replacements: positiveReplacements,
    negative_replacements: negativeReplacements
  };
  fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      if (data.image) {
        const imgSrc = 'data:image/jpeg;base64,' + data.image;
        document.querySelector(selector).src = imgSrc;
      } else if (data.error) {
        console.error('Error:', data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}



// const mapManager = [{
//   "tier": 1,
//   "size": 100,
//   "explored": 0,
//   "enemyDensity": 35,
//   "eventChance": 17,
//   "dropQuantity": 1,
//   "eventTypes": []
// },
// {
//   "tier": 2,
//   "size": 120,
//   "explored": 0,
//   "enemyDensity": 40,
//   "eventChance": 24,
//   "dropQuantity": 2,
//   "eventTypes": []
// }
// ]

// fetch('/assets/json/spells.json')
// .then(response => response.json())
// .then(data => {
//   globalSpellData = data;
//   spells = new Spells();
// })
// .catch(error => console.error('Failed to load spells:', error))


// const mapSettings = {
//   tier: 3,
//   dropQuantity: 5,
//   enemyDensity: 50, // This now influences the number of events
//   eventChance: 30,
//   playerLuck: 20, // Player's luck
//   luckBonus: 1.2 // Arbitrary luck bonus
// };

// const newMap = generateRandomMap(mapSettings);
// console.log(newMap);


// const rarity = 'epic'; // Example rarity
// const { dropQuantity, enemyDensity } = calculateDropsAndDensity(rarity, playerLuck);
// console.log(`Drop Quantity: ${dropQuantity}, Enemy Density: ${enemyDensity}`);

// const tier = 5; // Example tier
// const rarityMultiplier = 1; // Adjust based on map or other factors to affect rarity distribution
// const enemy = generateEnemy(tier, rarityMultiplier);
// console.log(enemy);

// let player = {
//   "Name": "Player",
//   "Level": 1,
//   "experience": 0,
//   "nextLevel": 1000,
//   "Health": { "currentValue": 100, "maximumValue": 100 },
//   "Mana": { "currentValue": 50, "maximumValue": 50 },
//   "Strength": { "level": 5, "experience": 0, "nextLevel": 1000 },
//   "Dexterity": { "level": 5, "experience": 0, "nextLevel": 1000 },
//   "Constitution": { "level": 5, "experience": 0, "nextLevel": 1000 },
//   "Speed": { "level": 5, "experience": 0, "nextLevel": 1000 },
//   "Magic": { "level": 5, "experience": 0, "nextLevel": 1000 },
//   "Luck": { "level": 1, "experience": 0, "nextLevel": 10000 }
// };

// updatePlayerExperience(player, "Magic", 3, "Rare", 1.5);
// console.log(player);




// // Example usage
// const mapTier = 3;
// const mapQuantity = 5;
// const playerLevel = 20;
// const playerLuck = 10;
// const enemyRarity = 'epic';
// const varianceMultiplier = 1.1;

// const [quantity, quality] = calculateLootOutcome(mapTier, mapQuantity, playerLevel, playerLuck, enemyRarity, varianceMultiplier);
// console.log(`Loot Quantity: ${quantity}, Loot Quality: ${quality}`);
// // Example usage
// const loot = generateLoot(3, 5, 20, 10, 'epic', 1.1);
// console.log(loot);


// from openai import OpenAI
// client = OpenAI()

// response = client.images.generate(
//   model="dall-e-3",
//   prompt="dark fantasy anime-style beach, daytime",
//   size="1024x1024",
//   quality="standard",
//   n=1,
// )

// image_url = response.data[0].url
// print(response.data[0].url)

// from openai import OpenAI
// client = OpenAI()

// response = client.chat.completions.create(
//   model="gpt-3.5-turbo-0125",
//   response_format={ "type": "json_object" },
//   messages=[
//     {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
//     {"role": "user", "content": "Generate an anime fantasy elemental map theme for me for a video game."}
//   ]
// )
// print(response.choices[0].message.content)