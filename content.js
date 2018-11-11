let config;

euler
    .config
    .get()
    .then( (result) => {
        config = result;
    });

function addRandomButton() {
    let navList = document.querySelector('#nav > ul');
    let randomButton = document.createElement('li');
    randomButton.id = 'random';
    let randomLink = document.createElement('a');
    randomLink.innerText = 'Random';
    randomLink.href = "#";
    randomLink.title = 'Random';
    randomLink.accessKey = 'r';
    randomButton.insertAdjacentElement('afterbegin', randomLink);
    navList.insertAdjacentElement('afterbegin', randomButton);
}

window.onload = () => {
    addRandomButton();

    let randomButton = document.getElementById('random');
    randomButton
        .addEventListener('click', () => {
            if (config.openNewTab) {
                euler
                    .random
                    .openURL();
            } else {
                euler
                    .random
                    .getURL()
                    .then( (result) => {
                        window.location = result;
                    });
            }
        });
}