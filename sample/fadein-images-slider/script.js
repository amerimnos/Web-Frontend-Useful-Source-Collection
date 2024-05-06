
// css 충분히 구현 가능해서 중단함.
/* 
controlScaleSlide();

function controlScaleSlide() {
    var scaleSlides = document.querySelectorAll('.img-wrap img');

    document.querySelector('.img-wrap .pause').addEventListener('click', function () {
        clearInterval(intervalID);
        for (const iterator of scaleSlides) {
            iterator.style.animationPlayState = 'paused';
        }
    })
    document.querySelector('.img-wrap .pause').addEventListener('touchstart', function () {
        clearInterval(intervalID);
    })

    var intervalID = setInterval(() => {

        var activeSlide = document.querySelector('.img-wrap img:not(.disable)');

        console.log(activeSlide);
        if (activeSlide === null) {
            for (const iterator of scaleSlides) {
                iterator.classList.remove('disable');
            }
        }

        activeSlide.classList.add('active');
        setTimeout(() => {
            console.log(activeSlide.nextSiblingm, 'activeSlide.nextSibling')
            activeSlide.classList.remove('active');
            activeSlide.classList.add('disable');
        }, 1000);
    }, 1050);
}
 */
