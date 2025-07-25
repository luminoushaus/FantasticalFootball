/*window.onload =*/swag = function () {

	const offScreenMenu = document.querySelector('.off-screen-menu');

	const ham = document.querySelector('.hamburger');

	ham.addEventListener('click', () => {
		offScreenMenu.classList.toggle('active');

	})
}

var firstNameList = [
	'Beverly', 'Steven', 'Gregory', 'Bethanne', 'Dave', 'Susan'
];

var surnameList = [
	'Hills', 'House', 'White', 'Brown', 'Jones', 'Two'
];

var newPlayer = "";

function generate() {
	let playerNames = []; //create PlayerNames array

	for (let i = 0; i < 4; i ++) { //do 4 times:
		//make name
		let name = firstNameList[Math.floor( Math.random() * firstNameList.length )] + " " + surnameList[Math.floor( Math.random() * surnameList.length)];
		//add name to array. this isn't used but we're keeping it for funsies
		playerNames.push(name);
		//add name to element. 'abcd'[i] turns whatever number we're on into a letter from a-d. it gets letter #i from that string
		document.getElementById("name" + "abcd"[i]).innerText = name;
	}
}

function random(min,max) {
 return Math.floor((Math.random())*(max-min+1))+min;
 document.getElementById("stats" + "abcd"[i]).innerText =
}
/*
	console.log(playerNames);
	document.getElementById("playersa").innerText = playerNames;
	document.getElementById("playersb").innerText = playerNames;
	document.getElementById("playersc").innerText = playerNames;
	document.getElementById("playersd").innerText = playerNames;
*/
