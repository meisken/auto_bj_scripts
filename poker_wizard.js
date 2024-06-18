// @require https://cdn.socket.io/4.7.5/socket.io.min.js
// @noframes
// ==/UserScript==


const waitForElement = (query) => {
    return new Promise((resolve,reject) => {
        console.log("waiting element", query)
        const timer = setInterval(() => {
            const element = document.querySelector(query)
            if(element === null){
                resolve()
                clearInterval(timer)
            }
        }, 100)
    })
}
const isPlainObject = (input) => {
    return input && !Array.isArray(input) && typeof input === 'object';
}

function weightedRandom(items, weights) {
    if (items.length !== weights.length) {
        throw new Error('Items and weights must be of the same size');
    }

    if (!items.length) {
        throw new Error('Items must not be empty');
    }

    // Preparing the cumulative weights array.
    // For example:
    // - weights = [1, 4, 3]
    // - cumulativeWeights = [1, 5, 8]
    const cumulativeWeights = [];
    for (let i = 0; i < weights.length; i += 1) {
        cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
    }

    // Getting the random number in a range of [0...sum(weights)]
    // For example:
    // - weights = [1, 4, 3]
    // - maxCumulativeWeight = 8
    // - range for the random number is [0...8]
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = maxCumulativeWeight * Math.random();

    // Picking the random item based on its weight.
    // The items with higher weight will be picked more often.
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        if (cumulativeWeights[itemIndex] >= randomNumber) {
            return {
                item: items[itemIndex],
                index: itemIndex,
            };
        }
    }
}

const suitsOrder = ["s","h","d","c"]
const numberOrder = ["a" , "k" , "q" , "j" , "10" , "9" , "8" , "7" , "6" , "5" , "4" , "3" , "2"]
const positionOrder = ["UTG", "HJ", "CO", "BTN", "SB", "BB"]

let myHands = []
let playerPositionData = []
let bigBlind = 0
const waitForMyHand = async () => {
    return new Promise((resolve,reject) => {
        const timer = setInterval(() => {
            if(myHands.length !== 0){
                resolve()
                clearInterval(timer)
            }
        },100)
    })
}
const clearData = () => {
    myHands = []
    playerPositionData = []
    const firstPosition = document.querySelectorAll(`div[data-tst="hs_0_preflop_UTG"] > .hspotcrd_inner > .hspotcrd_actions > .hspotcrd_action`)
    firstPosition[1]?.click()
    setTimeout(() => {
        firstPosition[0]?.click()
    },300)
}
const noSolutionCheck = () => {
    return new Promise((resolve, reject) => {
        const noSolutionText = document.querySelector(`[data-tst="204"].gw_mesblock > .gw_mesblock_title`).textContent
        if( noSolutionText === "There is no solution for this spot."){
            reject("no solution")
        }else{
            resolve()
        }
    })
}
const actionRequestHandler = async (raiseLab,callback) => {
    // try{

    // }catch(err){

    // }

    try{
        await waitForMyHand()
        //await noSolutionCheck()
        const getActionTable = () => {
            const possibleActions = [];
            const possibleActionElements = document.querySelectorAll(`[data-tst="study_action_btns"] > .sab > .sab_btn`)
            possibleActionElements.forEach((el) => {
                const action =  el.querySelector(".sab_btn_name-row > .sab_btn_name > .sab_btn_name_bet > .sab_btn_name_bet_big").textContent
                const rgb = el.querySelector(`.sab_btn_back`).style.background
                //window.getComputedStyle( backgroundElement ,null).getPropertyValue('background'); 
                const name = action.split(" ")[0]
                const size = action.split(" ")[1]
                

                possibleActions.push({ name, size, rgb })
            })
            return possibleActions

        }
        const getStrategyCell = () => {
            console.log("myHands",myHands)
            const isSameSuit = myHands[0].szColor === myHands[1].szColor ? "s" : "o"
            const isPair = myHands[0].szNumber === myHands[1].szNumber ? "" : isSameSuit
        
            const firstHandOrderIndex = numberOrder.findIndex((num) => num === myHands[0].szNumber)
            const secondHandOrderIndex = numberOrder.findIndex((num) => num === myHands[1].szNumber)
            const reorderHands = [firstHandOrderIndex, secondHandOrderIndex].sort((current, next) => current-next)
            
            let [firstHand, secondHand] = [numberOrder[reorderHands[0]],numberOrder[reorderHands[1]]]
        
            if(firstHand === "10"){
                firstHand = "T"
            }
            if(secondHand === "10"){
                secondHand = "T"
            }
            const myHandsPlainText = `${firstHand.toUpperCase()}${secondHand.toUpperCase()}${isPair}`
            console.log(myHandsPlainText)
            const strategyTableCell = document.querySelector(`#hero_${myHandsPlainText}`)
            return strategyTableCell
        
        }
        //const actionTable = getActionTable();
        const strategyCell = getStrategyCell()
        console.log("strategyCell", strategyCell)
        //prevent loading cause problem
        strategyCell.click()

        const actionsAndOdds = []
        
        const getPossibleActions = () => {
            let time = 0;
            return new Promise((resolve,reject) => {
                const timer = setInterval(() => {
                    time = time + 100;
                    if(time > 3500){
                        reject("get PossibleActions timeout")
                        clearInterval(timer)
                    }else{
                        const possibleActions = strategyCell.querySelectorAll(".rtc_graph_legend > .rtc_graph_legend_item")
                        if(!possibleActions || possibleActions.length === 0){
                            strategyCell.click()
                        }else{
                            resolve( possibleActions)
                            clearInterval(timer)
                        }
                    }
             
                },100)
            })
        }
        const possibleActions = await getPossibleActions()

        console.log("possibleActions", possibleActions)
        possibleActions.forEach((action) => {
            const [nameElement, oddsElement] = action.querySelectorAll("& > span")
            const name = nameElement.textContent.split(" ")[0]
            const betSize = nameElement.textContent.split(" ")[1]
            const odds = parseInt(oddsElement.textContent)
            actionsAndOdds.push({
                name,
                betSize,
                odds
            })
        })
    
        console.log(actionsAndOdds,actionsAndOdds.map(({name}) => name), actionsAndOdds.map(({odds}) => odds))
        const result = weightedRandom(
            actionsAndOdds.map(({name}) => name),
            actionsAndOdds.map(({odds}) => odds)
        )
        let targetActionButton = "btn" + actionsAndOdds[result.index].name
        
        const targetBetSize = Math.round(parseFloat(actionsAndOdds[result.index].betSize)) * 100
        if(targetActionButton === "btnRaise" || targetActionButton === "btnBet"){
            targetActionButton = `btn${raiseLab}`
        }
        callback(`${targetActionButton} ${targetBetSize === NaN ? 0 : targetBetSize * bigBlind}`)
    }catch(error){
        callback("error")
    }

    //callback actionsAndOdds[result.index]


    //const handGroupsContainer = document.querySelector(`div[data-tst="group"]`)
    // const detailedRows = []
    // const strategyRows = document.querySelectorAll(`div[data-tst="group"] > .combosrowhero.gw_table_body_row `)

    // strategyRows.forEach((row, i) => {
    //     const rowId = row.getAttribute("id");
    //     const hand = rowId.split("_")[1];
    //     const splitHand = [hand[0]+hand[1],hand[2]+hand[3]];
    //     detailedRows.push({
    //         element: row,
    //         hand: splitHand
    //     });
    // })

    // const matchedRow = detailedRows.filter((row) => {
        
    //     return row.hand.some((card) => {
    //         let number = myHands[0].szNumber.toUpperCase();
    //         if(number === "10"){
    //             number = "T"
    //         }
    //         const suit = myHands[0].szColor
    //         return card === `${number}${suit}`
    //     })
    // }).filter((row) => {
        
    //     return row.hand.some((card) => {
    //         let number = myHands[1].szNumber.toUpperCase();
    //         if(number === "10"){
    //             number = "T"
    //         }
    //         const suit = myHands[1].szColor
    //         return card === `${number}${suit}`
    //     })
    // })


    //background Rgb > action | width > %



    //console.log(MyPositionName,myHandsPlainText, strategyTableCell)

   
    //todo: send my position name from the app
}
const leaveTableHandler = (callback) => {
     
    clearData()
    callback({msg: "leave-table working"})
 
}
const playerHoleDataHandler = (cards, callback) => {
   
    console.log(cards, "my hands")
    // if(cards.length === 2){

    // }
   
    myHands = cards

    callback({msg: "playerHoleData working"})

 
}
const getCardElement = (suit, number) => {
    return new Promise((resolve,reject) => {

        const currentRowIndex = suitsOrder.findIndex((_suit) => _suit === suit)
        const currentCardIndex = numberOrder.findIndex((num) => num === number)
      
        if(currentRowIndex >= 0 && currentCardIndex >= 0){
            const cardRow = document.querySelectorAll("#cardsdialog > .dialog-template_content > .brdpckr > .brdpckr_cards-rows > .brdpckr_cards-rows_row")[currentRowIndex]
            const card = cardRow.querySelectorAll(".poker-card")[currentCardIndex]
            if(cardRow && card){
                resolve(card)
            }else{
                reject("card not found")
            }
           
        }else{
            reject("suit or number does not match")
        }
    })

}
let riverCards = []
const riverDataHandler = async ({cards,cardLength}, callback) => {


    if(myHands.length > 0 && cardLength >= 3){
        console.log("working")
        try{
          

            if(cardLength === 3){ 
                riverCards = cards 
                const flopHspotCard = document.querySelector(`div[data-tst="hs_flop_E0E1E2"]`)
                if(!flopHspotCard){
                    const lastPosition = document.querySelector(`div[data-tst="hs_5_preflop_BB"]`) || document.querySelector(`div[data-tst="hs_5_preflop_BB_active"]`)
                    const buttons = lastPosition?.querySelectorAll(".hspotcrd_inner > .hspotcrd_actions > .hspotcrd_action")
                    buttons[1]?.click()
                    setTimeout(() => {
                        buttons[0]?.click()
                    }, 300)
                    
                }
                const waitForDialog = () => {
                    return new Promise((resolve,reject) => {
                        let time  = 0;
                        const timeout = 3200;
                        const timer = setInterval(() => {
                            const selectBoardButton = document.querySelector("#selectboardbtn");
                            if(selectBoardButton){
                                selectBoardButton.click()
                            }
                            if(document.querySelector("#cardsdialog")){
                                resolve()
                                clearInterval(timer)
                            }
                            time += 100
                        },100)
                        if(time > timeout){
                            reject("cardsdialog timeout")
                        }
                    })
                }
                await waitForDialog()
            }
            if(cardLength === 4){ riverCards[3] = cards[0] }
            if(cardLength === 5){ riverCards[4] = cards[0] }
            const clearButton = document.querySelectorAll(`button[data-tst="btn_reset_cards"]`)[0]
            clearButton?.click()
            for (const { szColor, szNumber } of riverCards) {
                const card = await getCardElement(szColor, szNumber)
          
                card.click()
            }
        
        
            callback({msg: "river-data working"})
        }catch(err){
            callback({msg: `river-data ${err}`})
        }

    }else{
        callback({msg: `river-data my hand is empty or card length error`})
    }
   
}
const getMatchedContainer = (playerPositionName) => {
    return new Promise((resolve, reject) => {
        const actionButtonContainers = document.querySelectorAll("#hspotscont_inner > .hspot-card")
        const positionTitles = [];
        actionButtonContainers.forEach((container, i) => {
            const dataTst = container.getAttribute("data-tst")
            if(!dataTst){
                console.log(dataTst)
                reject("dataTst error")
            }else{
                const positionNames = dataTst.split("_")
                positionTitles.push({
                    seatName: positionNames[3],
                    domIndex: i
                }) 
            }
           
            
          
        })
  
        const positionMatches = positionTitles.filter(({seatName, domIndex},i) => {
            console.log(seatName , playerPositionName)
            return seatName === playerPositionName
        })
        console.log(positionMatches)
        if(!positionMatches || positionMatches.length === 0){
            reject("positionMatches error")
            return
        }
     
        const matchedContainer = actionButtonContainers[positionMatches[positionMatches.length - 1].domIndex]
     
        if(!matchedContainer){
            reject("matchedContainer error")
            return
        }
        resolve(matchedContainer)
    })
}

const actionList = {
    'ACTION_BET' : "bet",
    'ACTION_RAISE' : "bet",
    
    'ACTION_FOLD' : "CheckCallFold",
    'ACTION_CHECK' : "CheckCallFold", 
    'ACTION_CALL' : "CheckCallFold",
    
}


const getMatchedButton = (container, actionType, betSize ) => {

    return new Promise((resolve, reject) => {

        const buttons = container.querySelectorAll(".hspotcrd_inner > .hspotcrd_actions > .hspotcrd_action")


        const detailedButtons = []
        buttons.forEach((btn, i) => {
            const text = btn.querySelector(".hspotcrd_action_text").textContent
            const [name, size] = text.split(" ")
            detailedButtons.push({
                name,
                size: parseFloat(size) || 0,
                domIndex: i,
                buttonInDom: btn
            })
        })
        const hasCall = detailedButtons.some((btn) => btn.name === "Call") 
        const hasCheck = detailedButtons.some((btn) => btn.name === "Check") 
        //bug: sometime utg posted a big blind if he checks no button will be matched

        if(actionType === `ACTION_CHECK` && !hasCheck /*detailedButtons.some((btn) => btn.name === "Check") */ ){
            resolve(detailedButtons.find((btn) => btn.name === "Call") || detailedButtons.find((btn) => btn.name === "Raise"))
            return
        }

        if(betSize > 0  && !hasCall ){
            const matchedButtonBySize = detailedButtons.filter((btn) => btn.size > 0).reduce((current, next) => {
    
                if(betSize >= next.size){
                    return next
                }
                return current
            })
            console.log("matchedButtonBySize", matchedButtonBySize)
            resolve(matchedButtonBySize)
        }else if(betSize === 0 || hasCall){



            const matchedButtonByActionType = detailedButtons.filter((btn) => `ACTION_${btn.name}`.toUpperCase() ===  actionType)
            if(matchedButtonByActionType.length > 1){
                reject("matched more than one button")
            }else if(matchedButtonByActionType.length  === 0){
                reject("no button matched")
            }else{
                resolve(matchedButtonByActionType[0])
            }
        
        }else{
            reject("bet size error")
        }


 
            
        
    
     
    })

}   
// const otherPlayerACtionInput = (matchedButtons, actionType, betSize) => {
//     return new Promise((resolve,reject) => {
//         const gtoActions = {

//             bet : () => {
//                 if(matchedButtons.length > 0){
//                     const matchedTrueCount = matchedButtons.reduce((current, next) => {
    
//                         if(betSize >= next.size){
//                             return next
//                         }
//                         return current
//                     })
//                     matchedTrueCount.buttonInDom.click()
//                     resolve()
//                 }else{
//                     reject("no matched button")
//                 }
         
                
//             },
//             CheckCallFold : () => {
//                 if(matchedButtons.length === 1 && matchedButtons[0].buttonInDom){
//                     matchedButtons[0].buttonInDom.click()
//                     resolve()
//                 }else{
//                     reject("CheckCallFold error")
//                 }
//             }
//         }
//         gtoActions[actionList[actionType]]()
      
//     })

const getPlayerPositionName = (_playerIndex, tablePlayerCount) => {
    console.log("posDataLength", playerPositionData.length)
    const posDataLength = playerPositionData.length;
    if(posDataLength === 0){
        return positionOrder[0]
    }
    if(posDataLength < tablePlayerCount){
        if(posDataLength > 0){
            const previousPos = playerPositionData[posDataLength - 1]
            let step = _playerIndex - previousPos.playerIndex;
            if(step < 0){
                step = step + 6
            
            }
            
            return positionOrder[positionOrder.findIndex((posName) => posName === previousPos.pos) + step]
        }
        return positionOrder[posDataLength]
       
    }else{
        const previousData = playerPositionData.find(({playerIndex}) => playerIndex === _playerIndex)
        return previousData.pos
    }
  
}

const otherPlayerActionHandler = async ({bet, handChips, playerIndex, actionType, playerPositionName, tablePlayerCount},callback) => {
  

    console.log(bet, handChips, playerIndex, actionType, callback)

    const normalizedActionName = actionList[actionType]
   
    playerPositionName = getPlayerPositionName(playerIndex, tablePlayerCount)
    if(myHands.length > 0 && normalizedActionName){
    
        playerPositionData.push({
            playerIndex,
            pos: playerPositionName,
        })

        console.log(normalizedActionName , playerPositionName)
      
        try{
            const container = await getMatchedContainer(playerPositionName)
            if(container ){
        
                const matchedButton = await getMatchedButton(container, actionType, bet)
                matchedButton.buttonInDom.click()
                console.log(container, matchedButton)
                callback({msg: "other-player-action working"})
                
            }else{
                callback({msg: "other-player-action container not found"})
            }
        }catch(err){
            callback({msg: `other-player-action ${err}`})
            console.log(err)
        }
       
    

     
   

    
    }else{
        callback({msg: `other-player-action my hand is empty or action type (${actionType}) is not allow`}) 
    }

  
  
    //refresh gto wizard by clicking the first utg fold when BB action is coming
}
const actionSequence = []
let isRunning = false
let currentId = 0;

const executeActions = async (action) => {
    currentId = currentId + 1;
    actionSequence.push({
        action,
        actionId: currentId
    });

    const runActions = () => {
        return new Promise(async (resolve,reject) => {
            isRunning = true
            const executedActionIds = []

            for (const [i, {action, actionId}] of actionSequence.entries()) {
                await waitForElement(`[data-tst="study_loader"] > [data-tst="loader_spinner"]`)
                action()
                executedActionIds.push(actionId)
               
            }

            executedActionIds.forEach((id) => {
                const removeById = actionSequence.findIndex(({actionId}) => actionId === id)
                if(removeById >= 0){
                    actionSequence.splice(removeById, 1)
                }else{

                }
             
            })
            isRunning = false
        })
    }
    try{
        if(!isRunning){
            await runActions()
        }
     

    }catch(err){
        console.log(err)
    }
 
}
const connectWebSocketServer = async () => {
    const socket = io("ws://localhost:3000", { transports : ['websocket'], query: "role=gto" });

    socket.on('connect', () => {
        console.log("connected to server")
    })
    socket.on('connection-confirm', async (message) => {
        console.log(message)
        try{
            await waitForElement("div[data-tst='gwiz_loading_logo']")
            socket.emit("solver-is-ready")
        }catch(err){
            console.log(err)
        }
    })

    socket.on('action-request', (...args)=> {
        executeActions(() => actionRequestHandler(...args))
        
    })
    socket.on('leave-table', (...args) => {
        executeActions(() => leaveTableHandler(...args))
    })
    socket.on('playerHoleData',(...args) => {
        playerHoleDataHandler(...args)
    })
    socket.on('river-data', (...args) => {
        executeActions(() => riverDataHandler(...args))
    })
    socket.on('other-player-action', ({bet, handChips, playerIndex, actionType, playerPositionName, tablePlayerCount},callback) => {
        handChips = handChips / 100
        bet = bet / 100
        if(actionType === "ACTION_SB"){
            //clear data
            clearData()
        }
        if(actionType === "ACTION_BB"){
            //clear data
            bigBlind = bet
        }

  

        executeActions(() => otherPlayerActionHandler({bet, handChips, playerIndex, actionType, playerPositionName, tablePlayerCount},callback))
    })

}
(function() {
    'use strict';
    connectWebSocketServer()
    console.log("gto bot v12")
    // Your code here...
})();



 //http://localhost:3000?river-data={ "data" : {"cards":[{"szColor":"c","szNumber":"9"},{"szColor":"c","szNumber":"j"},{"szColor":"d","szNumber":"3"}],"cardLength":3}, "gtoId" : "wMNVLg69cy_vDuSLAAAD" }
    //http://localhost:3000?river-data={ "data" : {"cards":[{"szColor":"c","szNumber":"9"}],"cardLength":4}, "gtoId" : "wMNVLg69cy_vDuSLAAAD" }