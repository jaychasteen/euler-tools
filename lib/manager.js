let euler = {};

euler.config = ((

() => {

    let defaultConfig = {
        openNewTab: true
    }

    function getConfig() {
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get(['config'], (result) => {
                if (!result.config) {
                    // TODO: Load from config.json
                    resolve(defaultConfig);
                }
                resolve(result.config);
            });
        });
        
    }

    return {
        get: getConfig
    }
}

))();

euler.random = ((

() => {

    const statsURL = 'https://projecteuler.net/problem_analysis';

    let total = undefined;

    /**
     * Grab the highest problem number from the site
     * @param {String} DOMString The data retrieved from the PE site
     * @return {Number} The most recent problem number, i.e. the highest number
     */
    function parseStatisticsPage(DOMString) {
        const parser = new DOMParser();
        let doc = parser.parseFromString(DOMString, 'text/html');

        // We can't trust the value of problems.length, because it contains a potentially unknown number of
        // td.n_column cells. Some of the table headers are actually blank td's
        const problems = doc.querySelectorAll('tr > td.n_column');
        let mostRecent = 0;
        for (let i = 0; i < problems.length; i++) {
            if (Number(problems[i].innerText) > mostRecent) {
                mostRecent = Number(problems[i].innerText);
            }
        }
        return mostRecent;
    }

    function setTotal(value) {
        total = value;
    }

    /**
     * Returns the most recent problem number as the argument to get().then
     * Also stores the total in chrome.storage.local
     * @return {Promise} Resolve -> highest problem number, Reject -> xhr.statusText
     */
    function loadFromRemote() {
        return new Promise( (resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if ((xhr.status == 403) || (xhr.status == 404)) {
                    reject(xhr.statusText);
                }
                if ((xhr.readyState == 4) && (xhr.status == 200)) {
                    total = parseStatisticsPage(xhr.responseText);
                    chrome.storage.local.set({ total: total }, () => {
                        resolve(total);
                    });
                }
            }
            xhr.open('GET', statsURL, true);
            xhr.send();
        });
    }

    /**
     * Gets the total. Checks memory first, then local storage, if not then we set it.
     * @return {Promise} With the total passed as argument to .then()
     */
    function getTotal() {
        return new Promise( (resolve, reject) => {
            if (!total) {
                chrome.storage.local.get(['total'], (result) => {
                    result = result.total;
                    if (!result) {
                        loadFromRemote().then(setTotal)
                            .then( (result) => {
                                resolve(result);
                        });
                    }
                    resolve(result);
                });
            } else {
                resolve(total);
            }
        });
    }

    /* RANDOM */
    /**
     * Get a random problem number, which needs to be processed to URL
     */
    function getRandom() {
        function rand(max) {
            return Math.floor((Math.random() * max) + 1);
        }

        return getTotal()
            .then( (result) => {
                return rand(result);
            });
    }

    function getRandomURL() {
        return getRandom()
            .then( (result) => {
                return 'https://projecteuler.net/problem=' + result;
            });
    }

    function openRandomURL() {
        getRandomURL()
            .then( (randomURL) => {
                window.open(randomURL);
            });
    }

    getTotal().then( () => { console.log('Loaded First.')});

    return {
        getTotal: getTotal,
        get: getRandom,
        getURL: getRandomURL,
        openURL: openRandomURL
    }
}

))();