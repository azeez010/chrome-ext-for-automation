setInterval(() => {
    let which_play = "none";
    let allballs = document.querySelectorAll("div[class^='animate animate-ball-']");
    let pick_which = document.querySelectorAll(".hi-lo__item");
    for (let i = 0; i < pick_which.length; i++) {
        let classname = pick_which[i].getAttribute("class");
        if (classname.includes("active") == true) {
            let split = classname.split(" ");
            which_play = split[1].toUpperCase();
        }
    }
    let new_balls = [];
    let arithmetic_sum = 0;
    let ball_numbers = [];

    for (let i of allballs) {
        let ball = i.querySelector("div.ball");
        let colorsplit = ball.getAttribute("class").split(" ");
        let color = colorsplit[1].split("-");
        ball_numbers.push(parseInt(ball.innerText));
        let ballvalue = color[1].toUpperCase();
        new_balls.push(ballvalue);
    }
    for (m of ball_numbers)
    {
        arithmetic_sum += m;
    }
    chrome.runtime.sendMessage({
        msg: "_getballs",
        data: new_balls,
        which_play: which_play,
        arithmetic_sum: arithmetic_sum
    });
}, 10000);

let countdown;

function start_get() {
    let timeline = document.querySelector(".timeline__value .timeline__value-txt");
    let time = timeline.innerText;
    let timing = parseInt(time);
    chrome.runtime.sendMessage({
        msg: "_getdata",
        timing: timing
    });
}

function getdrawid() {
    let drawid = document.querySelector(".ball__holder-cd");
    let str = drawid.innerText;
    let draw_id = str.match(/[0-9]+/);
    chrome.runtime.sendMessage({
        msg: "_drawid",
        drawid: draw_id
    });
}

chrome.runtime.onMessage.addListener((request, sender) => {
    if (request) {
        alert(request.drawtype)
        if (request.msg == "isgameselected") {
            function isselected() {
                setTimeout(() => {
                    let ispicked = document.querySelectorAll(".rainbow__ball-value").length;
                    if (ispicked == 0) {
                        try {
                            document.querySelectorAll(".game-nav__item")[1].click();
                            setInterval(getdrawid, 500);
                            chrome.runtime.sendMessage({
                                msg: "gameselected",
                                data: true
                            });
                        } catch (error) {
                            isselected();
                        }
                    } else {
                        chrome.runtime.sendMessage({
                            msg: "gameselected",
                            data: true
                        });
                    }
                }, 2000);
            }
            isselected();
        } else if (request.msg == "selectplay") {
            document.querySelectorAll(".g-hi-lo__item")[request.index].click();
        }
        else if (request.msg == "getdata") {
            start_get();
        } else if (request.msg == "placebet") {
            try {
                let placebet = document.querySelector("a.place-bet");
                if (!placebet.getAttribute("disabled")) {
                    element.click(placebet);
                    chrome.runtime.sendMessage({
                        msg: "_placebet"
                    });
                }
            } catch (error) {
                //Do nothing
            }
        } else if (request.msg == "setstake") {
            try {
                let amount = request.amount;
                element.stake(amount);
                chrome.runtime.sendMessage({
                    msg: "_setstake",
                    amount: amount
                });
            } catch (error) {
                //Do nothing
            }
        }
    }
});
let element = {
    click: function(x) {
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent('mousedown', true, true);
        x.dispatchEvent(clickEvent);
    },
    stake: function(amount) {
        let input = document.querySelector(".input-group input");
        input.focus();
        document.execCommand('selectAll', false, undefined);
        document.execCommand('insertText', false, amount.toString());
    }
}