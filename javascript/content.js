var port = chrome.extension.connect({name: "ui"});
port.onMessage.addListener(function (msg) {
    if (msg.type === "getlocale") {
        alert("Current Page Language Is:"+msg.data);
    }
});
//port.postMessage({
//    type: "getlocale",
//    data: {
//        content: document.getElementsByTagName("body")[0].innerText,
//        chartset:document.charset,
//        title:document.getElementsByTagName("title")[0].innerText,
//        language:window.navigator.language,
//        languages:window.navigator.languages,
//        ua:window.navigator.userAgent
//    }
//});