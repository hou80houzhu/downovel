(function ($) {
    var port = chrome.extension.connect({name: "button"});
    port.onMessage.addListener(function (msg) {
        if (msg.type === "download") {
            var info = msg.data.data;
            var btn = $(".play"), total = 0;
            btn.html("<i class='loading'></i> starting");
            baseController.run(info.next, function (a) {
                total++;
                $(".result").show().children(1).append("<div class='result-item'><div class='result-item-a'></div><div class='result-item-b'>" + a.title + "</div></div>");
                btn.html("<i class='loading'></i> done( " + total + " )");
            }, info).done(function (a) {
                btn.remove();
                var _file = new Blob([a], {type: "text/plain"});
                var url = window.URL.createObjectURL(_file);
                var event = document.createEvent("MouseEvent");
                event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                var t = document.createElement("a");
                t.href = url;
                t.download = info.title + ".txt";
                t.dispatchEvent(event);
            });
        } else if (msg.type === "fail") {
            $(".play").removeClass("on");
        }
    });
    var baseController = {
        getPage: function (url, info) {
            var ps = $.promise();
            $.ajax({
                url: url,
                type: "get",
                dataType: "text",
                success: function (a) {
                    if (a) {
                        baseController.getPageInfo(a, info).done(function (t) {
                            if (t) {
                                ps.resolve(t);
                            } else {
                                ps.reject();
                            }
                        });
                    } else {
                        ps.reject();
                    }
                },
                error: function () {
                    ps.reject();
                }
            });
            return ps;
        },
        getPageInfo: function (content, info) {
            var n = content.split(/\<body.*?\>|\<\/body\>/), ps = $.promise();
            var _content = n[1];
            var main = $().create("div").html(_content).find(".bdsub").children(0);
            var next = main.children(2).find("a").last().attr("href");
            if (next.indexOf(".html") !== -1) {
                if (next[0] !== "/") {
                    var host = info.host;
                    chrome.tabs.getSelected(null, function (tab) {
                        var n = tab.url.substring(host.length).split("/");
                        n.pop();
                        n.push(next);
                        next = n.join("/");
                        ps.resolve({
                            title: main.children(1).text(),
                            content: main.children(5).html(),
                            next: next
                        });
                    });
                } else {
                    ps.resolve({
                        title: main.children(1).text(),
                        content: main.children(6).html(),
                        next: next
                    });
                }
            } else {
                ps.resolve(null);
            }
            return ps;
        },
        run: function (urlt, fn, info) {
            var base = $().create("div"), ps = $.promise();
            var m = function (url, inf) {
                url = inf.host + url;
                baseController.getPage(url, inf).done(function (a) {
                    console.log(a);
                    base.append("<div style='margin:10px 0 10px 0;'><br><br><h3>" + a.title + "</h3><br><br><p>" + a.content + "</p></div><br>");
                    try {
                        fn && fn(a);
                    } catch (e) {
                    }
                    m(a.next,inf);
                }).fail(function () {
                    ps.resolve(base.text());
                });
            };
            m(urlt, info);
            return ps;
        }
    };
    $().ready(function () {
        $(".play").click(function () {
            if (!$(this).hasClass("on")) {
                $(this).addClass("on");
                port.postMessage({
                    type: "download",
                    data: {}
                });
            }
        });
    });
})(window.bright);