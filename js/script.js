// GLOABAL VARIABLE
let $GNBBtn = document.querySelector('.gnb-btn'),
    $GNB    = document.querySelector('.gnb');

initialize();

function initialize() {
    if(typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }

    $GNBBtn.addEventListener('click', function () {
        $GNB.classList.toggle('active');
    })
}