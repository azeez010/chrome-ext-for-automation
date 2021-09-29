document.getElementById("start-game").onclick = function() {
    let drawtype = document.getElementById("drawtype").value;
    if (drawtype.trim() != "") {
        chrome.storage.sync.set({
            drawtype: drawtype,
            is_stoploss: "false"
        }, () => {
            setTimeout(function() {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { msg: "isgameselected", data: 'ok', drawtype: drawtype });
                });
            }, 2500);
            document.getElementById("start-game").innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
    } else {
        //Failed
    }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request) {
        if (request.msg == "gameselected") {
            location.href = 'stoploss.html';
        }
    }
});
document.getElementById("close-game").onclick = function() {
    window.close();
}
document.body.onload = function() {
    chrome.storage.sync.get(['activation'], (data) => {
        try {
            let timestamp = Math.floor(new Date().getTime() / 1000);
            let activation_key = data.activation;
            let dec = decrypt(activation_key);
            let timeleft = timestamp - parseInt(dec);
            var days_left = 30 - Math.floor(parseInt(timeleft) / 864000);
            var color = "tomato";
            switch (true) {
                case (days_left <= 10):
                    color = "tomato"
                    break;
                case (days_left <= 18):
                    color = "orange"
                    break;
                case (days_left <= 30):
                    color = "green"
                    break;
            }
            document.getElementById("banner").style.backgroundColor = color;
            document.getElementById("banner").innerHTML = '<i class="fas fa-key"></i> ' + days_left + " day(s) left";
        } catch (error) {}
    });
}