let betSize = 5;


const getBalance = () => {
    const balance = document.querySelector("span[data-role='balance-label-value']" ).textContent;
 
    return parseInt(balance.replace(",",""));
}

const balanceCheck = () => {
    const balance = getBalance();
    return balance >= betSize

}

const cardTypes = {
    "A": {
        value: 1
    },
    "2": {
        value: 2
    },
    "3": {
        value: 3
    },
    "4": {
        value: 4
    },
    "5": {
        value: 5
    },
    "6": {
        value: 6
    },
    "7": {
        value: 7
    },
    "8": {
        value: 8
    },
    "9": {
        value: 9
    },
    "10": {
        value: 10
    },
    "J": {
        value: 10
    },
    "Q": {
        value: 10
    },
    "K": {
        value: 10
    }
    
}
let currentBetTimes = 0;
let maxBetTimes = 20;

const buttonType = {
    hit: "div[data-role='hit'] > div.iconContainer--004ac > div.icon--eb080 > .buttonContainer--bd9a6",
    stand: "div[data-role='stand'] > div.iconContainer--004ac > div.icon--eb080 > .buttonContainer--bd9a6",
    double: "div[data-role='double'] > div.iconContainer--004ac > div.icon--eb080 .buttonContainer--bd9a6",
    split: "div[data-role='split'] > div.iconContainer--004ac > div.icon--eb080 > .buttonContainer--bd9a6",
    bet: "div[data-state='enabled'].container--e0aac.container--dac87.enabled--b1cef.enabled--00dd8 div.gradientBorder--dfa99",
    no: "div[data-role='no-position'] > div[data-role='no'] > div > div > div"
}

const actionTypes = {
    hit: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log('Hit');
        try{
            const [hitButton] = await getElements(0,buttonType.hit);


            if(hitButton){
                hitButton.click();
                console.log("hit button clicked");
            }

            console.log("is second hand?",isSecondHand)
            if(isSecondHand){
                console.log("run second hand check");  
            
                const [_,secondHandCards] = await getElements(oldMyCards.length,"div[data-role='secondHand-cards'] > div[data-role='virtual-card'] > div > div > div > span");
                console.log("second hand element", secondHandCards);  
                handCheck(oldDealerCard, secondHandCards, callbackOnResolve, isSecondHand);
                return
            }



            console.log("run hand check");  
            
            const {dealerCard, myCards} = await getElements(oldMyCards.length);
            handCheck(dealerCard, myCards, callbackOnResolve, isSecondHand);
            //div[data-role='secondHand-cards'] > div[data-role='virtual-card'] > div > div > div > span
            
        }catch(err){
            if(callbackOnResolve){
                callbackOnResolve();
                return
            }else{
                startBetting();
            }
        }
    },
    stand: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("Stand");
   
        const [standButton] = await getElements(0,buttonType.stand);
        if(standButton){
            standButton.click();
            console.log("stand button clicked");
        }
        if(callbackOnResolve){
            callbackOnResolve();
            return
        }else{
            startBetting();
        }
   
    },
    standThree: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("S3");

    


        if(oldMyCards.length > 3){
            console.log("run hit");  

            actionTypes.hit(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);

            // const {dealerCard, myCards} = await getElements(oldMyCards.length);
            // handCheck(dealerCard, myCards)
        }else{

            actionTypes.stand(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }
      
    
    },
    standFour: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("S4");
     

        if(oldMyCards.length > 4){
            console.log("run hit");  
            
            actionTypes.hit(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);

            // const {dealerCard, myCards} = await getElements(oldMyCards.length);
            // handCheck(dealerCard, myCards);

        }else{
            actionTypes.stand(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }

    },
    blackjackStandFour: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("blackjack S4");
     

        if(oldMyCards.length === 2){
            console.log("blackjack !!!");
            if(callbackOnResolve){
                callbackOnResolve();
                return
            }else{
                startBetting();
            }
            return
        }else{
            actionTypes.forcedResolved(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }

    },
    double: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("Double");
        console.log("balance check",balanceCheck());
        if(oldMyCards.length === 2 && (callbackOnResolve === undefined || callbackOnResolve === null) && !isSecondHand && balanceCheck()){
            const [doubleButton] = await getElements(0,buttonType.double);
            if(doubleButton){
                doubleButton.click();
                console.log("double button clicked");
            }
            if(callbackOnResolve){
                callbackOnResolve();
                return
            }else{
                startBetting();
            }
        }else{
            actionTypes.hit(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }


    },
    doubleStandThree: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("DS3");
        console.log("balance check",balanceCheck());

        if(oldMyCards.length === 2 && (callbackOnResolve === undefined || callbackOnResolve === null) && !isSecondHand && balanceCheck()){
            const [doubleButton] = await getElements(0,buttonType.double);
            if(doubleButton){
                doubleButton.click();
                console.log("double button clicked");
            }
            if(callbackOnResolve){
                callbackOnResolve();
                return
            }else{
                startBetting();
            }
        }else{

            actionTypes.standThree(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }

    },
    split: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("Split");

        //const splitButton = await getElements(0,"buttonContainer--bd9a6 .isNotPreferredDecision--a6f1f");
        const [splitButton] = await getElements(0,buttonType.split);
        if(splitButton ){
            splitButton.click();
            console.log("split button clicked");
        }
        
        const secondHandCheck = async () => {
            console.log("run second hand check");
            const [_,secondHandCards] = await getElements(1,"div[data-role='secondHand-cards'] > div[data-role='virtual-card'] > div > div > div > span");
    
            handCheck(dealerCard, secondHandCards, startBetting, true);
        }

        // const firstCard = getCardNumber(oldMyCards[0]);
        // const secondCard = getCardNumber(oldMyCards[1]);

        // if(firstCard === "A" && secondCard === "A"){

        //     console.log("game resolved");
        //     startBetting();
        //     return

        // }

        const {dealerCard, myCards} = await getElements(1);
        handCheck(dealerCard, myCards, secondHandCheck);

        //data-role="status-text" .textContent
    

        //getElements 

        //buttonContainer--bd9a6 isNotPreferredDecision--a6f1f //split button
        //cardContainer--b4b58 second card 
    },
    forcedResolved: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("forced resolved");
   
        if(callbackOnResolve){
            callbackOnResolve();
            return
        }else{
            startBetting();
        }
   
    },
    splitThenResolved:  async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("Split and forced resolve");
        console.log("balance check",balanceCheck());

        const [splitButton] = await getElements(0,buttonType.split);
        if(splitButton ){
            splitButton.click();
            console.log("split button clicked");
        }

        console.log("game resolved");
        startBetting();
        return

    }
}

const pairCombination = {
    "22": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "33": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "44": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.hit,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "55": {
        "2": actionTypes.double,
        "3": actionTypes.double,
        "4": actionTypes.double,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.double,
        "8": actionTypes.double,
        "9": actionTypes.double,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "66": {
        "2": actionTypes.hit,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "77": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "88": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.split,
    },
    "99": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.stand,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "1010": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.stand,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "JJ": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.stand,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "QQ": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.stand,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "KK": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.stand,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "AA": {
        "2": actionTypes.splitThenResolved,
        "3": actionTypes.splitThenResolved,
        "4": actionTypes.splitThenResolved,
        "5": actionTypes.splitThenResolved,
        "6": actionTypes.splitThenResolved,
        "7": actionTypes.splitThenResolved,
        "8": actionTypes.splitThenResolved,
        "9": actionTypes.splitThenResolved,
        "10": actionTypes.splitThenResolved,
        "J": actionTypes.splitThenResolved,
        "Q": actionTypes.splitThenResolved,
        "K": actionTypes.splitThenResolved,
        "A": actionTypes.splitThenResolved,
    }
}

const hasAceCombination = {
    "A1": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.hit,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "A2": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.double,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "A3": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "A4": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "A5": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.double,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "A6": {
        "2": actionTypes.hit,
        "3": actionTypes.double,
        "4": actionTypes.double,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "A7": {
        "2": actionTypes.standThree,
        "3": actionTypes.doubleStandThree,
        "4": actionTypes.doubleStandThree,
        "5": actionTypes.doubleStandThree,
        "6": actionTypes.doubleStandThree,
        "7": actionTypes.standFour,
        "8": actionTypes.standThree,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "A8": {
        "2": actionTypes.standFour,
        "3": actionTypes.standFour,
        "4": actionTypes.standFour,
        "5": actionTypes.standFour,
        "6": actionTypes.standFour,
        "7": actionTypes.standFour,
        "8": actionTypes.standFour,
        "9": actionTypes.standFour,
        "10": actionTypes.standThree,
        "J": actionTypes.standThree,
        "Q": actionTypes.standThree,
        "K": actionTypes.standThree,
        "A": actionTypes.standFour,
    },
    "A9": {
        "2": actionTypes.standFour,
        "3": actionTypes.standFour,
        "4": actionTypes.standFour,
        "5": actionTypes.standFour,
        "6": actionTypes.standFour,
        "7": actionTypes.standFour,
        "8": actionTypes.standFour,
        "9": actionTypes.standFour,
        "10": actionTypes.standFour,
        "J": actionTypes.standFour,
        "Q": actionTypes.standFour,
        "K": actionTypes.standFour,
        "A": actionTypes.standFour,
    },
    "A10": {
        "2": actionTypes.blackjackStandFour,
        "3": actionTypes.blackjackStandFour,
        "4": actionTypes.blackjackStandFour,
        "5": actionTypes.blackjackStandFour,
        "6": actionTypes.blackjackStandFour,
        "7": actionTypes.blackjackStandFour,
        "8": actionTypes.blackjackStandFour,
        "9": actionTypes.blackjackStandFour,
        "10": actionTypes.blackjackStandFour,
        "J": actionTypes.blackjackStandFour,
        "Q": actionTypes.blackjackStandFour,
        "K": actionTypes.blackjackStandFour,
        "A": actionTypes.blackjackStandFour,
    },
    "AJ": {
        "2": actionTypes.blackjackStandFour,
        "3": actionTypes.blackjackStandFour,
        "4": actionTypes.blackjackStandFour,
        "5": actionTypes.blackjackStandFour,
        "6": actionTypes.blackjackStandFour,
        "7": actionTypes.blackjackStandFour,
        "8": actionTypes.blackjackStandFour,
        "9": actionTypes.blackjackStandFour,
        "10": actionTypes.blackjackStandFour,
        "J": actionTypes.blackjackStandFour,
        "Q": actionTypes.blackjackStandFour,
        "K": actionTypes.blackjackStandFour,
        "A": actionTypes.blackjackStandFour,
    },
    "AQ": {
        "2": actionTypes.blackjackStandFour,
        "3": actionTypes.blackjackStandFour,
        "4": actionTypes.blackjackStandFour,
        "5": actionTypes.blackjackStandFour,
        "6": actionTypes.blackjackStandFour,
        "7": actionTypes.blackjackStandFour,
        "8": actionTypes.blackjackStandFour,
        "9": actionTypes.blackjackStandFour,
        "10": actionTypes.blackjackStandFour,
        "J": actionTypes.blackjackStandFour,
        "Q": actionTypes.blackjackStandFour,
        "K": actionTypes.blackjackStandFour,
        "A": actionTypes.blackjackStandFour,
    },
    "AK": {
        "2": actionTypes.blackjackStandFour,
        "3": actionTypes.blackjackStandFour,
        "4": actionTypes.blackjackStandFour,
        "5": actionTypes.blackjackStandFour,
        "6": actionTypes.blackjackStandFour,
        "7": actionTypes.blackjackStandFour,
        "8": actionTypes.blackjackStandFour,
        "9": actionTypes.blackjackStandFour,
        "10": actionTypes.blackjackStandFour,
        "J": actionTypes.blackjackStandFour,
        "Q": actionTypes.blackjackStandFour,
        "K": actionTypes.blackjackStandFour,
        "A": actionTypes.blackjackStandFour,
    }
}

const normalCombination = {
    "4": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.hit,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "5": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.hit,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "6": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.hit,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "7": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.hit,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "8": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.hit,
        "5": actionTypes.hit,
        "6": actionTypes.hit,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "9": {
        "2": actionTypes.hit,
        "3": actionTypes.double,
        "4": actionTypes.double,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "10": {
        "2": actionTypes.double,
        "3": actionTypes.double,
        "4": actionTypes.double,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.double,
        "8": actionTypes.double,
        "9": actionTypes.double,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "11": {
        "2": actionTypes.double,
        "3": actionTypes.double,
        "4": actionTypes.double,
        "5": actionTypes.double,
        "6": actionTypes.double,
        "7": actionTypes.double,
        "8": actionTypes.double,
        "9": actionTypes.double,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "12": {
        "2": actionTypes.hit,
        "3": actionTypes.hit,
        "4": actionTypes.standThree,
        "5": actionTypes.standThree,
        "6": actionTypes.standThree,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    }, 
    "13": {
        "2": actionTypes.standThree,
        "3": actionTypes.standThree,
        "4": actionTypes.standFour,
        "5": actionTypes.standFour,
        "6": actionTypes.standFour,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "14": {
        "2": actionTypes.standFour,
        "3": actionTypes.standFour,
        "4": actionTypes.standFour,
        "5": actionTypes.standFour,
        "6": actionTypes.standFour,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "15": {
        "2": actionTypes.standFour,
        "3": actionTypes.standFour,
        "4": actionTypes.standFour,
        "5": actionTypes.standFour,
        "6": actionTypes.standFour,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "16": {
        "2": actionTypes.standFour,
        "3": actionTypes.standFour,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.hit,
        "8": actionTypes.hit,
        "9": actionTypes.hit,
        "10": actionTypes.hit,
        "J": actionTypes.hit,
        "Q": actionTypes.hit,
        "K": actionTypes.hit,
        "A": actionTypes.hit,
    },
    "17": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.standFour,
        "10": actionTypes.standFour,
        "J": actionTypes.standFour,
        "Q": actionTypes.standFour,
        "K": actionTypes.standFour,
        "A": actionTypes.standFour,
    },
    "18": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.stand,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "19": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.stand,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "20": {
        "2": actionTypes.stand,
        "3": actionTypes.stand,
        "4": actionTypes.stand,
        "5": actionTypes.stand,
        "6": actionTypes.stand,
        "7": actionTypes.stand,
        "8": actionTypes.stand,
        "9": actionTypes.stand,
        "10": actionTypes.stand,
        "J": actionTypes.stand,
        "Q": actionTypes.stand,
        "K": actionTypes.stand,
        "A": actionTypes.stand,
    },
    "21": {
        "2": actionTypes.forcedResolved,
        "3": actionTypes.forcedResolved,
        "4": actionTypes.forcedResolved,
        "5": actionTypes.forcedResolved,
        "6": actionTypes.forcedResolved,
        "7": actionTypes.forcedResolved,
        "8": actionTypes.forcedResolved,
        "9": actionTypes.forcedResolved,
        "10": actionTypes.forcedResolved,
        "J": actionTypes.forcedResolved,
        "Q": actionTypes.forcedResolved,
        "K": actionTypes.forcedResolved,
        "A": actionTypes.forcedResolved,
    },
}

const getCardNumber = (el) => {
    if(!el) return

    const text = el.getAttribute("data-role");
    const newText = text.replace("card-","").substring(1);
    return newText
}

let timer = [];

const deleteTimer = () => {
    timer.forEach((abandoned) => {
        clearInterval(abandoned);
    })
  
    timer = [];
  
}
const addTimer = (param) => {
    timer.push(param)
}

const getElements = async (lastCardIndex,customSelector,timeout) => {


    return new Promise(async (resolve,reject) => {
        let waitTimes = 0;
        console.log("getting element");
        addTimer(setInterval(() => {

            if(customSelector){
                const customElement = document.querySelector(customSelector);
                const customElementArray = document.querySelectorAll(customSelector);

             
                if(customElement !== undefined && customElement !== null && customElementArray[lastCardIndex] !== undefined && customElementArray[lastCardIndex] !== null ){
                    console.log(customElementArray);
                    resolve([customElement,customElementArray]);
                    deleteTimer();
                    return
                }

           
            }else{
                const dealerCard = document.querySelector("div[data-role='dealer-virtual-cards'] > div > div[data-role='card-0'] > span");
                const myCards = document.querySelectorAll("div[data-role='firstHand-cards'] > div[data-role='virtual-card'] > div > div > div > span");
    
                if(dealerCard && myCards[lastCardIndex] ){
                 
                    resolve({dealerCard, myCards});
                    deleteTimer();
                    return
                }
            }
            if(timeout !== undefined && timeout !== null && timeout > 0 && timeout !== NaN){
                waitTimes++;
   
                if(waitTimes >= timeout){
                    console.log("get element timeout");
                    deleteTimer();
                    reject("element not found");
                }
            }
    

        }, 1000));

    })


}


let noButtonCLicked = false;



const raceButtonElement = async (raceButtons = []) => {
    return new Promise(async (resolve,reject) => {
        //buttonType.hit buttonType.bet
        const promises = [];
        const createGetElementArray = (btn) => getElements(0,btn);

        raceButtons.forEach(({btn}) => {
            promises.push(createGetElementArray(btn))
        })

        console.log("race start")
        const [winnerBtn] = await Promise.race(promises);
        deleteTimer();
        
        raceButtons.forEach(({btn,action}) => {
      
            const getBtnElement = document.querySelector(btn);
            if(getBtnElement === winnerBtn){
                console.log("race end");
                action(resolve,reject,winnerBtn);
                return
            }
        })


    })
}

const handCheck = async (dealerCard, myCards, callbackOnResolve, isSecondHand) => {
 
  

    
    const dealerNumber = getCardNumber(dealerCard);
    const firstCard = getCardNumber(myCards[0]);
    const secondCard = getCardNumber(myCards[1]);
    //buttonContainer--f47c3 no safe button 
    console.log(`dealer cards is: ${dealerNumber}`);

    if(dealerNumber === "A" && !noButtonCLicked){
        console.log("wait for safety button");    
        try{
            const [noButton] = await getElements(0,buttonType.no,5);
            noButton.click();
            noButtonCLicked = true;
            console.log("no button clicked");
        }catch(err){
            console.log("get safety button error");
        }  
      
    }


    const statusCheck = () => {
        return new Promise(async (resolve,reject) => {
            try{
                raceButtonElement([
                    {
                        btn: buttonType.hit,
                        action: (resolve,reject) => resolve()
                    },{
                        btn: buttonType.bet,
                        action: (resolve,reject) => reject()
                    }
                ]).then(resolve).catch(reject);
            }catch(err){
                resolve();
            }
        });
    }

    try{
        await statusCheck()
    }catch(err){
        console.log("game resolved");
        startBetting();
        return
    }


    console.log(`card counts: ${myCards.length}`)
    if(myCards.length >= 6){
        console.log("Six Card Charlie!!!");
        if(callbackOnResolve){
            callbackOnResolve();
            return
        }else{
            startBetting();
            return
        }
    }

    const cardNumbers = [];
    myCards.forEach((card) => {
        cardNumbers.push(getCardNumber(card))
    });

    const isPair = firstCard === secondCard;
    const hasAce = cardNumbers.includes("A");

    let playerValue = 0;
    cardNumbers.forEach(num => {  
        playerValue += cardTypes[num].value 
    });

    if(playerValue > 21){
        console.log("bust");
        if(callbackOnResolve){
            callbackOnResolve();
            return
        }else{
            startBetting();
            return
        }
      
    }

    let playerValueExcludeA = 0;

    cardNumbers.every((num, i) => {
        if(num === "A"){
            const ExcludeA = cardNumbers;
            ExcludeA.splice(i, 1); 
            ExcludeA.forEach((num) => {
                playerValueExcludeA += cardTypes[num].value 
            });
            return false
        }else{
            return true
        }
    })
    console.log("balance check",balanceCheck())
    if(isPair && myCards.length < 3 && (callbackOnResolve === undefined || callbackOnResolve === null) && balanceCheck()) {
        console.log("is pair");
        pairCombination[`${firstCard}${secondCard}`][dealerNumber](dealerCard, myCards, callbackOnResolve, isSecondHand);
        // console.log(`${firstCard} ${secondCard}`);
    
    }else if(hasAce && playerValueExcludeA <= 10){
        // const firstChar = firstCard === "A" ? firstCard : secondCard;
        // const secondChar = firstCard === "A" ?  secondCard : firstCard;

        //hasAceCombination[`${firstChar}${secondChar}`][dealerNumber](dealerCard, myCards);
        console.log(playerValueExcludeA,"has A");
        hasAceCombination[`A${playerValueExcludeA}`][dealerNumber](dealerCard, myCards, callbackOnResolve, isSecondHand);



    }else{
   

        console.log(playerValue, "normal card value");

        normalCombination[playerValue.toString()][dealerNumber](dealerCard, myCards, callbackOnResolve, isSecondHand)
   
    }

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




let frequency = 1;
let betTimer;
const betMoney = async () => {
    //data-state="enabled"
    return new Promise(async (resolve,reject) => {
        //const betButton = await getElements(0,"div.border--c5bcb.spinningBorderVisible--84727.borderSpinning--ea474 > div");
        
        const [betButton] = await getElements(0,buttonType.bet);
        let bettedTimes = 1;
        if(betButton){
            if(frequency > 1){
                betTimer = setInterval(() => {
                    if(bettedTimes >= frequency){
                        clearInterval(betTimer);
                    }
                    betButton.click();
                    bettedTimes++;
                },300)
            }else{
                betButton.click();
            }
      
            console.log("bet");
            resolve()
        }
    })
}

const isValidNumber = (arg) => (arg !== undefined && arg !== NaN && arg !== null && arg > 0);

const firstRun = () => {
    const roundsInput = window.prompt("How many rounds do you want to play? / 你想要賭多少局?");


    if(!(isValidNumber(parseInt(roundsInput))) || roundsInput === ""){
        console.log(`%cYour rounds input is invalid`, "color: red; font-size: 24px; font-weight: 700;");
        return false
    }else{
        maxBetTimes = parseInt(roundsInput);
    }

    const frequencyInput = window.prompt("How many times do you want to bet in each game? / 每局你想下注多少次");
 
    if(!(isValidNumber(parseInt(frequencyInput))) || frequencyInput === ""){
        console.log(`%cYour frequency input is invalid`, "color: red; font-size: 24px; font-weight: 700;");
        return false
    }else{
      
        frequency = parseInt(frequencyInput);
  
    }

    const selectedChipValue = Number(document.querySelector("div[data-role='selected-chip'] text").textContent);
    //document.querySelector("div[data-role='selected-chip']  div[data-role='chip']").getAttribute("data-value")
    const confirm = window.confirm(`Are you going to bet / 你確定是要想下注 $${selectedChipValue * frequencyInput} ( ${selectedChipValue} * ${frequencyInput} ) ? `);

    if(confirm){
        console.log(`%cThe program is going to play ${roundsInput} rounds, $${selectedChipValue * frequencyInput} for each !!!`, "color: red; font-size: 24px; font-weight: 700;");
        betSize = selectedChipValue * frequencyInput;
        return true
    }else{
        console.log(`%cThe program is cancelled`, "color: red; font-size: 24px; font-weight: 700;");
        return false
    }



}

const cardCount = () => {
    const firstHand = document.querySelectorAll("div[data-role='firstHand-cards'] > div[data-role='virtual-card'] > div > div > div > span")
    const secondHand = document.querySelectorAll("div[data-role='secondHand-cards'] > div[data-role='virtual-card'] > div > div > div > span");
    const dealerCard = document.querySelector("div[data-role='dealer-virtual-cards'] > div > div[data-role='card-0'] > span");
}

const startBetting = async () => {


    if(maxBetTimes === 1 && currentBetTimes === 1){
        deleteTimer();
        currentBetTimes = 0;
        return
    }



    if(currentBetTimes >= maxBetTimes){
        deleteTimer();
        currentBetTimes = 0;
        return
    }

    console.log("starting bet money");

    noButtonCLicked = false;

    await betMoney();
    currentBetTimes += 1;
    
    console.log(`%c round: ${currentBetTimes} / ${maxBetTimes}`, "background-color: #00688B; font-size: 24px; font-weight: 700;");
    const {dealerCard, myCards} = await getElements(1);
    handCheck(dealerCard, myCards)

}

const runBtnOnClick = () => {
    const confirm = firstRun();
    if(confirm){
        startBetting();
    }
}

const stopBtnOnClick = () => {
    console.log("stop");
    deleteTimer();
    clearInterval(betTimer);
    currentBetTimes = 0;
    maxBetTimes = 20;
}



const inertButton = () => {



    const runButton = document.createElement("button");
    runButton.appendChild(document.createTextNode("run"));

    runButton.style.backgroundColor = "green"
    buttonBaseStyles(runButton);

    runButton.addEventListener("click",runBtnOnClick);

    const stopButton = document.createElement("button");
    stopButton.appendChild(document.createTextNode("stop"));

    stopButton.style.backgroundColor = "red"
    buttonBaseStyles(stopButton);

    stopButton.addEventListener("click",stopBtnOnClick);


    const buttonsContainer = document.createElement("div");
    containerStyles(buttonsContainer);
    buttonsContainer.appendChild(runButton);
    buttonsContainer.appendChild(stopButton);

    const body = document.querySelector("body");
    body.appendChild(buttonsContainer);

    console.log("auto gambling V33_origin_stable inserted")
}



(function() {
    'use strict';
    inertButton()
})();
