chrome.storage.sync.get(["drawtype"], (value)=>{
	if (value.drawtype == "Hi Lo") {
		document.getElementById("max-profit").value = "500";
		document.getElementById("max-loss").value = "6";
	}
	else {
		document.getElementById("max-profit").value = "1000";
		document.getElementById("max-loss").value = "100";
	}
})
document.getElementById("proceed-game").onclick = function() {
	let maxprofit = document.getElementById("max-profit").value;
	let maxloss = document.getElementById("max-loss").value;
	if (maxprofit.match(/^[0-9]+$/) == null || maxloss.match(/^[0-9]+$/) == null) {
		//Failed
	}
	else {
		location.href = "gamewindow.html";
	}
}