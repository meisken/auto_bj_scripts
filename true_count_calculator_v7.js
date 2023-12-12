
const cardTypes = {
    "A": {
        value: 1,
        multiplication: -1
    },
    "2": {
        value: 2,
        multiplication: 1
    },
    "3": {
        value: 3,
        multiplication: 1
    },
    "4": {
        value: 4,
        multiplication: 2
    },
    "5": {
        value: 5,
        multiplication: 2
    },
    "6": {
        value: 6,
        multiplication: 2
    },
    "7": {
        value: 7,
        multiplication: 1
    },
    "8": {
        value: 8,
        multiplication: 0
    },
    "9": {
        value: 9,
        multiplication: 0
    },
    "10": {
        value: 10,
        multiplication: -2
    },
    "T": {
        value: 10,
        multiplication: -2
    },
    "J": {
        value: 10,
        multiplication: -2
    },
    "Q": {
        value: 10,
        multiplication: -2
    },
    "K": {
        value: 10,
        multiplication: -2
    }
    
}

const totalDecks = 8;
let currentHands = [];
let cardCount = {
    playedCard: 0,
    multiplication: 0
}
const getCurrentTrueCount = () => {
    let current = {
        playedCard: 0,
        multiplication: 0
    };
    current.playedCard = currentHands.length + cardCount.playedCard;
    currentHands.forEach((hand) => {
     
        if(cardTypes[hand] === undefined || cardTypes[hand].multiplication === undefined){
            window.console.error(`unknown card type: ${hand} ${cardTypes[hand]}`)
        }else{
            current.multiplication += cardTypes[hand].multiplication;
        }
        
        
    });
    current.multiplication += cardCount.multiplication;
    //currentHands.playedCard +=
    const trueCount = current.multiplication / ( ( totalDecks * 52 - current.playedCard ) / 52 )
    console.info("current hands",currentHands)
    console.table({
        ...current,
        trueCount
    })
    return {
        ...current,
        trueCount,
        currentHands
    }
    
}

const addKeydownListener = () => {

    const manualCardCount = (key) => {
        const keyList = {
            "0" : "T",
            "1" : "A",
            "2" : "2",
            "3" : "3",
            "4" : "4",
            "5" : "5",
            "6" : "6",
            "7" : "7",
            "8" : "8",
            "9" : "9"
        } 
        if(keyList[key] !== undefined){
            currentHands.push(keyList[key])
        }else{
            console.error(`you pressed a key (${key}) that is not supported`)
        }
        getCurrentTrueCount()
    }
    addEventListener("keydown",(e) => {manualCardCount(e.key)})

}

const buttonBaseStyles = (btn) => {
    btn.style.width = "150px";
    btn.style.height = "75px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "24px";
    btn.style.fontWeight = "bold";
}
const containerStyles = (container) => {


    container.style.position = "20px";
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.transform = "translateY(-50%)";
    container.style.left = "40px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "20px";
    container.style.zIndex = "100000";
}




const undoCounting = () => {
    currentHands.pop()
    getCurrentTrueCount()
}
const resetCardCount = () => {

    currentHands = [];
    cardCount.playedCard = 0;
    cardCount.multiplication= 0;
    getCurrentTrueCount()
}

const storeCardCount = () => {
    if(currentHands !== 0){
        cardCount.playedCard += currentHands.length;
        currentHands.forEach((hand) => {
            cardCount.multiplication += cardTypes[hand].multiplication
        });
        currentHands = [];
    }
    getCurrentTrueCount()
}

const inertButton = () => {


    //store button
    const storeButton = document.createElement("button");
    storeButton.appendChild(document.createTextNode("store"));
    storeButton.style.backgroundColor = "#66FF99"
    buttonBaseStyles(storeButton);
    storeButton.addEventListener("click",storeCardCount);

    //stop button
    // const stopButton = document.createElement("button");
    // stopButton.appendChild(document.createTextNode("stop"));
    // stopButton.style.backgroundColor = "red"
    // buttonBaseStyles(stopButton);
    // stopButton.addEventListener("click",stopBtnOnClick);



    const undoButton = document.createElement("button");
    undoButton.appendChild(document.createTextNode("undo"));
    undoButton.style.backgroundColor = "lightblue";
    buttonBaseStyles(undoButton);
    undoButton.addEventListener("click",undoCounting);

    const resetCounterButton = document.createElement("button");
    resetCounterButton .appendChild(document.createTextNode("reset"));
    resetCounterButton .style.backgroundColor = "#FF7276";
    buttonBaseStyles(resetCounterButton );
    resetCounterButton .addEventListener("click",resetCardCount);

    const buttonsContainer = document.createElement("div");
    containerStyles(buttonsContainer);


    buttonsContainer.appendChild(storeButton);
    buttonsContainer.appendChild(undoButton);
    buttonsContainer.appendChild(resetCounterButton);

    const body = document.querySelector("body");
    body.appendChild(buttonsContainer);

    console.info("true_count_calculator_v7 inserted")
}

(async function() {

    
    inertButton()

    addKeydownListener()
})();
