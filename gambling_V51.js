
const sendRequest = async (route,msg) => {
    console.log("sending req");
    const rawResponse = await fetch(`https://localhost:3003${route}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Methods': "GET,POST,PUT,PATCH,DELETE",
        },
        body: JSON.stringify({msg})
   });
   const content = await rawResponse.json();
 
   console.log(content);
}
const getBalance = () => {
    const balance = document.querySelector("span[data-role='balance-label__value']" ).textContent;
 
    return parseInt(balance.replace(",",""));
}

const sendBalance = () => {
    sendRequest("/",getBalance());
}


const balanceCheck = () => {
    const balance = getBalance();
    return balance >= betSize

}


let disconnectionCheckTimer; 



let stoppedCheckTimer;

let alertLoopTimer;
const setStoppedChecker = () => {
    console.log("start unexpected stop checking");
    stoppedCheckTimer = setTimeout(() => {
  
        alertLoopTimer = setInterval(() => {
            sendRequest("/error", "timeout");
            console.log("timeout");
        },1000 * 3)
    }, 1000 * 60 * 5);

}
const refreshStoppedCheckTimer = () => {
    console.log("refresh timer");
    clearInterval(alertLoopTimer);
    clearTimeout(stoppedCheckTimer);
    setStoppedChecker();
}

const startDisconnectionCheck = () => {

    const findDisconnectionText = () => {
    
        // const matches = [];
        // for (const div of document.querySelectorAll('div.title--f4c0d')) {
        //     if (div.textContent.includes("等待連接") || div.textContent.includes("等待连接")) {
        //         matches.push(div);
        //     }
        // }
        //div[data-role='connection-message'] 
        //const svgLoadingIconFirst = document.querySelector("div.icon--74776 > svg.icon--44cab.isAnimated--65bd1");

        return new Promise((resolve,reject) => {
            const getLoadingIcon = () => {
                return document.querySelector("div[data-role='basic-video-ui'] div.icon--52ace > svg.icon--44cab.isAnimated--65bd1") || document.querySelector("div.icon--74776 > svg.icon--44cab.isAnimated--65bd1");
            }

            if(getLoadingIcon() !== null && getLoadingIcon() !== undefined){
           
                setTimeout(() => {
                    console.log("wait for reconnect");
                    if(getLoadingIcon() !== null && getLoadingIcon() !== undefined){
                        reject("bad network");
                    }else{
                        resolve();
                    }
                }, 2500)
            }
            
        })

        return (/*svgLoadingIconFirst !== null ||*/ svgLoadingIconSecond !== null)
    }
    const findEmptyChipTower = () => {
        const betSpotStrokeWidth = document.querySelector("#lightningBetspotOutline").getAttribute("stroke-width");
        return betSpotStrokeWidth === "0.6" && currentBetTimes > 1
        //disabled === 0.6 normal === 2.6
    }
    console.log("start detecting");
    disconnectionCheckTimer = setInterval(() => {
        
        console.log("check");
        findDisconnectionText().catch((err) => {
            sendRequest("/error",err);
            console.log(err)
        });

        if(!(balanceCheck())){
            sendRequest("/error", "balance is empty");
            console.log("balance is empty")
        }
        if(findEmptyChipTower()){
            sendRequest("/error", "unexpected stop");
            console.log("unexpected stop")

        }
        const tableClosedDiv = document.querySelector("div[data-role='title']");//popup
        if(tableClosedDiv){
            if(tableClosedDiv.textContent === "賭桌關閉" || tableClosedDiv.textContent === "赌桌关闭"){
                sendRequest("/error", "table closed");
                console.log("table closed")
            }
        }
  
    }, 3000);

    setStoppedChecker();

}


const stopDisconnectionCheck = () => {
    console.log("stop detecting");
    clearInterval(disconnectionCheckTimer);
    clearTimeout(stoppedCheckTimer);
    clearInterval(alertLoopTimer);
}

let betSize = 5;




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
let currentBetTimes = 0;
let maxBetTimes = 20;

const buttonType = {
    hit: "div[data-role='hit'] > div.iconContainer--004ac > div.icon--eb080 > div.buttonContainer--bd9a6",
    stand: "div[data-role='stand'] > div.iconContainer--004ac > div.icon--eb080 > div.buttonContainer--bd9a6",
    double: "div[data-role='double'] > div.iconContainer--004ac > div.icon--eb080 > div.buttonContainer--bd9a6",
    split: "div[data-role='split'] > div.iconContainer--004ac > div.icon--eb080 > div.buttonContainer--bd9a6",
    bet: "div[data-state='enabled'].container--e0aac.container--dac87.enabled--b1cef.enabled--00dd8 div.gradientBorder--dfa99",
    no: "div[data-role='no-position'] > div[data-role='no'] > div > div > div"
}


const cardCount = {
    playedCard: 0,
    multiplication: 0

}

let currentHands = [];

let isRedCardDetected = false;
const resetCardCount = () => {
    cardCount.playedCard = 0;
    cardCount.multiplication = 0;
}

let visionTemp = []
const visionAi = async () => {
    console.log("running ai");

    const waitVideoElement = () => {
        return new Promise((resolve,reject) => {
            const timer = setInterval(() => {
                console.log("getting video element")
                const video = document.querySelector("#fmp4-video"); //#fmp4-video
                if(video) {
                    resolve(video);
                    clearInterval(timer);
                }
            },500)
        });
    }
    const video = await waitVideoElement();
    let model, RedCardModel;
    let cameraMode = "environment"; // or "user"




    const loadModelPromise = new Promise(function(resolve, reject) {
        roboflow.auth({
            publishable_key: publishable_key
        }).load(toLoad).then(function(m) {
            model = m;
            window.model = model;
            console.log("Card Vision Model loaded")
            resolve();
        });
    });
    const loadRedCardModelPromise = new Promise(function(resolve, reject) {
        roboflow.auth({
            publishable_key: publishable_key
        }).load(RedCardToLoad).then(function(m) {
            console.log("Red Card Vision Model loaded")
            RedCardModel = m;
            //window.model = model;
            resolve();
        });
    });

    const body = document.querySelector("body");
    Promise.all([
        //startVideoStreamPromise,
        loadModelPromise,
        loadRedCardModelPromise
    ]).then(function() {
        //body.classList.remove("loading");
        detectFrame();
    });

    const timers = [];
    const optimizedAnimationFrame = (callback) => {
        timers.push(
            setTimeout(() => {
                callback()
            },2)
        )
      
    }


    const cardClasses = {
        "A": {
            name: "A",
            count : 0
        },
        "2": {
            name: "2",
            count : 0
        },
        "3": {
            name: "3",
            count : 0
        },
        "4": {
            name: "4",
            count : 0
        },
        "5": {
            name: "5",
            count : 0
        },
        "6": {
            name: "6",
            count : 0
        },
        "7": {
            name: "7",
            count : 0
        },
        "8": {
            name: "8",
            count : 0
        },
        "9": {
            name: "9",
            count : 0
        },
        "10": {
            name: "T",
            count : 0
        },
        "T": {
            name: "T",
            count : 0
        },
        "J": {
            name: "J",
            count : 0
        },
        "Q": {
            name: "Q",
            count : 0
        }
        ,
        "K": {
            name: "K",
            count : 0
        },
        "RED": {
            name: "RED",
            count : 0
        }
    }
    let emptyAccumulator = 0;
    const visionCardCount = (card) => {
        cardClasses[card].count++;
    }
    const refreshCardCounts = () => {
        Object.keys(cardClasses).forEach((card) => {
            cardClasses[card].count = 0;
        })
    }

    const findTheHighestCount = () => {
        let highestCountCard = undefined;
        Object.keys(cardClasses).forEach((card) => {
            if(cardClasses[card].count === 0){
                return
            }
            if(highestCountCard === undefined){
                highestCountCard = cardClasses[card]
            }else{
                highestCountCard = highestCountCard.count > cardClasses[card].count ? highestCountCard : cardClasses[card]
            }
        
        });
        return highestCountCard
    }
    let cardFound = false;
  
    const storeVisionCardCounting = () => {
        if(visionTemp !== 0){
            cardCount.playedCard += visionTemp.length;
            visionTemp.forEach((hand) => {
                cardCount.multiplication += cardTypes[hand].multiplication
            });
            visionTemp = [];
        }

   
    }
       

    const detectFrame = async function() {
        const firstHand = document.querySelectorAll("div[data-role='firstHand-cards'] > div[data-role='virtual-card'] > div > div > div > span")
        const secondHand = document.querySelectorAll("div[data-role='secondHand-cards'] > div[data-role='virtual-card'] > div > div > div > span");
        const dealerCard = document.querySelectorAll("div[data-role='dealer-virtual-cards'] > div > div > span");
        
        const nativeCardCounting = (onCardFounded) => {
  
            const fetchHands = [];
 
          
            [firstHand,secondHand,dealerCard].forEach((hands) => {
                hands.forEach((hand) => {
                    fetchHands.push(getCardNumber(hand))
                });
            
            })
            if(fetchHands.length !== 0){
                if(fetchHands.length > currentHands.length && dealerCard.length === 1){
                    console.log("new player card found", fetchHands.length - currentHands.length);
                    onCardFounded && onCardFounded()
                }
                currentHands = structuredClone(fetchHands)
            }
            
            //console.log(getCurrentTrueCount(),visionTemp)
        
           
        }

        nativeCardCounting(() => {
            emptyAccumulator = 0;
            refreshCardCounts();
            visionTemp = [];
            console.log("refreshed", emptyAccumulator)
        });

 
        const getDealerCardPoint = () => {
            const scoreElement = document.querySelector("div.dealerScore--f29f0 > div > div[data-role='score']");
            const score = parseInt(scoreElement.textContent)
            return score ? score : 0
        }
        const dealerPoint = getDealerCardPoint();

        if(dealerPoint >= 17){
            storeVisionCardCounting();
        }

        if(!model || !RedCardModel) return optimizedAnimationFrame(detectFrame);

        model.configure({
            threshold: 0.8,
            overlap: 1,
            max_objects: 1
        });
        RedCardModel.configure({
            threshold: 0.92,
            overlap: 1,
            max_objects: 1
        })

        try{
            const [predictions,RedCardPredictions] = await Promise.all([
                model.detect(video),
                RedCardModel.detect(video)
            ]);

            
            if(RedCardPredictions.length !== 0){
                resetCardCount();
                console.log("reset card count")
            }else if(predictions.length !== 0){
                visionCardCount(predictions[0].class);
                cardFound = true;
           
              
            }else{
                emptyAccumulator++;
                
                if(emptyAccumulator >= 60 && firstHand.length >= 2){
                    if(cardFound){
                      
                        const VisionCardFound = findTheHighestCount();
                        if(VisionCardFound){
                            console.log("card count",VisionCardFound);
                            cardFound = false;
                            visionTemp.push(VisionCardFound.name);
                        }
                   
                     
                    }
                  
                    refreshCardCounts();
                    emptyAccumulator = 0;
                }
            }
        



            optimizedAnimationFrame(detectFrame);

        }catch(err){
            console.log("CAUGHT", err);
        }
    
    };

}    


const totalDecks = 8;
const getCurrentTrueCount = () => {
    let current = {
        playedCard: 0,
        multiplication: 0
    };
    current.playedCard = currentHands.length + cardCount.playedCard;
    currentHands.forEach((hand) => {
       
        current.multiplication += cardTypes[hand].multiplication;
       
    });
    current.multiplication += cardCount.multiplication;
    //currentHands.playedCard +=
    const trueCount = current.multiplication / ( ( totalDecks * 52 - current.playedCard ) / 52 )
    return {
        ...current,
        trueCount
    }
    
}
const storeCardCountingHistory = () => {
    if(currentHands !== 0){
        cardCount.playedCard += currentHands.length;
        currentHands.forEach((hand) => {
            cardCount.multiplication += cardTypes[hand].multiplication
        });
        currentHands = [];
    }
   
}

const handleResolve = (callbackOnResolve) => {

    if(callbackOnResolve){
        console.log("run callback");
        callbackOnResolve();
        return
    }else{
        console.log("game resolved");
        startBetting();
    }
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
            handleResolve(callbackOnResolve)
        }
    },
    stand: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
  
        console.log("Stand");
   
        const [standButton] = await getElements(0,buttonType.stand);
        if(standButton){
            standButton.click();
            console.log("stand button clicked");
        }
   
        handleResolve(callbackOnResolve)
   
    },
    standThree: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
      
        console.log("S3");

    


        if(oldMyCards.length > 3){ 

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
            handleResolve(callbackOnResolve)
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
         
            handleResolve(callbackOnResolve)
        }else{
            actionTypes.hit(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }


    },
    doubleStandThree: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("DS3");
        console.log("balance check",balanceCheck());

        if(oldMyCards.length === 2 && (callbackOnResolve === undefined || callbackOnResolve === null) && !isSecondHand && balanceCheck()){
            actionTypes.double(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
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

        const {dealerCard, myCards} = await getElements(1);
        handCheck(dealerCard, myCards, secondHandCheck);

        //data-role="status-text" .textContent
    

        //getElements 

        //buttonContainer--bd9a6 isNotPreferredDecision--a6f1f //split button
        //cardContainer--b4b58 second card 
    },
    forcedResolved: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {



        console.log("forced resolved");
        

        handleResolve(callbackOnResolve)
   
    },
    splitThenResolved:  async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {


        console.log("Split and forced resolve");
        console.log("balance check",balanceCheck());
        

        const [splitButton] = await getElements(0,buttonType.split);
        if(splitButton ){
            splitButton.click();
            console.log("split button clicked");
        }
    
        handleResolve(callbackOnResolve);

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
        const createGetElementArray = (btn,lastIndex = 0) => getElements(lastIndex,btn);

        raceButtons.forEach(({btn,lastIndex = 0}) => {
            promises.push(createGetElementArray(btn, lastIndex))
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
        handleResolve(callbackOnResolve)
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
        handleResolve(callbackOnResolve);
        return
      
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
        let adjustedFrequency = frequency;
        const trueCount = getCurrentTrueCount().trueCount;
        console.log(trueCount )
        
        if(trueCount < 0){
            adjustedFrequency = config["-1"];
        }
        if(trueCount >= 1 && trueCount < 2){
            adjustedFrequency = adjustedFrequency * config["1"];
        }
        if(trueCount >= 2 && trueCount < 3){
            adjustedFrequency = adjustedFrequency * config["2"];
        }
        if(trueCount >= 3 && trueCount < 4){
            adjustedFrequency = adjustedFrequency * config["3"];
        }
        if(trueCount >= 4 && trueCount < 5){
            adjustedFrequency = adjustedFrequency * config["4"];
        }

        if(betButton){
            if(adjustedFrequency > 1){
                betTimer = setInterval(() => {
                    if(bettedTimes >= adjustedFrequency){
                        clearInterval(betTimer);
                    }
                    betButton.click();
                    bettedTimes++;
                },200)
            }else if(adjustedFrequency === 1){
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

    const selectedChipValue = Number(document.querySelector("div[data-role='selected-chip'] > div[data-role='chip']").getAttribute("data-value"));
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




let enableWhatsappFunction = false;
let enableSendBalance = false;

const startBetting = async () => {


    if(maxBetTimes === 1 && currentBetTimes === 1){
        deleteTimer();
        currentBetTimes = 0;
        sendRequest("/error", "stopped");
        return
    }



    if(currentBetTimes >= maxBetTimes){
        deleteTimer();
        currentBetTimes = 0;
        sendRequest("/error", "stopped");
        return
    }

    console.log("starting bet money");

    if(enableSendBalance && enableWhatsappFunction){
        sendBalance();
    }

    noButtonCLicked = false;

    await betMoney();
    refreshStoppedCheckTimer();
    storeCardCountingHistory();
    currentBetTimes += 1;
    
    console.log(`%c round: ${currentBetTimes} / ${maxBetTimes}`, "background-color: #00688B; font-size: 24px; font-weight: 700;");
    const {dealerCard, myCards} = await getElements(1);
  
    handCheck(dealerCard, myCards)

}
const togglePlusTableButton = (on) => {
    const plusTableButton = document.querySelector("button[data-role='plus-table-button']")
    if(plusTableButton){
        plusTableButton.style.display = on ? "plusTableButton" : "none";

    }
}
const runBtnOnClick = () => {
    const confirm = firstRun();

    if(confirm){
        if(enableWhatsappFunction){
            startDisconnectionCheck(); 
        }
        togglePlusTableButton(false);
        visionAi();
        //cardCounting();
        startBetting();
    }
}

const stopBtnOnClick = () => {
    console.log("stop");
    deleteTimer();
    clearInterval(betTimer);
    stopDisconnectionCheck();
    togglePlusTableButton(true);
    currentBetTimes = 0;
    maxBetTimes = 20;
}


const fetchData = async () => {
    console.log("sending req"); 
    //20230306
    const specifiedDay = window.prompt("which day you want to fetch");
    const baseUrl = "https://evo88.nomisma88.com"
    const providerVersion = "gameProvider=evolution&client_version=6.20230307.182619.22477-fb0d9deba7";
    if(specifiedDay.length !== 8){ 
 
        console.log("input error")
        return 
    }
    const fetchADay = (date) => {
        return fetch(`${baseUrl}/api/player/history/day/${date}?${providerVersion}`);
    }

    const fetchAGame = (id) => {
        return fetch(`${baseUrl}/api/player/history/game/${id}?${providerVersion}`);;
    }
    const rawData = await fetchADay(specifiedDay); 
    const dataObject = await rawData.json();
    console.log(dataObject.length, specifiedDay);

    const postData = async (data,route) => {
        return new Promise(async (resolve,reject) => {
            try{
                const rawResponse = await fetch(`http://localhost:3000/${route}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': "*",
                        'Access-Control-Allow-Methods': "GET,POST,PUT,PATCH,DELETE",
                    },
                    body: JSON.stringify(data)
                });
                const res = await rawResponse.json();
                resolve(res);
            }catch(err){
                console.log(err);
                reject(err)
            }
        
        });
 
    }

    let i = 0;
    const timer = setInterval(async () => {
        if(i < dataObject.length){
            const rawGame = await fetchAGame(dataObject[i].id);
            const game = await rawGame.json();
            const dealerHand = game.result.dealerHand;
            const playerHand = game.participants[0].hands;

            const status = await postData(
                {
                    id: dataObject[i].id,
                    dealerHand,
                    playerHand
                }, 
                specifiedDay
            );

            console.log(i,status)
        }else{
            clearInterval(timer);
        }


        i++;
    },1500)


}
let rolloverAlarms = [];
const startRolloverAlarm = () => {
    if(enableWhatsappFunction){
        console.log("start rollover check");
        const rollover = window.prompt("What is the target number of rollover");
        const targetNumber = parseInt(rollover);
        rolloverAlarms.forEach((timer) => {
            clearInterval(timer);
        })
        if(targetNumber === "0" || targetNumber === 0) return

        rolloverAlarms.push( 
            setInterval(() => {
         
                const currentRolloverRaw = document.querySelectorAll("td.bet--53c7d")[0];
                if(currentRolloverRaw ){
                    const currentRollover = parseInt(currentRolloverRaw.textContent.substring(1).replace(" ","").replace(",",""));
                    console.log(`rollover check, current: ${currentRollover}, target: ${targetNumber}`)
                    if(currentRollover >= targetNumber){
                        console.log("rollover reached");
                        sendRequest("/error", "target reached");
                    }
                }
        
            }, 5000)
        )
    }

}

const inertButton = () => {


    //run button
    const runButton = document.createElement("button");
    runButton.appendChild(document.createTextNode("run"));
    runButton.style.backgroundColor = "green"
    buttonBaseStyles(runButton);
    runButton.addEventListener("click",runBtnOnClick);

    //stop button
    const stopButton = document.createElement("button");
    stopButton.appendChild(document.createTextNode("stop"));
    stopButton.style.backgroundColor = "red"
    buttonBaseStyles(stopButton);
    stopButton.addEventListener("click",stopBtnOnClick);

    //fetch button
    const fetchButton = document.createElement("button");
    fetchButton.appendChild(document.createTextNode("fetch"));
    fetchButton.style.backgroundColor = "lightblue"
    buttonBaseStyles(fetchButton);
    fetchButton.addEventListener("click",fetchData);

    //rollover alarm button
    const alarmButton = document.createElement("button");
    alarmButton.appendChild(document.createTextNode("alarm"));
    alarmButton.style.backgroundColor = "#154c79";
    buttonBaseStyles(alarmButton);
    alarmButton.addEventListener("click",startRolloverAlarm);

    const buttonsContainer = document.createElement("div");
    containerStyles(buttonsContainer);
    buttonsContainer.appendChild(runButton);
    buttonsContainer.appendChild(stopButton);
    //buttonsContainer.appendChild(fetchButton);
    buttonsContainer.appendChild(alarmButton);

    const body = document.querySelector("body");
    body.appendChild(buttonsContainer);

    console.log("auto gambling V50_beta_wts inserted")
}

const dataCheck = () => {
    setInterval(() => {
        console.log(getCurrentTrueCount(),visionTemp)
    }, 500)
}

(async function() {
    dataCheck()

    inertButton()
})();
