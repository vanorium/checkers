//initialise
const table = document.querySelector(".table");

//board settings
let size = 8;
let aiDifficulty = 0
let packOfRules="english"
let side = "white";
let choosedChecker = 0;
let def = [];
let must = [];
let additionalMove = 0;
let count;

let abc = "abcdefghijklmnopqrstuvwxyz";
let b = -1;
let c = "";

let checkers = document.querySelectorAll("checker");
let CELLS = document.querySelectorAll(".black", ".cell");

document.addEventListener("keydown", (event) => {
    let key = event.key;

    if (key == "t" || key == "T") {
        checkers.forEach((element) => {
            if (element.classList.contains("ch-black")) {
                element.remove();
                checkers = document.querySelectorAll("checker");
            }
        });
    }

    if (key == "r" || key == "r") {
        checkers.forEach((element) => {
            if (element.classList.contains("ch-white")) {
                element.remove();
                checkers = document.querySelectorAll("checker");
            }
        });
    }
});

// setting up the menu after determining the end of the game
let menu = document.getElementById("menu");
let main = document.getElementById("main");

let slider_tableSize=document.getElementById("slider_tableSize")
let text_tableSize=document.getElementById("text_tableSize")

slider_tableSize.addEventListener("input",()=>{
    size=slider_tableSize.value
    let oldString = text_tableSize.innerHTML
    let newString = oldString.replace(/\([^)]*\)/g, `(${size})`);
    text_tableSize.innerHTML=newString
})

let slider_variant=document.getElementById("slider_variant")
let text_variant=document.getElementById("text_variant")
let text_variant_spanEn=document.getElementById("en")
let text_variant_spanRu=document.getElementById("ru")

slider_variant.addEventListener("input",()=>{
    packOfRules=slider_variant.value==0?"english":"russian"
    text_variant_spanEn.classList.remove("selected")
    text_variant_spanRu.classList.remove("selected")

    if(packOfRules=="english"){
        text_variant_spanEn.classList.add("selected")
    }
    else{
        text_variant_spanRu.classList.add("selected")
    }
})


let slider_ai=document.getElementById("slider_ai")
let text_ai=document.getElementById("text_ai")

slider_ai.addEventListener("input",()=>{
    aiDifficulty=slider_ai.value
    let oldString = text_ai.innerHTML
    let newString = oldString.replace(/\([^)]*\)/g, `(${aiDifficulty})`);
    text_ai.innerHTML=newString
})

// menu.style = "display: none;";

let winner = "";
let btnAgain = document.getElementById("again")
btnAgain.addEventListener("click",()=>{
    create()
    menu.classList.remove("opacity-up")
    menu.classList.add("opacity-down")

    setTimeout(() => {
        menu.style = "display: none;";
    }, 250);
})

// bottom
let group=document.getElementById("group")
let groupContainers=group.querySelectorAll(".container")

function end() {    
    console.log("_______________________");
    winner = side == "white" ? "black" : "white";
    console.log("winner:" + winner);
    setTimeout(() => {

        menuChecker.style=""
        btnAgain.innerText="again"
        menu.style = "";
        menu.classList.remove("opacity-down")
        menu.classList.add("opacity-up");

        // center 
        main.classList.remove("backgroundFor-white","backgroundFor-black")
        main.classList.add("backgroundFor-" + winner);
        btnAgain.classList.remove("btnFor-white","btnFor-black")
        btnAgain.classList.add("btnFor-" + winner);
        document.querySelector(".checker").classList.remove("ch-white","ch-black");
        document.querySelector(".checker").classList.add(winner == "white" ? "ch-white" : "ch-black");

        groupContainers.forEach(container=>{
            let element=container.querySelector("element")
            let slider=container.querySelector("input")

            element.classList.remove("textFor-white","textFor-black")
            element.classList.add("textFor-"+winner)

            slider.classList.remove("rangeFor-white","rangeFor-black")
            slider.classList.add("rangeFor-"+winner)
            slider.style.setProperty('--thumb-background', winner === 'white' ? 'black' : 'white');
        })

    }, 200);
}


//------------------------------------------------------------------------------------------------------------------------------------------------

//simplified structure: start => packCheck(....) => checking massives (def[],must[]) => conclussion

function sideCheck(element) {
    return (
        (element.classList.contains("ch-white") && side == "white") ||
        (element.classList.contains("ch-black") && side == "black")
    );
}
function checkerCheck(checkingCell) {
    return (
        (checkingCell.querySelector(".ch-black") && side == "white") ||
        (checkingCell.querySelector(".ch-white") && side == "black")
    );
}

function setCountText() {
    count.innerText =
        document.querySelectorAll(".ch-white").length + "/" + document.querySelectorAll(".ch-black").length;
}

function sideChange() {
    console.log("______________");
    clear();

    if (winner == "") {
        side = side == "white" ? "black" : "white";
        console.log("side: " + side);
        choosedChecker = 0;
        def = [];
        must = [];
        additionalMove = 0;
        start(0);
    }
}

function mustCells(checkingCell, fromCellX, fromCellY, basedCellX, basedCellY) {
    console.log("killer gotta go there: ", checkingCell);
    checkingCell.classList.add("move");
    checkingCell.setAttribute("killX", fromCellX);
    checkingCell.setAttribute("killY", fromCellY);
    checkingCell.setAttribute("killerX", basedCellX);
    checkingCell.setAttribute("killerY", basedCellY);
}

//the second part of checking
function step(fromCellX, fromCellY, checkX, checkY, basedCellX, basedCellY, defined, isKing) {
    CELLS.forEach((checkingCell) => {
        let checkingCellX = +checkingCell.getAttribute("x");
        let checkingCellY = +checkingCell.getAttribute("y");

        checkX = checkX / Math.abs(checkX);
        checkY = checkY / Math.abs(checkY);

        if (fromCellX + checkX == checkingCellX && fromCellY + checkY == checkingCellY) {
            console.log(fromCellX, fromCellY, checkX, checkY, checkingCell);
            if (!checkingCell.querySelector("checker")) {
                if (!defined) {
                    let link = +basedCellX + "," + basedCellY;
                    if (!must.includes(link)) {
                        must.push(link);
                        console.log("from:", basedCellX, basedCellY, "\ntarget: ", fromCellX, fromCellY);
                    }
                }
                if (defined) {
                    mustCells(checkingCell, fromCellX, fromCellY, basedCellX, basedCellY);

                    if (packOfRules=="russian" && isKing) {
                        for (let i = 2; i <= size; i++) {
                            CELLS.forEach((checkingCell) => {
                                let checkingCellX = +checkingCell.getAttribute("x");
                                let checkingCellY = +checkingCell.getAttribute("y");
                                if (
                                    fromCellX + checkX * i == checkingCellX &&
                                    fromCellY + checkY * i == checkingCellY
                                ) {
                                    if (!checkingCell.querySelector("checker")) {
                                        mustCells(checkingCell, fromCellX, fromCellY, basedCellX, basedCellY);
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
    });
}

function continueDir(a) {
    return a + a / Math.abs(a);
}

//a checking base of possible ways
function check(fromCell, checkX, checkY, defined) {
    // console.log(fromCell)
    let fromCellX = +fromCell.getAttribute("x");
    let fromCellY = +fromCell.getAttribute("y");

    let kingStatus;
    if (fromCell.querySelector("checker")) {
        kingStatus = fromCell.querySelector("checker").classList.contains("king");
    }

    CELLS.forEach((checkingCell) => {
        let checkingCellX = +checkingCell.getAttribute("x");
        let checkingCellY = +checkingCell.getAttribute("y");

        if (fromCellX + checkX == checkingCellX && fromCellY + checkY == checkingCellY) {
            // the always true loop-check for a king because of must.length!=0 => it will find an exit at the end of ends
            if (must.length && kingStatus) {
                check(fromCell, continueDir(checkX), continueDir(checkY), defined);
            }

            // target was finded; it means that there is an obstacle, after this it will check a next cell for none cell in it, if it's true => killer was found
            if (checkerCheck(checkingCell)) {
                if((packOfRules=="english" && checkY == (side == "white" ? -1 : 1)) || kingStatus || packOfRules=="russian"){
                    step(checkingCellX, checkingCellY, checkX, checkY, fromCellX, fromCellY, defined, kingStatus);
                }
            }

            // there's no taget
            if (!checkingCell.querySelector("checker") && !must.length) {
                if (kingStatus == 0 ? checkY == (side == "white" ? -1 : 1) : 1) {
                    if (packOfRules=="russian" && kingStatus) {
                        check(fromCell, continueDir(checkX), continueDir(checkY), defined);
                    }

                    if (!defined) {
                        let link = +fromCell.getAttribute("x") + "," + fromCell.getAttribute("y");
                        if (!def.includes(link)) {
                            def.push(link);
                        }
                    } else {
                        checkingCell.classList.add("move");
                    }
                }
            }
        }
    });
}

//visual things
function makeActive() {
    CELLS.forEach((cell) => {
        if (def.length) {
            def.forEach((pos) => {
                let cellX = cell.getAttribute("x");
                let cellY = cell.getAttribute("y");

                let posAll = pos.split(",").map(parseFloat);
                let posX = posAll[0];
                let posY = posAll[1];

                if (cellX == posX && cellY == posY) {
                    cell.classList.add("active");
                }
            });
        }
        if (must.length) {
            must.forEach((pos) => {
                let cellX = cell.getAttribute("x");
                let cellY = cell.getAttribute("y");

                let posAll = pos.split(",").map(parseFloat);
                let posX = posAll[0];
                let posY = posAll[1];

                if (cellX == posX && cellY == posY) {
                    cell.classList.add("active");
                }
            });
        }
    });
}

//reset visual things
function clear() {
    // choosedChecker=0
    CELLS.forEach((checkingCell) => {
        checkingCell.classList.remove("active", "move");
        checkingCell.removeAttribute("killX");
        checkingCell.removeAttribute("killY");
        checkingCell.removeAttribute("killerX");
        checkingCell.removeAttribute("killerY");
    });
}

//the pack of checks
function packCheck(element, defined) {
    //left-up
    check(element.parentElement, -1, side == "white" ? -1 : 1, defined);

    //right-up
    check(element.parentElement, +1, side == "white" ? -1 : 1, defined);

    //left-down
    check(element.parentElement, -1, side == "white" ? 1 : -1, defined);

    //right-down
    check(element.parentElement, +1, side == "white" ? 1 : -1, defined);
}

//starting a cycle of actions
function start(defined) {
    if (!defined) {
        if (!additionalMove) {
            checkers.forEach((element) => {
                if (sideCheck(element)) {
                    packCheck(element, defined);
                }
            });
        } else {
            packCheck(choosedChecker, 0);
        }

        //end
        if (must.length) {
            def = [];
            makeActive();

            if (must.length == 1) {
                CELLS.forEach((cell) => {
                    let posAll = must[0].split(",").map(parseFloat);
                    let posX = posAll[0];
                    let posY = posAll[1];

                    let cellX = cell.getAttribute("x");
                    let cellY = cell.getAttribute("y");

                    if (cellX == posX && cellY == posY) {
                        choosedChecker = cell.querySelector("checker");
                        console.log("target can be killed");
                        start(1);
                    }
                });
            }
        } else if (additionalMove) {
            console.log("no next target");
            sideChange();
        }

        // console.log("end","must",must,"def",def)

        if (def.length) {
            makeActive();
        } else if (!must.length) {
            end();
        }
    }

    if (defined) {
        console.log("checking: ", choosedChecker);
        packCheck(choosedChecker, defined);
    }
}

//creating a table
function create(){

    //reset
    if(CELLS.length){
        winner=""
        choosedChecker=0
        def=[]
        must=[]
        additionalMove=0
        side="white"
        table.innerHTML = "";
        b=-1
        c=""
    }

    //realization of table
    table.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    let blackCheckersEdgeFromTop =  size==6?2:
                                    size==7?3:
                                    size==8?3:
                                    size==9?3:
                                    size==10?4:
                                    size==11?4:
                                    size==12?5:0

    let whiteCheckersEdgeFromBottom = blackCheckersEdgeFromTop;
    for (let y = 1; y <= size; y++) {
        for (let x = 1; x <= size; x++) {
            let cell = document.createElement("cell");
            cell.setAttribute("x", x);
            cell.setAttribute("y", y);
    
            let textY = document.createElement("t");
            let textAbc = document.createElement("t"); textAbc.classList.add("abc");
            let textAbcWrapper = document.createElement("div"); textAbcWrapper.classList.add("textAbcWrapper"); textAbcWrapper.appendChild(textAbc);    
            if (y == 1) {

                arr = abc.split("");
    
                if ((x + 2) % arr.length == 0) {
                    b++;
                }
                if (b != -1) {
                    c = b + 1;
                }
    
                textAbc.innerText = c + arr[(x - 1) % arr.length];
    
                if (x % 2 == 0) {
                    textY.style.color = `rgba(240, 217, 181)`;
                    textAbc.style.color = `rgba(240, 217, 181)`;
                } else {
                    textAbc.style.color = `rgb(181, 136, 99)`;
                }
                cell.appendChild(textAbcWrapper);
            }
    
            if (x == 1) {
                textY.innerText = y;
                if (y % 2 == 0) {
                    textY.style.color = `rgba(240, 217, 181)`;
                } else {
                    textY.style.color = `rgb(181, 136, 99)`;
                }
                cell.appendChild(textY);
            }
    
            if (y == size && x == size) {
                count = document.createElement("t");
                count.classList.add("count");
                cell.appendChild(count);
            }
    
            if ((1 + x + y) % 2 == 0) {
                cell.classList.add("black");
    
                if (y <= blackCheckersEdgeFromTop) {
                    let checker = document.createElement("checker");
                    checker.classList.add("ch-black");
                    cell.appendChild(checker);
                }
                if (y > size - whiteCheckersEdgeFromBottom) {
                    let checker = document.createElement("checker");
                    checker.classList.add("ch-white");
                    cell.appendChild(checker);
                }
            } else {
                cell.classList.add("white");
            }
    
            table.appendChild(cell);
        }
    }
    
    //initialise
    checkers = document.querySelectorAll("checker");
    CELLS = document.querySelectorAll(".black", ".cell");

    //choosing a checker
    checkers.forEach((element) => {
    element.addEventListener("click", () => {
        if (sideCheck(element)) {
            let clickedCell = element.parentElement;
            let clickedCellX = clickedCell.getAttribute("x");
            let clickedCellY = clickedCell.getAttribute("y");

            let choosedCell = choosedChecker.parentElement;

            if (clickedCell != choosedCell) {
                if (!must.length) {
                    def.forEach((pos) => {
                        let posAll = pos.split(",").map(parseFloat);
                        let posX = posAll[0];
                        let posY = posAll[1];

                        if (clickedCellX == posX && clickedCellY == posY) {
                            CELLS.forEach((checkingCell) => {
                                checkingCell.classList.remove("active", "move");
                            });
                            clickedCell.classList.add("active");

                            choosedChecker = clickedCell.querySelector("checker");
                            start(1);
                        }
                    });
                } else {
                    must.forEach((pos) => {
                        let posAll = pos.split(",").map(parseFloat);
                        let posX = posAll[0];
                        let posY = posAll[1];

                        if (clickedCellX == posX && clickedCellY == posY) {
                            CELLS.forEach((checkingCell) => {
                                checkingCell.classList.remove("active", "move");
                            });
                            clickedCell.classList.add("active");

                            choosedChecker = clickedCell.querySelector("checker");
                            start(1);
                        }
                    });
                }
            } else {
                if (must.length > 1 || !must.length) {
                    CELLS.forEach((checkingCell) => {
                        checkingCell.classList.remove("move");
                    });
                    choosedChecker = 0;
                    makeActive();
                }
            }
        }
    });
    });

    //movement
    CELLS.forEach((toCell) => {
    toCell.addEventListener("click", () => {
        if (toCell.classList.contains("move")) {
            let checker = choosedChecker;

            if (!must.length) {
                toCell.appendChild(checker);
                sideChange();
            }

            if (must.length) {
                let toCellKillX = toCell.getAttribute("killX");
                let toCellKillY = toCell.getAttribute("killY");
                let toCellKillerX = toCell.getAttribute("killerX");
                let toCellKillerY = toCell.getAttribute("killerY");

                CELLS.forEach((checkingCell) => {
                    let checkingCellX = checkingCell.getAttribute("x");
                    let checkingCellY = checkingCell.getAttribute("y");

                    //defining the target
                    if (checkingCellX == toCellKillX && checkingCellY == toCellKillY) {
                        if (checkingCell.querySelector("checker")) {
                            checkingCell.querySelector("checker").remove();
                            setCountText();
                            checkers = document.querySelectorAll("checker");
                        }
                    }
                });

                CELLS.forEach((checkingCell) => {
                    let checkingCellX = checkingCell.getAttribute("x");
                    let checkingCellY = checkingCell.getAttribute("y");

                    //defining the killer
                    if (checkingCellX == toCellKillerX && checkingCellY == toCellKillerY) {
                        toCell.appendChild(checker);
                        must = [];
                        clear();
                        additionalMove = 1;
                        console.log("target was killed");
                        start(0);
                    }
                });
            }

            // there's a "reverse" logic for the sides.
            // we have to swap sides' conditions 'cuz previously we run "sideChange()" or "start(0)"
            if (
                (side == "black" && toCell.getAttribute("y") == 1) ||
                (side == "white" && toCell.getAttribute("y") == size)
            ) {
                checker.classList.add("king");
            }
        }
    });
    });

    setCountText();
    start();

}

// creating the menu at start
main.classList.add("backgroundFor-white");
btnAgain.classList.add("btnFor-white");
let menuChecker = document.getElementById("checker")
menuChecker.style="display:none;"
btnAgain.innerText="play"
groupContainers.forEach(container=>{
    let element=container.querySelector("element")
    let slider=container.querySelector("input")

    element.classList.add("textFor-white")
    slider.classList.add("rangeFor-white")
    slider.style.setProperty('--thumb-background', "black");
})

create()
document.querySelectorAll("checker").forEach(element=>{
    element.remove()
})
clear()

document.querySelector("body").style=""