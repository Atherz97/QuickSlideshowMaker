var dark = false;
document.getElementById('toggle_dark').addEventListener('click',setDark);;

function setDark() {
	dark = !dark;
	if (!dark) {
		document.body.style.backgroundColor = "white";
		document.body.style.color = "black";
		document.getElementById('toggle_dark').setAttribute('src',"images/darkmode.png");
	}
	else {
		document.body.style.backgroundColor = "#181818";
		document.body.style.color = "white";
		document.getElementById('toggle_dark').setAttribute('src',"images/darkmode_active.png");
	}
}
