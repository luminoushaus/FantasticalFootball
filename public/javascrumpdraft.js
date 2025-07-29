var firstNameList = [
	'Beverly', 'Steven', 'Gregory', 'Bethanne', 'Dave', 'Susan'
];

var surnameList = [
	'Hills', 'House', 'White', 'Brown', 'Jones', 'Two'
];

var speciesList = [
	'Human', 'Orc', 'Gnome', 'Elf', 'Dwarf', 'Centaur'
];

var newPlayer = "";

function generate() {
	let playerNames = []; //create PlayerNames array

	for (let playerLetter of "ABCD") { //do for A, B, C, and D
		//make name
		let name;
		while (true) { //keep doing this
			name = firstNameList[Math.floor( Math.random() * firstNameList.length )] + " " + surnameList[Math.floor( Math.random() * surnameList.length)];
			if (!playerNames.includes(name)) { //this one's fresh
				playerNames.push(name); //add it to the list
				break;
			} //otherwise the loop continues
		} 
		//add name to elements
		for (let element of document.querySelectorAll(`#player${playerLetter}>.name`)) {element.innerText = name}; 
		//add species
		document.querySelector(`#player${playerLetter}>.species`).innerText = speciesList[Math.floor(Math.random() * speciesList.length)];

		for (let stat of ["str", "dex", "end", "int", "ego", "fte"]) {
			document.querySelector(`#player${playerLetter}>.stats>.${stat}`).innerText = getRandomInt(1, 10);

		}
	}
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/*
	console.log(playerNames);
	document.getElementById("playersa").innerText = playerNames;
	document.getElementById("playersb").innerText = playerNames;
	document.getElementById("playersc").innerText = playerNames;
	document.getElementById("playersd").innerText = playerNames;
*/