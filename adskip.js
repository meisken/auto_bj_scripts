
const waitForElementDisplayed = (query) => {
    return new Promise((resolve,reject) => {
        const timer = setInterval(() => {
            const element = document.querySelector(query);
            console.log(element)
            if(element){
                resolve(element)
                clearInterval(timer)
            }
        },100)
    })
}
const clickSkipButton = () => {
    document.querySelector(".ytp-ad-skip-button")?.click();
    document.querySelector(".ytp-ad-skip-button-modern")?.click();

//#rendering-content ytd-display-ad-renderer
}
const insertStyleTag = () => {
    const style = document.createElement('style');

    style.textContent = `
        #companion, #fulfilled-layout, #masthead-ad{
            display: none !important;
        }
    `;
    
    document.head.appendChild(style);
}
const taimuRipu = async () => {
    await new Promise(async (resolve, _reject) => {
        const videoContainer = await waitForElementDisplayed("#movie_player");
  
        const setTimeoutHandler = async () => {
                const isAd = videoContainer?.classList.contains("ad-interrupting") || videoContainer?.classList.contains("ad-showing");
                const skipLock = document.querySelector(".ytp-ad-preview-text-modern")?.innerText || document.querySelector(".ytp-ad-preview-text")?.innerText;
                const surveyLock = document.querySelector(".ytp-ad-survey")?.length > 0;
                console.log(isAd, skipLock)
                if (isAd && skipLock) {
                    const videoPlayer = document.getElementsByClassName("video-stream")[0];
                    videoPlayer.muted = true; // videoPlayer.volume = 0;
                    videoPlayer.currentTime = videoPlayer.duration - 0.1;
                    videoPlayer.playbackRate = 15;
            
            
                    videoPlayer.paused && videoPlayer.play()
                    // CLICK ON THE SKIP AD BTN
                
                    setTimeout(() => {
                        clickSkipButton()
                    },100)
        
                }
        
            resolve();
        };
        //const observerTargetElement = await waitForElementDisplayed(".html5-video-player");
        const observer = new MutationObserver(setTimeoutHandler);
        observer.observe( videoContainer, { attributes: true, attributeFilter: ["class"] })

        const skip = () => {
            let time = 0;
            const timer = setInterval(() => {
                clickSkipButton()
                time +=100;
                if(time >= 3000){
                    clearInterval(timer)
                }
            }, 100)
        }
        

        const skipButtonObserver = new MutationObserver(skip);
        const skipButtonContainer = await waitForElementDisplayed(".video-ads.ytp-ad-module");
        skipButtonObserver.observe( skipButtonContainer, { subtree: true })

        // RUN IT ONLY AFTER 100 MILLISECONDS
        //setTimeout(setTimeoutHandler, 100);
    });
  
    //taimuRipu();
};



(function() {
    'use strict';
    taimuRipu();
    insertStyleTag()
    // Your code here...
})();