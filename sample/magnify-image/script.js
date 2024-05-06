window.addEventListener("load", function () {
    imageZoom("myimage", "myresult");
})

function imageZoom(imgID, resultID) {
    var img = null,
        lens = null,
        lensSizeRatio = 3,
        result = null,
        cx = 0,
        cy = 0;

    img = document.getElementById(imgID);
    result = document.getElementById(resultID);

    lens = document.createElement("DIV");
    lens.setAttribute("class", "img-zoom-lens");
    img.parentElement.insertBefore(lens, img);

    img.addEventListener("mousemove", moveLens);
    img.addEventListener("touchstart", moveLens);
    img.addEventListener("touchmove", moveLens);
    lens.addEventListener("mousemove", moveLens);
    lens.addEventListener("touchmove", moveLens);
    window.addEventListener("orientationchange", (event) => {
        console.log(`the orientation of the device is now ${event.target.screen.orientation.angle}`);
        setTimeout(() => {
            initPos();
        }, 50);
    });

    initialize();

    function initialize() {
        initPos();
    }

    function initPos() {
        lens.style.width = `${result.offsetWidth / lensSizeRatio}px`;
        lens.style.height = `${result.offsetHeight / lensSizeRatio}px`;

        /*calculate the ratio between result DIV and lens:*/
        cx = result.offsetWidth / lens.offsetWidth;
        cy = result.offsetHeight / lens.offsetHeight;

        result.style.backgroundImage = `url('${img.src}')`;
        result.style.backgroundSize = `${(img.width * cx)}px ${(img.height * cy)}px`;

        var x = img.width / 2 - lens.offsetWidth / 2;
        var y = img.height / 2 - lens.offsetHeight / 2;

        lens.style.transform = `translate( ${x}px, ${y}px)`;
        result.style.backgroundPosition = `-${(x * cx)}px -${(y * cy)}px`;
    }

    function moveLens(e) {
        var pos, x, y;

        e.preventDefault();
        pos = getCursorPos(e);

        /*calculate the position of the lens:*/
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);

        /*prevent the lens from being positioned outside the image:*/
        if (x > img.width - lens.offsetWidth) { x = img.width - lens.offsetWidth; }
        if (x < 0) { x = 0; }
        if (y > img.height - lens.offsetHeight) { y = img.height - lens.offsetHeight; }
        if (y < 0) { y = 0; }


        lens.style.transform = `translate( ${x}px, ${y}px)`;
        result.style.backgroundPosition = `-${(x * cx)}px -${(y * cy)}px`;
    }
    function getCursorPos(e) {
        var a = img.getBoundingClientRect(), x = 0, y = 0;

        e = e || window.event;

        x = (e.pageX ?? e.changedTouches[0].pageX) - a.left;
        y = (e.pageY ?? e.changedTouches[0].pageY) - a.top;

        x = x - window.pageXOffset;
        y = y - window.pageYOffset;

        return { x: x, y: y };
    }
}
