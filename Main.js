Array.prototype.randomize = function () {
    //fisher yates from http://codereview.stackexchange.com/a/12200/3163
    var i = this.length;
    if (i === 0) return false;
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempi = this[i];
        var tempj = this[j];
        this[i] = tempj;
        this[j] = tempi;
    }
};

Array.prototype.toObject = function () {
    var o = {};
    for (var i = 0; i < this.length; i++) {
        o[this[i]] = '';
    }
    return o;
};

function bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
        el.attachEvent('on' + eventName, eventHandler);
    }
}

var Wheel = (function () {
    var wheel = document.getElementById('wheel'),
        wheelValues = [7,3,8,4,9,11,5,10,1,6,2,12]
        spinTimeout = false,
        spinModifier = function () {
            return Math.random() * 10 + 20;
        },
        modifier = spinModifier(),
        slowdownSpeed = 0.2,
        prefix = (function () {
            if (document.body.style.MozTransform !== undefined) {
                return "MozTransform";
            } else if (document.body.style.WebkitTransform !== undefined) {
                return "WebkitTransform";
            } else if (document.body.style.OTransform !== undefined) {
                return "OTransform";
            } else {
                return "";
            }
        }()),
        degreeToRadian = function (deg) {
            return deg / (Math.PI * 180);
        };

    function Wheel() {}




    Wheel.prototype.rotate = function (degrees) {
        var val = "rotate(-" + degrees + "deg)";
        if (wheel.style[prefix] !== undefined) wheel.style[prefix] = val;
        var rad = degreeToRadian(degrees % 360),
        filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + rad + ", M12=-" + rad + ", M21=" + rad + ", M22=" + rad + ")";
        if (wheel.style.filter !== undefined) wheel.style.filter = filter;
        wheel.setAttribute("data-rotation", degrees);
    };
    Wheel.prototype.addEventListener = function(eventName, eventHandler) {
        wheel.addEventListener(eventName, eventHandler, false);
    }

    Wheel.prototype.spin = function (target,callback, amount) {
        var _this = this;
        clearTimeout(spinTimeout);
        modifier -= slowdownSpeed + target;
        if (amount === undefined) {
            amount = parseInt(wheel.getAttribute('data-rotation'), 10);
        }
        this.rotate(amount);
        if (modifier > 0) {
            spinTimeout = setTimeout(function () {
                _this.spin(target,callback, amount + modifier );
            }, 1000 / 5);
        } else {
            var dataRotation = parseInt(wheel.getAttribute('data-rotation'), 10);
            modifier = spinModifier();
            var divider = 360 / wheelValues.length;
            var offset = divider / 2; //half division
            var wheelValue = wheelValues[Math.floor(Math.ceil((dataRotation + offset) % 360) / divider)];
            if (wheelValue === target) {
                // Stop the spinner when it reaches the targetValue
                return callback(wheelValue);
            } else {
                _this.spin(6, callback, amount + modifier);
            }
        }
    };

    return Wheel;
})();

var WheelGame = (function () {
    var wheel = new Wheel(),
        spinWheel = document.getElementById('spin'),
        buyVowel = document.getElementById('vowel'),
        newButton = document.getElementById('newpuzzle'),
        solve = document.getElementById('solve');

    function WheelGame(puzzles) {
        var _this = this;
        this.puzzles = puzzles;
        this.puzzles.randomize();
        this.currentMoney = 0;
        this.puzzleSolved = false;

        bindEvent(buyVowel, "click", function () {
            if (_this.currentMoney > 200) {
                if (_this.createGuessPrompt("PLEASE ENTER A VOWEL", true) !== false) {
                    _this.currentMoney -= 200;
                    _this.updateMoney();
                }
            } else {
                alert("You need more than $200 to buy a vowel");
            }
        });
        bindEvent(newButton, "click", function () {
            _this.newRound();
        });
        var spinTheWheel = function () {
            wheel.spin(function (valueSpun) {
                console.log("🚀 ~ file: Main.js:136 ~ valueSpun:", valueSpun)
                if (isNaN(valueSpun)) {
                    // alert(valueSpun);
                } else {
                    //is a valid number
                    if (valueSpun === 0) {
                        alert('Bankrupt!');
                        _this.currentMoney = 0;
                    } else {
                        //spun greater than 0
                        var amountFound = _this.createGuessPrompt(valueSpun);
                        _this.currentMoney += (valueSpun * amountFound);
                    }
                    _this.updateMoney();
                }
            });
        };
        bindEvent(spinWheel, "click", spinTheWheel);
        bindEvent(wheel, "click", spinTheWheel);

        function arrays_equal(a, b) {
            return !(a < b || b < a);
        }
        
        bindEvent(solve, "click", function () {
            if (!_this.puzzleSolved) {
                var solve = prompt("Solve the puzzle?", "");
                if (solve) {
                    guess = solve.toUpperCase().split("");
                    if (arrays_equal(guess, _this.currentPuzzleArray)) {
                        for (var i = 0; i < guess.length; ++i) {
                            _this.guessLetter(guess[i], false, true);
                        }
                    }
                    if (!_this.puzzleSolved) {
                        alert('PUZZLE NOT SOLVED');
                    }
                }
            }
        });
        this.startRound(0); //start the 1st round
    }
    return WheelGame;
})();

var Game = new WheelGame([
    "doctor who", "the dark knight rises", "wheel of fortune",
    "facebook", "twitter", "google plus", "sea world", "pastrami on rye",
    "i am sparta", "whose line is it anyway", "google chrome"
]);