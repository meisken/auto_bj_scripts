// @noframes
// ==/UserScript==

(async function() {
    'use strict';
    const wait = () => {
        return new Promise((resolve,reject) => {
            const timer = setInterval(() => {
                console.log("fetch iframe");
                const body = document.querySelector("body");

                const iframe = body.querySelector("iframe") 
              
                if(iframe.contentWindow.document.querySelector("#video-wrapper > div > div > div > video")){

                    setTimeout(() => { //this is for making sure the iframe is newest, preventing sometime the iframe refresh several times
                        console.log("resolve iframe",iframe)
                        //__document = iframe.contentWindow.document;
                        resolve(iframe.contentWindow.document)
                    },2000)
                    clearInterval(timer)

                    
                    
                     
                }
              

            },100)
        })
    }
    
    const __document = await wait();
    const runScriptInsideIframe = (script) => {
        var tagString = script;

        var range = document.createRange();
        range.selectNode(document.getElementsByTagName("BODY")[0]);
        var documentFragment = range.createContextualFragment(tagString);
        __document.body.appendChild(documentFragment);

    }

    const customConfig = `
        <script type="text/javascript">

            const config = {
                "-1" : 0,
                "0" : 0,
                "1" : 0,
                "1.5": 0,
                "2" : 1,
                "2.7": 1,
                "3" : 1,
                "3.3": 1,
                "3.7" : 1,
                "4.1" : 1,
                "4.5": 1,
                "5" : 1,
                "6" : 1,
                "6.5": 1,
                "7" : 1,
                "8" : 1,
                "9" : 1,
                "10": 1,


            }

            const aiConfig = {
                aiVersionName: "RED_CARD_V4",
                maxPlayedCard: 215,
                framePerMilliseconds: 50,
                Threshold: 0.9,
                disableAreaCheck: false,
                triggerTimeThreshold: 1,
                trueCountThreshold: 1.5, 
                trueCountList: {
                    "210" : 0,
                    "200" : -0.3,
                    "180" : -1,
                    "170" : -2,
                    "150" : -3,
                    "100" : -4,
                },
                detectableArea: {
                    y: [
                        {
                            min: 415,
                            max: 425
                        },
                        {
                            min: 455,
                            max: 465
                        }
                    ],
                    x: [
                        {
                            min: 300,
                            max: 310
                        },
                        {
                            min: 330,
                            max: 340
                        }
                    ]
              
                }
            }
        </script>
    `
    runScriptInsideIframe(customConfig);
  
    const tensorflow_js = ` 
        <script async src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"  type="text/javascript"></script>
    `
    runScriptInsideIframe(tensorflow_js);


    const autoGamblingScript = `<script defer src="https://cdn.statically.io/gh/meisken/cdn_script/main/gambling_anti_robot_v36_custom9.js" type="text/javascript"></script>`
    runScriptInsideIframe(autoGamblingScript);
})();




