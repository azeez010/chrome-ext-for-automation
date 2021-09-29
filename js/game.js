var current_balance = 0;

var profit_made = 0;

var is_playing = true;

var which_play = "";

var draws_index = 0;

var initial_stake = 50;

var gamemode = "HI LO";

var current_stake = 50;

var timing = 0;

var same = false;

var temp_selection = -1;

var current_balls = [];

var all_balls = [];

function togglemode(x) {
    if (x == "Auto") {
        document.getElementById("game-mode").style.color = "green";
        document.getElementById("game-mode").innerHTML = "Auto";
        document.getElementById("display").innerHTML = `
			<div class="row m-1">
				<h6><b>Stake</b></h6>
			</div>
			<div class="row m-1">
				<div class="row">
					<div class="col-sm-9 mb-1">
						<input class="form-control" id="stake" value="50" readonly="readonly">
					</div>
                    <div class="col-sm-3 mb-1">
                        <button class="ui red button" id="start-stop">Stop</button>
                    </div>
				</div>
			</div>
			<div class="row m-1">
				<div class="col-sm-12">
					<span style="color:gray;font-size:12px">
						<i class="fas fa-info-circle"></i> Set your phone screen display to 30 mins. When the bot reaches take profit, wait after 15 minutes before starting it again.
					</span>
				</div>
			</div>
		`;
    } else {
        document.getElementById("game-mode").style.color = "orange";
        document.getElementById("game-mode").innerHTML = "Manual";
        document.getElementById("display").innerHTML = `
			<div class="row m-1">
				<h6><b>Suggestion</b></h6>
			</div>
			<div class="row m-1">
				<div class="row">
					<div class="col-sm-9 mb-1">
						<input class="form-control" style="background-color:gray" readonly="readonly" id="suggestion" value="XXXX">
					</div>
				</div>
			</div>
			<div class="row m-1">
				<div class="col-sm-12">
					<span style="color:gray;font-size:12px">
						<i class="fas fa-info-circle"></i> Suggestions will start appearing after a few draws...
					</span>
				</div>
			</div>
		`;
    }
}
document.body.onload = function() {
    chrome.storage.sync.get(['drawtype', 'is_stoploss'], (data) => {
        gamemode = "Auto";
        drawtype = data.drawtype;
        document.getElementById("draw-type").innerHTML = drawtype.toString();
        selectplay(0);
        is_stoploss = (data.is_stoploss == "true") ? true : false;
        if (gamemode == "Auto") {
            document.getElementById("stop-loss").style.backgroundColor = "lawngreen";
            togglemode("Auto");
            document.getElementById("start-stop").onclick = function() {
                is_playing = !is_playing;
                if (is_playing == false) {
                    document.getElementById("start-stop").className = "ui red button";
                    document.getElementById("start-stop").innerHTML = "Stop";
                }
                else {
                    document.getElementById("start-stop").className = "ui green button";
                    document.getElementById("start-stop").innerHTML = "Start";
                }
            }
        }
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                msg: "getdata"
            });
        });
    });
}

var countdown;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request) {
        if (request.msg == "_getballs") {
            if (timing <= 40 && timing >= 30) {
                getClass = request.which_play;
                getballs(request.data, request.arithmetic_sum);
            }
        } else if (request.msg == "_getdata") {
            timing = request.timing;
            if (timing <= 0) {
                document.getElementById("clock").innerHTML = "--";
            } else {
                let timeformat = (timing <= 9) ? "0" + timing : timing;
                document.getElementById("clock").innerHTML = timeformat.toString();
            }
            try {
                clearInterval(countdown);
            } catch (error) {
                //Do nothing
            }
            countdown = setInterval(function() {
                timing--;
                if (timing <= 0) {
                    document.getElementById("clock").innerHTML = "--";
                } else {
                    let timeformat = (timing <= 9) ? "0" + timing : timing;
                    document.getElementById("clock").innerHTML = timeformat.toString();
                }
                if (timing <= -3) {
                    timing = 0;
                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            msg: "getdata"
                        });
                    });
                }
            }, 1000);
        } else if (request.msg == "_drawid") {
            drawid = request.drawid;
        } else if (request.msg == "_placebet") {
            additemstolist("| PLACED #" + current_stake.toString() + " FOR " + check_stake.toUpperCase() + " |");
        } else if (request.msg == "_setstake") {
            current_stake = request.amount;
        }
    }
});

function is_same(list_a, list_b) {
    if (current_balls.length != 0) {
        if (list_a.length == list_b.length) {
            let x = -1;
            let result = 0;
            for (let i in list_a) {
                x++;
                if (list_a[x] == list_b[x]) {
                    result++;
                }
            }
            if (result == list_a.length) {
                same = true;
            } else {
                same = false;
            }
        } else {
            same = false;
        }
    } else {
        same = false;
    }
}
//Main Game Logic
var is_playing = false;

var drawid = 0;

var arithmetic_sum = 0;

var determinant = 0;

var loss_count = 0;

var check_stake = "";

var checkwin = false;

var category = 0;

var draws_count = 0;

function selectplay(x = 0) {
    try {
        if (x == temp_selection) {
            //Do nothing
        } else {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    msg: "selectplay",
                    index: x
                });
            });
            temp_selection = x;
        }
    } catch (error) {
        //Do nothing
    }
}

function getballs(new_balls, arithmetic_sum) {

    is_same(current_balls, new_balls);

    if (same == false) {

        current_drawid = drawid.toString().split("");

        current_balls = new_balls;

        all_balls.push(current_balls);

        let _map = {
            "RED": "tomato",
            "BLUE": "steelblue",
            "GREEN": "lawngreen",
            "YELLOW": "gold"
        };

        let _balls = [_map[current_balls[0]], _map[current_balls[1]], _map[current_balls[2]], _map[current_balls[3]], _map[current_balls[4]], _map[current_balls[5]], _map[current_balls[6]]];

        let output = `< <span style="color:${_balls[0].toLowerCase()}">${current_balls[0]}</span> <span style="color:${_balls[1].toLowerCase()}">${current_balls[1]}</span> <span style="color:${_balls[2].toLowerCase()}">${current_balls[2]}</span> <span style="color:${_balls[3].toLowerCase()}">${current_balls[3]}</span> <span style="color:${_balls[4].toLowerCase()}">${current_balls[4]}</span> <span style="color:${_balls[5].toLowerCase()}">${current_balls[5]}</span> >`;

        if (checkwin == true) {
            if (drawtype == "Hi Lo") {
                let played = getClass;
                if (played == check_stake) {
                    additemstolist("--  YOU WON 😨 !!!  --");
                    profit_made += current_stake;
                    loss_count = 0;
                    if (profit_made >= 500) {
                        window.close();
                    }
                    setstake(initial_stake);
                } else {
                    additemstolist("--  YOU LOST 😭 !!!  --");
                    profit_made -= current_stake;
                    loss_count++;
                    if (loss_count >= 6) {
                        window.close();
                    }
                    current_stake = current_stake * 2;
                    setstake(current_stake);
                }
            } else if (drawtype == "Mid") {
                let played = getClass;
                if (played == check_stake) {
                    additemstolist("--  YOU WON 😨 !!!  --");
                    profit_made += (current_stake * 26) - current_stake;
                    if (profit_made >= 1000) {
                        window.close();
                    }
                    setstake(initial_stake);
                    loss_count = 0;
                } else {
                    additemstolist("--  YOU LOST 😭 !!!  --");
                    profit_made -= current_stake;
                    loss_count++;
                    if (loss_count >= 1 && loss_count <= 15) {
                        current_stake = 50;
                    } else if (loss_count >= 16 && loss_count <= 25) {
                        current_stake = 75;
                    } else if (loss_count >= 26 && loss_count <= 33) {
                        current_stake = 100;
                    } else if (loss_count >= 34 && loss_count <= 41) {
                        current_stake = 150;
                    } else if (loss_count >= 42 && loss_count <= 48) {
                        current_stake = 200;
                    } else if (loss_count >= 49 && loss_count <= 53) {
                        current_stake = 250;
                    } else if (loss_count >= 54 && loss_count <= 57) {
                        current_stake = 300;
                    } else if (loss_count >= 58 && loss_count <= 61) {
                        current_stake = 350;
                    } else if (loss_count >= 62 && loss_count <= 64) {
                        current_stake = 400;
                    } else if (loss_count >= 65 && loss_count <= 67) {
                        current_stake = 450;
                    } else if (loss_count >= 68 && loss_count <= 70) {
                        current_stake = 500;
                    } else if (loss_count >= 71 && loss_count <= 72) {
                        current_stake = 550;
                    } else if (loss_count >= 73 && loss_count <= 74) {
                        current_stake = 600;
                    } else if (loss_count >= 75 && loss_count <= 76) {
                        current_stake = 650;
                    } else if (loss_count >= 77 && loss_count <= 78) {
                        current_stake = 700;
                    } else if (loss_count >= 79 && loss_count <= 80) {
                        current_stake = 750;
                    } else if (loss_count >= 81 && loss_count <= 81) {
                        current_stake = 800;
                    } else if (loss_count >= 82 && loss_count <= 83) {
                        current_stake = 850;
                    } else if (loss_count >= 84 && loss_count <= 84) {
                        current_stake = 900;
                    } else if (loss_count >= 85 && loss_count <= 85) {
                        current_stake = 950;
                    } else if (loss_count >= 86 && loss_count <= 87) {
                        current_stake = 1000;
                    } else if (loss_count >= 88 && loss_count <= 89) {
                        current_stake = 1100;
                    } else if (loss_count >= 90 && loss_count <= 91) {
                        current_stake = 1200;
                    } else if (loss_count >= 92 && loss_count <= 93) {
                        current_stake = 1300;
                    } else if (loss_count >= 94 && loss_count <= 95) {
                        current_stake = 1400;
                    } else if (loss_count >= 96 && loss_count <= 97) {
                        current_stake = 1500;
                    } else if (loss_count >= 98 && loss_count <= 99) {
                        current_stake = 1650;
                    } else if (loss_count >= 100) {
                        current_stake = 1800;
                        window.close();
                    }
                    setstake(current_stake);
                }
                draws_count = 0;
            }
            checkwin = false;
        }

        if (drawtype == "Hi Lo") {
            let _drawid = parseInt(current_drawid[current_drawid.length - 2] + current_drawid[current_drawid.length - 1]);
            let sum = arithmetic_sum / _drawid;

            additemstolist("");
            additemstolist("[" + drawid + "]");

            let determinant = Math.round(sum);

            which_play = checkwhich(determinant);

            if (is_playing == false) {
                if (which_play != "NONE") {
                    let play_int = (which_play == "HI") ? 0 : 2;
                    check_stake = which_play;
                    checkwin = true;
                    selectplay(play_int);
                    placebet();
                } else {
                    additemstolist("xxxx");
                    checkwin = false;
                }    
            }
        } 
        
        else if(draw_type == "colors"){
            alert("COLOR__s")
        }

        else {
            if (is_playing == false) {
                draws_count++;
                if (draws_count >= 50) {
                    let play_int = 1;
                    check_stake = "MID";
                    checkwin = true;
                    selectplay(play_int);
                    placebet();
                }
            }
        }

    }
}

function placebet() {
    try {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                msg: "placebet"
            });
        });
    } catch (Exception) {
        //Do nothing
    }
}

function setstake(amount, y = 0) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            msg: "setstake",
            amount: amount
        });
    });
}

function checkwhich(num) {
    let output_value = "NONE";

    let r = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46];
    let b = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47];
    let g = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48];

    let m = [0, 0, 0];

    for (let i of r) {
        if (i == num) {
            m[0] = 1;
        }
    }
    for (let i of b) {
        if (i == num) {
            m[1] = 1;
        }
    }
    for (let i of g) {
        if (i == num) {
            m[2] = 1;
        }
    }
    if (m[0] == 1) {
        output_value = "LO";
    } else if (m[1] == 1) {
        output_value = "HI";
    } else if (m[2] == 1) {
        output_value = "NONE";
    } else if (m[0] == 0 && m[1] == 0 && m[2] == 0) {
        output_value = "NONE";
    }
    return output_value;
}

function additemstolist(output) {
    document.getElementById("board").innerHTML += `${output}<br/>`;
    document.getElementById("board").scrollTop += document.getElementById("board").scrollHeight;
}

//Activation controller
// let activation_checker = setInterval(() => {
//     let current_time = Math.floor(new Date().getTime() / 1000);
//     chrome.storage.sync.get(["activation"], (result) => {
//         let key = result.activation;
//         let old_time = parseInt(decrypt(key));
//         if (current_time - old_time >= 2592000) {
//             location.href = "activation.html";
//             clearInterval(activation_checker);
//         }
//     });
// }, 3000);

// _placebet