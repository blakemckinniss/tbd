class Tower {
    constructor() {
        this.inSession = false; 
        this.session = null; 
    }

    startSession() {
        // if (!player.hasKey || player.hasKey.length === 0) {
        //     alert("You need a key to enter the tower.");
        //     return;
        // }

        // player.useKey(); // Assuming this method updates the player's keys appropriately

        this.session = {
            size: 100,
            explored: 0,
            monsterDensity: Math.floor(10 + Math.random() * 40),
            eventChance: 10,
            // Additional environmental variables or properties can be added here
        };

        this.inSession = true;
        this.loadTowerScreen(); 
    }

    resumeSession() {
        if (!this.inSession || !this.session) {
            console.error("No active session to resume.");
            return;
        }
        this.loadTowerScreen();
    }

    abandonSession() {
        if (!this.inSession) {
            console.error("No active session to abandon.");
            return;
        }
        this.resetSession();
        this.loadTowerScreen(); // Optionally refresh the screen to reflect the session's end
    }

    claimReward() {
        if (!this.inSession || this.session.explored < this.session.size) {
            console.error("Session not complete or no session to claim rewards from.");
            return;
        }
        // Implement reward logic here
        console.log("Reward claimed."); // Placeholder action
        this.resetSession();
        this.loadTowerScreen(); // Refresh the screen to show the session has ended and rewards claimed
    }

    resetSession() {
        this.inSession = false;
        this.session = null;
        this.loadTowerScreen(); // Refresh the UI to show the session has been reset
    }

    explore() {
        if (!this.inSession || !this.session) {
            console.error("No active session to explore.");
            return;
        }

        var explored = characterBuffs.get("ExplorationSpeedMultiplier") * ((player.getSpeedLevel() + player.getSpeedBonus())/10);
        console.log("Explored:", explored);
        player.setManaCurrentValue(player.getManaCurrentValue() + characterBuffs.get("ManaPerSecond"));
        player.setSpeedExperience(player.getSpeedExperience() + 5*explored*characterBuffs.get("LevelingSpeedMultiplier")/characterBuffs.get("ExplorationSpeedMultiplier"));

        this.session.explored += explored; // Adjust this value based on your game's logic
        if (this.session.explored >= this.session.size) {
            console.log("Exploration complete. You can now claim your reward.");
        }
        this.loadTowerScreen(); 
        if (!this.checkFloorEvent()) {
            monsters.battleChance(false);
        }
		else {
			monsters.battleChance(true);
		}
    }

    checkFloorEvent() {
		var eventChance = 10;
		var eventRoll = Math.floor(Math.random()*100);
		if (eventRoll <= eventChance) {
			eventRoll = Math.random()*100;
			if (eventRoll < 5) {
				var rarity = player.getCurrentFloor() + Math.floor(Math.random() * player.getCurrentFloor());
				document.getElementById("floorlog").innerHTML = "You turn a corner, finding a treasure chest."
				inventory.findChest(rarity);
			}
			else {
				var gold = Math.round(Math.random() * 50 * player.getCurrentFloor()) + 1;
				document.getElementById("floorlog").innerHTML = "You find the body of another adventurer. You check their pockets, obtaining " + gold + " gold.";
				inventory.setGold(inventory.getGold() + gold);
			}
			return true;
		}
		else {
			document.getElementById("floorlog").innerHTML = "You walk around for a bit, finding nothing of interest."
			return false;
		}
	};
    
    loadTowerScreen() {

        const enterTowerButton = document.getElementById("enterTowerButton");
        const abandonTowerButton = document.getElementById("abandonTowerButton");
        const claimRewardButton = document.getElementById("claimRewardButton");

        console.log("enterTowerButton:", enterTowerButton); // Check if the element is found
        console.log("inSession:", this.inSession); // Verify the session state

        enterTowerButton.style.display = this.inSession ? 'none' : 'block';
        abandonTowerButton.style.display = this.inSession ? 'block' : 'none';
        claimRewardButton.style.display = (this.inSession && this.session && this.session.explored >= this.session.size) ? 'block' : 'none';
        // explorationProgress.style.display = this.inSession ? 'block' : 'none';

        if (this.inSession) {
            // document.getElementById("floor").innerHTML = currentFloor;
            document.getElementById("explperc").innerHTML = this.session.explored + "%";
            document.getElementById("floorbar").style.width = this.session.explored + "%";
            player.loadExploreButton();
        }
    }
}

const tower = new Tower();
