(function ($) {
    var port = chrome.extension.connect({name: "content"});
    port.onMessage.addListener(function (msg) {
        if (msg.type === "getpageinfo") {
            $().ready(function () {
                var t = base.getPageInfo();
                if (t) {
                    port.postMessage({
                        type: "pageinfo",
                        data: t
                    });
                } else {
                    port.postMessage({
                        type: "fail",
                        data: t
                    });
                    alert("can not support this is site,or is not in noval sort page.");
                }
            });
        }
    });
    var base = {
        getPageInfo: function () {
            var host = window.location.protocol + "//" + window.location.host + (window.location.port ? ":" + window.location.port : "");
            if (window.location.href.indexOf(host + "/html") !== -1) {
                var main = $(".bdsub").children(0);
                if (main.length > 0) {
                    return {
                        title: main.children(1).text().split(" ")[0],
                        next: (window.location.href + main.children(5).find("a").eq(0).attr("href")).substring(host.length),
                        host: host
                    };
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    };
})(bright);