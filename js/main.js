var cookie_set = true;
document.body.onload = function() {
	let current_time = Math.floor(new Date().getTime() / 1000);
	chrome.storage.sync.get(["activation"], (result)=> {
		let key = result.activation;
		if (key == undefined) {
			location.href = "activation.html";
		}
		else {
			let old_time = parseInt(decrypt(key));
			if (current_time - old_time >= 2592000) {
				location.href = "activation.html";
			}
			else {
				setTimeout(()=> {
					location.href = "play.html";
				}, 4500);
			}
		}
	});
}