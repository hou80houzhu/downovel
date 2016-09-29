var inspectHost = "";
var ports = {};
var handler = {
    content: function (message, sender, sendResponse) {
        if (message.type === "pageinfo") {
            ports["button"].postMessage({
                type: "download",
                data: message
            });
        }else if(message.type==="fail"){
            ports["button"].postMessage({
                type: "fail",
                data: {}
            });
        }
    },
    button: function (message, sender, sendResponse) {
        if (message.type === "download") {
            ports["content"].postMessage({
                type: "getpageinfo",
                data: message
            });
        }
    }
};
chrome.runtime.onConnect.addListener(function (port) {
    ports[port.name] = port;
    port.onMessage.addListener(handler[port.name]);
    port.onDisconnect.addListener(function (port) {
        ports[port.name] = null;
    });
});