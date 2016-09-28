(function ($) {
    var getPage=function(url){
        $.ajax({
            url:"http://www.23wx.com/class/7_1.html",
            dataType:"text",
            success:function(a){
                console.log(a);
            }
        });
    };
    $().ready(function () {
        $(".play").click(function () {
            getPage();
            var port = chrome.extension.connect({name: "ui"});
            port.onMessage.addListener(function (msg) {
                if (msg.type === "getlocale") {
                    alert("Current Page Language Is:" + msg.data);
                }
            });
            port.postMessage({
                type: "getlocale",
                data: {
                    content: document.getElementsByTagName("body")[0].innerText,
                    chartset: document.charset,
                    title: document.getElementsByTagName("title")[0].innerText,
                    language: window.navigator.language,
                    languages: window.navigator.languages,
                    ua: window.navigator.userAgent
                }
            });
        });
    });
})(window.bright);