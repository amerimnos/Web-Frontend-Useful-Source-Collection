
controlVideo();

function controlVideo() {
    var video = document.querySelector("video");
    var lastTime = 0;
    var videoReq = null;

    video.addEventListener("canplaythrough", (event) => {
        console.log("I think I can play through the entire video without having to stop to buffer.");
        video.play();
    });

    video.addEventListener("ended", (event) => {
        console.log("Video stopped either because it has finished playing or no further data is available.");
    });

    video.addEventListener('play', () => {
        setVideoTimeToStop(video.currentTime);
    });

    function setVideoTimeToStop(currentTime) {
        console.log('Current time: ' + currentTime);

        lastTime = currentTime;

        videoReq = requestAnimationFrame(() => {
            setVideoTimeToStop(video.currentTime);
        });

        if (lastTime > 1.7) {
            video.pause();
            cancelAnimationFrame(videoReq);
            /* video.style.display = 'none'; */
            document.querySelector('.icon-wrap').classList.add('active');
        }
    }
}

