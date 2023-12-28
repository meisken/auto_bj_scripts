let visionModel;

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
const fetchTrueCount = async () => {
    return new Promise(async (resolve, reject) => {
        try{
            const res = await fetch('https://counterevo.meisken.dev/api/card_count',{
                method: "GET",
                cache: "no-cache", 
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Request": "meiskena999gambling",
                    'pragma': 'no-cache',
                    //"cache": 'no-store',
                    'Cache-Control': 'no-store, max-age=0',
           
                  
                },
                next: {
                    revalidate: 0,
                    //tags: ['card']
                }
            });
            const data = await res.json();
          
            cardCount.multiplication = data.multiplication
            cardCount.playedCard = data.playedCard

            const trueCount = data.multiplication / ( ( totalDecks * 52 - data.playedCard ) / 52 )
            console.log(`fetch true count: `,cardCount)
            resolve(trueCount)
         
        }catch(err){
            reject(err)
        }
    })


}
const getBalance = () => {
    const balance = document.querySelector("span[data-role='balance-label-value']" )?.textContent;
    if(balance){
        const normalize = balance.split(".")[0].split("").filter((char, i) => Number.isInteger(parseInt(char)))
        return parseInt(normalize.join(""));

    }else{
        console.error("balance check error")
        return 0
    }
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
let maxBetTimes = Infinity;

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
const animationFrameTimers = [];

const yoloVision = () => {
        
    const labels = [
        "RED"
    ]

    const Threshold = 0.85;

    class Colors {

        constructor() {
            this.palette = [
                "#FF3838",
                "#FF9D97",
                "#FF701F",
                "#FFB21D",
                "#CFD231",
                "#48F90A",
                "#92CC17",
                "#3DDB86",
                "#1A9334",
                "#00D4BB",
                "#2C99A8",
                "#00C2FF",
                "#344593",
                "#6473FF",
                "#0018EC",
                "#8438FF",
                "#520085",
                "#CB38FF",
                "#FF95C8",
                "#FF37C7",
            ];
            this.n = this.palette.length;
        }
    
        get = (i) => this.palette[Math.floor(i) % this.n];
    
        static hexToRgba = (hex, alpha) => {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? `rgba(${[parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)].join(
                    ", "
                )}, ${alpha})`
                : null;
        };
    }
   
    const handleRedDetected = () => {
        console.log("a red card is found")

       
        console.log("card count reset")
        resetCardCount()
    
     
           
     

    
        // const dealerCard = document.querySelectorAll("div[data-role='dealer-virtual-cards'] > div > div > span")
        // if(dealerCard.length === 0){
            
        // }
            
     
    }

    const renderBoxes = (canvasRef, boxes_data, scores_data, classes_data, ratios, triggeredCallback) => {


        const ctx = canvasRef.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
    
        const colors = new Colors();
    
        // font configs
        const font = `${Math.max(
            Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
            14
        )}px Arial`;
        ctx.font = font;
        ctx.textBaseline = "top";
    
        for (let i = 0; i < scores_data.length; ++i) {
            // filter based on class threshold
            const klass = labels[classes_data[i]];
            const color = colors.get(classes_data[i]);
            const score = (scores_data[i] * 100).toFixed(1) ;
        

            if(parseInt(score) > aiConfig.Threshold * 100){
                
                

                let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4);
                x1 *= ratios[0];
                x2 *= ratios[0];
                y1 *= ratios[1];
                y2 *= ratios[1];
                if(
                    (
                        y1 > 415 && y1 < 425 &&
                        x1 > 300 && x1 < 310 &&
                        y2 > 455 && y2 < 465 &&
                        x2 > 330 && x2 < 340
                    ) || (
                        aiConfig.disableAreaCheck
                    )
                ){
                    triggeredCallback && triggeredCallback()
                    const width = x2 - x1;
                    const height = y2 - y1;
                
                    console.log("boxes", y1, x1, y2, x2)
                    // draw box.
                    ctx.fillStyle = Colors.hexToRgba(color, 0.2);
                    ctx.fillRect(x1, y1, width, height);
                
                    // draw border box.
                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
                    ctx.strokeRect(x1, y1, width, height);
                
                    // Draw the label background.
                    ctx.fillStyle = color;
                    const textWidth = ctx.measureText(klass + " - " + score + "%").width;
                    const textHeight = parseInt(font, 10); // base 10
                    const yText = y1 - (textHeight + ctx.lineWidth);
                    ctx.fillRect(
                        x1 - 1,
                        yText < 0 ? 0 : yText, // handle overflow label box
                        textWidth + ctx.lineWidth,
                        textHeight + ctx.lineWidth
                    );
                
                    // Draw labels
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(klass + " - " + score + "%", x1 - 1, yText < 0 ? 0 : yText);
                }

            }

        }
    };

    const preprocess = (source, modelWidth, modelHeight) => {
        let xRatio, yRatio; // ratios for boxes
    
        const input = tf.tidy(() => {
            const img = tf.browser.fromPixels(source);
        
            // padding image to square => [n, m] to [n, n], n > m
            const [h, w] = img.shape.slice(0, 2); // get source width and height
            const maxSize = Math.max(w, h); // get max size
            const imgPadded = img.pad([
                [0, maxSize - h], // padding y [bottom only]
                [0, maxSize - w], // padding x [right only]
                [0, 0],
            ]);
        
            xRatio = maxSize / w; // update xRatio
            yRatio = maxSize / h; // update yRatio
        
            return tf.image
                .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
                .div(255.0) // normalize
                .expandDims(0); // add batch
        });
    
        return [input, xRatio, yRatio];
    };

    const detect = async (model, video, canvas) => {


        if(video && canvas){
        
        
            const  model_dim = [model.inputs[0].shape[1], model.inputs[0].shape[2]];
        
            // Set canvas height and width
        
            canvas.width = model_dim[0];
            canvas.height = model_dim[1];
            //console.log(width,height)

            // 4. TODO - Make Detections
            // const img = tf.browser.fromPixels(video)
            // const resized = tf.image.resizeBilinear(img,  model_dim).maximum(tf.scalar(0)).minimum(tf.scalar(1))
            // const casted = resized.cast('float32')
            // const expanded = casted.expandDims(0)

        
            const [modelWidth, modelHeight] = model_dim; // get model width and height

            tf.engine().startScope(); // start scoping tf engine
            const [input, xRatio, yRatio] = preprocess(video, modelWidth, modelHeight); // preprocess image
        
            const res = model.executeAsync(input); // inference model
            const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
            
            const boxes = tf.tidy(() => {
                const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
                const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
                const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
                const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
                return tf
                    .concat(
                        [
                            y1,
                            x1,
                            tf.add(y1, h), //y2
                            tf.add(x1, w), //x2
                        ],
                        2
                    )
                    .squeeze();
            }); // process boxes [y1, x1, y2, x2]
        
            const [scores, classes] = tf.tidy(() => {
                // class scores
                const rawScores = transRes.slice([0, 0, 4], [-1, -1, labels.length]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
                return [rawScores.max(1), rawScores.argMax(1)];
            }); // get max scores and classes index
        
            const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes
        
            const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
            const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
            const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index

            renderBoxes(
                canvas, 
                boxes_data, 
                scores_data, 
                classes_data, 
                [xRatio, yRatio], 
                handleRedDetected
            ); // render boxes

            // requestAnimationFrame(() => {
            //     detect(model, video, canvas)
            // })

            // setTimeout(() => {
            //     detect(model, video, canvas)
            // }, 20)

            tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory
        
            //callback();
            tf.engine().endScope(); // end of scoping

        
        }
    

    }


    return detect

}


const createCanvas = () => {
    const videoWrapper = document.querySelector("#video-wrapper > div > div > div > div > div");
    const canvas = document.createElement("canvas");

    canvas.id = "vision-canvas"

    canvas.style.position = "absolute";
    canvas.style.inset = 0;
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.zIndex = 8;
    canvas.style.pointerEvents = "none"

    videoWrapper.appendChild(canvas)
    return canvas
}

let previousTrueCount = {
    multiplication: 0,
    playedCard: 0
};
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

   
    const optimizedAnimationFrame = (callback) => {
        animationFrameTimers.push(
            setTimeout(() => {
                callback()
            },aiConfig.framePerMilliseconds)
        )
      
    }
    const storeVisionCardCounting = () => {
        if(visionTemp !== 0){
            cardCount.playedCard += visionTemp.length;
            visionTemp.forEach((hand) => {
                cardCount.multiplication += cardTypes[hand].multiplication
            });
            visionTemp = [];
        }

   
    }
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
            visionTemp.push(keyList[key])
        }else{
            console.warn(`you pressed a key (${key}) that is not supported`)
        }
       
    }
    window.addEventListener("keydown",(e) => {manualCardCount(e.key)})

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
    const canvas = createCanvas()
    const runVision = yoloVision();

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
        const refreshCardCounts = () => {
            Object.keys(cardClasses).forEach((card) => {
                cardClasses[card].count = 0;
            })
        }


        const sendData = () => {
            //const randomNumber = `${(Date.now()+Math.random()*1000000).toFixed(2)}`;
            const trueCount = getCurrentTrueCount();
            console.log(trueCount,visionTemp)
            // fetch(`https://counterevo.meisken.dev/api/card_count`,{
            //     method: "POST", 
            //     body: JSON.stringify({
            //         "playedCard": trueCount.playedCard,
            //         "multiplication": trueCount.multiplication
            //     }),
       
            //     cache: "no-store",
            //     headers: {
            //         'Cache-Control': 'no-store, max-age=0, must-revalidate',
            //         "Content-Type": "application/json",
            //         "Accept-Request": "meiskena999gambling",
            //         'pragma': 'no-cache',
             
                
            //     }
            // }).then(async (res) => {
               
            //     res.json().then((data) => {
            //         console.log("data sent:", data)
            //     })
              
            // }).catch((err) => {
            //     console.warn("send data error", err)
            // })
        }
        nativeCardCounting(() => {
            emptyAccumulator = 0;
            refreshCardCounts();
            visionTemp = [];

    
          
            sendData()
            console.log("refreshed", emptyAccumulator)
        });

 
        const getDealerCardPoint = () => {
            const scoreElement = document.querySelector("div.dealerScore--f29f0 > div > div[data-role='score']");
            const score = parseInt(scoreElement.textContent)
            return score ? score : 0
        }
        const dealerPoint = getDealerCardPoint();

        const trueCount = getCurrentTrueCount();
        if(dealerPoint >= 17){
            
            if(
                trueCount.multiplication !== previousTrueCount.multiplication && 
                trueCount.playedCard !== previousTrueCount.playedCard
            ){
                sendData()
            }
            storeVisionCardCounting();
        }

        runVision(visionModel,video, canvas)
        
   
   
  
        if(trueCount.playedCard > aiConfig.maxPlayedCard ){
            resetCardCount()
        }

        previousTrueCount = structuredClone(trueCount);

        //console.log(trueCount,visionTemp)
        optimizedAnimationFrame(detectFrame);
    
    };
    detectFrame();

}    


const totalDecks = 8;
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
    doubleStand: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
     
        console.log("Double");
        console.log("balance check",balanceCheck());
       
        if(oldMyCards.length === 2 && (callbackOnResolve === undefined || callbackOnResolve === null) && !isSecondHand && balanceCheck()){
            actionTypes.double(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }else{
            actionTypes.stand(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
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
    doubleStandFour: async (oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand) => {
        console.log("DS4");
        console.log("balance check",balanceCheck());

        if(oldMyCards.length === 2 && (callbackOnResolve === undefined || callbackOnResolve === null) && !isSecondHand && balanceCheck()){
            actionTypes.double(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
        }else{

            actionTypes.standFour(oldDealerCard, oldMyCards, callbackOnResolve, isSecondHand);
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
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "33": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "44": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "55": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "66": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "77": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
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
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "99": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "1010": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "JJ": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "QQ": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "KK": {
        "2": actionTypes.split,
        "3": actionTypes.split,
        "4": actionTypes.split,
        "5": actionTypes.split,
        "6": actionTypes.split,
        "7": actionTypes.split,
        "8": actionTypes.split,
        "9": actionTypes.split,
        "10": actionTypes.split,
        "J": actionTypes.split,
        "Q": actionTypes.split,
        "K": actionTypes.split,
        "A": actionTypes.split,
    },
    "AA": {
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
    "A3": {
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
    "A4": {
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
    "A5": {
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
    "A6": {
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
    "A7": {
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
    "A8": {
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
    "A9": {
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
    "10": {
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
    "11": {
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
    "12": {
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
    "13": {
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
    "14": {
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
    "15": {
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
    "16": {
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
    "17": {
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
    "18": {
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
    "19": {
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
    "20": {
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

function cloneDeep(oldObj) {
    const newObj = Array.isArray(oldObj) ? [] : {};

    for (let i in oldObj) {
        if (typeof oldObj[i] === 'object') {
            console.log(i)
            newObj[i] = cloneDeep(oldObj[i]);
        } else {
            newObj[i] = oldObj[i];
        }
    }

    return newObj;

}

const handCheck = async (dealerCard, myCards, callbackOnResolve, isSecondHand) => {
 
  

    
    const dealerNumber = getCardNumber(dealerCard);
    let firstCard = getCardNumber(myCards[0]);
    let secondCard = getCardNumber(myCards[1]);

    const isFaceCard = (value) => {

        return value === "10" || value === "J" || value === "Q" || value === "K"
    }
    
    firstCard = isFaceCard(firstCard) ? "10" : firstCard;
    secondCard = isFaceCard(secondCard) ? "10" : secondCard;
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




let frequency = 1, freezeIndicator = false;
let betTimer, freezeTimer;

const setFreezeTimer = () => {
    clearTimeout(freezeTimer)
    freezeTimer = setTimeout(() => {
        freezeIndicator = true
        console.log("bet for preventing freeze")
    },1380000/2)
}

const betMoney = async () => {
    //data-state="enabled"
    return new Promise(async (resolve,reject) => {
        //const betButton = await getElements(0,"div.border--c5bcb.spinningBorderVisible--84727.borderSpinning--ea474 > div");
        
        const [betButton] = await getElements(0,buttonType.bet);
        let bettedTimes = 1;
        const trueCount = getCurrentTrueCount().trueCount;
        if((betButton && trueCount >= 1.5) || freezeIndicator){
            betButton.click();
            setFreezeTimer()
            freezeIndicator = false
            console.log("bet");
            
        }
        resolve();
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
    //cardCount.multiplication
    const playedCardInput = window.prompt("input you last playedCard number (default 0) / 輸入上次playedCard的數字");
    if(parseInt(playedCardInput) === NaN || parseInt(playedCardInput) === undefined ){
        console.log(`%cYour playedCard number is invalid`, "color: red; font-size: 24px; font-weight: 700;");

        return false
    }else{
        if(playedCardInput != "" && parseInt(playedCardInput) != 0){
            cardCount.playedCard = parseInt(playedCardInput) 
        } 
    }

    const multiplicationInput = window.prompt("input you last multiplication number (default 0) / 輸入上次multiplication的數字");
    if(parseInt(multiplicationInput) === NaN || parseInt(multiplicationInput) === undefined){
        console.log(`%cYour multiplication number is invalid`, "color: red; font-size: 24px; font-weight: 700;");

        return false
    }else{
        if(multiplicationInput != "" && parseInt(multiplicationInput) != 0){
            cardCount.multiplication = parseInt(multiplicationInput) 
        } 
    }

    const selectedChipValue = Number(document.querySelector("div[data-role='selected-chip'] > div[data-role='chip']").getAttribute("data-value"));
    //document.querySelector("div[data-role='selected-chip']  div[data-role='chip']").getAttribute("data-value")
    console.log(`%cThe program is going to play ${roundsInput} rounds, $${selectedChipValue * frequencyInput} for each !!!`, "color: red; font-size: 24px; font-weight: 700;");
    betSize = selectedChipValue * frequencyInput;
    return true



}




let enableWhatsappFunction = false;
let enableSendBalance = false;

const startBetting = async () => {


    // if(maxBetTimes === 1 && currentBetTimes === 1){
    //     deleteTimer();
    //     currentBetTimes = 0;
    //     sendRequest("/error", "stopped");
    //     return
    // }



    // if(currentBetTimes >= maxBetTimes){
    //     deleteTimer();
    //     currentBetTimes = 0;
    //     sendRequest("/error", "stopped");
    //     return
    // }

    console.log("starting bet money");

    if(enableSendBalance && enableWhatsappFunction){
        sendBalance();
    }

    noButtonCLicked = false;

   
    await betMoney();
    if(enableWhatsappFunction){
        refreshStoppedCheckTimer();
    }
  
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
const runBtnOnClick = async () => {
    // const confirm = firstRun();

    // if(confirm){
    //     if(enableWhatsappFunction){
    //         startDisconnectionCheck(); 
    //     }
        await fetchTrueCount()
        togglePlusTableButton(false);
        visionAi();
        //cardCounting();
        setFreezeTimer()
        startBetting();
    //}
}

const stopBtnOnClick = () => {
    console.log("stop");
    deleteTimer();
    clearInterval(betTimer);
    clearTimeout(freezeTimer);
    stopDisconnectionCheck();
    togglePlusTableButton(true);
    animationFrameTimers.forEach((t) => {
        clearTimeout(t)
    })
    currentBetTimes = 0;
    maxBetTimes = Infinity;
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
const undoCounting = () => {
    visionTemp.pop()
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
    buttonsContainer.appendChild(runButton);
    buttonsContainer.appendChild(stopButton);

    buttonsContainer.appendChild(undoButton);
    buttonsContainer.appendChild(resetCounterButton);

    const body = document.querySelector("body");
    body.appendChild(buttonsContainer);

    console.log("auto gambling anti_robot_v42_test inserted")
}


const loadVisionModel = () => {

    const waitTensorflowjsLoad = () => {
        return new Promise((resolve,reject) => {
            const timer = setInterval(() => {
                if(tf === undefined){
                    console.log("tensorflow is undefined")
                }
                
                if(tf?.loadGraphModel) {     
                    resolve();
                    clearInterval(timer);
                }
            },250)
        });
    }

    return new Promise(async (resolve, reject) => {
        try{
            await waitTensorflowjsLoad()
        
            const remoteModelUrl = "https://cdn.statically.io/gh/meisken/cdn_script/main/vision_model/RED_CARD_V2/model.json"
            const model = await tf.loadGraphModel(remoteModelUrl, {
                onProgress: (fractions) => {
                    console.log(fractions)
                }
            });
            const dummyInput = tf.ones(model.inputs[0].shape);
            const warmupResult = await model.executeAsync(dummyInput);
            tf.dispose(warmupResult)
            tf.dispose(dummyInput)
            visionModel = model;
            resolve()
        }catch(err){
            console.log(err)
            reject(err)
        }
    })
}

(async function() {




    try{
        
        await loadVisionModel()
        if(!aiConfig){
            
            throw Error("ai config is not defined")
        }
    }
    catch(err){
        console.log(err)
    }finally{
        inertButton()
    }


})();
