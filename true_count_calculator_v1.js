


const currentHands = [];
const cardCount = {
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
            console.warn(`unknown card type: ${hand} ${cardTypes[hand]}`)
        }else{
            current.multiplication += cardTypes[hand].multiplication;
        }
        
        
    });
    current.multiplication += cardCount.multiplication;
    //currentHands.playedCard +=
    const trueCount = current.multiplication / ( ( totalDecks * 52 - current.playedCard ) / 52 )
    return {
        ...current,
        trueCount
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
            console.warn(`you pressed a key (${key}) that is not supported`)
        }
        console.log(getCurrentTrueCount())
    }
    window.addEventListener("keydown",(e) => {manualCardCount(e.key)})

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
}
const resetCardCount = () => {

    currentHands = [];
    cardCount.playedCard = 0;
    cardCount.multiplication= 0;

}

const storeCardCount = () => {
    if(currentHands !== 0){
        cardCount.playedCard += currentHands.length;
        currentHands.forEach((hand) => {
            cardCount.multiplication += cardTypes[hand].multiplication
        });
        currentHands = [];
    }
    console.log(getCurrentTrueCount())
}

const inertButton = () => {


    //store button
    const storeButton = document.createElement("button");
    storeButton.appendChild(document.createTextNode("store"));
    storeButton.style.backgroundColor = "green"
    buttonBaseStyles(storeButton);
    storeButton.addEventListener("click",storeCardCount);

    //stop button
    // const stopButton = document.createElement("button");
    // stopButton.appendChild(document.createTextNode("stop"));
    // stopButton.style.backgroundColor = "red"
    // buttonBaseStyles(stopButton);
    // stopButton.addEventListener("click",stopBtnOnClick);

    //fetch button
    const fetchButton = document.createElement("button");
    fetchButton.appendChild(document.createTextNode("fetch"));
    fetchButton.style.backgroundColor = "lightblue"
    buttonBaseStyles(fetchButton);
    fetchButton.addEventListener("click",fetchData);

    //rollover alarm button
    // const alarmButton = document.createElement("button");
    // alarmButton.appendChild(document.createTextNode("alarm"));
    // alarmButton.style.backgroundColor = "#154c79";
    // buttonBaseStyles(alarmButton);
    // alarmButton.addEventListener("click",startRolloverAlarm);

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
    //buttonsContainer.appendChild(runButton);
    //buttonsContainer.appendChild(stopButton);
    //buttonsContainer.appendChild(fetchButton);
    //buttonsContainer.appendChild(alarmButton);
    buttonsContainer.appendChild(undoButton);
    buttonsContainer.appendChild(resetCounterButton);

    const body = document.querySelector("body");
    body.appendChild(buttonsContainer);

    console.log("true_count_calculator_v1 inserted")
}

(async function() {

    
    inertButton()
    addKeydownListener();
})();
