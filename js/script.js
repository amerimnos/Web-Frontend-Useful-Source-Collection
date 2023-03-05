// VARIABLE
let nav = $(".ygt-nav"),
    navigation_links = $(".ygt-nav a"),
    highlight = $(".ygt-nav a.highlight");

initialize();

function initialize() {
    setEventTab();
}

function setEventTab() {
    $(".tab_content").hide();
    $(".tab_content:first").show();
    $(navigation_links[0]).addClass("active");

    highlight.css({
        left: navigation_links[0].offsetLeft + "px",
        height: navigation_links[0].offsetHeight + "px",
        width: navigation_links[0].offsetWidth + "px"
    });

    $(".ygt-nav a").click(function () {
        let activeTab = $(this).attr("rel");

        $(".ygt-nav a").removeClass("active");
        $(this).addClass("active");
        $(".tab_content").hide()
        $("#" + activeTab).fadeIn()
    });

    $(navigation_links).on("click", function () {
        $(navigation_links).removeClass("active");
        $(this).addClass("active");
        highlight.css({
            left: this.offsetLeft + "px",
            width: this.offsetWidth + "px"
        });
    });
}

