var firstNameList = [
	'Beverly', 'Steven', 'Gregory', 'Bethanne', 'Dave', 'Susan'
];

var surnameList = [
	'Hills', 'House', 'White', 'Brown', 'Jones', 'Two'
];

var speciesList = [
	'Human', 'Orc', 'Gnome', 'Elf', 'Dwarf', 'Centaur'
];

var likesList = [ 
	'Baseball', 'Football', 'the colour red', 'birds', 'cakes', 'summertime', 'springtime', 'autumn', 'winter', 'rocks', 'birds', 'horses', 'dogs', 'cats', 'math', 'going outside', 'sunny weather', 'wet weather', 'space', 'the ocean'

];

var hobbiesList = [ 
	'playing football.', 'baking.', 'watching bad reality TV.', 'birdwatching.', 'meowing.', 'taking photographs.', "barking.", 'collecting cards.', 'playing chess.', 'practicing taekwondo.', 'doing crosswords.', 'solving sudoku puzzles.', 'cycling.', 'fishing.'

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
		
		document.querySelector(`#player${playerLetter}>.likes`).innerText = likesList[Math.floor(Math.random() * likesList.length)];
		
		document.querySelector(`#player${playerLetter}>.dislikes`).innerText = likesList[Math.floor(Math.random() * likesList.length)];

		document.querySelector(`#player${playerLetter}>.hobbies`).innerText = hobbiesList[Math.floor(Math.random() * hobbiesList.length)];
		
		let years = Math.floor(Math.random() * 40) - 20; //so it's -5 to 20
		let message = '';
		if (years == 1) {message = `started playing football a year ago`}
		else if (years == -1) {message = `will have started playing football in a year`}
		else if (years > 0) {message = `started playing football ${years} years ago`}
		else if (years < 0) {message = `will have started playing football in ${Math.abs(years)} years`}
	
		else {message = `started playing football today`}

		document.querySelector(`#player${playerLetter}>.time`).innerText = message;
		
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


