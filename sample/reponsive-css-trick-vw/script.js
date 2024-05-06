function getScrollbarWidth() {
    // Create a div element to use for measuring the scrollbar width
    const div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.overflowY = 'scroll';
    div.style.visibility = 'hidden';
    // Add the div to the body of the page
    document.body.appendChild(div);
    // Calculate the scrollbar width
    const scrollbarWidth = div.offsetWidth - div.clientWidth;
    // Remove the div from the body of the page
    document.body.removeChild(div);
    // Return the scrollbar width
    return scrollbarWidth;
}

window.addEventListener('load', () => {
    // Get the scrollbar width
    const scrollbarWidth = getScrollbarWidth();
    // Set the --user-scroll-bar-width CSS variable to the scrollbar width
    document.documentElement.style.setProperty('--user-scroll-bar-width', `${scrollbarWidth}`);
});