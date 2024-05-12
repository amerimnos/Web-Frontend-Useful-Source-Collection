// GLOABAL VARIABLE
let $GNBBtn = document.querySelector('.c-gnb-btn'),
    $GNB    = document.querySelector('.c-gnb');

initialize();

function initialize() {
    if(typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }

    $GNBBtn.addEventListener('click', function () {
        $GNB.classList.toggle('active');
    })
}