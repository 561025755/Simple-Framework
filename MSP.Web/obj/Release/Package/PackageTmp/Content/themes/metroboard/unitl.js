var Util = {};
$(function () {
    document.ondragstart = function () {
        return false
    };
    $.ajaxSetup({
        cache: false
    });
    $("[title],[original-title]").live("mouseover",
    function () {
        if ($(this).attr("disableTitle")) {
            return false
        }
        var k = $(this);
        if (k.attr("title")) {
            k.attr("original-title", k.attr("title"));
            k.removeAttr("title")
        }
        if (!k.attr("original-title")) {
            return
        }
        var l = k.attr("original-title");
        var j = $("#hover_tip");
        if (j.length == 0) {
            j = $("<div id='hover_tip'><div class='tip_arrow'></div><div class='tip_content radius3'></div></div>").appendTo("body")
        }
        $(".tip_content").html(l);
        $("#hover_tip").show();
        $(".tip_arrow").removeClass("tip_right").removeClass("tip_top").css("top", "");
        if (k.attr("title_pos") == "right") {
            j.css({
                left: k.offset().left + k.outerWidth() + 7,
                top: k.offset().top + k.outerHeight() / 2 - j.outerHeight() / 2
            });
            $(".tip_arrow").attr("class", "tip_arrow tip_right").css("top", j.outerHeight() / 2 - 7)
        } else {
            if (k.attr("title_pos") == "top") {
                j.css({
                    left: k.offset().left + k.outerWidth() / 2 - j.outerWidth() / 2,
                    top: k.offset().top - j.outerHeight()
                });
                $(".tip_arrow").attr("class", "tip_arrow tip_top")
            } else {
                if (k.attr("title_pos") == "left") {
                    j.css({
                        left: k.offset().left - j.outerWidth() - 7,
                        top: k.offset().top + k.outerHeight() / 2 - j.outerHeight() / 2
                    });
                    $(".tip_arrow").attr("class", "tip_arrow tip_left")
                } else {
                    j.css({
                        left: k.offset().left + k.outerWidth() / 2 - j.outerWidth() / 2,
                        top: k.offset().top + k.outerHeight()
                    });
                    $(".tip_arrow").attr("class", "tip_arrow")
                }
            }
        }
    }).live("mouseout",
    function () {
        $("#hover_tip").hide()
    });
    var f;
    var i;
    var d;
    $(".user_quickinfo").live("mouseenter",
    function () {
        var k = $(this);
        var j = k.attr("userId");
        if (f) {
            f.abort()
        }
        clearTimeout(i);
        i = setTimeout(function () {
            f = Util.ajax({
                url: "/u/quickinfo",
                data: {
                    userId: j
                },
                success: function (m) {
                    if (m.result == "not_exists") {
                        return
                    }
                    var l = g();
                    l.attr("userId", j);
                    l.html(m);
                    l.show();
                    l.popMenu({
                        autoClose: false,
                        target: k,
                        position: "left"
                    });
                    l.unbind().bind("mouseenter",
                    function () {
                        clearTimeout(d)
                    }).bind("mouseleave",
                    function () {
                        l.popMenu("close")
                    });
                    $("#userinfo_follow_btn").unbind().bind("click",
                    function () {
                        if ($(this).hasClass("green")) {
                            Util.ajax({
                                url: "/start/unfollow",
                                data: {
                                    followId: j
                                },
                                success: function (n) {
                                    $("#userinfo_follow_btn").text("关注").removeClass("green").addClass("default")
                                }
                            })
                        } else {
                            Util.ajax({
                                url: "/start/savefollow",
                                data: {
                                    followIds: j
                                },
                                success: function (n) {
                                    $("#userinfo_follow_btn").text("关注中").removeClass("default").addClass("green")
                                }
                            })
                        }
                    })
                }
            })
        },
        400)
    }).live("mouseleave",
    function () {
        if (f) {
            f.abort()
        }
        clearTimeout(i);
        d = setTimeout(function () {
            $("#userQuickInfo").popMenu("close")
        },
        400)
    });
    function g() {
        var j = $("#userQuickInfo");
        if (j.length == 0) {
            j = $("<div id='userQuickInfo' class='shadow_1 radius3' style='display:none;'></div>").appendTo("body")
        }
        return j
    }
    var h;
    var b;
    var c;
    $(".tag_quickinfo").live("mouseenter",
    function () {
        var k = $(this);
        var j = k.attr("tag");
        if (h) {
            h.abort()
        }
        clearTimeout(b);
        b = setTimeout(function () {
            h = Util.ajax({
                url: "/tags/quickinfo",
                data: {
                    tag: j
                },
                success: function (m) {
                    if (m.result == "not_exists") {
                        return
                    }
                    var l = e();
                    l.html(m);
                    l.show();
                    l.popMenu({
                        autoClose: false,
                        target: k,
                        position: "left"
                    });
                    l.unbind().bind("mouseenter",
                    function () {
                        clearTimeout(c)
                    }).bind("mouseleave",
                    function () {
                        l.popMenu("close")
                    });
                    $("#taginfo_follow_btn").unbind().bind("click",
                    function () {
                        if ($(this).hasClass("green")) {
                            Util.ajax({
                                url: "/tags/unfollow",
                                data: {
                                    tagName: j
                                },
                                success: function (n) {
                                    $("#taginfo_follow_btn").text("关注").removeClass("green").addClass("default")
                                }
                            })
                        } else {
                            Util.ajax({
                                url: "/tags/follow",
                                data: {
                                    tagName: j
                                },
                                success: function (n) {
                                    $("#taginfo_follow_btn").text("关注中").removeClass("default").addClass("green")
                                }
                            })
                        }
                    })
                }
            })
        },
        400)
    }).live("mouseleave",
    function () {
        if (h) {
            h.abort()
        }
        clearTimeout(b);
        c = setTimeout(function () {
            $("#tagQuickInfo").popMenu("close")
        },
        400)
    });
    function e() {
        var j = $("#tagQuickInfo");
        if (j.length == 0) {
            j = $("<div id='tagQuickInfo' class='shadow_1 radius3' style='display:none;'></div>").appendTo("body")
        }
        return j
    }
    var a = document.referrer;
    if (a && a.indexOf("processon.com") < 0) {
        Util.setCookie("processon_referrer", encodeURI(a), 1)
    }
});
Array.prototype.inArray = function (b) {
    for (var a = 0; a < this.length; a++) {
        if (this[a] == b) {
            return true
        }
    }
    return false
};
Array.prototype.indexOf = function (b) {
    for (var a = 0; a < this.length; a++) {
        if (this[a] == b) {
            return a
        }
    }
    return -1
};
Array.prototype.remove = function (b) {
    var a = this.indexOf(b);
    if (a > -1) {
        this.splice(a, 1)
    }
};
Util.formatMsg = function (str, args) {
    if (typeof args != "object") {
        eval("args=['" + args + "']")
    }
    for (var i = 0; i < args.length; i++) {
        var toReplace = "{" + i + "}";
        str = str.replace(toReplace, args[i])
    }
    return str
};
Util.formatNumber = function (e, c) {
    if (/[^0-9\.]/.test(e)) {
        return "0"
    }
    if (e == null || e == "") {
        return "0"
    }
    e = e.toString().replace(/^(\d*)$/, "$1.");
    e = (e + "00").replace(/(\d*\.\d\d)\d*/, "$1");
    e = e.replace(".", ",");
    var d = /(\d)(\d{3},)/;
    while (d.test(e)) {
        e = e.replace(d, "$1,$2")
    }
    e = e.replace(/,(\d\d)$/, ".$1");
    if (c == 0) {
        var b = e.split(".");
        if (b[1] == "00") {
            e = b[0]
        }
    }
    return e
};
Util.onlyNum = function (b) {
    var a = b || window.event;
    if (!(a.keyCode >= 8 && a.keyCode <= 20) || (a.keyCode >= 33 && a.keyCode <= 46)) {
        if (!((a.keyCode >= 48 && a.keyCode <= 57) || (a.keyCode >= 96 && a.keyCode <= 105))) {
            if (window.event) {
                a.returnValue = false
            } else {
                a.preventDefault()
            }
        }
    }
    return a.keyCode
};
Util.loading = function (b) {
    var c = {
        content: "loading...",
        show: 1000,
        delay: 0,
        model: false
    };
    if (typeof (b) == "string" && b == "close") {
        $("#top_loading_tip").remove();
        $("#dialog_model").remove();
        return
    }
    b = $.extend(c, b);
    if ($("#top_loading_tip").length > 0) {
        $("#top_loading_tip").remove()
    }
    var a = $("<div id='top_loading_tip' class='loadingTop'><p><b>" + b.content + "</b></p></div>").appendTo("body");
    if (b.model) {
        $("body").append("<div id='dialog_model'></div>");
        $("#dialog_model").css({
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            "z-index": b.zIndex - 1,
            opacity: 0.6,
            background: "#FFF",
            display: "none"
        })
    }
    if (typeof (b.show) == "number") {
        $("#top_loading_tip").delay(b.delay).show(0,
        function () {
            if (b.model) {
                $("#dialog_model").show()
            }
        }).delay(b.show).fadeOut(500,
        function () {
            if (b.model) {
                $("#dialog_model").hide()
            }
        })
    } else {
        if (b.show === true) {
            $("#top_loading_tip").delay(b.delay).show(0,
            function () {
                if (b.model) {
                    $("#dialog_model").show()
                }
            })
        }
    }
};
$.fn.clear = function () {
    $(this).find("input[type=text]").val("");
    $(this).find("input[type=password]").val("");
    $(this).find("textarea").val("");
    $(this).find("select").val("")
};
$.fn.submitFormAjax = function (a) {
    var b = $(this);
    if (a.onSubmit) {
        if (a.onSubmit.call() == false) {
            return
        }
    }
    $.ajax({
        url: a.url ? a.url : $(this).attr("action"),
        type: "POST",
        data: $(this).serialize(),
        success: function (c) {
            if (c.error == "error") {
                $.simpleAlert("暂时无法处理您的请求，请稍候重试。", "error", 3000)
            } else {
                if (c.error == "notlogin") {
                    Util.loginWindow("open",
                    function () {
                        b.submitFormAjax(a)
                    })
                } else {
                    if (a.success) {
                        a.success(c)
                    }
                }
            }
        },
        error: function (c) {
            $.simpleAlert("暂时无法处理您的请求，请稍候重试。".errorMsg, "error", 3000);
            if (a.error) {
                a.error(c)
            }
        }
    })
};
$.fn.submitForm = function (opt) {
    var defaultOpt = {
        json: true
    };
    var options = $.extend(defaultOpt, opt);
    var form = $(this);
    if (options.onSubmit) {
        if (options.onSubmit.call(form) == false) {
            return
        }
    }
    if (options.url) {
        form.attr("action", options.url)
    }
    var frameId = "submit_frame_" + (new Date().getTime());
    var frame = $("<iframe id=" + frameId + " name=" + frameId + "></iframe>").attr("src", window.ActiveXObject ? "javascript:false" : "about:blank").css({
        position: "absolute",
        top: -1000,
        left: -1000
    });
    form.attr("target", frameId);
    frame.appendTo("body");
    frame.bind("load", submitCallback);
    form.append("<input type='hidden' name='submitFormByHiddenFrame' id='submitFormByHiddenFrameParam' value='hiddenFrame'/>");
    form[0].submit();
    $("#submitFormByHiddenFrameParam").remove();
    var checkCount = 10;
    function submitCallback() {
        frame.unbind();
        var body = $("#" + frameId).contents().find("body");
        var data = body.html();
        if (data == "") {
            if (--checkCount) {
                setTimeout(submitCallback, 200);
                return
            }
            return
        }
        var ta = body.find(">textarea");
        if (ta.length) {
            data = ta.val()
        } else {
            var pre = body.find(">pre");
            if (pre.length) {
                data = pre.html()
            }
        }
        try {
            eval("data=" + data);
            if (data.error == "error") {
                $.simpleAlert("暂时无法处理您的请求，请稍候重试。", "error", 3000)
            } else {
                if (data.error == "notlogin") {
                    Util.loginWindow("open",
                    function () {
                        form.submitForm(options)
                    })
                } else {
                    if (options.success) {
                        options.success(data)
                    }
                }
            }
        } catch (e) {
            if (options.json) {
                $.simpleAlert("暂时无法处理您的请求，请稍候重试。", "error", 3000);
                if (options.error) {
                    options.error(data)
                }
            } else {
                if (options.success) {
                    options.success(data)
                }
            }
        }
        setTimeout(function () {
            frame.unbind();
            frame.remove()
        },
        100)
    }
};
Util.ajax = function (a) {
    if (a.onSend) {
        if (a.onSend() == false) {
            return
        }
    }
    var b = {
        type: "POST"
    };
    a = $.extend(b, a);
    return $.ajax({
        url: a.url,
        type: a.type,
        traditional: true,
        data: a.data,
        success: function (c) {
            if (c.error == "error") {
                $.simpleAlert("暂时无法处理您的请求，请稍候重试。", "error", 3000);
                if (a.error) {
                    a.error(c)
                }
            } else {
                if (c.error == "notlogin") {
                    if (a.loginValidate) {
                        a.loginValidate(c)
                    }
                    Util.loginWindow("open",
                    function () {
                        Util.ajax(a)
                    })
                } else {
                    if (a.success) {
                        a.success(c)
                    }
                }
            }
        },
        error: function (c) {
            if (c.status) {
                if (a.error) {
                    a.error(c)
                } else { }
            }
        }
    })
};
Util.load = function (d, a, c, e, b) {
    $.ajax({
        url: a,
        type: "POST",
        dataType: "html",
        data: c,
        success: function (f) {
            if (f.error == "error") {
                $.simpleAlert("暂时无法处理您的请求，请稍候重试。", "error", 3000)
            } else {
                if (f.error == "notlogin") {
                    Util.loginWindow("open",
                    function () {
                        Util.load(d, a, c, e, b)
                    })
                } else {
                    if (b) {
                        if (b(f)) {
                            d.html(f);
                            if (e) {
                                e(f)
                            } else {
                                d.html(f)
                            }
                        }
                    } else {
                        if (e) {
                            d.html(f);
                            e(f)
                        } else {
                            d.html(f)
                        }
                    }
                }
            }
        },
        error: function (f) {
            $.simpleAlert("暂时无法处理您的请求，请稍候重试。", "error", 3000)
        }
    })
};
Util.get = function (a, b, c) {
    $.ajax({
        url: a,
        type: "GET",
        data: b,
        success: function (d) {
            if (d.error == "error") {
                $.simpleAlert("暂时无法处理您的请求，请稍候重试。", "error", 3000)
            } else {
                if (d.error == "notlogin") {
                    Util.loginWindow("open",
                    function () {
                        Util.get(a, b, c)
                    })
                } else {
                    c(d)
                }
            }
        },
        error: function (d) { }
    })
};
Util.filterXss = function (a) {
    a = a.toString();
    a = a.replace(/[<%3C]/g, "&lt;");
    a = a.replace(/[>%3E]/g, "&gt;");
    a = a.replace(/"/g, "&quot;");
    a = a.replace(/'/g, "&#39;");
    return a
};
$.fn.disable = function (c, b) {
    $(this).attr("disable", true);
    $(this).addClass("opacity");
    for (var a = 0; a < $(this).length; a++) {
        var d = $(this)[a];
        $(d).unbind("mouseover.disable").bind("mouseover.disable",
        function () {
            var e = $("<div class='disabled-mask'></div>").appendTo("body");
            if (!c) {
                c = 2
            }
            e.css({
                width: $(this).outerWidth() + c,
                height: $(this).outerHeight() + 4,
                top: $(this).offset().top,
                left: $(this).offset().left
            });
            if (b) {
                e.css("z-index", b)
            }
            e.bind("mouseout",
            function () {
                $(this).remove()
            })
        }).bind("focus",
        function () {
            $(this).blur()
        });
        $(d).trigger("mouseover.disable")
    }
    return this
};
$.fn.enable = function () {
    $(this).attr("disable", false);
    $(this).removeClass("opacity");
    for (var a = 0; a < $(this).length; a++) {
        var b = $(this)[a];
        $(b).unbind("mouseover.disable").unbind("focus")
    }
    $(".disabled-mask").trigger("mouseout");
    return this
};
Util.loginWindow = function (c, b) {
    if (typeof c == "undefined") {
        c = "open"
    }
    if (c == "open") {
        if ($("#loginWindow").length) {
            $("#loginWindow").remove()
        }
        var a = $("<div id='loginWindow' class='loginWindow'></div>").appendTo("body");
        a.append("<div id='loginWindow-content' class='loginWindow-content'><img src='/images/ajaxload.gif' style='margin:80px 0px 0px 45%'/></div>");
        $("#loginWindow-content").load("/login/window",
        function () {
            loginCallback = b
        });
        a.dialog()
    } else {
        if (c = "close") {
            $("#loginWindow").dialog("close")
        }
    }
};
Util.globalTopTip = function (d, c, b) {
    if (typeof d == "undefined") {
        return
    }
    if (b == null) {
        b = 5000
    }
    if (c == null) {
        c = "top_success"
    }
    var e = $("#global_top_dialog");
    if (e.length > 0) {
        e.remove()
    }
    e = $('<div id="global_top_dialog" class="global_top_dialog"><div class="left_arrow"></div>' + d + '<div class="right_arrow"></div></div>').appendTo("body");
    e.addClass(c);
    var a = e.outerWidth();
    if ($("#header").length == 0) {
        e.css("top", "0px")
    }
    e.css({
        "margin-left": -(a * 0.5) + "px"
    }).show();
    setTimeout(function () {
        e.addClass("show");
        setTimeout(function () {
            e.removeClass("show");
            setTimeout(function () {
                e.fadeOut("slow").remove()
            },
            250)
        },
        b)
    },
    50)
};
Util.setCookie = function (b, c, a) {
    var d = new Date();
    d.setDate(d.getDate() + a);
    document.cookie = b + "=" + escape(c) + ((a == null) ? "" : ";expires=" + d.toGMTString())
};
Util.getCookies = function (b) {
    if (document.cookie.length > 0) {
        var c = document.cookie.indexOf(b + "=");
        if (c != -1) {
            c = c + b.length + 1;
            var a = document.cookie.indexOf(";", c);
            if (a == -1) {
                a = document.cookie.length
            }
            return unescape(document.cookie.substring(c, a))
        }
    }
    return ""
};
Util.checkPrivateFileCount = function (a) {
    Util.ajax({
        url: "/view/getprivatefilecount",
        success: function (b) {
            if (b.filecount >= b.totalcount) {
                $.confirm({
                    content: "私有存储空间已经不足<br><br><span>▪ 您只能创建公开文件，点击确定继续。</span><br>▪ 您也可以去 <a target='_blank' href='/support/privatefile'>扩容</a>",
                    onConfirm: function () {
                        a()
                    }
                })
            } else {
                a()
            }
        }
    })
}; (function (c) {
    var d = 0;
    c.mask = function (f) {
        if (typeof f == "undefined") {
            f = "open"
        }
        if (f == "open") {
            if (d == 0) {
                var e = c("<div id='window-mask' class='window-mask' style='display:none'></div>").appendTo("body");
                e.css({
                    width: c(window).width() + "px",
                    height: c(window).height() + "px",
                    filter: "alpha(opacity=60)"
                }).show();
                c(window).bind("resize.mask",
                function () {
                    e.css({
                        width: c(window).width() + "px",
                        height: c(window).height() + "px"
                    })
                })
            }
            d++
        } else {
            if (f == "close") {
                d--;
                if (d == 0) {
                    c("#window-mask").remove();
                    c(window).unbind("resize.mask")
                }
            }
        }
    };
    c.fn.dialog = function (g) {
        var f = c(this);
        if (typeof g == "string") {
            if (g == "close") {
                f.find(".dialog_close").trigger("click");
                if (c("#window-mask") != null) {
                    c("#window-mask").hide()
                }
            }
        } else {
            var i = {
                fixed: true,
                closable: true,
                mask: true
            };
            g = c.extend(i, g);
            if (!g) {
                g = {}
            }
            var j = "";
            if (g.title) {
                j = g.title
            } else {
                if (f.attr("title")) {
                    j = f.attr("title");
                    f.attr("title", "")
                }
            }
            f.addClass("dialog_box").show();
            var k = c("<div class='dialog_close'></div>").appendTo(f);
            k.bind("click",
            function () {
                if (g.onClose) {
                    if (g.onClose() == false) {
                        return
                    }
                }
                c.mask("close");
                f.hide();
                f.removeClass("dialog_box").find(".dialog_close").remove();
                var l = f.find(".dialog_title");
                f.attr("title", l.text());
                l.remove();
                c(window).unbind("resize.dialog")
            });
            if (g.closable) {
                k.show()
            }
            if (j != "") {
                f.prepend("<h2 class='dialog_title'>" + j + "</h2>")
            }
            if (g.mask) {
                c.mask()
            }
            var h = f.outerWidth();
            var e = f.outerHeight();
            c(window).bind("resize.dialog",
            function () {
                var m = 0;
                if (g.fixed) {
                    f.css("position", "fixed");
                    m = (c(window).height() - e) / 2 + "px"
                } else {
                    f.css("position", "absolute");
                    m = (c(window).height() - e) / 2 + c(document).scrollTop() + "px"
                }
                var l = (c(window).width() - h) / 2 + "px";
                f.css({
                    top: m,
                    left: l
                })
            });
            c(window).trigger("resize.dialog");
            f.find(".dialog_title").draggable({
                target: f
            })
        }
        return f
    };
    c.confirm = function (e) {
        var f = c("#global_confirm_window");
        if (!f.length) {
            f = c("<div id='global_confirm_window' title='请确认'><div class='msg'></div><div class='buttons'><span class='button default okbtn'>确定</span>&nbsp;&nbsp;<span class='button cancelbtn'>取消</span></div></div>").appendTo("body")
        }
        f.find(".msg").html(e.content);
        if (e.width) {
            f.css("width", e.width)
        }
        if (e.height) {
            f.css("height", e.height)
        }
        f.dialog();
        f.find(".okbtn").unbind().bind("click",
        function () {
            f.dialog("close");
            if (e.onConfirm) {
                e.onConfirm()
            }
        });
        f.find(".cancelbtn").unbind().bind("click",
        function () {
            f.dialog("close");
            if (e.onCancel) {
                e.onCancel()
            }
        })
    };
    c.fn.popMenu = function (e) {
        var k = c(this);
        if (typeof e == "string") {
            if (e == "close") {
                k.hide().removeClass("popover");
                c(window).unbind("resize.popmenu")
            }
            return
        }
        var j = {
            position: "left",
            fixed: false,
            offsetX: 0,
            offsetY: 0,
            zindex: 2,
            autoClose: true,
            closeAfterClick: false,
            autoPosition: true
        };
        var f = c.extend(j, e);
        var i = c(f.target);
        k.addClass("popover").css("z-index", f.zindex);
        if (f.fixed) {
            k.css("position", "fixed")
        }
        if (f.autoClose) {
            if (f.closeAfterClick == false) {
                k.unbind("mouseup.popmenu").bind("mouseup.popmenu",
                function (l) {
                    l.stopPropagation()
                })
            }
            c(document).bind("mouseup.popmenu",
            function () {
                k.popMenu("close");
                c(document).unbind("mouseup.popmenu");
                if (f.onClose) {
                    f.onClose()
                }
            })
        }
        c(window).bind("resize.popmenu",
        function () {
            k.popMenu(e)
        });
        k.show();
        var h = 0;
        if (f.position == "center") {
            h = i.offset().left + i.outerWidth() / 2 - k.outerWidth() / 2
        } else {
            if (f.position == "right") {
                h = i.offset().left + i.outerWidth() - k.outerWidth()
            } else {
                h = i.offset().left
            }
        }
        if (h + k.outerWidth() > c(window).width()) {
            h = c(window).width() - k.outerWidth()
        }
        var g = i.offset().top + i.outerHeight();
        if (f.autoPosition && g + f.offsetY + k.outerHeight() > c(window).height() + c(document).scrollTop()) {
            k.css({
                top: c(window).height() - k.outerHeight() + c(document).scrollTop(),
                left: h + f.offsetX
            })
        } else {
            k.css({
                top: g + f.offsetY,
                left: h + f.offsetX
            })
        }
    };
    c.fn.spread = function (j) {
        var q = this;
        if (typeof j === "string") {
            return
        }
        if (q.length <= 0) {
            return
        }
        var e = c(q[0]),
        C = e.parent();
        var A = parseInt(e.css("padding-left").replace("px", "")),
        v = parseInt(e.css("padding-right").replace("px", "")),
        t = parseInt(e.css("padding-top").replace("px", "")),
        f = parseInt(e.css("padding-bottom").replace("px", "")),
        u = parseInt(C.css("padding-left").replace("px", "")),
        o = parseInt(C.css("padding-right").replace("px", "")),
        n = parseInt(C.css("padding-top").replace("px", "")),
        B = parseInt(C.css("padding-bottom").replace("px", ""));
        var l = {
            w: e.width() + A + v,
            h: e.height() + t + f,
            ml: 10,
            mt: 10,
            maxWidth: C.width(),
            s: 150
        };
        var g = c.extend(l, j);
        var m = g.w,
        x = g.h,
        y = g.ml,
        r = g.mt,
        z = g.maxWidth,
        p = g.s;
        c.each(q,
        function (s, w) {
            var h = c(w);
            h.css({
                top: "-" + x + "px",
                left: 0
            })
        });
        var k = parseInt((z + y) / (m + y));
        var i = Math.ceil(q.length / k);
        c.each(q,
        function (w, E) {
            var s = c(E);
            var h = parseInt(w / k);
            var D = parseInt(w % k);
            var H = D == 0 ? u + 10 : D * (m + y) + u + 10;
            var G = h == 0 ? n + 6 : h * (x + r) + n + 6;
            s.css({
                display: "block",
                position: "absolute"
            });
            var F = (Math.sqrt(Math.pow((G + 150), 2) + Math.pow(H, 2)) / 150);
            s.animate({
                top: G,
                left: H
            },
            F * p)
        })
    };
    c.simpleAlert = function (j, h, f) {
        if (j == "close") {
            c("#simplealert").remove();
            return
        }
        if (c("#simplealert").length) {
            c("#simplealert").remove()
        }
        var i = "simplealert-icon-info";
        if (h) {
            i = "simplealert-icon-" + h
        }
        var e = c("<div id='simplealert' class='simplealert'></div>").appendTo("body");
        var g = "<div class='" + i + "'>";
        if (h == "loading") {
            g += "<img src='/images/default/designer/loading.gif' style='margin:10px 0px 0px 12px'/>"
        }
        g += "</div><div class='simplealert-msg'>" + j + "</div><div class='simplealert-right'></div>";
        e.html(g);
        e.css("top", (c(window).height() - e.height()) / 2 + c(window).scrollTop() + "px");
        e.css("left", (c(window).width() - e.width()) / 2 + c(window).scrollLeft() + "px");
        e.show();
        if (f != "no") {
            setTimeout(function () {
                e.fadeOut(200)
            },
            f ? f : 3500)
        }
    };
    c.fn.tooltip = function (g, f, k, l, e) {
        var h, j, i;
        f = f ? f : "warning";
        if (f != "none") {
            //g = "<img src='/images/icon/ico-" + f + ".png' style='vertical-align:middle;margin-right:5px;'/><span>" + g + "</span>"
        }
        if (c("#p_toolTip").length) {
            c("#p_toolTip").remove()
        }
        c("body").append('<p id="p_toolTip" class="tool-tip radius3">' + g + "</p>");
        h = c("#p_toolTip");
        if (l == "top") {
            i = c(this).offset().top - h.height() - 20 + "px";
            j = c(this).offset().left + c(this).width() / 2 - h.width() / 2 + "px"
        } else {
            if (l == "bottom") {
                i = c(this).offset().top + c(this).height() + 25 + "px";
                j = c(this).offset().left + c(this).width() / 2 - h.width() / 2 + "px"
            } else {
                if (l == "left") {
                    i = c(this).offset().top + c(this).height() / 2 - h.height() / 2 + "px";
                    j = c(this).offset().left - h.width() - 20 + "px"
                } else {
                    if (l == "right") {
                        i = c(this).offset().top + h.height() / 2 - h.height() / 2 + "px";
                        j = c(this).offset().left + c(this).width() + 28 + "px"
                    }
                }
            }
        }
        h.css({
            left: j,
            top: i
        }).addClass(l);
        if (!k) {
            h.show().delay(e).hide()
        } else {
            h.fadeIn("slow").delay(e).fadeOut("slow")
        }
    };
    c.closeTooltip = function () {
        c("p#p_toolTip").remove()
    };
    c.fn.draggable = function (e) {
        var g = {
            target: c(this)
        };
        var f = c.extend(g, e);
        c(this).unbind("dragstart").bind("dragstart",
        function () {
            return false
        });
        c(this).unbind("mousedown.drag").bind("mousedown.drag",
        function (i) {
            c(document).bind("selectstart",
            function () {
                return false
            });
            var l = i.pageX;
            var j = i.pageY;
            var k = f.target.offset().left;
            var h = f.target.offset().top;
            c(document).bind("mousemove.drag",
            function (p) {
                var o = p.pageX - l + k;
                var n = p.pageY - j + h;
                if (f.bounding) {
                    var m = f.bounding.offset().left;
                    var q = f.bounding.offset().top;
                    if (o > m && n > q && o < m + f.bounding.outerWidth() - f.target.outerWidth() && n < q + f.bounding.outerHeight() - f.target.outerHeight()) {
                        f.target.offset({
                            left: o,
                            top: n
                        })
                    }
                } else {
                    f.target.offset({
                        left: o,
                        top: n
                    })
                }
            });
            c(document).bind("mouseup.drag",
            function (m) {
                c(document).unbind("selectstart");
                c(document).unbind("mousemove.drag");
                c(document).unbind("mouseup.drag")
            })
        })
    };
    c.fn.suggest = function (f) {
        var j = c(this);
        var i = {
            valueField: "value",
            width: j.outerWidth(),
            format: function (l) {
                return l.text
            }
        };
        var g = c.extend(i, f);
        if (!j.data("suggest")) {
            var k = c("<ul class='suggest_menu'></ul>").appendTo("body");
            k.width(g.width);
            j.data("suggest", k)
        }
        var e = -1;
        var h = "";
        j.unbind("keydown.suggest").bind("keydown.suggest",
        function (m) {
            var n = j.data("suggest");
            if (m.keyCode == 40) {
                m.preventDefault();
                if (e < n.children().length - 1) {
                    e++;
                    n.find(".selected").removeClass("selected");
                    n.find("li[index=" + e + "]").addClass("selected")
                }
            } else {
                if (m.keyCode == 38) {
                    m.preventDefault();
                    n.find(".selected").removeClass("selected");
                    if (e >= 0) {
                        e--;
                        n.find("li[index=" + e + "]").addClass("selected")
                    }
                } else {
                    if (m.keyCode == 13) {
                        var l = n.find(".selected");
                        if (l.length) {
                            j.val(l.attr("val"))
                        }
                        if (g.onEnter) {
                            g.onEnter(j)
                        }
                        n.empty().popMenu("close")
                    }
                }
            }
        }).unbind("keyup.suggest").bind("keyup.suggest",
        function (m) {
            var n = j.data("suggest");
            var l = j.val();
            if (l == "") {
                n.empty().popMenu("close")
            } else {
                if (l != h) {
                    e = -1;
                    c.get(g.url, {
                        q: l
                    },
                    function (r) {
                        n.empty();
                        var o = r.items;
                        if (o.length == 0) {
                            n.empty().popMenu("close")
                        } else {
                            for (var p = 0; p < o.length; p++) {
                                var q = o[p];
                                var s = "<li index='" + p + "' class='suggest_item' val='" + q[g.valueField] + "'>";
                                s += g.format(q);
                                s += "</li>";
                                n.append(s)
                            }
                            n.popMenu({
                                target: j,
                                zindex: 4
                            });
                            n.find(".suggest_item").bind("mousedown",
                            function (t) {
                                t.preventDefault();
                                j.val(c(this).attr("val"));
                                if (g.onEnter) {
                                    g.onEnter(j)
                                }
                                n.empty().popMenu("close")
                            })
                        }
                    })
                }
            }
            h = l
        }).unbind("blur.suggest").bind("blur.suggest",
        function (l) {
            var m = j.data("suggest");
            m.empty().popMenu("close")
        })
    };
    c.fn.switchbutton = function (f) {
        var l = {
            val: true,
            width: 82,
            height: 30,
            innerHeight: 22,
            innerWidth: 22,
            innerBackground: "#fff",
            enable: true,
            title: ""
        };
        var g = c.extend(l, f);
        var k = c(this),
        e = k.find(".switch"),
        i = k.find(".switch-left"),
        h = k.find(".switch-right");
        k.css({
            width: g.width,
            height: g.height,
            "line-height": g.height - 10 + "px"
        });
        e.css({
            width: g.innerWidth,
            height: g.innerHeight,
            background: g.innerBackground
        });
        k.on("click",
        function () {
            if (!g.enable) {
                return
            }
            if (g.val) {
                g.val = false
            } else {
                g.val = true
            }
            j()
        });
        j();
        function j() {
            if (!g.val) {
                k.attr("title", g.true_tip);
                k.removeClass("green").addClass("gray");
                e.addClass("left").removeClass("right");
                i.hide();
                h.show();
                e.html("<span class='lock-icon'></span>")
            } else {
                k.attr("title", g.false_tip);
                k.removeClass("gray").addClass("green");
                e.addClass("right").removeClass("left");
                i.show();
                h.hide();
                e.html("<span class='unlock-icon'></span>")
            }
            k.attr("val", g.val)
        }
    };
    c.fn.pagination = function (o, k, n, j) {
        if (k <= 0) {
            return
        }
        var p = 5;
        if (j) {
            p = j
        }
        var l = c(this).addClass("pagination");
        var e = 1;
        var g = k;
        if (k > p) {
            var m = Math.floor(p / 2);
            var e = (o - m) > 0 ? (o - m) : 1;
            if (k - e < p) {
                e = k - p + 1
            }
            var g = e + p - 1
        }
        var f = "";
        if (o > 1) {
            f += "<a p='" + (o - 1) + "'>«</a>"
        } else {
            f += "<a class='disabled'>«</a>"
        }
        if (e >= 2) {
            f += "<a p='1'>1</a>"
        }
        if (e >= 3) {
            f += "<a class='disabled ellipsis'>...</a>"
        }
        for (var h = e; h <= g; h++) {
            if (h > k) {
                break
            }
            if (h == o) {
                f += '<a class="disabled">' + h + "</a>"
            } else {
                f += "<a p='" + h + "'>" + h + "</a>"
            }
        }
        if (g <= k - 2) {
            f += "<a class='disabled ellipsis'>...</a><a p='" + k + "'>" + k + "</a>"
        } else {
            if (g <= k - 1) {
                f += "<a p='" + k + "'>" + k + "</a>"
            }
        }
        if (o < k) {
            f += "<a p='" + (o + 1) + "'>»</a>"
        } else {
            f += "<a class='disabled'>»</a>"
        }
        l.html(f);
        if (n) {
            l.find("a[p]").bind("click",
            function () {
                var i = c(this).attr("p");
                n(i)
            })
        }
    };
    c.fn.fileSize = function () {
        var i = this.get(0);
        var e = 0;
        if (c.browser.msie && !i.files) {
            var g = i.value;
            var h = new ActiveXObject("Scripting.FileSystemObject");
            var f = h.GetFile(g);
            e = f.Size
        } else {
            e = i.files[0].size
        }
        return e * 1024
    };
    c.fn.errorTip = function (g, f) {
        var i;
        var h = "error";
        if (c(".signin-error").length) {
            c(".signin-error").remove()
        }
        if (f != null) {
            h = f
        }
        var e = '<span class="signin-error"><span class="signin-' + h + '-tip">' + g + '<label class="signin-' + h + '-tip-arrow right"></label><label class="signin-' + h + '-tip-arrow right1"></label></span></span>';
        if (c(this).offset().left < 200) {
            e = '<span class="signin-error"><span class="signin-' + h + '-tip">' + g + '<label class="signin-' + h + '-tip-arrow left"></label><label class="signin-' + h + '-tip-arrow left1"></label></span></span>'
        }
        c("body").append(e);
        i = c(".signin-error");
        i.css({
            left: c(this).offset().left - i.width(),
            top: c(this).offset().top + c(this).height() / 2 - 7,
            opacity: "0",
            filter: "alpha(opacity=0)"
        });
        c(this).addClass(h);
        if (c(this).offset().left < 200) {
            i.animate({
                left: c(this).offset().left + i.width(),
                top: c(this).offset().top + c(this).height() / 2 - 7,
                opacity: "0.7",
                filter: "alpha(opacity=70)"
            },
            200)
        } else {
            i.animate({
                left: c(this).offset().left - i.width() - 14,
                top: c(this).offset().top + c(this).height() / 2 - 7,
                opacity: "0.7",
                filter: "alpha(opacity=70)"
            },
            200)
        }
    };
    c.closeErrorTip = function () {
        c(".signin-error").remove();
        c("input.error").removeClass("error")
    };
    var b = {};
    var a = null;
    c.fn.streamInput = function (u) {
        if (!this[0] || !u.face || this[0].nodeName != "DIV" || this.attr("stream_id")) {
            return
        }
        var h = {
            target: this
        };
        var f = c.extend(h, u);
        var r = {
            id: "",
            range: null
        };
        var s = Object.keys(b);
        r.id = s.length ? b[s[s.length - 1]].id + 1 : 1;
        r.stream_id = "stream_" + (s.length ? b[s[s.length - 1]].id + 1 : 1);
        this.attr({
            contentEditable: "true",
            spellcheck: "false",
            accesskey: "q",
            stream_id: r.stream_id
        });
        c(f.face).attr("for_stream", r.stream_id);
        b[r.stream_id] = r,
        a = r;
        var o = false,
        i = false,
        k = 0,
        l = 0,
        m = 0,
        p = !!f.home;
        c(f.target).off("click.stream keyup.stream").on("click.stream keyup.stream",
        function (w) {
            a = b[c(this).attr("stream_id")];
            a.target = c(this);
            var v = window.getSelection();
            a.range = v.getRangeAt(0).cloneRange()
        });
        c(f.target).off("DOMSubtreeModified.stream").on("DOMSubtreeModified.stream",
        function (D) {
            if (!o) {
                return
            }
            o = false;
            if (c(this).children().length < 1) {
                return
            }
            q(c(this));
            t(c(this));
            if (i) {
                q(c(this).find(".paste-cont"));
                var E = c(this).html();
                c(this).empty();
                var x = window.getSelection();
                var B = x.getRangeAt(0);
                B.deleteContents();
                var w = c("<div>" + E + "</div>");
                var A = w.html(),
                y = document.createElement("div"),
                F = document.createDocumentFragment(),
                z,
                v;
                if (A) {
                    y.innerHTML = A;
                    while ((z = y.firstChild)) {
                        v = F.appendChild(z);
                        if (z.nodeName == "SPAN") {
                            k = F.childNodes.length + z.childNodes.length - 1
                        }
                    }
                }
                B.insertNode(F);
                if (v) {
                    B = B.cloneRange();
                    B.collapse(true);
                    g(c(this), false);
                    B.setStart(this, k || this.childNodes.length - l);
                    B.setEnd(this, k || this.childNodes.length - l);
                    if (l && m) {
                        var C = this.childNodes.length - l;
                        z = this.childNodes[C];
                        B.setStart(z, z.data.length - m);
                        B.setEnd(z, z.data.length - m)
                    }
                    x.removeAllRanges();
                    x.addRange(B)
                }
            } else {
                e(this)
            }
        });
        c(f.target).off("paste.stream").on("paste.stream",
        function (A) {
            A = A.originalEvent;
            var x = A.clipboardData || A.view.clipboardData;
            var w = window.getSelection();
            var z = w.getRangeAt(0);
            z.deleteContents();
            try {
                var B = x.getData("text/html") || x.getData("text/plain").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                B = B.replace(/<(\/)?(html|body)(\s|\S)+?>/g, "").replace(/(<!--.+?-->)|(\r\n)/g, "");
                var v = c("<div>" + B + "</div>");
                q(v);
                t(v);
                n(v, w, z, this);
                return false
            } catch (y) {
                o = true;
                if (c.trim(c(this).html().replace(/\s+|<br>/g, "")) == "") {
                    i = false;
                    return
                }
                i = true;
                var C = document.createElement("span");
                C.className = "paste-cont";
                z.insertNode(C);
                z = z.cloneRange();
                z.selectNodeContents(C);
                w.removeAllRanges();
                w.addRange(z);
                var D = j(this);
                l = D.v,
                m = D.len
            }
        });
        c(f.face).off("click.stream").on("click.stream",
        function () {
            a = b[c(this).attr("for_stream")];
            var v = a.target = c("div[stream_id='" + c(this).attr("for_stream") + "']");
            v.focus();
            if (a.range) {
                var x = window.getSelection();
                x.removeAllRanges();
                x.addRange(a.range)
            }
            var w = c("#faces_dialog");
            if (w.length < 1) {
                w = c("<div></div>").attr({
                    id: "faces_dialog",
                    "class": "faces-lib"
                }).append("<ul><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>").appendTo(c("body"))
            }
            c("#faces_dialog").popMenu({
                target: this,
                fixed: p,
                offsetY: 10,
                zindex: 999
            })
        });
        c("#faces_dialog ul li").off("click.stream").on("click.stream",
        function (z) {
            c("#faces_dialog").popMenu("close");
            var w = c(a.target),
            x = c(this).index() + 1,
            A;
            A = "<img class='ico-face' src='/images/default/faces/" + x + ".gif'>";
            if (c.trim(w.html().replace(/&nbsp;|<br>/g, "")) == "") {
                w.html(A);
                e(w[0]);
                return
            }
            w.focus();
            var y = window.getSelection();
            var v = a.range;
            v.deleteContents();
            var B = c("<div>" + A + "</div>");
            n(B, y, v, w)
        });
        function q(y) {
            try {
                var v = y.html().replace(/^\s+/g, " ").replace(/(\S)\s+(\S)?/g, "$1 $2");
                y.html(v);
                var w = y.children(":not(.ico-face, .paste-cont)");
                if (w.length < 1) {
                    return
                }
                w.each(function (z, A) {
                    var B = c(A).css("display");
                    if (c(A).is("img, title, head, link, style, script")) {
                        c(A).remove()
                    } else {
                        c(A).replaceWith(c(A).html())
                    }
                })
            } catch (x) { }
            w = y.children(":not(.ico-face, .paste-cont)");
            if (w.length > 0) {
                q(y)
            }
        }
        function t(w) {
            var v = w.find(".ico-face");
            v.each(function (x, y) {
                c(y).replaceWith(c("<img class='" + c(y).attr("class") + "' src='" + c(y).attr("src") + "'>"))
            })
        }
        function g(w) {
            var v = w.children(".paste-cont");
            if (v.length < 1) {
                return
            }
            v.each(function (x, y) {
                c(y).replaceWith(c(y).html())
            })
        }
        function e(x) {
            c(x).focus();
            try {
                var v = document.createRange();
                v.selectNode(x.lastChild || x);
                v.collapse(false);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(v);
                c(x).keyup()
            } catch (w) { }
        }
        function j(C) {
            var B = C.cloneNode(true),
            w = B.childNodes.length,
            y = 0,
            x = 0;
            if (w > 3 && c(B).children(".paste-cont").length > 0) {
                for (var z = 0; z < w; z++) {
                    var A = B.childNodes[z];
                    if (A.nodeName == "SPAN") {
                        y = w - z - 1;
                        if (z < w - 1 && B.childNodes[z + 1].nodeName == "#text") {
                            x = B.childNodes[z + 1].data.length
                        }
                        break
                    }
                }
            }
            return {
                v: y,
                len: x
            }
        }
        function n(w, x, B, D) {
            var A = w.html(),
            y = document.createElement("div"),
            C = document.createDocumentFragment(),
            z,
            v;
            if (A) {
                y.innerHTML = A;
                while ((z = y.firstChild)) {
                    v = C.appendChild(z)
                }
            }
            B.insertNode(C);
            if (v) {
                B = B.cloneRange();
                B.setStartAfter(v);
                B.collapse(true);
                x.removeAllRanges();
                x.addRange(B);
                c(D).keyup()
            }
            return B
        }
    }
})(jQuery);
String.prototype.isEmpty = function () {
    if (this.replace(/(^\s*)|(\s*$)/g, "").length <= 0) {
        return true
    } else {
        return false
    }
};
String.prototype.notEmpty = function () {
    return !this.isEmpty()
};
String.prototype.isEmail = function () {
    if (this.isEmpty() || (!/^([\w]+)(.[\w]+)*@([\w-]+\.){1,5}([A-Za-z]){2,4}$/.test(this))) {
        return false
    } else {
        return true
    }
};
String.prototype.isPhoneNumber = function () {
    if (this.isEmpty() || (!/^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/.test(this))) {
        return false
    } else {
        return true
    }
};
String.prototype.minLength = function (a) {
    if (this.length >= a) {
        return true
    } else {
        return false
    }
};
String.prototype.maxLength = function (a) {
    if (this.length <= a) {
        return true
    } else {
        return false
    }
};
String.prototype.cut = function (a, d) {
    var c = "";
    if (this == "") {
        return c
    }
    if (typeof d == "undefined") {
        d = "..."
    }
    var e = 0;
    for (var b = 0; b < this.length; b++) {
        if (this.charCodeAt(b) > 127 || this.charCodeAt(b) == 94) {
            e += 2
        } else {
            e++
        }
    }
    if (e <= a) {
        return this.toString()
    }
    e = 0;
    a = (a > d.length) ? a - d.length : a;
    for (var b = 0; b < this.length; b++) {
        if (this.charCodeAt(b) > 127 || this.charCodeAt(b) == 94) {
            e += 2
        } else {
            e++
        }
        if (e > a) {
            c += d;
            break
        }
        c += this.charAt(b)
    }
    return c
};
String.prototype.byteLength = function () {
    var b = 0;
    for (var a = 0; a < this.length; a++) {
        if (this.charCodeAt(a) > 127 || this.charCodeAt(a) == 94) {
            b += 2
        } else {
            b++
        }
    }
    return b
};
function initTemplateCategorySelect() {
    $("#template-category-select li").unbind().bind("click",
    function () {
        $(".template-category li").removeClass("current");
        $(this).addClass("current");
        var a = $(this).attr("category");
        //getTemplates(a)
    });
    $(".item-container").die().live("click",
    function () {
        $(".template_selected").removeClass("template_selected");
        $(this).addClass("template_selected");
        $("#template_select_ok").enable()
    }).live("dblclick",
    function () {
        templateSelected()
    })
}
function getTemplates(a) {
    Util.get("/diagraming/gettemplates", {
        category: a
    },
    function (e) {
        if (a == "my_template") {
            $(".item-container").remove()
        } else {
            $(".item-container[chartId!='']").remove();
            if ($(".item-container[chartId='']").length == 0) {
                $("#template-container").append('<div class="item-container template_selected radius3" chartId=""><div></div>空模板</div>')
            }
        }
        for (var c = 0; c < e.templates.length; c++) {
            var b = e.templates[c];
            $("#template-container").append('<div define="' + b.chartId + '" class="item-container radius3"><div><img src="/chart_image/thumb/' + b.thumbnail + '.png"/></div>' + b.title + "</div>")
        }
        var d = $(".template_selected");
        if (d.length <= 0) {
            $("#template_select_ok").disable()
        }
    })
}
var globalNewTeamId;
var globalNewFolderId;
function globalNewDialog(c, a, b) {
    globalNewTeamId = c;
    globalNewFolderId = a;
    if ($("#dialog_new_diagram").length == 0) {
        Util.ajax({
            url: "/diagraming/new_dialog",
            data: {},
            success: function (d) {
                $("body").append(d);
                $("#dialog_new_diagram").dialog();
                initTemplateCategorySelect();
                $("#template_select_ok").bind("click",
                function () {
                    templateSelected(b)
                });
                $("#template_select_cancel").bind("click",
                function () {
                    $("#dialog_new_diagram").dialog("close")
                });
                getTemplates("uncategorized")
            }
        })
    } else {
        $("#dialog_new_diagram").dialog()
    }
}
function globalNewDiagrams(d, a, c) {
    var b = "/diagrams/new";
    if (d != null) {
        b += "?team=" + d
    }
    if (d == null && a != null) {
        b += "?folder=" + a
    } else {
        if (d != null && a != null) {
            b += "&folder=" + a
        }
    }
    window.open(b)
}
function templateSelected(g) {
    var e = $(".template_selected");
    if (e.length <= 0) {
        return
    }
    var d = $("#template-category-select li.current");
    var f = d.attr("category");
    var c = e.attr("define");
    if (!c) {
        c = ""
    }
    var b = $("#privateornot").attr("val");
    $("#dialog_new_diagram").dialog("close");
    var a = "/diagraming/new?template=" + c + "&category=" + f;
    if (f == "my_template") {
        a = "/diagrams/new_from_template?chartId=" + c
    }
    if (g == "template") {
        a = "/diagraming/new?template=" + c + "&category=" + f + "&istemplate=true"
    }
    if (globalNewTeamId) {
        a += "&team=" + globalNewTeamId
    }
    if (globalNewFolderId) {
        a += "&folder=" + globalNewFolderId
    }
    if (b == "true") {
        a += "&status=public"
    } else {
        a += "&status=private"
    }
    window.location.href = a
};