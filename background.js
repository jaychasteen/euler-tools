/** Chrome listeners */

/** onInstalled */
chrome.runtime.onInstalled.addListener(() => {    
    console.log('installed?');
});

chrome.browserAction.onClicked.addListener((tab) => {
    euler
        .random
        .getURL()
        .then( (result) => {
            chrome.tabs.create({
                url: result
            });
        });
});