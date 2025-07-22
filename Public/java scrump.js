window.onload = function () {

	const offScreenMenu = document.querySelector('.off-screen-menu');

	const ham = document.querySelector('.hamburger');

	ham.addEventListener('click', () => {
		offScreenMenu.classList.toggle('active');

	})
}