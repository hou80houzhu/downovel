var bright = function () {};
var is = {
    isFunction: function (obj) {
        return (typeof obj === 'function') && obj.constructor === Function;
    },
    isEmptyObject: function (obj) {
        for (var a in obj) {
            return false;
        }
        return true;
    },
    isWindow: function (obj) {
        return obj !== undefined && obj !== null && obj === obj.window;
    },
    isDocument: function (obj) {
        return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
    },
    isObject: function (obj) {
        return  typeof (obj) === "object" && Object.prototype.toString.call(obj).toLowerCase() === "[object object]" && !obj.length;
    },
    isString: function (obj) {
        return (typeof obj === 'string') && obj.constructor === String;
    },
    isNumber: function (obj) {
        return typeof obj === "number";
    },
    isNumeric: function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    },
    isAvalid: function (obj) {
        return obj !== null && obj !== undefined;
    },
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isQueryString: function (str) {
        return is.isString(str) && /(^|&).*=([^&]*)(&|$)/.test(str);
    },
    isElement: function (e) {
        return e && e.nodeType === 1 && e.nodeName;
    }
};
var serialize = {
    parse: function (str) {
        return window.JSON.parse(str);
    },
    stringify: function (obj) {
        return window.JSON.stringify(obj);
    },
    postData: function (obj) {
        if (obj) {
            if (obj instanceof FormData || obj instanceof Blob || obj instanceof ArrayBuffer) {
                return obj;
            } else if (is.isObject(obj)) {
                var has = false;
                for (var i in obj) {
                    if (obj[i] instanceof Blob || obj[i] instanceof ArrayBuffer || obj[i] instanceof File) {
                        has = true;
                        break;
                    }
                }
                if (has) {
                    var fd = new FormData();
                    for (var i in obj) {
                        if (obj[i] instanceof Blob) {
                            fd.append(i, obj[i]);
                        } else if (obj[i] instanceof File) {
                            fd.append(i, obj[i]);
                        } else if (is.isArray(obj[i]) || is.isObject(obj[i])) {
                            fd.append(i, window.encodeURIComponent(serialize.stringify(obj[i])));
                        } else if (obj[i] instanceof FormData) {
                        } else {
                            fd.append(i, window.encodeURIComponent(obj[i].toString()));
                        }
                    }
                    return fd;
                } else {
                    return serialize.queryString(obj);
                }
            } else if (is.isArray(obj)) {
                return window.encodeURIComponent(serialize.stringify({key: obj}));
            } else {
                return obj;
            }
        } else {
            return null;
        }
    },
    queryString: function (obj) {
        var result = "";
        if (obj) {
            for (var i in obj) {
                var val = obj[i];
                if (is.isString(val)) {
                    result += i + "=" + window.encodeURIComponent(val) + "&";
                } else if (is.isObject(val) || is.isArray(val)) {
                    result += i + "=" + window.encodeURIComponent(serialize.stringify(val)) + "&";
                } else if (val instanceof FormData || val instanceof Blob || val instanceof File || val instanceof ArrayBuffer) {
                } else {
                    result += i + "=" + (val ? window.encodeURIComponent(val.toString()) : "") + "&";
                }
            }
            return result.length > 0 ? result.substring(0, result.length - 1) : "";
        } else {
            return "";
        }
    },
    queryObject: function (str) {
        var n = str.split("?"), result = {};
        if (n.length > 1) {
            n[1].split("&").forEach(function (a) {
                var c = a.split("=");
                result[c[0]] = c.length > 1 ? c[1] : "";
            });
            return result;
        } else {
            return null;
        }
    },
    hashObject: function (str) {
        var n = str.split("#"), result = {};
        if (n.length > 1) {
            n[1].split("&").forEach(function (a) {
                var c = a.split("=");
                result[c[0]] = c.length > 1 ? c[1] : "";
            });
            return result;
        } else {
            return null;
        }
    }
};
var json = {
    each: function (object, fn) {
        var name, i = 0, length = object.length, isObj = length === undefined || is.isFunction(object);
        if (isObj) {
            for (name in object) {
                if (fn.call(object[ name ], name, object[ name ]) === false) {
                    break;
                }
            }
        } else {
            while (i < length) {
                if (fn.call(object[ i ], i, object[ i++ ]) === false) {
                    break;
                }
            }
        }
        return object;
    },
    clone: function (obj) {
        var a;
        if (is.isArray(obj)) {
            a = [];
            for (var i = 0; i < obj.length; i++) {
                a[i] = arguments.callee(obj[i]);
            }
            return a;
        } else if (is.isObject(obj)) {
            a = {};
            for (var i in obj) {
                a[i] = arguments.callee(obj[i]);
            }
            return a;
        } else {
            return obj;
        }
    },
    cover: function () {
        var obj, key, val, vals, arrayis, clone, result = arguments[0] || {}, i = 1, length = arguments.length, isdeep = false;
        if (typeof result === "boolean") {
            isdeep = result;
            result = arguments[1] || {};
            i = 2;
        }
        if (typeof result !== "object" && !is.isFunction(result)) {
            result = {};
        }
        if (length === i) {
            result = this;
            i = i - 1;
        }
        while (i < length) {
            obj = arguments[i];
            if (obj !== null) {
                for (key in obj) {
                    val = result[key];
                    vals = obj[key];
                    if (result === vals) {
                        continue;
                    }
                    arrayis = is.isArray(vals);
                    if (isdeep && vals && (is.isObject(vals) || arrayis)) {
                        if (arrayis) {
                            arrayis = false;
                            clone = val && is.isArray(val) ? val : [];
                        } else {
                            clone = val && is.isObject(val) ? val : {};
                        }
                        result[key] = arguments.callee(isdeep, clone, vals);
                    } else if (vals !== undefined) {
                        result[key] = vals;
                    }
                }
            }
            i++;
        }
        return result;
    }
};

var dynamicQueue = function () {
    this.state = "waiting";//waiting,running
    this.list = [];
    this.result = null;
    this.current = null;
    this._complete = null;
    this._notify = null;
    this.waits = 1;
    this._completeTimes = 0;
    this._handleTimes = 0;
};
dynamicQueue.prototype.add = function (fn, error, parameters) {
    this.list.push({
        fn: fn,
        error: error,
        parameters: parameters
    });
    if (this.state === "waiting") {
        if (this.list.length === this.waits) {
            dynamicQueue._fire.call(this, this.result);
        }
    }
    return this;
};
dynamicQueue.prototype.size = function () {
    return this.list.length;
};
dynamicQueue.prototype.wait = function (num) {
    if (arguments.length === 0 || num === 0) {
        num = 10000000;
    }
    this.waits = num;
    return this;
};
dynamicQueue.prototype.work = function (data) {
    if (this.state === "waiting") {
        this.waits = 1;
        dynamicQueue.next.call(this, data);
    }
    return this;
};
dynamicQueue.prototype.delay = function (time) {
    this.add(function (data) {
        var ths = this;
        setTimeout(function () {
            ths.next(data);
        }, time);
    });
    return this;
};
dynamicQueue.prototype.notify = function (fn) {
    fn && (this._notify = fn);
    return this;
};
dynamicQueue.prototype.complete = function (fn) {
    fn && (this._complete = fn);
    return this;
};
dynamicQueue.prototype.isRunning = function () {
    return this.state === "running";
};
dynamicQueue.prototype.isWaiting = function () {
    return this.state === "waiting";
};
dynamicQueue.prototype.isHandleAtOnce = function () {
    if (this.state === "running" && this.list.length > 0) {
        return false;
    } else {
        return true;
    }
};
dynamicQueue.prototype.completeTimes = function () {
    return this._completeTimes;
};
dynamicQueue.prototype.handleTimes = function () {
    return this._handleTimes;
};
dynamicQueue.prototype.clean = function () {
    this.list.length = 0;
    this.state = "waiting";
    for (var i in this) {
        this[i] = null;
    }
};
dynamicQueue.getQueueLite = function (queue) {
    return {
        isRunning: function () {
            return queue.isRunning();
        },
        isWaiting: function () {
            return queue.isWaiting();
        },
        isHandleAtOnce: function () {
            return queue.isHandleAtOnce();
        },
        completeTimes: function () {
            return queue.completeTimes();
        },
        handleTimes: function () {
            return queue.handleTimes();
        },
        next: function (data) {
            dynamicQueue.next.call(queue, data);
            return queue;
        },
        delay: function (time) {
            queue.delay(time);
            return queue;
        },
        error: function (e) {
            return dynamicQueue.error.call(queue, e);
        },
        clean: function () {
            queue.clean();
            return queue;
        }
    };
};
dynamicQueue.next = function (data) {
    this._notify && this._notify.call(this, data);
    dynamicQueue._fire.call(this, data);
    return this;
};
dynamicQueue.error = function (data) {
    if (this.current) {
        this.current.error && this.current.error(this, data);
    }
    return this;
};
dynamicQueue._fire = function (result) {
    if (this.list.length > 0) {
        this.state = 'running';
        this._handleTimes = this._handleTimes + 1;
        var a = this.list.shift(), ths = dynamicQueue.getQueueLite(this);
        this.current = a;
        try {
            a.fn && a.fn.call(ths, result, a.parameters);
        } catch (e) {
            dynamicQueue.error.call(e);
            dynamicQueue.next.call(ths, result);
        }
    } else {
        if (this.state === 'running') {
            this.result = result;
            this.state = 'waiting';
            this._completeTimes = this._completeTimes + 1;
            this.current = null;
        }
        this._complete && this._complete.call(this, result);
    }
    return this;
};
bright.dynamicQueue = function () {
    return new dynamicQueue();
};

var promise = function (task) {
    this.state = 0;//0,1,2
    this.queue = new dynamicQueue();
    this._finally = null;
    this._notify = null;
    this._complete = null;
    this._result = null;
    this._scope = null;
    var ths = this;
    this.queue.complete(function (data) {
        ths._result = data;
        var a = ths._finally && ths._finally.call(ths, data);
        if (a instanceof promise) {
            a.complete(function (b) {
                ths._result = b;
                ths._complete && ths._complete.call(ths, b);
            });
        } else {
            ths._complete && ths._complete.call(ths, data);
        }
    }).notify(function (e) {
        ths._notify && ths._notify(e);
    });
    if (is.isFunction(task)) {
        this.queue.wait();
        this.done(function (a) {
            return a;
        });
        task(function (a) {
            ths.resolve(a);
        }, function (a) {
            ths.reject(a);
        });
    } else if (task) {
        this._result = task;
        this.state = 1;
        this.queue.add(function () {
            this.next(task);
        });
    } else {
        this.queue.wait();
        this.done(function (a) {
            return a;
        });
    }
};
promise.prototype.scope = function (scope) {
    if (arguments.length === 1) {
        this._scope = scope;
        return this;
    } else {
        return this._scope;
    }
};
promise.prototype.then = function (resolver, rejecter) {
    promise.add.call(this, resolver, 1);
    promise.add.call(this, rejecter, 2);
    return this;
};
promise.prototype.wait = function (fn) {
    this.queue.add(function (data) {
        var ths = this;
        fn.call(ths, function (a) {
            ths.next(a);
        }, data);
    });
    return this;
};
promise.prototype.done = function (fn) {
    promise.add.call(this, fn, 1);
    return this;
};
promise.prototype.fail = function (fn) {
    promise.add.call(this, fn, 2);
    return this;
};
promise.prototype.always = function (fn) {
    is.isFunction(fn) && (this._finally = fn);
    return this;
};
promise.prototype.reject = function (data) {
    this.state = 2;
    this.queue.work(data);
    return this;
};
promise.prototype.resolve = function (data) {
    this.state = 1;
    this.queue.work(data);
    return this;
};
promise.prototype.notify = function (fn) {
    is.isFunction(fn) && (this._notify = fn);
    return this;
};
promise.prototype.complete = function (fn) {
    is.isFunction(fn) && (this._complete = fn);
    return this;
};
promise.prototype.delay = function (time) {
    this.queue.delay(time);
    return this;
};
promise.prototype.clean = function () {
    this.queue.clean();
    for (var i in this) {
        this[i] = null;
    }
};
promise.add = function (fn, state) {
    var ps = this;
    if (fn && is.isFunction(fn)) {
        this.queue.add(function (data) {
            var ths = this;
            setTimeout(function () {
                if (ps.state === state) {
                    var a;
                    if (ps._scope) {
                        a = fn && fn.call(ps._scope, data);
                    } else {
                        a = fn && fn(data);
                    }
                    if (a instanceof promise) {
                        a.complete(function (b) {
                            ths.next(b);
                        });
                    } else {
                        ths.next(a);
                    }
                } else {
                    ths.next(data);
                }
            }, 0);
        });
    }
};
bright.promise = function (fn) {
    return new promise(fn);
};
bright.all = function () {
    var ps = $.promise();
    if (arguments.length > 0) {
        var a = Array.prototype.slice.call(arguments);
        var total = a.length;
        a.forEach(function (pros) {
            pros.complete(function () {
                if (this.isResolve) {
                    total = total - 1;
                    if (total === 0) {
                        ps.resolve();
                    }
                }
            });
        });
    }
    return ps;
};
bright.any = function () {
    var ps = $.promise();
    if (arguments.length > 0) {
        var a = Array.prototype.slice.call(arguments);
        var total = a.length, resolved = false;
        a.forEach(function (pros) {
            pros.complete(function () {
                total = total - 1;
                if (this.isResolve) {
                    resolved = true;
                }
                if (total === 0 && resolved) {
                    ps.resolve();
                }
            });
        });
    }
    return ps;
};
var request = function (option) {
    this.mimeType = null;
    this.data = option.data || "";
    this.url = option.url || "";
    this.realURL = option.url || "";
    this.type = option.type || "post";
    this.realType = option.dataType || "text";
    this.dataType = ["arraybuffer", "blob", "document", "text"].indexOf(option.dataType) !== -1 ? option.dataType : "text";
    this.async = option.async === false ? false : true;
    this.timeout = option.timeout || 30000;
    this.headers = option.headers || {};
    this.events = json.cover({
        readystatechange: null,
        loadstart: null,
        progress: null,
        abort: null,
        error: null,
        load: null,
        timeout: null,
        loadend: null
    }, option.events);
    var ths = this;
    this._eventproxy = function (e) {
        var deal = ths.events[e.type];
        ths.response = this;
        deal && deal.call(ths, e);
        if (e.type === "loadend") {
            ths.clean();
        }
    };
    this._uploadproxy = function (e) {
        var deal = ths.events[e.type];
        ths.response = this;
        deal && deal.call(ths, e);
    };
    this.xhr = new XMLHttpRequest();
};
request.prototype.clean = function () {
    for (var i in this.events) {
        if (i === "progress") {
            this.xhr.upload.removeEventListener(i, this._uploadproxy, false);
        } else {
            this.xhr.removeEventListener(i, this._eventproxy, false);
        }
    }
    for (var i in this) {
        this[i] = null;
    }
};
request.prototype.abort = function () {
    this.xhr.abort();
    return this;
};
request.prototype.header = function (params, val) {
    if (arguments.length === 1) {
        for (var i in params) {
            this.headers[i] = params[i];
        }
    } else {
        this.headers[params] = val;
    }
    return this;
};
request.prototype.bind = function (type, fn) {
    if (arguments.length === 1) {
        for (var i in type) {
            this.events[i] = type[i];
        }
    } else {
        this.events[type] = fn;
    }
    return this;
};
request.prototype.unbind = function (type, fn) {
    var m = this.events[type];
    for (var i in m) {
        if (m[i] === fn) {
            m[i] = null;
        }
    }
    return this;
};
request.prototype.fire = function () {
    if (this.mimeType) {
        this.xhr.overrideMimeType(this.mimeType);
    }
    if (this.type === "get") {
        var querystr = serialize.queryString(this.data);
        this.url += (this.url.indexOf("?") !== -1 ? (querystr === "" ? "" : "&" + querystr) : (querystr === "" ? "" : "?" + querystr));
    } else {
        this.data = serialize.postData(this.data);
    }
    this.xhr.open(this.type, this.url, this.async);
    if (this.async) {
        this.xhr.responseType = this.dataType;
        this.xhr.timeout = this.timeout;
    }
    for (var i in this.events) {
        if (i === "progress") {
            this.xhr.upload.addEventListener(i, this._uploadproxy, false);
        } else {
            this.xhr.addEventListener(i, this._eventproxy, false);
        }
    }
    for (var i in this.headers) {
        this.xhr.setRequestHeader(i, this.headers[i]);
    }
    if (is.isQueryString(this.data)) {
        this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    this.xhr.send(this.data);
    return this;
};
ajax = function (option) {
    var pros = new promise();
    if (option) {
        option["events"] = {
            error: function (e) {
                option.error && option.error.call(this, e);
                pros.reject(e);
            },
            load: function (e) {
                var status = this.response.status;
                if ((status >= 200 && status < 300) || status === 304) {
                    var result = this.response.response;
                    if (this.realType === "json") {
                        var txt = this.response.responseText;
                        try {
                            result = serialize.parse(txt);
                        } catch (e) {
                            throw Error("[bright] ajax unvaliable json string,url is '" + option.url + "'");
                        }
                    }
                    option.success && option.success.call(this, result);
                    pros.resolve(result);
                } else {
                    option.error && option.error.call(this, e);
                    pros.reject(this.response);
                }
            }
        };
        new request(option).fire();
        return pros;
    } else {
        return pros.resolve();
    }
};

var inspectHost = "";
var ports = {};
var handler = {
    ui: function (message, sender, sendResponse) {
        if (message.type === "getlocale") {
            console.log(message.data);
            chrome.tabs.detectLanguage(function (a) {// detect language by chrome extension method,if is is fail,then post the request to the detect API.
//                if (a !== "und") {//delect fail by chrome extension method.
                    ports["ui"].postMessage({
                        type: "getlocale",
                        data: a
                    });
//                } else {
//                    ajax({//detect language by remote api.
//                        url: "http://localhost/brightjs/data/data.json",// you shold change the url,which to detect the language.
//                        type: "post",
//                        data: JSON.stringify(message.data),
//                        dataType:"json",
//                        success: function (a) {
//                            if(a.code==="1"){
//                                ports["ui"].postMessage({
//                                    type: "getlocale",
//                                    data: a
//                                });
//                            }
//                        }
//                    });
//                }
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