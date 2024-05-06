function manageAnimations() {
    const elements = {
        loaderContainer: document.getElementById("loader-container"),
        animations: {
            1: document.getElementById("animation1"),
            2: document.getElementById("animation2"),
            3: document.getElementById("animation3")
        },
        animeFirst: document.querySelectorAll(".anime-first"),
        animeEnd: document.querySelectorAll(".anime-end"),
        animationReset: document.querySelectorAll(".animation-reset")
    };
    let isActive = false;

    function playAnimation1() {
        elements.animations[1].beginElement();
        elements.animations[1].addEventListener("endEvent", playAnimation2);
    }

    function playAnimation2() {
        elements.animations[2].beginElement();
        elements.animations[2].addEventListener("endEvent", playAnimation3);
    }

    function playAnimation3() {
        elements.animations[3].beginElement();
    }

    function resetAnimationListeners() {
        elements.animations[1].removeEventListener('endEvent', playAnimation2);
        elements.animations[2].removeEventListener('endEvent', playAnimation3);
        elements.animeEnd.forEach(element => {
            element.beginElement();
        });
    }

    let observerOptions = {
        rootMargin: "0px",
        threshold: [0, 1],
    };

    let observerCallback = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                if (isActive === true) return;
                playAnimation1();
                console.log('active');
                isActive = true;
            }

            if (entry.intersectionRatio === 0) {
                isActive = false;
                resetAnimationListeners();
                console.log('inactive');
            }
        });
    };
    let intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    let observerTarget = elements.loaderContainer;
    intersectionObserver.observe(observerTarget);
}

// 실행
manageAnimations();