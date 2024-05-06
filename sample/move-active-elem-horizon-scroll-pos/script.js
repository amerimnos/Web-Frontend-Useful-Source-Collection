window.onload = function () {
    scrollToActiveItemInHorizontalScroll();
    function scrollToActiveItemInHorizontalScroll() {
        var scrollableList = document.querySelector('.scrollable-list');
        var activeItem = scrollableList.querySelector('.active');

        if (scrollableList !== null && activeItem !== null) {
            var container = document.querySelector('.scrollable-container');
            var containerScrollLeft = container.scrollLeft;
            var itemOffsetLeft = activeItem.offsetLeft;
            var containerWidth = container.offsetWidth;
            var itemWidth = activeItem.offsetWidth;
            var targetScrollLeft = itemOffsetLeft - (containerWidth - itemWidth) / 2;

            var duration = 1000;
            var startTime = null;

            function animate(currentTime) {
                if (!startTime) {
                    startTime = currentTime;
                }

                var timeElapsed = currentTime - startTime;
                var scrollAmount = easeInOutCubic(timeElapsed, containerScrollLeft, targetScrollLeft - containerScrollLeft, duration);

                container.scrollLeft = scrollAmount;

                if (timeElapsed < duration) {
                    requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);

            function easeInOutCubic(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            }

            console.log(
                "containerWidth: " + containerWidth +
                ", itemWidth: " + itemWidth +
                ", containerScrollLeft: " + containerScrollLeft +
                ", itemOffsetLeft: " + itemOffsetLeft +
                ", targetScrollLeft: " + targetScrollLeft
            );
        }
    }
};
