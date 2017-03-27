﻿var UI = {
    init: function () {
        $(".diagram_title").bind("click", function () {
            if ($(this).hasClass("readonly")) {
                return
            }
            var h = $.trim($(this).text());
            $(this).hide();
            $("#title_container").append("<input type='text'/>");
            $("#title_container").children("input").val(h).select();
            $("#title_container").children("input").bind("blur", function () {
                var i = $.trim($(this).val());
                UI.changeTitle(i)
            }).bind("keydown", function (i) {
                if ($.trim($(this).val()).length > 60) {
                    $(this).val($.trim($(this).val()).substring(0, 60))
                }
                if (i.keyCode == 13) {
                    var j = $.trim($(this).val());
                    UI.changeTitle(j)
                }
            })
        });
        $("#bar_theme").button({
            onMousedown: function () {
                UI.showThemeSelect()
            }
        });
        $("#bar_undo").button({
            onClick: function () {
                MessageSource.undo()
            }
        });
        $("#bar_redo").button({
            onClick: function () {
                MessageSource.redo()
            }
        });
        $("#bar_brush").button({
            onClick: function () {
                if ($("#bar_brush").button("isSelected")) {
                    $("#bar_brush").button("unselect");
                    $("#designer_op_help").hide();
                    $(document).unbind("keydown.cancelbrush");
                    Utils.selectCallback = null
                } else {
                    Designer.clipboard.brush()
                }
            }
        });
        $("#bar_font_family").button({
            onMousedown: function () {
                $("#font_list").dropdown({
                    target: $("#bar_font_family"),
                    onSelect: function (j) {
                        var i = j.text();
                        Designer.setFontStyle({
                            fontFamily: i
                        });
                        $("#bar_font_family").button("setText", i)
                    }
                });
                var h = $("#bar_font_family").text().trim();
                $("#font_list").children().each(function () {
                    if ($(this).text() == h) {
                        $("#font_list").dropdown("select", $(this));
                        return false
                    }
                })
            }
        });
        $("#bar_font_size").spinner({
            min: 12,
            max: 100,
            step: 1,
            unit: "px",
            onChange: function (h) {
                Designer.setFontStyle({
                    size: h
                })
            }
        });
        $("#bar_font_size").spinner("setValue", "13px");
        $("#bar_font_bold").button({
            onClick: function () {
                var h = !$("#bar_font_bold").button("isSelected");
                Designer.setFontStyle({
                    bold: h
                });
                $("#bar_font_bold").toggleClass("selected")
            }
        });
        $("#bar_font_italic").button({
            onClick: function () {
                var h = !$("#bar_font_italic").button("isSelected");
                Designer.setFontStyle({
                    italic: h
                });
                $("#bar_font_italic").toggleClass("selected")
            }
        });
        $("#bar_font_underline").button({
            onClick: function () {
                var h = !$("#bar_font_underline").button("isSelected");
                Designer.setFontStyle({
                    underline: h
                });
                $("#bar_font_underline").toggleClass("selected")
            }
        });
        $("#bar_font_color").button({
            onMousedown: function () {
                var h = $("#bar_font_color").button("getColor");
                $.colorpicker({
                    target: $("#bar_font_color"),
                    onSelect: function (i) {
                        Designer.setFontStyle({
                            color: i
                        });
                        $("#bar_font_color").button("setColor", i)
                    },
                    color: h,
                    trans: false
                })
            }
        });
        $("#bar_font_align").button({
            onMousedown: function () {
                $("#font_align_list").dropdown({
                    target: $("#bar_font_align"),
                    onSelect: function (h) {
                        var i = {};
                        i[h.attr("cate")] = h.attr("al");
                        Designer.setFontStyle(i)
                    }
                })
            }
        });
        $("#bar_fill").button({
            onMousedown: function () {
                var h = $("#bar_fill").button("getColor");
                $.colorpicker({
                    target: $("#bar_fill"),
                    onSelect: function (i) {
                        Designer.setFillStyle({
                            type: "solid",
                            color: i
                        });
                        $("#bar_fill").button("setColor", i)
                    },
                    color: h,
                    extend: "<div id='bar_fill_gradient' title='渐变' class='toolbar_button active'><div class='ico gradient'></div></div><div id='bar_fill_img' title='图片...' class='toolbar_button active'><div class='ico ico_img'></div></div><div id='bar_fill_more' class='toolbar_button active'>更多...</div>"
                });
                $("#bar_fill_gradient").unbind().bind("click", function () {
                    Designer.setFillStyle({
                        type: "gradient"
                    });
                    $("#color_picker").dropdown("close")
                });
                $("#bar_fill_img").unbind().bind("click", function () {
                    UI.showImageSelect(function (j, i, k) {
                        Designer.setFillStyle({
                            type: "image",
                            fileId: j,
                            imageW: i,
                            imageH: k
                        })
                    });
                    $("#color_picker").dropdown("close")
                });
                $("#bar_fill_more").unbind().bind("click", function () {
                    Dock.showView("graphic", true);
                    $("#color_picker").dropdown("close")
                })
            }
        });
        $("#bar_line_color").button({
            onMousedown: function () {
                var h = $("#bar_line_color").button("getColor");
                $.colorpicker({
                    target: $("#bar_line_color"),
                    onSelect: function (i) {
                        Designer.setLineStyle({
                            lineColor: i
                        });
                        $("#bar_line_color").button("setColor", i)
                    },
                    color: h,
                    trans: false
                })
            }
        });
        $("#bar_line_width").button({
            onMousedown: function () {
                $("#line_width_list").dropdown({
                    target: $("#bar_line_width"),
                    onSelect: function (l) {
                        var k = parseInt(l.text());
                        Designer.setLineStyle({
                            lineWidth: k
                        })
                    }
                });
                var i = Utils.getSelected()[0];
                var h;
                if (i.name == "linker") {
                    h = Utils.getLinkerLineStyle(i.lineStyle)
                } else {
                    h = Utils.getShapeLineStyle(i.lineStyle)
                }
                var j = h.lineWidth;
                $("#line_width_list").children().each(function () {
                    if (parseInt($(this).text()) == j) {
                        $("#line_width_list").dropdown("select", $(this))
                    }
                })
            }
        });
        $("#bar_line_style").button({
            onMousedown: function () {
                $("#line_style_list").dropdown({
                    target: $("#bar_line_style"),
                    onSelect: function (m) {
                        var l = m.attr("line");
                        Designer.setLineStyle({
                            lineStyle: l
                        })
                    }
                });
                var i = Utils.getSelected()[0];
                var h;
                if (i.name == "linker") {
                    h = Utils.getLinkerLineStyle(i.lineStyle)
                } else {
                    h = Utils.getShapeLineStyle(i.lineStyle)
                }
                var j = h.lineStyle;
                var k = $("#line_style_list").children("li[line=" + j + "]");
                $("#line_style_list").dropdown("select", k)
            }
        });
        $("#bar_linkertype").button({
            onMousedown: function () {
                $("#line_type_list").dropdown({
                    target: $("#bar_linkertype"),
                    onSelect: function (j) {
                        var i = j.attr("tp");
                        Designer.setLinkerType(i);
                        var h = j.children("div").attr("class");
                        $("#bar_linkertype").children("div:eq(0)").attr("class", h)
                    }
                })
            }
        });
        $("#bar_beginarrow").button({
            onMousedown: function () {
                $("#beginarrow_list").dropdown({
                    target: $("#bar_beginarrow"),
                    onSelect: function (m) {
                        var n = m.attr("arrow");
                        Designer.setLineStyle({
                            beginArrowStyle: n
                        });
                        var l = m.children(".ico_arrow").attr("class");
                        $("#bar_beginarrow").children("div:eq(0)").attr("class", l)
                    }
                });
                var i = Utils.getSelected()[0];
                var h;
                if (i.name == "linker") {
                    h = Utils.getLinkerLineStyle(i.lineStyle)
                } else {
                    h = Utils.getShapeLineStyle(i.lineStyle)
                }
                var j = h.beginArrowStyle;
                var k = $("#beginarrow_list").children("li[arrow=" + j + "]");
                $("#beginarrow_list").dropdown("select", k)
            }
        });
        $("#bar_endarrow").button({
            onMousedown: function () {
                $("#endarrow_list").dropdown({
                    target: $("#bar_endarrow"),
                    onSelect: function (m) {
                        var n = m.attr("arrow");
                        Designer.setLineStyle({
                            endArrowStyle: n
                        });
                        var l = m.children(".ico_arrow").attr("class");
                        $("#bar_endarrow").children("div:eq(0)").attr("class", l)
                    }
                });
                var i = Utils.getSelected()[0];
                var h;
                if (i.name == "linker") {
                    h = Utils.getLinkerLineStyle(i.lineStyle)
                } else {
                    h = Utils.getShapeLineStyle(i.lineStyle)
                }
                var j = h.endArrowStyle;
                var k = $("#endarrow_list").children("li[arrow=" + j + "]");
                $("#endarrow_list").dropdown("select", k)
            }
        });
        $("#bar_front").button({
            onClick: function () {
                Designer.layerShapes("front")
            }
        });
        $("#bar_back").button({
            onClick: function () {
                Designer.layerShapes("back")
            }
        });
        $("#bar_lock").button({
            onClick: function () {
                Designer.lockShapes()
            }
        });
        $("#bar_unlock").button({
            onClick: function () {
                Designer.unlockShapes()
            }
        });
        $("#bar_link").button({
            onClick: function () {
                UI.showInsertLink()
            }
        });
        $("#size_set").button({
            onClick: function () {
                UI.showSetSize();
            }
        });
        $("#bar_collapse").button({
            onClick: function () {
                var h = UI.toogleTitleBar();
                CLB.setConfig("showToolbar", h)
            }
        });
        $("#menu_bar").children().bind("mousedown", function (i) {
            var h = $(this);
            b(h);
            i.stopPropagation()
        });
        $("#menu_bar").children().bind("mouseenter", function () {
            var h = $(this);
            if ($("#ui_container").find(".options_menu:visible").length > 0) {
                b(h)
            }
        });
        function b(i) {
            var l = i.attr("menu");
            if (i.hasClass("readonly")) {
                return
            }
            $("#" + l).dropdown({
                target: i,
                onSelect: function (m) {
                    g(m)
                }
            });
            if (l == "bar_list_page") {
                var j = $("#bar_list_pagesize").children("li[w=" + Model.define.page.width + "][h=" + Model.define.page.height + "]");
                if (j.length > 0) {
                    $("#bar_list_pagesize").dropdown("select", j)
                } else {
                    $("#bar_list_pagesize").dropdown("select", $("#page_size_custom"))
                }
                $("#page_size_w").spinner("setValue", Model.define.page.width + "px");
                $("#page_size_h").spinner("setValue", Model.define.page.height + "px");
                j = $("#bar_list_padding").children("li[p=" + Model.define.page.padding + "]");
                $("#bar_list_padding").dropdown("select", j);
                j = $("#bar_list_gridsize").children("li[s=" + Model.define.page.gridSize + "]");
                $("#bar_list_gridsize").dropdown("select", j);
                if (Model.define.page.showGrid) {
                    $("#bar_list_page").dropdown("select", $("#bar_list_page").children("li[ac=set_page_showgrid]"))
                } else {
                    $("#bar_list_page").dropdown("unselect", $("#bar_list_page").children("li[ac=set_page_showgrid]"))
                }
                var h = "portrait";
                if (Model.define.page.orientation) {
                    h = Model.define.page.orientation
                }
                var k = $("#bar_list_orientation").children("li[ori=" + h + "]");
                $("#bar_list_orientation").children().menuitem("unselect");
                k.menuitem("select")
            } else {
                if (l == "bar_list_view") {
                    var j = $("#bar_list_view").children(".static[zoom='" + Designer.config.scale + "']");
                    if (j.length) {
                        $("#bar_list_page").dropdown("select", j)
                    }
                }
            }
        }
        function g(t) {
            var k = t.attr("ac");
            if (k == "rename") {
                $(".diagram_title").trigger("click")
            } else {
                if (k == "close") {
                    window.location.href = "/diagraming/back?id=" + chartId
                } else {
                    if (k == "saveAs") {
                        UI.showSaveAs()
                    } else {
                        if (k == "export") {
                            $("#export_dialog").dlg();
                            $("#export_png").click()
                        } else {
                            if (k == "undo") {
                                MessageSource.undo()
                            } else {
                                if (k == "redo") {
                                    MessageSource.redo()
                                } else {
                                    if (k == "cut") {
                                        Designer.clipboard.cut()
                                    } else {
                                        if (k == "copy") {
                                            Designer.clipboard.copy()
                                        } else {
                                            if (k == "paste") {
                                                Designer.clipboard.paste()
                                            } else {
                                                if (k == "duplicate") {
                                                    Designer.clipboard.duplicate()
                                                } else {
                                                    if (k == "brush") {
                                                        Designer.clipboard.brush()
                                                    } else {
                                                        if (k == "selectall") {
                                                            Designer.selectAll()
                                                        } else {
                                                            if (k == "delete") {
                                                                Designer.op.removeShape()
                                                            } else {
                                                                if (k == "zoom") {
                                                                    var u = t.attr("zoom");
                                                                    if (u == "in") {
                                                                        Designer.zoomIn()
                                                                    } else {
                                                                        if (u == "out") {
                                                                            Designer.zoomOut()
                                                                        } else {
                                                                            var m = parseFloat(u);
                                                                            Designer.setZoomScale(m)
                                                                        }
                                                                    }
                                                                } else {
                                                                    if (k == "insert") {
                                                                        var q = t.attr("in");
                                                                        if (q == "text") {
                                                                            Designer.op.changeState("creating_free_text")
                                                                        } else {
                                                                            if (q == "image") {
                                                                                UI.showImageSelect(function (s, p, x) {
                                                                                    UI.insertImage(s, p, x)
                                                                                })
                                                                            } else {
                                                                                if (q == "line") {
                                                                                    Designer.op.changeState("creating_free_linker")
                                                                                }
                                                                            }
                                                                        }
                                                                    } else {
                                                                        if (k == "set_page_size") {
                                                                            var r = parseInt(t.attr("w"));
                                                                            var l = parseInt(t.attr("h"));
                                                                            Designer.setPageStyle({
                                                                                width: r,
                                                                                height: l
                                                                            })
                                                                        } else {
                                                                            if (k == "set_page_padding") {
                                                                                var j = parseInt(t.attr("p"));
                                                                                Designer.setPageStyle({
                                                                                    padding: j
                                                                                })
                                                                            } else {
                                                                                if (k == "set_page_orientation") {
                                                                                    var i = t.attr("ori");
                                                                                    Designer.setPageStyle({
                                                                                        orientation: i
                                                                                    })
                                                                                } else {
                                                                                    if (k == "set_page_showgrid") {
                                                                                        if (t.menuitem("isSelected")) {
                                                                                            t.menuitem("unselect");
                                                                                            Designer.setPageStyle({
                                                                                                showGrid: false
                                                                                            })
                                                                                        } else {
                                                                                            t.menuitem("select");
                                                                                            Designer.setPageStyle({
                                                                                                showGrid: true
                                                                                            })
                                                                                        }
                                                                                    } else {
                                                                                        if (k == "set_page_gridsize") {
                                                                                            var v = parseInt(t.attr("s"));
                                                                                            Designer.setPageStyle({
                                                                                                gridSize: v
                                                                                            })
                                                                                        } else {
                                                                                            if (k == "front") {
                                                                                                Designer.layerShapes("front")
                                                                                            } else {
                                                                                                if (k == "back") {
                                                                                                    Designer.layerShapes("back")
                                                                                                } else {
                                                                                                    if (k == "forward") {
                                                                                                        Designer.layerShapes("forward")
                                                                                                    } else {
                                                                                                        if (k == "backward") {
                                                                                                            Designer.layerShapes("backward")
                                                                                                        } else {
                                                                                                            if (k == "align_shape") {
                                                                                                                var n = t.attr("al");
                                                                                                                Designer.alignShapes(n)
                                                                                                            } else {
                                                                                                                if (k == "distribute_shape") {
                                                                                                                    var o = t.attr("dis");
                                                                                                                    Designer.distributeShapes(o)
                                                                                                                } else {
                                                                                                                    if (k == "match_size") {
                                                                                                                        if (t.attr("custom")) {
                                                                                                                            Dock.showView("metric", true)
                                                                                                                        } else {
                                                                                                                            var o = {};
                                                                                                                            var r = t.attr("w");
                                                                                                                            var l = t.attr("h");
                                                                                                                            if (r) {
                                                                                                                                o.w = r
                                                                                                                            }
                                                                                                                            if (l) {
                                                                                                                                o.h = l
                                                                                                                            }
                                                                                                                            Designer.matchSize(o)
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        if (k == "lock") {
                                                                                                                            Designer.lockShapes()
                                                                                                                        } else {
                                                                                                                            if (k == "unlock") {
                                                                                                                                Designer.unlockShapes()
                                                                                                                            } else {
                                                                                                                                if (k == "group") {
                                                                                                                                    Designer.group()
                                                                                                                                } else {
                                                                                                                                    if (k == "ungroup") {
                                                                                                                                        Designer.ungroup()
                                                                                                                                    } else {
                                                                                                                                        if (k == "hotkey") {
                                                                                                                                            UI.showHotKey()
                                                                                                                                        } else {
                                                                                                                                            if (k == "feedback") {
                                                                                                                                                UI.showFeedBack()
                                                                                                                                            } else {
                                                                                                                                                if (k == "getting_started") {
                                                                                                                                                    UI.gettingStart()
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $("#page_size_w").spinner({
            min: 200,
            unit: "px",
            step: 100,
            onChange: function (h) {
                Designer.setPageStyle({
                    width: h
                })
            }
        });
        $("#page_size_h").spinner({
            min: 200,
            unit: "px",
            step: 100,
            onChange: function (h) {
                Designer.setPageStyle({
                    height: h
                })
            }
        });
        var a = $("#color_picker").html();
        var c = $("<div class='menu color_picker extend_menu'>" + a + "</div>").appendTo($("#bar_page_color"));
        c.css("right", "-179px");
        c.children(".color_items").children("div").unbind().bind("click", function () {
            var h = $(this).css("background-color");
            h = h.replace(/\s/g, "");
            h = h.substring(4, h.length - 1);
            Designer.setPageStyle({
                backgroundColor: h
            });
            $("#bar_list_page").dropdown("close")
        });
        c.children(".color_items").children("div").off("mouseenter").on("mouseenter", function () {
            var h = $(this).css("background-color");
            h = h.replace(/\s/g, "");
            h = UI.RGB2Hex(h);
            c.children(".color_hex").find("input").val(h)
        });
        c.children(".color_hex").find("input").off("keyup").on("keyup", function () {
            var i = $(this).val();
            if (i.length == 3 || i.length == 6) {
                var h = UI.hex2RGB("#" + i);
                Designer.setPageStyle({
                    backgroundColor: h
                })
            }
        });
        c.children(".color_transparent").bind("click", function () {
            Designer.setPageStyle({
                backgroundColor: "transparent"
            });
            $("#bar_list_page").dropdown("close")
        });
        var e = Model.define.page;
        if (e.backgroundColor != "transparent") {
            var f = e.backgroundColor;
            var d = UI.RGB2Hex("rgb(" + f + ")");
            c.children(".color_hex").find("input").val(d)
        }
        Designer.events.push("selectChanged", 0);
        Designer.events.push("clipboardChanged", 0);
        Designer.events.push("undoStackChanged", 0);
        Designer.events.push("redoStackChanged", 0)
    },
    changeTitle: function (d) {
        var b = $(".diagram_title").text();
        if (d && d != b && chartId != "") {
            var a = {
                action: "changeTitle",
                title: d
            };
            CLB.send(a)
        }
        var c = d != "" ? d : b;
        $("title").text(c + " - ProcessOn");
        $(".diagram_title").text(c).show();
        $("#title_container").children("input").remove()
    },
    update: function () {
        var h = Utils.getSelectedIds();
        var f = h.length;
        var n = Utils.getSelectedLinkerIds();
        var a = n.length;
        var e = Utils.getSelectedShapeIds();
        var m = e.length;
        var l = Utils.getSelectedLockedIds().length;
        var k = Utils.getSelectedGroups().length;
        var d = $("#bar_list_arrange");
        if (f == 0) {
            $(".toolbar").find(".selected").removeClass("selected");
            if ($("#designer_op_help").is(":visible")) {
                $("#bar_brush").button("enable");
                $("#bar_brush").button("select")
            } else {
                $("#bar_brush").button("disable")
            }
            $("#bar_font_family").button("disable");
            $("#bar_font_size").button("disable");
            $("#bar_font_bold").button("disable");
            $("#bar_font_italic").button("disable");
            $("#bar_font_underline").button("disable");
            $("#bar_font_color").button("disable");
            $("#bar_font_align").button("disable");
            $("#bar_line_color").button("disable");
            $("#bar_line_width").button("disable");
            $("#bar_line_style").button("disable");
            $("#bar_front").button("disable");
            $("#bar_back").button("disable");
             

            var i = $("#bar_list_edit");
            i.children("li[ac=cut]").menuitem("disable");
            i.children("li[ac=copy]").menuitem("disable");
            i.children("li[ac=duplicate]").menuitem("disable");
            i.children("li[ac=brush]").menuitem("disable");
            i.children("li[ac=delete]").menuitem("disable");
            d.children("li[ac=front]").menuitem("disable");
            d.children("li[ac=back]").menuitem("disable");
            d.children("li[ac=forward]").menuitem("disable");
            d.children("li[ac=backward]").menuitem("disable");
            d.children("li[ac=lock]").menuitem("disable")
        } else {
            $("#bar_brush").button("enable");
            if ($("#designer_op_help").is(":visible")) {
                $("#bar_brush").button("select")
            }
            $("#bar_font_family").button("enable");
            $("#bar_font_size").button("enable");
            $("#bar_font_bold").button("enable");
            $("#bar_font_italic").button("enable");
            $("#bar_font_underline").button("enable");
            $("#bar_font_color").button("enable");
            $("#bar_font_align").button("enable");
            $("#bar_line_color").button("enable");
            $("#bar_line_width").button("enable");
            $("#bar_line_style").button("enable");
            $("#bar_front").button("enable");
            $("#bar_back").button("enable");
            $("#bar_lock").button("enable");
           
            var i = $("#bar_list_edit");
            i.children("li[ac=cut]").menuitem("enable");
            i.children("li[ac=copy]").menuitem("enable");
            i.children("li[ac=duplicate]").menuitem("enable");
            i.children("li[ac=brush]").menuitem("enable");
            i.children("li[ac=delete]").menuitem("enable");
            d.children("li[ac=front]").menuitem("enable");
            d.children("li[ac=back]").menuitem("enable");
            d.children("li[ac=forward]").menuitem("enable");
            d.children("li[ac=backward]").menuitem("enable");
            d.children("li[ac=lock]").menuitem("enable");
            var g = Model.getShapeById(h[0]);
            var b;
            var c;
            if (g.name == "linker") {
                b = Utils.getLinkerFontStyle(g.fontStyle);
                c = Utils.getLinkerLineStyle(g.lineStyle)
            } else {
                b = Utils.getShapeFontStyle(g.fontStyle);
                c = Utils.getShapeLineStyle(g.lineStyle)
            }
            $("#bar_font_family").button("setText", b.fontFamily);
            $("#bar_font_size").spinner("setValue", b.size + "px");
            if (b.bold) {
                $("#bar_font_bold").button("select")
            } else {
                $("#bar_font_bold").button("unselect")
            }
            if (b.italic) {
                $("#bar_font_italic").button("select")
            } else {
                $("#bar_font_italic").button("unselect")
            }
            if (b.underline) {
                $("#bar_font_underline").button("select")
            } else {
                $("#bar_font_underline").button("unselect")
            }
            $("#bar_font_color").button("setColor", b.color);
            $("#bar_line_color").button("setColor", c.lineColor)
        }
        if (m == 0) {
            $("#bar_fill").button("disable");
            $("#size_set").button("disable");
        } else {
            $("#bar_fill").button("enable");
           
            var g = Model.getShapeById(e[0]);
            var j = Utils.getShapeFillStyle(g.fillStyle);
            if (j.type == "solid") {
                $("#bar_fill").button("setColor", j.color)
            } else {
                if (j.type == "gradient") {
                    $("#bar_fill").button("setColor", j.endColor)
                }
            }
            if (g.name == "billboard" || g.name == "LightBox") {
                $("#size_set").button("enable");
            }
        }
        if (m != 1) {
            $("#bar_link").button("disable")
        } else {
            $("#bar_link").button("enable")
        }
        if (a == 0) {
            $("#bar_linkertype").button("disable");
            $("#bar_beginarrow").button("disable");
            $("#bar_endarrow").button("disable")
        } else {
            $("#bar_linkertype").button("enable");
            $("#bar_beginarrow").button("enable");
            $("#bar_endarrow").button("enable");
            var g = Model.getShapeById(n[0]);
            var c = Utils.getLinkerLineStyle(g.lineStyle);
            $("#bar_linkertype").children("div:eq(0)").attr("class", "ico linkertype_" + g.linkerType.toLowerCase());
            $("#bar_beginarrow").children("div:eq(0)").attr("class", "ico ico_arrow larrow_" + c.beginArrowStyle.toLowerCase());
            $("#bar_endarrow").children("div:eq(0)").attr("class", "ico ico_arrow rarrow_" + c.endArrowStyle.toLowerCase())
        }
        if (l == 0) {
            $("#bar_unlock").button("disable");
            d.children("li[ac=unlock]").menuitem("disable")
        } else {
            $("#bar_unlock").button("enable");
            d.children("li[ac=unlock]").menuitem("enable")
        }
        if (f < 2) {
            d.children("li[ac=group]").menuitem("disable");
            $("#bar_arrange_align").menuitem("disable")
        } else {
            d.children("li[ac=group]").menuitem("enable");
            $("#bar_arrange_align").menuitem("enable")
        }
        if (m < 2) {
            $("#bar_arrange_match").menuitem("disable")
        } else {
            $("#bar_arrange_match").menuitem("enable")
        }
        if (f < 3) {
            $("#bar_arrange_dist").menuitem("disable")
        } else {
            $("#bar_arrange_dist").menuitem("enable")
        }
        if (k == 0) {
            d.children("li[ac=ungroup]").menuitem("disable")
        } else {
            d.children("li[ac=ungroup]").menuitem("enable")
        }
    },
    showInsertLink: function () {
        $("#link_dialog").dlg();
        var a = Utils.getSelected()[0].link;
        if (!a) {
            a = ""
        }
        $("#linkto_addr").val(a).select();
        $("#linkto_addr").unbind().bind("keydown", function (b) {
            if (b.keyCode == 13) {
                UI.setLink()
            }
        })
    },
    setLink: function () {
        var b = $("#linkto_addr").val();
        var a = Utils.getSelected()[0];
        a.link = b;
        Model.update(a);
        $("#link_dialog").dlg("close")
    },
    showSetSize:function () {
        $("#size_dialog").dlg();
        $("#designer_button").click(function () {
            UI.setSize();
        });
      
    },
    setSize: function () {        
        var sizeid = $("#size_id").val();
        var sort = $("#box-sort").val();
        var target = Utils.getSelected()[0];
        $('#' + target.id).find(".shape_info").attr({
            size: sizeid,
            sort:sort,
        });
        $("#size_dialog").dlg("close");
    },
    imageSelectedCallback: null,
    showImageSelect: function (d) {
        if (d) {
            this.imageSelectedCallback = d
        } else {
            this.imageSelectedCallback = null
        }
        this.fetchingRequest = null;
        var a = $(window).height() - 200;
        if (a > 550) {
            a = 550
        } else {
            if (a < 200) {
                a = 200
            }
        }
        $(".image_list").height(a);
        $("#image_dialog").dlg({
            onClose: function () {
                if (UI.fetchingRequest) {
                    UI.fetchingRequest.abort()
                }
            }
        });
        if ($("#image_select_upload").is(":visible")) {
            UI.loadUserImages()
        }
        $(".image_sources").children().unbind("click").bind("click", function () {
            UI.showImageSelectContent($(this).attr("ty"))
        });
        $("#upload_img_res").empty();
        $("#input_upload_image").unbind().bind("change", function () {
            $("#upload_img_res").html("<span style='color: #666'>上传中...</span>");
            $("#frm_upload_image").submitForm({
                success: function (e) {
                    if (e.result == "type_wrong") {
                        $("#upload_img_res").html("此文件不是图片，请重新选择")
                    } else {
                        if (e.result == "size_wrong") {
                            $("#upload_img_res").html("文件大小超出要求，最大2M")
                        } else {
                            if (e.result == "exception") {
                                $("#upload_img_res").html("无法使用此图片，请选择其他图片")
                            } else {
                                var f = e.image;
                                UI.setShapeImage(f.fileId, f.imageW, f.imageH)
                            }
                        }
                    }
                }
            })
        });
        $("#input_img_url").val("");
        $("#img_url_area").empty();
        var c = "";
        function b() {
            var e = $("#input_img_url").val().trim();
            if (e != c) {
                c = e;
                if (e != "") {
                    if (e.indexOf("http") < 0) {
                        e = "http://" + e
                    }
                    $("#img_url_area").html("<span class='img_url_loading_tip'>正在加载预览...</span>");
                    var f = $("<img class='img_url_loading' src='" + e + "'/>").appendTo("#img_url_area");
                    f.unbind().bind("load", function () {
                        f.show().addClass("img_url_loaded");
                        $(".img_url_loading_tip").remove()
                    }).bind("error", function () {
                        $("#img_url_area").html("<div class='img_url_error'>无法在此地址下加载图片。<ul><li>请检查图片地址是否输入正确。</li><li>确保图片地址是公开的。</li><ul></div>")
                    })
                }
            }
        }
        $("#input_img_url").unbind().bind("paste", function () {
            b()
        }).bind("keyup", function () {
            b()
        });
        $("#input_img_search").unbind().bind("keydown", function (f) {
            if (f.keyCode == 13) {
                UI.searchImage()
            }
        });
        $("#btn_img_search").unbind().bind("click", function () {
            UI.searchImage()
        });
        $("#set_image_submit").button("enable");
        $("#set_image_submit").button({
            onClick: function () {
                var e = $(".image_sources").children(".active").attr("ty");
                if (e == "upload") {
                    var n = $("#user_image_items").children(".image_item_selected");
                    if (n.length > 0) {
                        var g = n.attr("fileId");
                        var m = n.attr("w");
                        var j = n.attr("h");
                        UI.setShapeImage(g, m, j)
                    } else {
                        $("#image_dialog").dlg("close")
                    }
                } else {
                    if (e == "url") {
                        var k = $(".img_url_loaded");
                        if (k.length > 0) {
                            var f = k.attr("src");
                            UI.setShapeImage(f, k.width(), k.height())
                        } else {
                            $("#image_dialog").dlg("close")
                        }
                    } else {
                        var n = $("#google_image_items").children(".image_item_selected");
                        if (n.length > 0) {
                            var f = n.attr("u");
                            var l = parseInt(n.attr("w"));
                            var i = parseInt(n.attr("h"));
                            UI.setShapeImage(f, l, i)
                        } else {
                            $("#image_dialog").dlg("close")
                        }
                    }
                }
            }
        });
        $("#set_image_cancel").button({
            onClick: function () {
                $("#image_dialog").dlg("close")
            }
        });
        $("#set_image_text").empty()
    },
    showImageSelectContent: function (a) {
        $(".image_list").hide();
        $("#image_select_" + a).show().find("input[type=text]").select();
        $(".image_sources").children().removeClass("active");
        $(".image_sources").children("li[ty=" + a + "]").addClass("active")
    },
    loadUserImages: function (a) {
        $("#user_image_items").empty();
        $.ajax({
            url: "/user_image/list",
            success: function (d) {
                if (d.images) {
                    for (var c = 0; c < d.images.length; c++) {
                        var b = d.images[c];
                        UI.appendUserImage(b)
                    }
                    $("#user_image_items").append("<div style='clear: both'></div>")
                }
            }
        });
        $("#user_image_items").attr("loaded", "true")
    },
    searchIndex: 0,
    searchKeywords: "",
    searchImage: function () {
        var a = $("#input_img_search").val();
        if (a.trim() != "") {
            $("#google_image_items").empty();
            this.searchKeywords = encodeURI(a);
            this.searchIndex = 0;
            UI.loadSearchImg()
        } else {
            $("#input_img_search").focus()
        }
    },
    loadSearchImg: function () {
        $.getJSON("https://api.iconfinder.com/v2/icons/search?query=" + this.searchKeywords + "&offset=" + this.searchIndex + "&count=24&minimum_size=128&vector=false&premium=false", function (c) {
            if (c.total_count == 0) {
                $("#google_image_items").html("<div class='img_gg_loading_tip'>没有搜索结果，建议使用常见英文单词进行搜索。</div>")
            } else {
                var j = c.icons;
                for (var d = 0; d < j.length; d++) {
                    var h = j[d];
                    var k = h.raster_sizes;
                    k.sort(function (m, i) {
                        return m.size - i.size
                    });
                    for (var e = 0; e < k.length; e++) {
                        var l = k[e];
                        if (l.size == 128 || e == k.length - 1) {
                            var a = l.formats[0].preview_url;
                            var f = $("<div class='image_item' u='" + a + "' w='" + l.size_width + "' h='" + l.size_height + "'></div>").appendTo($("#google_image_items"));
                            f.unbind().bind("click", function () {
                                $(".image_item_selected").removeClass("image_item_selected");
                                $(this).addClass("image_item_selected")
                            });
                            var g = $("<div class='image_box'><img src='" + a + "'/></div>").appendTo(f);
                            var b = $("<div class='drop_size'><span>" + l.size_width + "x" + l.size_height + "</span></div>").appendTo(f);
                            b.data("sizes", k);
                            if (k.length > 1) {
                                b.append("<div class='ico ico_accordion'></div>");
                                b.bind("click", function () {
                                    UI.dropImageSizes($(this))
                                })
                            } else {
                                b.css({
                                    "padding-left": "9px",
                                    cursor: "default"
                                })
                            }
                            break
                        }
                    }
                }
                $("#google_image_items").append("<div style='clear: both'></div>");
                $(".img_gg_loading_tip").remove();
                $(".gg_img_more").remove();
                if (UI.searchIndex + 24 < c.total_count) {
                    $("#google_image_items").append("<div onclick='UI.loadSearchImg()' class='gg_img_more toolbar_button active'>显示更多结果...</div>")
                }
            }
        });
        $(".gg_img_more").remove();
        $("#google_image_items").append("<div class='img_gg_loading_tip'>正在加载图片...</div>");
        this.searchIndex += 24
    },
    dropImageSizes: function (e) {
        var d = e.data("sizes");
        d.sort(function (h, g) {
            return h.size - g.size
        });
        var f = $("#img_size_menu");
        if (f.length == 0) {
            f = $("<ul id='img_size_menu' class='menu list' style='z-index:1'></ul>").appendTo("#ui_container")
        }
        f.empty();
        for (var c = 0; c < d.length; c++) {
            var b = d[c];
            var a = b.formats[0].preview_url;
            f.append("<li u='" + a + "' w='" + b.size_width + "' h='" + b.size_height + "'>" + b.size_width + "x" + b.size_height + "</li>")
        }
        f.dropdown({
            target: e,
            onSelect: function (h) {
                var g = e.parent();
                g.attr("u", h.attr("u"));
                g.attr("w", h.attr("w"));
                g.attr("h", h.attr("h"));
                e.children("span").text(h.text());
                g.find("img").attr("src", h.attr("u"))
            }
        })
    },
    appendUserImage: function (b) {
        var c = $("<div class='image_item' id='" + b.imageId + "' fileId='" + b.fileId + "' w='" + b.imageW + "' h='" + b.imageH + "'></div>").appendTo($("#user_image_items"));
        c.unbind().bind("click", function () {
            $(".image_item_selected").removeClass("image_item_selected");
            $(this).addClass("image_item_selected")
        }).bind("mouseenter", function () {
            var f = $(this);
            var e = $("<div class='ico ico_remove_red'></div>").appendTo(f);
            var g = f.attr("id");
            e.bind("click", function () {
                f.fadeOut();
                $.ajax({
                    url: "/user_image/remove",
                    data: {
                        imageId: g
                    }
                })
            })
        }).bind("mouseleave", function () {
            $(this).find(".ico_remove_red").remove()
        });
        var a = "/file/id/" + b.fileId + "/diagram_user_image";
        var d = $("<div class='image_box'><img src='" + a + "'/></div>").appendTo(c)
    },
    setShapeImage: function (b, a, c) {
        if (this.imageSelectedCallback) {
            this.imageSelectedCallback(b, a, c)
        }
        $("#image_dialog").dlg("close")
    },
    insertImage: function (b, a, d) {
        a = parseInt(a);
        d = parseInt(d);
        var e = $("#designer_layout");
        var g = e.width() / 2 + e.offset().left;
        var f = e.height() / 2 + e.offset().top;
        var i = Utils.getRelativePos(g, f, $("#designer_canvas"));
        var c = Model.create("standardImage", i.x.restoreScale() - a / 2, i.y.restoreScale() - d / 2);
        c.props.w = a;
        c.props.h = d;
        c.fillStyle = {
            type: "image",
            fileId: b,
            display: "fill",
            imageW: a,
            imageH: d
        };
        Model.add(c);
        Designer.painter.renderShape(c);
        Utils.unselect();
        Utils.selectShape(c.id)
    },
    doExport: function () {
        $("#export_dialog").dlg("close");
        $.simpleAlert("准备下载...", "info", "no");
        $("#export_title").val($(".diagram_title").text() || "未命名文件");
        var a = $("#export_form input[name='type']:checked").val();
        $.simpleAlert("close");
        $("#export_form").submit();
        $("#export_ok").disable();
        setTimeout(function () {
            $("#export_ok").enable()
        }, 2000)
    },
    exportSVG: function (f) {
        var u = Model.define, q = u.elements, j = [], k, b, c, h, d;
        $("#svg_dialog").empty();
        var n = SVG("svg_dialog");
        n.attr("id", "drawing");
        var v = "<script><![CDATA[(function(){var zooms=[25,33,50,67,75,100,120,150,200,250,300,400,500];var i=5;var draw=document.getElementById('drawing');var w=parseInt(draw.getAttribute('width').replace('px',''));var h=parseInt(draw.getAttribute('height').replace('px',''));draw.onmousewheel=function(e){e=e||window.e;event(this,e);};if(draw.addEventListener)return;function event(ele,e){if(!e.ctrlKey)return;e.returnValue=false;var d=e.wheelDelta;if(d==null&&e.detail&&e.axis==e.HORIZONTAL_AXIS)d=e.detail;d>0?i=i-(-1):i--;if(i>=zooms.length){i--;return;}if(i<0){i=0;return;}draw.setAttribute('width',w*(zooms[i]/100));draw.setAttribute('height',h*(zooms[i]/100));}})();]]><\/script>";
        var t = Export.flow;
        for (var p in q) {
            b = $.extend({}, q[p]);
            if (b.from && b.from.x == b.to.x && b.from.y == b.to.y) {
                continue
            }
            c = {
                lineColor: "50,50,50",
                lineStyle: "solid",
                lineWidth: 2,
                beginArrowStyle: "none",
                endArrowStyle: "solidArrow"
            },
            h = {
                type: "solid",
                color: "255,255,255",
                alpha: 1
            },
            d = {
                bold: false,
                color: "0,0,0",
                underline: false,
                textAlign: "center",
                italic: false,
                size: 13
            },
            k = {},
            k.parent = b.parent,
            k.id = b.id,
            k.index = b.props.zindex,
            k.x = b.props.x,
            k.y = b.props.y,
            k.w = b.props.w,
            k.h = b.props.h,
            k.angle = b.props.angle;
            k.font = b.fontStyle = $.extend(d, b.fontStyle);
            k.font.color = Export.getColor(b.fontStyle.color);
            k.font.bold = !!k.font.bold ? "bold" : "normal",
            k.font.underline = !!k.font.underline ? "underline" : "blink",
            k.font.italic = !!k.font.italic ? "italic" : "normal",
            k.font.family = k.font.fontFamily || "微软雅黑,黑体,Arial";
            k.line = b.lineStyle = $.extend(c, b.lineStyle);
            k.line.lineColor = Export.getColor(k.line.lineColor);
            if (b.fillStyle) {
                k.fill = b.fillStyle = $.extend(h, b.fillStyle);
                if (k.fill.alpha != 1) {
                    if (k.fill.color) {
                        k.fill.color += "," + k.fill.alpha
                    }
                    if (k.fill.beginColor) {
                        k.fill.beginColor += "," + k.fill.alpha
                    }
                    if (k.fill.endColor) {
                        k.fill.endColor += "," + k.fill.alpha
                    }
                }
                if (k.fill.color) {
                    k.fill.color = Export.getColor(k.fill.color)
                }
                if (k.fill.beginColor) {
                    k.fill.beginColor = Export.getColor(k.fill.beginColor)
                }
                if (k.fill.endColor) {
                    k.fill.endColor = Export.getColor(k.fill.endColor)
                }
            }
            if (b.shapeStyle) {
                k.shape = b.shapeStyle
            }
            if (b.path) {
                k.path = t.json2path(b.props, b.path, k.line, k.fill)
            }
            if (b.linkerType) {
                var l = t.line2path(b);
                k.path = l[0],
                k.points = l[1],
                k.linker = b.linkerType
            }
            if (b.textBlock && b.textBlock.length > 0) {
                k.strs = t.textSplit(b.props, b.textBlock, k.font)
            }
            if (b.attribute && b.attribute.markers && b.attribute.markers.length) {
                k.markers = t.marker2svg(b.attribute, b.props, b)
            }
            if (b.dataAttributes && b.dataAttributes.length) {
                k.attrs = t.attr2svg(b.props, b.dataAttributes, k.angle)
            }
            j.push(k)
        }
        j.sort(function (i, g) {
            if (i.index == g.index && i.parent == g.id) {
                return 1
            }
            return i.index - g.index
        });
        var s = n.group();
        var e = s.path().fill(Export.getColor(u.page.backgroundColor));
        var m = s.group();
        for (var r = 0; r < j.length; r++) {
            if (typeof j[r].x == "number") {
                t.shape2svg(j[r], m.group(), f)
            } else {
                t.flowline2svg(j[r], s, m.group())
            }
        }
        var a = t.getRect(m);
        n.viewbox(a.left - 20, a.top - 20, a.width + 40, a.height + 40);
        n.size(a.width + 40, a.height + 40);
        var o = [["M", a.left - 20, a.top - 20], ["h", a.width + 40], ["v", a.height + 40], ["h", -a.width - 40], ["v", -a.height - 40], ["z"]];
        e.plot(o);
        setTimeout(function () {
            var g = $("#svg_dialog").html();
            g = encodeURIComponent(g);
            $.simpleAlert("close");
            $("#svg_dialog").empty();
            $("svg").remove();
            $("#export_title").after("<input id='export_definition' type='hidden' name='definition'/>");
            $("#export_definition").val(g);
            $("#export_form").submit();
            $("#export_definition").remove()
        }, 3000)
    },
    showHotKey: function () {
        var a = $(window).height() - 175;
        if (a > 500) {
            a = 500 + "px"
        }
        $("#hotkey_list").dlg();
        $("#hotkey_list").css({
            top: "28px"
        });
        $("#hotkey_list .dialog_content").css({
            height: a
        })
    },
    showFeedBack: function () {
        $("#send_feedback").css({
            width: "auto",
            height: "auto"
        });
        var a = $("#send_feedback");
        a.dlg();
        $("#feedback_email").focus();
        $("#feedback_message").val("");
        $(".feedback_error_email_format").hide();
        $(".feedback_error_msg").hide()
    },
    sendFeedBack: function (c) {
        $(".feedback_error_email_format").hide();
        $(".feedback_error_msg").hide();
        var a = $.trim($("#feedback_email").val());
        if (!a.isEmail()) {
            $("#feedback_email").focus();
            $(".feedback_error_email_format").show();
            return
        }
        var b = $.trim($("#feedback_message").val());
        if (b == "") {
            $("#feedback_message").val("").focus();
            $(".feedback_error_msg").show();
            return
        }
        Util.ajax({
            url: "/support/save_ask",
            data: {
                content: b,
                username: $("#feedback_name").val(),
                email: a,
                url: location.href
            },
            success: function (d) {
                $(".dlg_mask").remove();
                $("#send_feedback").animate({
                    left: $(window).width(),
                    top: $(window).height(),
                    width: 0,
                    height: 0,
                    opacty: 0.2
                })
            }
        })
    },
    gettingStart: function (a) {
        this.showStartStep(1)
    },
    showStartStep: function (b, e) {
        $(".mark_content").hide();
        var a = $(".mark" + b + "_content");
        a.show();
        var d;
        var c;
        if (b == 1) {
            d = $("#shape_panel").offset().top + 70;
            c = $("#shape_panel").offset().left + $("#shape_panel").width() + 10
        } else {
            if (b == 2) {
                d = $(".row2").offset().top + 30;
                c = $("#menu_bar_insert").offset().left + $("#menu_bar_insert").width() - a.outerWidth() / 2
            } else {
                if (b == 3) {
                    d = $(".toolbar").offset().top + 40;
                    c = 270
                } else {
                    if (b == 4) {
                        d = $("#dock").offset().top + 10;
                        c = $("#dock").offset().left - a.outerWidth() - 10
                    } else {
                        if (b == "created") {
                            d = e.offset().top + e.height() / 2 - a.outerHeight() / 2;
                            if (d <= 0) {
                                d = 0
                            }
                            if (d + a.outerHeight() > $(window).height()) {
                                d = $(window).height() - a.outerHeight()
                            }
                            c = e.offset().left + e.width() + 10
                        }
                    }
                }
            }
        }
        a.css({
            top: d,
            left: c
        })
    },
    closeGettingStart: function (a) {
        $(".mark_content").hide()
    },
    showAddColla: function () {
        Util.ajax({
            url: "/collaboration/get_colla_role_list",
            data: {
                chartId: chartId
            },
            success: function (b) {
                $("#colla_dialog").find(".role_list").html(b).scrollTop(999);
                $("#colla_dialog").removeClass("_update");
                $("#colla_dialog").css({
                    top: ($(window).height() - $("#colla_dialog").outerHeight()) * 0.5 + "px"
                });
                $("#colla_dialog").dlg();
                $("#add_prompt4").hide();
                $("#add_prompt3").hide();
                $("#add_prompt2").hide();
                $("#add_prompt1").show();
                $("#colla_suggest_box").addClass("colla").html('<div class="suggest_colla_box colla_loading"></div>');
                UI.getCollaTeamMembers()
            }
        });
        var a = "";
        $("#input_add_colla").val("").unbind().bind("keyup", function () {
            var c = $(this).val();
            if (c == a) {
                return
            }
            a = c;
            if (c == "") {
                $("#add_prompt4").hide();
                $("#add_prompt3").hide();
                $("#add_prompt2").hide();
                $("#add_prompt1").show();
                if (!$("#colla_suggest_box").hasClass("colla")) {
                    var b = '<span class="left"><strong>常用联系人</strong>：</span><span class="right"><strong>我的小组成员</strong>：</span>';
                    $(".suggest_bot_tip").html(b);
                    $("#colla_suggest_box").addClass("colla").html('<div class="suggest_colla_box colla_loading"></div>');
                    UI.getCollaTeamMembers()
                }
                return
            }
            Util.ajax({
                url: "/collaboration/get_new_members",
                data: {
                    value: c
                },
                success: function (d) {
                    $(".suggest_bot_tip").html("<strong>从以下用户列表中选择一个用户发起邀请： </strong>");
                    $("#colla_suggest_box").removeClass("colla").html("");
                    $("#colla_suggest_box").html(d);
                    if ($("#colla_suggest_box").find("ul").length > 0) {
                        $("#add_prompt4").hide();
                        $("#add_prompt3").hide();
                        $("#add_prompt2").show();
                        $("#add_prompt1").hide()
                    } else {
                        $("#add_prompt4").hide();
                        $("#add_prompt3").hide();
                        $("#add_prompt2").hide();
                        $("#add_prompt1").show()
                    }
                    $(".colla_suggest").find("li").on("click", function () {
                        if ($(this).attr("joinType") != "team") {
                            $("#add_prompt4").hide();
                            $("#add_prompt3").hide();
                            $("#add_prompt2").show();
                            $("#add_prompt1").hide();
                            var g = $.trim($("#input_add_colla").val());
                            $(".colla_suggest").find("li").removeClass("seled");
                            $(this).addClass("seled");
                            var e = $(this).attr("joinType");
                            var h = $(this).attr("target");
                            if (e == "user") {
                                var f = $(this).attr("username");
                                $("#input_add_colla").val(f);
                                $("#add_userid").val(h)
                            } else {
                                $("#input_add_colla").val(h);
                                $("#add_userid").val(h)
                            }
                            $("#add_type").val(e)
                        }
                    })
                }
            })
        })
    },
    showMoreContacter: function (b, d) {
        var c = {};
        var a = +($(d).attr("all"));
        if (b == "contacters") {
            var e = $(d).parent().find("li[joinType='user']").length;
            c.source = b;
            c.split = e
        } else {
            if (b == "team") {
                var e = $(d).parent().find("li[joinType='user']").length;
                c.source = b;
                c.teamId = $(d).parent().attr("target");
                c.split = e
            }
        }
        Util.ajax({
            url: "/collaboration/get_add_more",
            data: c,
            success: function (j) {
                var l = j.users;
                var h = "";
                var g = "", i, k, f;
                $.each(l, function (n) {
                    var m = l[n];
                    h = "/images/default/default/profile-full-male.png";
                    i = m.userId;
                    if (m.photoFileName != null && m.photoFileName != "") {
                        h = "/file/" + m.photoFileName + "/photo"
                    }
                    k = m.fullName;
                    f = m.email;
                    g += '<li joinType="user" target="' + i + '" username="' + k + '" email="' + f + '"><img src="' + h + '"/>' + k + "</li>"
                });
                $(d).before(g);
                if ($(d).parent().find("li[joinType='user']").length == a) {
                    $(d).hide()
                } else {
                    $(d).show()
                }
                $(d).parent().scrollTop(9999)
            }
        })
    },
    getCollaTeamMembers: function () {
        Util.ajax({
            url: "/collaboration/get_contacter_team_members",
            data: {
                source: "designer"
            },
            success: function (a) {
                $("#colla_suggest_box").find(".suggest_colla_box").removeClass("colla_loading").html(a);
                $(".colla_suggest").find("li").on("click", function () {
                    if ($(this).attr("joinType") == "team") {
                        var b = $(this).attr("target");
                        if (!$(this).hasClass("active")) {
                            $(this).addClass("active");
                            $(".team_member[target='" + b + "']").show();
                            Util.ajax({
                                url: "/collaboration/show_team_member",
                                data: {
                                    teamId: b
                                },
                                success: function (i) {
                                    var o = +(i.teamMemberCount);
                                    var n = +(i.firstSize);
                                    var g = i.users;
                                    var j = "";
                                    var k, l = "", m, h;
                                    $.each(g, function (q) {
                                        l = "/images/default/default/profile-full-male.png";
                                        var p = g[q];
                                        k = p.userId;
                                        if (p.photoFileName != null && p.photoFileName != "") {
                                            l = "/file/" + p.photoFileName + "/photo"
                                        }
                                        m = p.fullName;
                                        h = p.email;
                                        j += '<li joinType="user" target="' + k + '" username="' + m + '" email="' + h + '"><img src="' + l + '"/>' + m + "</li>"
                                    });
                                    if (n < o) {
                                        j += '<div class="slider" all="' + o + '" onclick="UI.showMoreContacter(\'team\', this)"><span></span></div>'
                                    }
                                    $(".team_member[target='" + b + "']").css({
                                        background: "none"
                                    });
                                    $(".team_member[target='" + b + "']").append(j);
                                    $(".colla_suggest.team_member").find("li").on("click", function () {
                                        $("#add_prompt4").hide();
                                        $("#add_prompt3").hide();
                                        $("#add_prompt2").show();
                                        $("#add_prompt1").hide();
                                        var r = $.trim($("#input_add_colla").val());
                                        $(".colla_suggest").find("li").removeClass("seled");
                                        $(this).addClass("seled");
                                        var p = $(this).attr("joinType");
                                        var s = $(this).attr("target");
                                        if (p == "user") {
                                            var q = $(this).attr("username");
                                            $("#input_add_colla").val(q);
                                            $("#add_userid").val(s)
                                        } else {
                                            $("#input_add_colla").val(s);
                                            $("#add_userid").val(s)
                                        }
                                        $("#add_type").val(p)
                                    })
                                }
                            })
                        } else {
                            $(this).removeClass("active");
                            $(".team_member[target='" + b + "']").hide();
                            $(".team_member[target='" + b + "']").html("");
                            $(".team_member[target='" + b + "']").css({
                                background: "url(/images/default/view_loading.gif) center center no-repeat"
                            })
                        }
                    }
                    if ($(this).attr("joinType") == "user" || $(this).attr("joinType") == "email") {
                        $("#add_prompt4").hide();
                        $("#add_prompt3").hide();
                        $("#add_prompt2").show();
                        $("#add_prompt1").hide();
                        var e = $.trim($("#input_add_colla").val());
                        $(".colla_suggest").find("li").removeClass("seled");
                        $(this).addClass("seled");
                        var c = $(this).attr("joinType");
                        var f = $(this).attr("target");
                        if (c == "user") {
                            var d = $(this).attr("username");
                            $("#input_add_colla").val(d);
                            $("#add_userid").val(f)
                        } else {
                            $("#input_add_colla").val(f);
                            $("#add_userid").val(f)
                        }
                        $("#add_type").val(c)
                    }
                })
            }
        })
    },
    doAddCollaboration: function () {
        if ($(".colla_suggest").length > 0) {
            if ($(".colla_suggest").find(".seled").length == 0) {
                $("#add_prompt1").hide();
                $("#add_prompt2").show();
                $("#add_prompt3").hide();
                $("#add_prompt4").hide();
                var h = ($(window).outerHeight() - 104) * 0.5 + 100;
                var a = ($(window).outerWidth() - 272) * 0.5;
                $("#confirm_dlg").removeClass("newSize").css({
                    top: h + "px",
                    left: a + "px"
                });
                $("#confirm_dlg").addClass("newSize").css({
                    top: ($(window).outerHeight() - $("#confirm_dlg").height()) * 0.5 + "px",
                    left: ($(window).outerWidth() - $("#confirm_dlg").width()) * 0.5 + "px",
                    display: "block"
                })
            } else {
                var i = $(".colla_suggest").find(".seled").find("img").attr("src");
                var d = $("#input_add_colla").val();
                if (d.length > 30) {
                    d = d.substr(0, 30) + "..."
                }
                var f = $("#add_userid").val();
                var c = $("#invit_role").val();
                var g = $("#add_type").val();
                $(".add_new_button").find(".designer_button").text("发送中...");
                var e = null;
                if (g == "email") {
                    $(".role_list").find(".role_item").each(function () {
                        if ($(this).attr("type") == g && $(this).attr("target") == f) {
                            e = $(this);
                            $(this).find(".inviting_").text("再次邀请")
                        }
                    })
                }
                var b = {
                    type: g,
                    target: f,
                    role: c,
                    chartId: chartId
                };
                Util.ajax({
                    url: "/collaboration/add",
                    data: b,
                    success: function (k) {
                        var j = k.result;
                        if (j == "exists") {
                            $("#add_prompt2").hide();
                            $("#add_prompt1").hide();
                            $("#add_prompt4").hide();
                            $("#add_prompt3").show()
                        } else {
                            Util.ajax({
                                url: "/collaboration/get_colla_role_list",
                                data: {
                                    chartId: chartId
                                },
                                success: function (l) {
                                    $(".role_list").html(l).scrollTop(999)
                                }
                            })
                        }
                        $(".add_new_button").find(".designer_button").text("发送邀请");
                        $("#colla_dialog").addClass("_update").css({
                            top: ($(window).height() - $("#colla_dialog").outerHeight()) * 0.5 + "px"
                        });
                        if (j != "exists") {
                            setTimeout(function () {
                                $("#add_prompt3").hide();
                                $("#add_prompt2").hide();
                                $("#add_prompt1").hide();
                                $("#add_prompt4").show()
                            }, 400)
                        }
                        setTimeout(function () {
                            $("#add_prompt3").hide();
                            $("#add_prompt2").hide();
                            $("#add_prompt4").hide();
                            $("#add_prompt1").show();
                            $("#input_add_colla").val("");
                            if (!$("#colla_suggest_box").hasClass("colla")) {
                                var l = '<span class="left"><strong>常用联系人</strong>：</span><span class="right"><strong>我的小组成员</strong>：</span>';
                                $(".suggest_bot_tip").html(l);
                                $("#colla_suggest_box").addClass("colla").html('<div class="suggest_colla_box colla_loading"></div>');
                                UI.getCollaTeamMembers()
                            }
                        }, 1000)
                    }
                })
            }
        }
    },
    deleteCollaRole: function (c) {
        var a = $(c).parent(".role_item");
        var b = a.attr("collaborationId");
        Util.ajax({
            url: "/collaboration/delete",
            data: {
                collaborationId: b
            },
            success: function (d) {
                if (d.result == "success") {
                    a.remove()
                }
            }
        });
        $("#colla_dialog").addClass("_update").css({
            top: ($(window).height() - $("#colla_dialog").outerHeight()) * 0.5 + "px"
        })
    },
    changeCollaRole: function (b, a) {
        Util.ajax({
            url: "/collaboration/set_role",
            data: {
                collaborationId: b,
                role: $(a).val()
            },
            success: function (c) {
                if (c.result == "success") {
                    $(a).parent(".given_role").find(".change_success").stop().animate({
                        left: "-38px"
                    }, 200).delay(400).animate({
                        left: "0px"
                    }, 200)
                }
            }
        })
    },
    showShapesManage: function () {
        $("#shapes_dialog").dlg();
        $("#shape_manage_list").children("li").unbind().bind("click", function () {
            var b = $(this).find("input");
            var c = !b.is(":checked");
            b.attr("checked", c);
            a(b)
        });
        $("#shape_manage_list").find("input").unbind().bind("click", function (b) {
            b.stopPropagation();
            a($(this))
        }).each(function () {
            var c = $(this).val();
            var b = c.split(",");
            var f = true;
            for (var d = 0; d < b.length; d++) {
                var e = b[d];
                if ((CategoryMapping.network && e == "network") || (CategoryMapping.aws_analytics && e == "network_aws") || (CategoryMapping.cisco_bulidings && e == "network_cisco") || (CategoryMapping.azure && e == "network_azure") || (CategoryMapping.ali_app_service && e == "network_aliyun")) {
                    f = true;
                    break
                }
                if (!CategoryMapping[e]) {
                    f = false;
                    break
                }
            }
            $(this).attr("checked", f)
        });
        function a(c) {
            var d = c.val();
            var b = d.split(",");
            var e = c.is(":checked");
            if (b.length > 1) {
                $("#shape_manage_list").find("input").each(function () {
                    var f = $(this).val();
                    if (b.indexOf(f) >= 0) {
                        $(this).attr("checked", e)
                    }
                })
            } else {
                $("#shape_manage_list").find(".cate_parent").each(function () {
                    var g = $(this).val().split(",");
                    var f = true;
                    for (var h = 0; h < g.length; h++) {
                        var j = g[h];
                        if (!$("#shape_manage_list").find("input[value=" + j + "]").is(":checked")) {
                            f = false;
                            break
                        }
                    }
                    $(this).attr("checked", f)
                })
            }
        }
    },
    saveShapesManage: function () {
        var d = $("#shape_manage_list").find("input:checked:not(.cate_parent)").map(function () {
            return $(this).val()
        }).get();
        var b = "";
        var c = {
            action: "changeSchema",
            categories: d.join(",")
        };
        CLB.send(c);
        Designer.setSchema(d, function () {
            $("#shapes_dialog").dlg("close")
        })
    },
    showUserMenu: function (a) {
        a.stopPropagation();
        $("#user_menu").dropdown({
            target: $(".user"),
            position: "right",
            onSelect: function (b) {
                var c = b.attr("ac");
                if (c == "dia") {
                    location.href = "/diagrams"
                } else {
                    if (c == "net") {
                        location.href = "/network"
                    } else {
                        if (c == "out") {
                            location.href = "/login/out"
                        }
                    }
                }
            }
        })
    },
    showDownload: function () {
        if ($("#export_dialog").attr("key")) {
            $("#export_pdfHD").click();
            $("#export_ok").click();
            return
        }
        $("#export_dialog").dlg();
        $("#export_png").click()
    },
    showShareMenu: function (a) {
        a.stopPropagation();
        $("#share_menu").dropdown({
            target: $("#share_btn"),
            onSelect: function (b) {
                var c = b.attr("ac");
                if (c == "colla") {
                    UI.showAddColla()
                } else {
                    if (c == "download") { } else {
                        if (c == "link") {
                            UI.showViewLink()
                        } else {
                            if (c == "embed") {
                                UI.showEmbed()
                            }
                        }
                    }
                }
            }
        });
        $(".share_to_a").off("mousedown").on("mousedown", function () {
            var b = $(this);
            Util.ajax({
                url: "/view/getlink",
                async: false,
                data: {
                    chartId: chartId
                },
                success: function (e) {
                    if (e.viewLinkId != "") {
                        var d = b.attr("hrefs");
                        if (d.indexOf("/view/link/") < 0) {
                            b.attr("hrefs", d.replace("=https://www.processon.com", "=https://www.processon.com/view/link/" + e.viewLinkId))
                        }
                        if (b.hasClass("weixin")) {
                            var f = b.attr("hrefs").replace("https://www.processon", "http://test.processon");
                            var c = $("<div><img src='" + f + "&size=180x180'/><div>微信扫一扫 分享</div></div>").appendTo("body");
                            c.css({
                                position: "absolute",
                                width: 200,
                                height: 216,
                                left: "50%",
                                top: "40%",
                                marginLeft: -100,
                                marginTop: -100,
                                textAlign: "center",
                                zIndex: 9999999,
                                border: "1px solid #ccc",
                                background: "#fff",
                                boxShadow: "1px 1px 12px #bbb"
                            });
                            c.find("img").css({
                                width: "180px",
                                height: "180px",
                                marginTop: 10
                            });
                            $(document).on("mousedown.weixin", function () {
                                c.remove()
                            })
                        } else {
                            window.open(b.attr("hrefs"))
                        }
                    }
                }
            })
        })
    },
    showEmbed: function () {
        if (chartId != "") {
            $("#embed_designer_chart").dlg();
            $("#iframe_html").val("");
            $(".embed_preview").html("");
            var a, b;
            a = $("#embed_width").val();
            b = $("#embed_height").val();
            UI.changeEmbedWH(a, b);
            $("#iframe_html").select();
            $(".embed_size").find("input").keyup(function () {
                var c = $.trim($("#embed_width").val()) == "" ? 340 : $.trim($("#embed_width").val());
                var d = $.trim($("#embed_height").val()) == "" ? 160 : $.trim($("#embed_height").val());
                c = parseInt(c);
                d = parseInt(d);
                $(".embed_preview").find("div:first").css({
                    width: c + "px",
                    height: d + "px"
                });
                $(".embed_preview").find("iframe").css({
                    width: c + "px",
                    height: d + "px"
                });
                UI.changeEmbedWH(c, d)
            });
            $("#iframe_html").unbind().bind("click", function () {
                $(this).select()
            });
            $(".embed_preview").keydown(function () {
                $(".embed_size").find("input").blur()
            })
        }
    },
    changeEmbedWH: function (a, d) {
        var b = '<iframe id="embed_dom" name="embed_dom" frameborder="0" style="border:1px solid #000;display:block;width:' + a + "px; height:" + d + 'px;" src="https://www.processon.com/embed/' + chartId + '"></iframe>';
        $("#iframe_html").val(b);
        $(".embed_preview_wrap").css({
            "margin-top": (-d / 2) + "px",
            "margin-left": (-a / 2) + "px"
        });
        $(".embed_preview").html("").html(b);
        var c = document.getElementById("embed_dom");
        c.onload = c.onreadystatechange = function () {
            if (!c.readyState || c.readyState == "complete") {
                setTimeout(function () {
                    $(".embed_preview .preview_dis").remove();
                    setTimeout(function () {
                        $(".embed_obj").fadeIn()
                    }, 100)
                }, 400)
            }
        }
    },
    showViewLink: function () {
        if (chartId == "") {
            return
        }
        var b = null;
        var a = "";
        Util.get("/folder/get_chart", {
            id: chartId
        }, function (f) {
            b = f.chart;
            a = b.viewLinkId;
            var g = b.title;
            $(".create_view_link h3").find("span._tip2").html(g);
            $("#share_link_win").dlg();
            if (a == "" || a == null) {
                UI.showCreateViewLink()
            } else {
                var e = "off";
                var c = null;
                if (b.viewPassword != null || b.viewPassword != "") {
                    e = "on";
                    c = b.viewPassword
                }
                UI.showShareViewLink(e, c);
                var d = "https://www.processon.com/view/link/" + a;
                $("#_view_link_input").val(d).select()
            }
        })
    },
    showCreateViewLink: function () {
        $(".create_view_link h3").find("span._tip1").html("创建分享浏览链接");
        $("#share_link_win").find(".txt").css({
            width: "390px"
        }).removeAttr("readonly", "readonly");
        if ($("#_locale").val() === "zh") {
            $("#share_link_win").find(".txt").css({
                width: "410px"
            })
        }
        $("#_view_link_input").val("");
        var a = "<p>希望分享给别人，又不想完全公开？您可以在此创建一个浏览链接，分享给别人后，可以通过此链接来安全地浏览您的文件。 </p><p>当然，您也可以给浏览链接添加密码，以便您享有更多的控制权限。 </p>";
        $(".create_dis").html(a);
        setTimeout(function () {
            $(".create.designer_button").show()
        }, 200)
    },
    showShareViewLink: function (d, b) {
        var e = "-1px";
        var c = "#fff;color:#323232;text-shadow:0px 1px 0px rgba(255,255,255,0.3)";
        if (d == "on" && b != "" && b != null) {
            e = "33px";
            c = "#5da206;color:#fff;text-shadow:0px 1px 0px rgba(0,0,0,0.3)"
        }
        $(".create_view_link h3").find("span._tip1").html("分享链接以便其他人可以浏览文件 ");
        $(".create.designer_button").hide();
        $("#share_link_win").find(".txt").css({
            width: "98%"
        }).attr("readonly", "readonly");
        var a = '<p>密码保护</p><p><a href="javascript:;" onclick="UI.deleteViewLink()">删除链接</a>&nbsp;撤销访问权</p><div class="edit_pw_protect" style="background:' + c + ';" onclick="UI.changePWState(this)"><span class="pw_protect_on">开</span><span class="pw_protect_off">关</span><div class="pw_protect_watch" style="left: ' + e + ';"></div></div><div class="password_input_w"><input type="text" class="_pw txt" value="" placeholder=\'密码\' /><span class="button add_pw_btn" onclick="UI.addViewLinkPassword(this)">添加 </span><div style="clear:both;"></div></div>';
        $(".create_dis").html(a);
        if (d == "on" && b != "" && b != null) {
            $(".button.add_pw_btn").text("更改");
            $(".password_input_w").show().find("._pw").val(b)
        }
    },
    createViewLink: function (a) {
        Util.ajax({
            url: "/view/addlink",
            data: {
                chartId: chartId
            },
            success: function (d) {
                UI.showShareViewLink("off");
                var b = d.viewLinkId;
                var c = "https://www.processon.com/view/link/" + b;
                $("#_view_link_input").val(c).select()
            }
        })
    },
    deleteViewLink: function () {
        Util.ajax({
            url: "/view/dellink",
            data: {
                chartId: chartId
            },
            success: function (a) {
                UI.showCreateViewLink()
            }
        })
    },
    changePWState: function (a) {
        var c = $(a).find(".pw_protect_watch")[0];
        var b = c.offsetLeft;
        if (b == -1) {
            $(c).css({
                left: "33px"
            });
            $(".button.add_pw_btn").text("添加");
            $(".password_input_w").show().find("._pw").val("").focus()
        } else {
            Util.ajax({
                url: "/view/removepassword",
                data: {
                    chartId: chartId
                },
                success: function (d) {
                    $(c).css({
                        left: "-1px"
                    });
                    $(".edit_pw_protect").css({
                        background: "#fff",
                        color: "#323232",
                        "text-shadow": "0px 1px 0px rgba(255,255,255,0.3)"
                    });
                    $(".password_input_w").find("._pw").val("");
                    $(".password_input_w").hide()
                }
            })
        }
    },
    addViewLinkPassword: function (b) {
        var a = $.trim($(b).parent().find("._pw").val());
        if (a == "") {
            $("._pw").focus();
            return false
        }
        Util.ajax({
            url: "/view/addpassword",
            data: {
                viewPassword: a,
                chartId: chartId
            },
            success: function (c) {
                $(".edit_pw_protect").css({
                    background: "#5da206",
                    color: "#fff",
                    "text-shadow": "0px 1px 0px rgba(0,0,0,0.3)"
                });
                $(".button.add_pw_btn").text("更改")
            }
        })
    },
    showPublish: function (a) {
        if (a) {
            $("#unpublish_dialog").dlg("close");
            $("#publish_dialog").dlg();
            return
        }
        if (cstatus == "public") {
            $("#unpublish_dialog").dlg()
        } else {
            $("#publish_dialog").dlg()
        }
    },
    savePublish: function () {
        var b = $("#publish_category").val();
        var e = $("#publish_language").val();
        var d = $("#publish_description").val();
        var a = $("#publish_tags").val();
        if ($.trim(a) == "") {
            $("#publish_tags").focus();
            return
        } else {
            if ($.trim(d) == "") {
                $("#publish_description").focus();
                return
            }
        }
        var c = a.replace("，", ",").split(",");
        Utils.removeFromArray(c, "");
        if (c.length == 0) {
            $("#publish_tags").focus();
            return
        }
        $("#publish_dialog_savebtn").disable();
        $.ajax({
            url: "/folder/publish",
            data: {
                id: chartId,
                status: "public",
                language: e,
                industry: b,
                description: d,
                tags: c,
                _public_edit: $("#public_edit").is(":checked"),
                _public_clone: $("#public_clone").is(":checked")
            },
            traditional: true,
            success: function (f) {
                $("#publish_dialog_savebtn").enable()
            }
        });
        cstatus = "public";
        $("#publish_dialog").dlg("close")
    },
    cancelPublish: function () {
        $.ajax({
            url: "/folder/publish",
            data: {
                id: chartId,
                status: "private"
            },
            success: function (a) {
                if (a.result == "overed") {
                    UI.showTip("私有存储空间已经不足，只能创建公开文件，您可以 <a target='_blank' href='/support/privatefile'>扩容</a>")
                } else {
                    cstatus = "private"
                }
            }
        });
        $("#unpublish_dialog").dlg("close")
    },
    showSaveAs: function () {
        $("#saveas_dialog").dlg();
        $("#saveas_title").val($(".diagram_title").text()).select()
    },
    doSaveAs: function () {
        if ($("#saveas_title").val().trim() == "") {
            $("#saveas_title").focus();
            return
        }
        $("#hid_saveas_id").val(chartId);
        $("#saveas_form").submit();
        $("#btn_dosaveas").removeAttr("onclick")
    },
    showShapeOptions: function () {
        var f = Utils.getSelectedShapeIds();
        UI.hideShapeOptions();
        if (f.length == 1) {
            var g = Model.getShapeById(f[0]);
            if (g.name == "uiTab") {
                var a = 0;
                for (var e = 0; e < g.path.length - 1; e++) {
                    var k = g.path[e];
                    if (typeof k.fillStyle == "undefined") {
                        a = e + 1;
                        break
                    }
                }
                h(g, [{
                    label: "Tab数：",
                    type: "spinner",
                    value: g.path.length - 1,
                    onChange: function (n) {
                        var l = 0;
                        for (var o = 0; o < g.path.length - 1; o++) {
                            var q = g.path[o];
                            if (typeof q.fillStyle == "undefined") {
                                l = o;
                                break
                            }
                        }
                        var p = g.path[g.path.length - 1];
                        if (n != g.path.length - 1) {
                            if (l > n - 1) {
                                l = n - 1;
                                $("#change_uitab_index").spinner("setValue", n)
                            }
                            g.path = [];
                            var s = [];
                            for (var o = 0; o < n; o++) {
                                var m = {
                                    actions: [{
                                        action: "move",
                                        x: "w/" + n + "*" + o,
                                        y: "h"
                                    }, {
                                        action: "line",
                                        x: "w/" + n + "*" + o,
                                        y: 7
                                    }, {
                                        action: "quadraticCurve",
                                        x1: "w/" + n + "*" + o,
                                        y1: 0,
                                        x: "w/" + n + "*" + o + "+7",
                                        y: 0
                                    }, {
                                        action: "line",
                                        x: "w/" + n + "*" + (o + 1) + "-7",
                                        y: 0
                                    }, {
                                        action: "quadraticCurve",
                                        x1: "w/" + n + "*" + (o + 1),
                                        y1: 0,
                                        x: "w/" + n + "*" + (o + 1),
                                        y: 7
                                    }, {
                                        action: "line",
                                        x: "w/" + n + "*" + (o + 1),
                                        y: "h"
                                    }]
                                };
                                if (o != l) {
                                    m.fillStyle = {
                                        color: "r-20,g-20,b-20"
                                    };
                                    m.actions.push({
                                        action: "close"
                                    })
                                }
                                g.path.push(m);
                                if (o < g.textBlock.length) {
                                    var r = g.textBlock[o];
                                    r.position.x = "w/" + n + "*" + o + "+5";
                                    r.position.w = "w/" + n + "-10";
                                    s.push(r)
                                } else {
                                    s.push({
                                        position: {
                                            x: "w/" + n + "*" + o + "+5",
                                            y: 5,
                                            w: "w/" + n + "-10",
                                            h: "h-10"
                                        },
                                        text: "Tab " + (o + 1)
                                    })
                                }
                            }
                            g.textBlock = s;
                            g.path.push(p);
                            Schema.initShapeFunctions(g);
                            Model.update(g);
                            Designer.painter.renderShape(g);
                            $("#change_uitab_index").spinner("setOptions", {
                                max: n
                            })
                        }
                    }
                }, {
                    id: "change_uitab_index",
                    label: "选中：",
                    type: "spinner",
                    value: a,
                    max: g.path.length - 1,
                    onChange: function (o) {
                        var l = 0;
                        for (var m = 0; m < g.path.length - 1; m++) {
                            var n = g.path[m];
                            if (typeof n.fillStyle == "undefined") {
                                l = m;
                                break
                            }
                        }
                        if (l != o - 1) {
                            g.path[l].fillStyle = {
                                color: "r-20,g-20,b-20"
                            };
                            g.path[l].actions.push({
                                action: "close"
                            });
                            delete g.path[o - 1].fillStyle;
                            g.path[o - 1].actions.splice(6, 1);
                            Schema.initShapeFunctions(g);
                            Model.update(g);
                            Designer.painter.renderShape(g)
                        }
                    }
                }])
            } else {
                if (g.attribute.collapsable) {
                    h(g, [{
                        type: "button",
                        value: g.attribute.collapsed ? "展开" : "收缩",
                        onClick: function (l) {
                            MessageSource.beginBatch();
                            var s = [];
                            if (!g.attribute.markers) {
                                g.attribute.markers = []
                            }
                            if (g.attribute.collapsed) {
                                var m = Utils.getCollapsedShapesById(g.id);
                                for (var n = 0; n < m.length; n++) {
                                    var i = m[n];
                                    delete i.attribute.collapseBy;
                                    s.push(i);
                                    Designer.painter.renderShape(i)
                                }
                                var r = Utils.getOutlinkers(m);
                                for (var n = 0; n < r.length; n++) {
                                    var p = r[n];
                                    delete p.attribute;
                                    s.push(p);
                                    Designer.painter.renderLinker(p)
                                }
                                Utils.removeFromArray(g.attribute.markers, "expand");
                                g.attribute.container = true;
                                g.attribute.collapsed = false;
                                var t = g.attribute.collapseW ? g.attribute.collapseW : 400;
                                var o = g.attribute.collapseH ? g.attribute.collapseH : 300;
                                Designer.setShapeProps({
                                    w: t,
                                    h: o
                                }, [g]);
                                l.text("收缩")
                            } else {
                                var q = Utils.getContainedShapes([g]);
                                for (var n = 0; n < q.length; n++) {
                                    var i = q[n];
                                    if (typeof i.attribute == "undefined") {
                                        i.attribute = {}
                                    }
                                    i.attribute.collapseBy = g.id;
                                    s.push(i);
                                    Designer.painter.renderShape(i)
                                }
                                var r = Utils.getOutlinkers(q);
                                for (var n = 0; n < r.length; n++) {
                                    var p = r[n];
                                    p.attribute = {
                                        collapseBy: g.id
                                    };
                                    s.push(p);
                                    Designer.painter.renderLinker(p)
                                }
                                g.attribute.markers.push("expand");
                                g.attribute.container = false;
                                g.attribute.collapsed = true;
                                g.attribute.collapseW = g.props.w;
                                g.attribute.collapseH = g.props.h;
                                Designer.setShapeProps({
                                    w: 120,
                                    h: 80
                                }, [g]);
                                l.text("展开")
                            }
                            if (s.length > 0) {
                                Model.updateMulti(s)
                            }
                            Utils.selectShape(g.id);
                            MessageSource.commit()
                        }
                    }])
                } else {
                    if (g.name == "uiGrid") {
                        var j = 1;
                        var c = 1;
                        var d = g.path[2];
                        for (var e = 0; e < d.actions.length - 1; e++) {
                            var b = d.actions[e];
                            if (b.action == "move" && b.x == 0) {
                                j++
                            } else {
                                if (b.action == "move" && b.y == 0) {
                                    c++
                                }
                            }
                        }
                        h(g, [{
                            id: "change_uigrid_row",
                            label: "行：",
                            type: "spinner",
                            value: j,
                            onChange: function (s) {
                                var m = g.path[1].actions;
                                m[2].y = "h/" + s + "+0.5";
                                m[3].y = "h/" + s + "+0.5";
                                var p = [];
                                for (var u = 1; u < s; u++) {
                                    var r = "Math.round(h*" + u + "/" + s + ")+0.5";
                                    p.push({
                                        action: "move",
                                        x: 0,
                                        y: r
                                    });
                                    p.push({
                                        action: "line",
                                        x: "w",
                                        y: r
                                    })
                                }
                                for (var u = 0; u < g.path[2].actions.length; u++) {
                                    var o = g.path[2].actions[u];
                                    if (o.y == 0 || o.y == "h") {
                                        p.push(o)
                                    }
                                }
                                g.path[2].actions = p;
                                var t = 0;
                                var v = 0;
                                if (s > j) {
                                    for (var l = 0; l < g.textBlock.length; l++) {
                                        var n = g.textBlock[l];
                                        n.position.y = "h/" + s + "*" + v;
                                        n.position.h = "h/" + s;
                                        t++;
                                        if (t == c) {
                                            t = 0;
                                            v++
                                        }
                                    }
                                    t = 0;
                                    while (v < s) {
                                        while (t < c) {
                                            var q = {
                                                x: "w/" + c + "*" + t + "+5",
                                                y: "h/" + s + "*" + v,
                                                w: "w/" + c + "-10",
                                                h: "h/" + s
                                            };
                                            g.textBlock.push({
                                                position: q
                                            });
                                            t++
                                        }
                                        t = 0;
                                        v++
                                    }
                                } else {
                                    if (s < j) {
                                        var i = [];
                                        while (v < s) {
                                            while (t < c) {
                                                var l = v * c + t;
                                                var n = g.textBlock[l];
                                                n.position.y = "h/" + s + "*" + v;
                                                n.position.h = "h/" + s;
                                                i.push(n);
                                                t++
                                            }
                                            t = 0;
                                            v++
                                        }
                                        g.textBlock = i
                                    }
                                }
                                Schema.initShapeFunctions(g);
                                Model.update(g);
                                Designer.painter.renderShape(g);
                                j = s
                            }
                        }, {
                            id: "change_uigrid_column",
                            label: "列：",
                            type: "spinner",
                            value: c,
                            onChange: function (r) {
                                var p = [];
                                for (var u = 0; u < g.path[2].actions.length; u++) {
                                    var o = g.path[2].actions[u];
                                    if (o.x == 0 || o.x == "w") {
                                        p.push(o)
                                    } else {
                                        break
                                    }
                                }
                                for (var u = 1; u < r; u++) {
                                    var l = "Math.round(w*" + u + "/" + r + ")+0.5";
                                    p.push({
                                        action: "move",
                                        x: l,
                                        y: 0
                                    });
                                    p.push({
                                        action: "line",
                                        x: l,
                                        y: "h"
                                    })
                                }
                                var s = 0;
                                var v = 0;
                                if (r > c) {
                                    var i = [];
                                    for (var m = 0; m < g.textBlock.length; m++) {
                                        var n = g.textBlock[m];
                                        n.position.x = "w/" + r + "*" + s + "+5";
                                        n.position.w = "w/" + r + "-10";
                                        i.push(n);
                                        s++;
                                        if (s == c) {
                                            while (s < r) {
                                                var q = {
                                                    x: "w/" + r + "*" + s + "+5",
                                                    y: "h/" + j + "*" + v,
                                                    w: "w/" + r + "-10",
                                                    h: "h/" + j
                                                };
                                                var t = {
                                                    position: q
                                                };
                                                if (v == 0) {
                                                    t.text = "标题 " + (s + 1)
                                                }
                                                i.push(t);
                                                s++
                                            }
                                            s = 0;
                                            v++
                                        }
                                    }
                                    g.textBlock = i
                                } else {
                                    if (r < c) {
                                        var i = [];
                                        while (v < j) {
                                            while (s < r) {
                                                var m = v * c + s;
                                                var n = g.textBlock[m];
                                                n.position.x = "w/" + r + "*" + s + "+5";
                                                n.position.w = "w/" + r + "-10";
                                                i.push(n);
                                                s++
                                            }
                                            s = 0;
                                            v++
                                        }
                                        g.textBlock = i
                                    }
                                }
                                g.path[2].actions = p;
                                Schema.initShapeFunctions(g);
                                Model.update(g);
                                Designer.painter.renderShape(g);
                                c = r
                            }
                        }])
                    }
                }
            }
        }
        function h(q, w) {
            var p = $("#shape_opt_box");
            if (p.length == 0) {
                p = $("<div id='shape_opt_box'><div class='shape_opts'></div><div class='ico dlg_close'></div></div>").appendTo("#designer_canvas");
                p.bind("mousedown", function (i) {
                    i.stopPropagation()
                }).bind("mousemove", function (i) {
                    i.stopPropagation()
                });
                p.children(".dlg_close").bind("click", function (i) {
                    p.hide()
                })
            }
            p.show();
            var s = Utils.getShapeBox(q);
            p.css({
                left: s.x + s.w + 10,
                top: s.y,
                "z-index": Model.orderList.length + 1
            });
            var r = p.children(".shape_opts");
            r.empty();
            for (var n = 0; n < w.length; n++) {
                var l = w[n];
                var v = $("<div class='opt'></div>").appendTo(r);
                if (l.type == "spinner") {
                    v.append("<label>" + l.label + "</label>");
                    var t = $("<div class='field'></div>").appendTo(v);
                    var u = $("<div class='spinner active' style='width: 55px;'></div>").appendTo(t);
                    if (l.id) {
                        u.attr("id", l.id)
                    }
                    u.spinner({
                        min: 1,
                        max: typeof l.max != "undefined" ? l.max : 20,
                        step: 1,
                        onChange: l.onChange
                    });
                    u.spinner("setValue", l.value)
                } else {
                    if (l.type == "button") {
                        var m = $("<div class='button_box'></div>").appendTo(v);
                        var o = $("<div class='toolbar_button active'>" + l.value + "</div>").appendTo(m);
                        o.bind("click", function () {
                            l.onClick($(this))
                        })
                    }
                }
            }
        }
    },
    hideShapeOptions: function () {
        $("#shape_opt_box").hide()
    },
    toogleTitleBar: function () {
        var a = $("#bar_collapse").children("div");
        if (a.hasClass("collapse")) {
            a.attr("class", "ico expand");
            $(".titlebar").slideUp(200);
            $(".layout").animate({
                height: $(window).height() - 73
            }, 200);
            $("#bar_return").show();
            return false
        } else {
            a.attr("class", "ico collapse");
            $(".titlebar").slideDown(200);
            $(".layout").animate({
                height: $(window).height() - 143
            }, 200);
            $("#bar_return").hide();
            return true
        }
    },
    showThemeSelect: function () {
        $("#themes").dropdown({
            target: $("#bar_theme")
        });
        if ($("#themes").children(".theme_box").length == 0) {
            for (var d in Schema.themes) {
                var f = Schema.themes[d];
                var e = $("<div theme='" + d + "' class='theme_box'><canvas width='130' height='130'></canvas></div>").appendTo($("#themes"));
                e.bind("click", function () {
                    var g = $(this).attr("theme");
                    UI.setTheme(g)
                });
                var c = e.children("canvas");
                var a = c[0].getContext("2d");
                a.save();
                a.fillStyle = "rgb(" + f.shape.fillStyle.color + ")";
                a.lineWidth = f.shape.lineStyle.lineWidth;
                a.strokeStyle = "rgb(" + f.shape.lineStyle.lineColor + ")";
                a.beginPath();
                a.moveTo(10, 14);
                a.quadraticCurveTo(10, 10, 14, 10);
                a.lineTo(81, 10);
                a.quadraticCurveTo(85, 10, 85, 14);
                a.lineTo(85, 51);
                a.quadraticCurveTo(85, 55, 81, 55);
                a.lineTo(14, 55);
                a.quadraticCurveTo(10, 55, 10, 51);
                a.closePath();
                a.closePath();
                a.fill();
                a.stroke();
                a.beginPath();
                a.moveTo(140, 70);
                a.lineTo(100, 100);
                a.lineTo(140, 130);
                a.closePath();
                a.fill();
                a.stroke();
                a.restore();
                a.fillStyle = "rgb(" + f.linker.lineStyle.lineColor + ")";
                a.lineWidth = f.linker.lineStyle.lineWidth;
                a.strokeStyle = "rgb(" + f.linker.lineStyle.lineColor + ")";
                a.beginPath();
                a.moveTo(47, 56);
                a.lineTo(47, 100);
                a.lineTo(90, 100);
                a.stroke();
                a.beginPath();
                a.moveTo(83, 96);
                a.lineTo(95, 100);
                a.lineTo(83, 104);
                a.closePath();
                a.fill();
                a.stroke();
                a.textAlign = "center";
                a.textBaseline = "middle";
                var b = "";
                if (f.shape.fontStyle.italic) {
                    b += " italic"
                }
                if (f.shape.fontStyle.bold) {
                    b += " bold"
                }
                b += " " + f.shape.fontStyle.size + "px " + f.shape.fontStyle.fontFamily;
                a.font = b;
                a.fillStyle = "rgb(" + f.shape.fontStyle.color + ")";
                a.fillText("流程节点", 47, 32);
                b = "";
                if (f.linker.fontStyle.italic) {
                    b += " italic"
                }
                if (f.linker.fontStyle.bold) {
                    b += " bold"
                }
                b += " " + f.linker.fontStyle.size + "px " + f.linker.fontStyle.fontFamily;
                a.font = b;
                a.fillStyle = "rgb(" + f.linker.fontStyle.color + ")";
                a.clearRect(30, 71, 30, 18);
                a.fillText("是", 47, 80)
            }
        }
        $("#themes").append("<div style='clear:both'></div>")
    },
    setTheme: function (a) {
        var b = Schema.themes[a];
        Model.setTheme(b);
        $("#themes").dropdown("close")
    },
    showTip: function (a, d, c) {
        if (!d) {
            d = "center"
        }
        var b = $("#designer_ui_tip");
        if (b.length == 0) {
            b = $("<div id='designer_ui_tip'><div class='ui_tip_text'></div></div>").appendTo("#designer_viewport");
            b.append("<div class='ico ui_tip_close'></div>");
            b.children(".ui_tip_close").bind("click", function () {
                UI.hideTip()
            })
        }
        if (c) {
            b.children(".ui_tip_close").bind("click.callback", function () {
                c()
            })
        } else {
            b.children(".ui_tip_close").unbind("click.callback")
        }
        b.children(".ui_tip_text").html(a);
        if (d == "center") {
            b.css("left", ($("#designer_viewport").width() - b.outerWidth()) / 2)
        } else {
            b.css("left", "20px")
        }
        b.fadeIn("fast")
    },
    hideTip: function () {
        $("#designer_ui_tip").hide()
    },
    RGB2Hex: function (b) {
        if (b.charAt(0) == "#") {
            return b
        }
        var c = b.split(/\D+/);
        var a = Number(c[1]) * 65536 + Number(c[2]) * 256 + Number(c[3]);
        return "" + UI.toHex(a, 6)
    },
    toHex: function (a, c) {
        var b = a.toString(16);
        while (b.length < c) {
            b = "0" + b
        }
        return b
    },
    hex2RGB: function (d) {
        var c = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if (d && c.test(d)) {
            if (d.length === 4) {
                var e = "#";
                for (var b = 1; b < 4; b += 1) {
                    e += d.slice(b, b + 1).concat(d.slice(b, b + 1))
                }
                d = e
            }
            var a = [];
            for (var b = 1; b < 7; b += 2) {
                a.push(parseInt("0x" + d.slice(b, b + 2)))
            }
            return a.join(",")
        } else {
            return d
        }
    }
};
var Dock = {
    init: function () {
        var a = $("#designer_layout").width();
        var d = $("#layout_block").width();
        var c = a - d;
        $("#dock").css("right", c);
        var e = c + $("#dock").outerWidth() - 1;
        $(".dock_view").css("right", e);
        if ($("#demo_signup").length) {
            var b = $("#demo_signup").outerHeight();
            $("#dock").css("top", b);
            $(".dock_view").css("top", b + 10)
        }
        $(".ico_dock_collapse").bind("click", function () {
            $(".dock_view").hide();
            $(".dock_buttons").children().removeClass("selected");
            if (Dock.currentView == "history") {
                Dock.closeHistory()
            }
            Dock.currentView = "";
            CLB.setConfig("dock", "none")
        });
        $(window).bind("resize.dock", function () {
            if (Dock.currentView == "attribute") {
                Dock.fitAttrList()
            }
        });
        $("#dock_zoom").spinner({
            min: 50,
            max: 200,
            unit: "%",
            step: 10,
            onChange: function (f) {
                Designer.setZoomScale(f / 100)
            }
        });
        $("#dock_line_color").colorButton({
            onSelect: function (f) {
                Designer.setLineStyle({
                    lineColor: f
                })
            }
        });
        $("#dock_line_style").button({
            onMousedown: function () {
                $("#line_style_list").dropdown({
                    target: $("#dock_line_style"),
                    onSelect: function (l) {
                        var j = l.attr("line");
                        Designer.setLineStyle({
                            lineStyle: j
                        });
                        var k = l.children("div").attr("class");
                        $("#dock_line_style").children(".linestyle").attr("class", k)
                    }
                });
                var g = Utils.getSelected()[0];
                var f;
                if (g.name == "linker") {
                    f = Utils.getLinkerLineStyle(g.lineStyle)
                } else {
                    f = Utils.getShapeLineStyle(g.lineStyle)
                }
                var h = f.lineStyle;
                var i = $("#line_style_list").children("li[line=" + h + "]");
                $("#line_style_list").dropdown("select", i)
            }
        });
        $("#dock_line_width").spinner({
            min: 0,
            max: 10,
            unit: "px",
            step: 1,
            onChange: function (f) {
                Designer.setLineStyle({
                    lineWidth: f
                })
            }
        });
        $("#dock_fill_type").button({
            onMousedown: function () {
                $("#dock_fill_list").dropdown({
                    target: $("#dock_fill_type"),
                    onSelect: function (j) {
                        var i = j.attr("ty");
                        $("#dock_fill_type").button("setText", j.text());
                        if (i == "image") {
                            UI.showImageSelect(function (m, l, n) {
                                Designer.setFillStyle({
                                    type: "image",
                                    fileId: m,
                                    imageW: l,
                                    imageH: n
                                })
                            })
                        } else {
                            Designer.setFillStyle({
                                type: i
                            });
                            var k = Utils.getSelectedShapeIds();
                            var h = Model.getShapeById(k[0]);
                            var g = Utils.getShapeFillStyle(h.fillStyle);
                            Dock.setFillStyle(g)
                        }
                    }
                });
                var f = $("#dock_fill_type").text();
                $("#dock_fill_list").children().each(function () {
                    if ($(this).text() == f) {
                        $("#dock_fill_list").dropdown("select", $(this));
                        return false
                    }
                })
            }
        });
        $("#fill_solid_btn").colorButton({
            onSelect: function (f) {
                Designer.setFillStyle({
                    type: "solid",
                    color: f
                })
            }
        });
        $("#fill_gradient_begin").colorButton({
            onSelect: function (f) {
                Designer.setFillStyle({
                    beginColor: f
                });
                $("#fill_gradient_begin").attr("c", f)
            }
        });
        $("#fill_gradient_end").colorButton({
            onSelect: function (f) {
                Designer.setFillStyle({
                    endColor: f
                });
                $("#fill_gradient_end").attr("c", f)
            }
        });
        $("#gradient_swap").button({
            onClick: function () {
                var g = $("#fill_gradient_begin").attr("c");
                var f = $("#fill_gradient_end").attr("c");
                $("#fill_gradient_begin").attr("c", f).colorButton("setColor", f);
                $("#fill_gradient_end").attr("c", g).colorButton("setColor", g);
                Designer.setFillStyle({
                    beginColor: f,
                    endColor: g
                })
            }
        });
        $("#gradient_type").button({
            onMousedown: function () {
                $("#gradient_type_list").dropdown({
                    target: $("#gradient_type"),
                    onSelect: function (j) {
                        var i = j.attr("ty");
                        $("#gradient_type").button("setText", j.text());
                        Designer.setFillStyle({
                            gradientType: i
                        });
                        $(".gradient_details").hide();
                        $("#gradient_type_" + i).show();
                        var k = Utils.getSelectedShapeIds();
                        var h = Model.getShapeById(k[0]);
                        var g = Utils.getShapeFillStyle(h.fillStyle);
                        if (i == "linear") {
                            $("#gradient_angle").spinner("setValue", Math.round(g.angle / Math.PI * 180) + "°")
                        } else {
                            $("#gradient_radius").spinner("setValue", Math.round(g.radius * 100) + "%")
                        }
                    }
                });
                var f = $("#gradient_type").text().trim();
                $("#gradient_type_list").children().each(function () {
                    if ($(this).text() == f) {
                        $("#gradient_type_list").dropdown("select", $(this));
                        return false
                    }
                })
            }
        });
        $("#gradient_angle").spinner({
            min: 0,
            max: 360,
            unit: "°",
            step: 15,
            onChange: function (g) {
                var f = g / 180 * Math.PI;
                Designer.setFillStyle({
                    angle: f
                })
            }
        });
        $("#gradient_radius").spinner({
            min: 0,
            max: 100,
            unit: "%",
            step: 5,
            onChange: function (f) {
                Designer.setFillStyle({
                    radius: f / 100
                })
            }
        });
        $("#fill_change_img").button({
            onClick: function () {
                UI.showImageSelect(function (g, f, i) {
                    Designer.setFillStyle({
                        type: "image",
                        fileId: g,
                        imageW: f,
                        imageH: i
                    })
                })
            }
        });
        $("#fill_img_display").button({
            onMousedown: function () {
                $("#img_display_list").dropdown({
                    target: $("#fill_img_display"),
                    onSelect: function (g) {
                        var f = g.attr("ty");
                        $("#fill_img_display").button("setText", g.text());
                        Designer.setFillStyle({
                            display: f
                        })
                    }
                })
            }
        });
        $("#spinner_opacity").spinner({
            min: 0,
            max: 100,
            unit: "%",
            step: 5,
            onChange: function (f) {
                Designer.setShapeStyle({
                    alpha: f / 100
                })
            }
        });
        $("#dock_metric_x").spinner({
            min: -800,
            unit: "px",
            step: 5,
            onChange: function (f) {
                Designer.setShapeProps({
                    x: f
                })
            }
        });
        $("#dock_metric_x").spinner("setValue", "0px");
        $("#dock_metric_w").spinner({
            min: 20,
            unit: "px",
            step: 5,
            onChange: function (f) {
                Designer.setShapeProps({
                    w: f
                })
            }
        });
        $("#dock_metric_y").spinner({
            min: -800,
            unit: "px",
            step: 5,
            onChange: function (f) {
                Designer.setShapeProps({
                    y: f
                })
            }
        });
        $("#dock_metric_y").spinner("setValue", "0px");
        $("#dock_metric_h").spinner({
            min: 20,
            unit: "px",
            step: 5,
            onChange: function (f) {
                Designer.setShapeProps({
                    h: f
                })
            }
        });
        $("#dock_metric_angle").spinner({
            min: 0,
            max: 360,
            unit: "°",
            step: 15,
            onChange: function (g) {
                var f = g / 180 * Math.PI;
                Designer.setShapeProps({
                    angle: f
                })
            }
        });
        $("#dock_page_size").button({
            onMousedown: function () {
                $("#page_size_list").dropdown({
                    target: $("#dock_page_size"),
                    onSelect: function (j) {
                        var g = parseInt(j.attr("w"));
                        var i = parseInt(j.attr("h"));
                        Designer.setPageStyle({
                            width: g,
                            height: i
                        });
                        $("#dock_page_size").button("setText", j.text())
                    }
                });
                var f = $("#page_size_list").children("li[w=" + Model.define.page.width + "][h=" + Model.define.page.height + "]");
                if (f.length > 0) {
                    $("#page_size_list").dropdown("select", f)
                } else {
                    $("#page_size_list").dropdown("select", $("#dock_size_custom"))
                }
                $("#dock_size_w").spinner("setValue", Model.define.page.width + "px");
                $("#dock_size_h").spinner("setValue", Model.define.page.height + "px")
            }
        });
        $("#dock_size_w").spinner({
            min: 200,
            unit: "px",
            step: 100,
            onChange: function (f) {
                Designer.setPageStyle({
                    width: f
                })
            }
        });
        $("#dock_size_h").spinner({
            min: 200,
            unit: "px",
            step: 100,
            onChange: function (f) {
                Designer.setPageStyle({
                    height: f
                })
            }
        });
        $("#dock_page_padding").button({
            onMousedown: function () {
                $("#page_padding_list").dropdown({
                    target: $("#dock_page_padding"),
                    onSelect: function (g) {
                        var h = parseInt(g.attr("p"));
                        Designer.setPageStyle({
                            padding: h
                        });
                        $("#dock_page_padding").button("setText", g.text())
                    }
                });
                var f = $("#page_padding_list").children("li[p=" + Model.define.page.padding + "]");
                $("#page_padding_list").dropdown("select", f)
            }
        });
        $("#dock_page_color").colorButton({
            position: "center",
            onSelect: function (f) {
                Designer.setPageStyle({
                    backgroundColor: f
                })
            }
        });
        $(".dock_page_ori_list").children("input").unbind().bind("click", function () {
            var f = $(this).val();
            Designer.setPageStyle({
                orientation: f
            })
        });
        $("#dock_page_showgrid").bind("change", function () {
            var f = $(this).is(":checked");
            Designer.setPageStyle({
                showGrid: f
            });
            if (f) {
                $("#dock_gridsize_box").show()
            } else {
                $("#dock_gridsize_box").hide()
            }
        });
        $("#dock_page_gridsize").button({
            onMousedown: function () {
                $("#page_gridsize_list").dropdown({
                    target: $("#dock_page_gridsize"),
                    onSelect: function (h) {
                        var g = parseInt(h.attr("s"));
                        Designer.setPageStyle({
                            gridSize: g
                        });
                        $("#dock_page_gridsize").button("setText", h.text())
                    }
                });
                var f = $("#page_gridsize_list").children("li[s=" + Model.define.page.gridSize + "]");
                $("#page_gridsize_list").dropdown("select", f)
            }
        });
        $("#btn_history_add").button({
            onClick: function () {
                Dock.toggleAddHistory()
            }
        });
        $("#btn_history_restore").button({
            onClick: function () {
                Dock.restoreVersion()
            }
        });
        $("#txt_sub_comment").bind("keyup", function (j) {
            if (j.keyCode == 13) {
                var f = $(this);
                var i = f.val().replace(/\n/g, "");
                if (i.trim() == "") {
                    return
                }
                var l = "";
                var h = Utils.getSelectedShapeIds();
                if (h.length == 1) {
                    l = h[0]
                }
                var k = {
                    action: "comment",
                    userId: userId,
                    id: Utils.newId(),
                    name: userName,
                    content: i,
                    shapeId: l,
                    replyId: ""
                };
                CLB.send(k);
                Dock.appendComment(k);
                Dock.bindComment();
                $("#comment_container").scrollTop(9999);
                f.val("");
                if (!Model.comments) {
                    Model.comments = []
                }
                Model.comments.push(k);
                if (l != "") {
                    var g = Model.getShapeById(l);
                    Designer.painter.renderShape(g)
                }
            }
        });
        $("#show_comment_ico").bind("click", function (h) {
            var f = $("#show_comment_ico").is(":checked");
            CLB.setConfig("showCommentIco", f);
            showCommentIco = f;
            for (var i in Model.define.elements) {
                var g = Model.getShapeById(i);
                if (g.name != "linker") {
                    Designer.painter.renderShape(g)
                }
            }
        });
        if (dock != "none") {
            if (dock == "") {
                dock = "navigator"
            }
            this.showView(dock)
        }
    },
    currentView: "",
    showView: function (a, b) {
        if ($("#dock_btn_" + a).button("isDisabled")) {
            return
        }
        $(".dock_view").hide();
        $(".dock_view_" + a).show();
        $(".dock_buttons").children().removeClass("selected");
        $("#dock_btn_" + a).addClass("selected");
        if (Dock.currentView == "history" && a != "history") {
            Dock.closeHistory()
        }
        this.currentView = a;
        this.update(true);
        if (b) {
            CLB.setConfig("dock", a)
        }
    },
    setFillStyle: function (a) {
        $("#dock_fill_type").button("setText", $("#dock_fill_list").children("li[ty=" + a.type + "]").text());
        $(".fill_detail").hide();
        if (a.type == "solid") {
            $(".fill_detail_solid").show();
            $("#fill_solid_btn").colorButton("setColor", a.color)
        } else {
            if (a.type == "gradient") {
                $(".fill_detail_gradient").show();
                $("#fill_gradient_begin").attr("c", a.beginColor).colorButton("setColor", a.beginColor);
                $("#fill_gradient_end").attr("c", a.endColor).colorButton("setColor", a.endColor);
                $("#gradient_type").button("setText", $("#gradient_type_list").children("li[ty=" + a.gradientType + "]").text());
                $(".gradient_details").hide();
                if (a.gradientType == "linear") {
                    $("#gradient_type_linear").show();
                    $("#gradient_angle").spinner("setValue", Math.round(a.angle / Math.PI * 180) + "°")
                } else {
                    $("#gradient_type_radial").show();
                    $("#gradient_radius").spinner("setValue", Math.round(a.radius * 100) + "%")
                }
            } else {
                if (a.type == "image") {
                    $(".fill_detail_image").show();
                    var b = "fill";
                    if (a.display) {
                        b = a.display
                    }
                    $("#fill_img_display").button("setText", $("#img_display_list").children("li[ty=" + b + "]").text())
                }
            }
        }
    },
    update: function (o) {
        if (this.currentView == "navigator") {
            if (o) {
                Navigator.draw()
            }
            $("#dock_zoom").spinner("setValue", Math.round(Designer.config.scale * 100) + "%")
        } else {
            if (this.currentView == "graphic") {
                var l = Utils.getSelectedIds();
                var k = l.length;
                var i = Utils.getSelectedShapeIds();
                var r = i.length;
                if (k == 0) {
                    $("#dock_line_color").button("disable");
                    $("#dock_line_style").button("disable");
                    $("#dock_line_width").button("disable")
                } else {
                    $("#dock_line_color").button("enable");
                    $("#dock_line_style").button("enable");
                    $("#dock_line_width").button("enable");
                    var m = Model.getShapeById(l[0]);
                    var j;
                    if (m.name == "linker") {
                        j = Utils.getLinkerLineStyle(m.lineStyle)
                    } else {
                        j = Utils.getShapeLineStyle(m.lineStyle)
                    }
                    $("#dock_line_color").colorButton("setColor", j.lineColor);
                    var f = $("#line_style_list").children("li[line=" + j.lineStyle + "]").children().attr("class");
                    $("#dock_line_style").children(".linestyle").attr("class", f);
                    $("#dock_line_width").spinner("setValue", j.lineWidth + "px")
                }
                if (r == 0) {
                    $("#dock_fill_type").button("disable");
                    $("#spinner_opacity").button("disable");
                    Dock.setFillStyle({
                        type: "none"
                    })
                } else {
                    $("#dock_fill_type").button("enable");
                    $("#spinner_opacity").button("enable");
                    var m = Model.getShapeById(i[0]);
                    var q = Utils.getShapeFillStyle(m.fillStyle);
                    Dock.setFillStyle(q);
                    $("#spinner_opacity").spinner("setValue", Math.round(m.shapeStyle.alpha / 1 * 100) + "%")
                }
            } else {
                if (this.currentView == "metric") {
                    var i = Utils.getSelectedShapeIds();
                    var r = i.length;
                    if (r == 0) {
                        $("#dock_metric_x").button("disable");
                        $("#dock_metric_w").button("disable");
                        $("#dock_metric_y").button("disable");
                        $("#dock_metric_h").button("disable");
                        $("#dock_metric_angle").button("disable")
                    } else {
                        var m = Model.getShapeById(i[0]);
                        $("#dock_metric_x").button("enable").spinner("setValue", Math.round(m.props.x) + "px");
                        $("#dock_metric_w").button("enable").spinner("setValue", Math.round(m.props.w) + "px");
                        $("#dock_metric_y").button("enable").spinner("setValue", Math.round(m.props.y) + "px");
                        $("#dock_metric_h").button("enable").spinner("setValue", Math.round(m.props.h) + "px");
                        $("#dock_metric_angle").button("enable").spinner("setValue", Math.round(m.props.angle / Math.PI * 180) + "°")
                    }
                } else {
                    if (this.currentView == "page") {
                        var n = Model.define.page;
                        var p = n.width;
                        var g = n.height;
                        var e = $("#page_size_list").children("li[w=" + p + "][h=" + g + "]");
                        var d = "";
                        if (e.length > 0) {
                            d = e.text()
                        } else {
                            d = $("#dock_size_custom").text()
                        }
                        $("#dock_page_size").button("setText", d);
                        $("#dock_page_padding").button("setText", n.padding + "px");
                        $("#dock_page_color").colorButton("setColor", n.backgroundColor);
                        $("#dock_page_showgrid").attr("checked", n.showGrid);
                        if (n.showGrid) {
                            $("#dock_gridsize_box").show()
                        } else {
                            $("#dock_gridsize_box").hide()
                        }
                        var b = "";
                        var c = $("#page_gridsize_list").children("li[s=" + n.gridSize + "]");
                        if (c.length > 0) {
                            var b = c.text()
                        }
                        $("#dock_page_gridsize").button("setText", b);
                        var a = "portrait";
                        if (Model.define.page.orientation) {
                            a = Model.define.page.orientation
                        }
                        $(".dock_page_ori_list").children("input[value=" + a + "]").attr("checked", true)
                    } else {
                        if (this.currentView == "attribute") {
                            var l = Utils.getSelectedIds();
                            var k = l.length;
                            if (k != 1) {
                                $(".attr_list").html("<li class='attr_none'>选择一个图形后，在这里查看数据属性</li>");
                                $(".attr_add").hide();
                                this.fitAttrList()
                            } else {
                                this.setAttributeList();
                                $(".attr_add").show();
                                this.cancelAttrAdd()
                            }
                        } else {
                            if (this.currentView == "history") {
                                if (o && Dock.historyVersions == null) {
                                    this.loadHistorys()
                                }
                            } else {
                                if (this.currentView == "comment") {
                                    this.loadComments();
                                    if (showCommentIco) {
                                        $("#show_comment_ico").attr("checked", true)
                                    } else {
                                        $("#show_comment_ico").attr("checked", false)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    historyVersions: null,
    loadHistorys: function () {
        if (chartId == "") {
            $("#history_container").html("<div style='padding: 20px 10px;'>您正在试用状态，无法浏览历史版本</div>");
            return
        }
        $.ajax({
            url: "/diagraming/history",
            data: {
                chartId: chartId
            },
            success: function (a) {
                Dock.historyVersions = "loaded";
                $("#history_container").html(a);
                Dock.resetVersions();
                Dock.initRemoveHistory()
            }
        })
    },
    resetVersions: function () {
        if ($("#history_versions").length == 0) {
            return
        }
        $("#history_versions").children("li").unbind().bind("click", function () {
            if ($(this).hasClass("selected")) {
                Dock.closeHistory()
            } else {
                $("#history_versions").children(".selected").removeClass("selected");
                $(this).addClass("selected");
                var d = $(this).attr("def");
                Dock.showHistoryVersion(d)
            }
            var e = $("#history_versions").children(".selected");
            if (e.length != 0 && e.attr("ind") != "0") {
                $("#btn_history_restore").button("enable")
            } else {
                $("#btn_history_restore").button("disable")
            }
        });
        $("#history_versions").height("auto");
        var c = $("#history_versions").offset().top;
        var b = c + $("#history_versions").height() + 75;
        if (b > $(window).height()) {
            var a = $(window).height() - c - 75;
            if (a < 140) {
                a = 140
            }
            $("#history_versions").height(a)
        } else {
            $("#history_versions").height("auto")
        }
        $("#history_versions").scrollTop(0)
    },
    toggleAddHistory: function () {
        $(".area_history").toggle();
        if ($("#area_history_add").is(":visible")) {
            $("#history_remark").focus()
        }
    },
    addHistory: function () {
        if (chartId != "") {
            var b = $("#history_remark").val();
            var a = {
                action: "addHistory",
                remark: b
            };
            CLB.sendDirectly(a, function () {
                Dock.loadHistorys();
                $("#history_remark").val("");
                Dock.toggleAddHistory()
            })
        }
    },
    initRemoveHistory: function () {
        function a() {
            $(".dock_history_remove_div").find("span:first").off().on("click", function (c) {
                var b = $(this).parents("li").attr("vid");
                if (chartId != "") {
                    var d = {
                        action: "removeHistory",
                        vid: b
                    };
                    CLB.sendDirectly(d, function () {
                        Dock.loadHistorys()
                    })
                }
                c.stopPropagation()
            });
            $(".dock_history_remove_div").find("span:last").off().on("click", function (b) {
                $(".dock_history_remove_con").remove();
                b.stopPropagation()
            })
        }
        $(".dock_history_remove").off().on("click", function (f) {
            $(".dock_history_remove_con").remove();
            var c = $(this).parent().parent();
            var b = c.attr("vid");
            var d = $("<div class='dock_history_remove_con'><div class='dock_history_remove_div'>确认删除此历史版本？<div style='margin-top:8px;'><span class='toolbar_button active'>确定</span>&nbsp;&nbsp;<span class='toolbar_button active'>取消</span></div></div></div>");
            d.appendTo(c);
            a();
            f.stopPropagation()
        })
    },
    showHistoryVersion: function (a) {
        $("#btn_history_restore").button("disable");
        $.ajax({
            url: "/diagraming/getdefinition",
            data: {
                definitionId: a
            },
            success: function (b) {
                Dock.openHistory(b.definition);
                $("#btn_history_restore").button("enable");
                UI.showTip("您在正浏览一个历史版本<a href='javascript:' style='margin-left: 10px;color:#0080FF' onclick='Dock.closeHistory()'>返回工作状态</a>")
            }
        })
    },
    currentDefinition: null,
    openHistory: function (a) {
        if (this.currentDefinition == null) {
            this.currentDefinition = $.extend(true, {}, Model.define)
        }
        Utils.unselect();
        Designer.open(a);
        Designer.hotkey.cancel();
        Designer.op.cancel();
        $("#menu_bar").children().addClass("readonly");
        $(".diagram_title").addClass("readonly");
        $(".dock_buttons").children().addClass("disabled");
        $("#dock_btn_history").removeClass("disabled");
        $(".panel_box").addClass("readonly");
        CLB.stopListen()
    },
    closeHistory: function () {
        if (this.currentDefinition != null) {
            Designer.open(this.currentDefinition);
            this.currentDefinition = null;
            this.activeOperation();
            UI.hideTip()
        }
    },
    activeOperation: function () {
        Designer.hotkey.init();
        Designer.op.init();
        $("#menu_bar").children().removeClass("readonly");
        $(".diagram_title").removeClass("readonly");
        $(".dock_buttons").children().removeClass("disabled");
        $("#dock_btn_history").removeClass("disabled");
        $(".panel_box").removeClass("readonly");
        $("#history_versions").children(".selected").removeClass("selected");
        $("#btn_history_restore").button("disable");
        CLB.startListen()
    },
    restoreVersion: function () {
        var d = $("#history_versions").children(".selected");
        if (d.length) {
            MessageSource.beginBatch();
            var e = Dock.currentDefinition.elements;
            var f = [];
            if (e) {
                for (var h in e) {
                    f.push(e[h])
                }
            }
            MessageSource.send("remove", f);
            var b = {
                page: Utils.copy(Dock.currentDefinition.page),
                update: Utils.copy(Model.define.page)
            };
            MessageSource.send("updatePage", b);
            var a = Model.define.elements;
            var c = [];
            if (a) {
                for (var h in a) {
                    c.push(a[h])
                }
            }
            MessageSource.send("create", c);
            var g = {
                theme: Utils.copy(Dock.currentDefinition.theme),
                update: Utils.copy(Model.define.theme)
            };
            MessageSource.send("setTheme", g);
            MessageSource.commit();
            Dock.activeOperation();
            UI.hideTip()
        }
    },
    currentCommentId: "-1",
    commentOperate: "",
    loadComments: function () {
        if (this.commentOperate == "viewing_comment") {
            return
        }
        var d = $("#comment_container");
        var c = Utils.getSelectedShapeIds();
        var e;
        if (c.length == 1) {
            e = c[0]
        } else {
            e = ""
        }
        if (this.currentCommentId != e) {
            this.currentCommentId = e;
            if (!Model.comments || Model.comments.length == 0) {
                d.html("<div class='comment_none'>暂时没有评论</div>")
            } else {
                d.empty();
                for (var b = 0; b < Model.comments.length; b++) {
                    var a = Model.comments[b];
                    if (a.shapeId == e || e == "") {
                        Dock.appendComment(a)
                    }
                }
                Dock.bindComment();
                Dock.fitComments()
            }
        }
    },
    bindComment: function () {
        var a = $("#comment_container");
        a.find("input").unbind("click").bind("click", function (b) {
            b.stopPropagation()
        });
        a.find(".input_comment_reply").unbind("keydown").bind("keydown", function (d) {
            if (d.keyCode == 13) {
                var c = $(this).val();
                if (c == "") {
                    return
                }
                $(this).val("");
                var b = $(this).parent().parent().parent().attr("id");
                var f = {
                    action: "comment",
                    userId: userId,
                    id: Utils.newId(),
                    name: userName,
                    content: c,
                    shapeId: "",
                    replyId: b
                };
                CLB.send(f);
                Dock.appendComment(f);
                Dock.bindComment()
            }
            Dock.fitComments()
        });
        a.find(".comment_remove").unbind("click").bind("click", function (g) {
            g.stopPropagation();
            $(this).parent().remove();
            var k = $(this).parent().attr("id");
            var h = {
                action: "removeComment",
                id: k
            };
            CLB.send(h);
            Dock.fitComments();
            var f = [];
            for (var d = 0; d < Model.comments.length; d++) {
                var c = Model.comments[d];
                if (c.id != k && c.replyId != k) {
                    f.push(c)
                }
            }
            Model.comments = f;
            var j = $(this).parent().attr("shapeId");
            var b = Model.getShapeById(j);
            if (b != null && b.name != "linker") {
                Designer.painter.renderShape(b)
            }
        });
        a.children(".comment_item_outer").unbind().bind("click", function () {
            if ($(this).hasClass("selected")) {
                $(this).removeClass("selected")
            } else {
                a.children(".selected").removeClass("selected");
                $(this).addClass("selected")
            }
            var c = $(this).attr("shapeId");
            Dock.commentOperate = "viewing_comment";
            if (c) {
                var b = Model.getShapeById(c);
                if (b != null) {
                    Utils.selectShape(c)
                }
            }
            Dock.fitComments();
            Dock.commentOperate = ""
        })
    },
    fitComments: function () {
        var c = $("#comment_container");
        var e = c.scrollTop();
        c.height("auto");
        var d = c.offset().top;
        var b = d + c.height() + 145;
        if (b > $(window).height()) {
            var a = $(window).height() - d - 145;
            if (a < 120) {
                a = 120
            }
            c.height(a)
        } else {
            c.height("auto")
        }
        c.scrollTop(e)
    },
    appendComment: function (a) {
        $(".comment_none").remove();
        var b = $("<div class='comment_item' id='" + a.id + "'></div>").appendTo(e);
        if (a.replyId) {
            var e = $("#comment_container").children("#" + a.replyId + ".comment_item").find(".comment_reply_list");
            b = $("<div class='comment_item comment_item_inner' id='" + a.id + "'></div>").appendTo(e)
        } else {
            var e = $("#comment_container");
            b = $("<div class='comment_item comment_item_outer' id='" + a.id + "'></div>").appendTo(e)
        }
        if (role == "owner" || a.userId == userId) {
            b.append("<div class='ico comment_remove' disableTitle='true' title='删除'></div>")
        }
        if (a.shapeId) {
            b.attr("shapeId", a.shapeId)
        }
        b.append("<img src='/photo/" + a.userId + ".png'/>");
        var c = $("<div class='comment_content_box'></div>").appendTo(b);
        c.append("<div class='comment_name'>" + a.name + "</div>");
        c.append("<div class='comment_content'>" + a.content + "</div>");
        var g = new Date();
        if (a.time) {
            g.setTime(a.time)
        }
        var f = g.format(dateFormat);
        c.append("<div class='comment_date'>" + f + "</div>");
        if (!a.replyId) {
            c.append("<div class='comment_reply_list'></div>");
            c.append("<div class='comment_reply'><input type='text' class='input_text input_comment_reply' placeholder='回复此评论...'/></div>")
        }
        Dock.fitComments()
    },
    setAttributeList: function () {
        var c = Utils.getSelectedIds();
        var b = Model.getShapeById(c[0]);
        $(".attr_list").empty();
        if (b.dataAttributes) {
            for (var d = 0; d < b.dataAttributes.length; d++) {
                var a = b.dataAttributes[d];
                var f = $("#attr_add_type").children("option[value=" + a.type + "]").text();
                var e = $("<li id='" + a.id + "' class='attr_item attr_item_" + a.id + "' onclick=\"Dock.editAttr('" + a.id + "')\"><div class='attr_name'>" + a.name + "</div><div class='attr_type'>" + f + "</div><div class='attr_value'>" + a.value + "</div><div style='clear: both'></div></li>").appendTo($(".attr_list"));
                if (a.category != "default") {
                    e.append("<div class='ico ico_attr_delete' onclick=\"Dock.deleteAttr('" + a.id + "', event)\"></div>")
                }
            }
        }
        this.fitAttrList()
    },
    fitAttrList: function () {
        var b = $(".attr_list").scrollTop();
        $(".attr_list").height("auto");
        var d = $(".attr_list").offset().top;
        var c = d + $(".attr_list").height() + 10;
        if (c > $(window).height()) {
            var a = $(window).height() - d - 10;
            if (a < 140) {
                a = 140
            }
            $(".attr_list").height(a)
        } else {
            $(".attr_list").height("auto")
        }
        $(".attr_list").scrollTop(b)
    },
    showAttrAdd: function () {
        $("#attr_add_btn").hide();
        $(".attr_add_items").show();
        $("#attr_add_name").val("").focus();
        $("#attr_add_type").val("string");
        $("#attr_add_type").unbind().bind("change", function () {
            Dock.setAttrValueInput(null, $(this).val())
        });
        Dock.setAttrValueInput(null, "string");
        this.fitAttrList()
    },
    saveAttrAdd: function () {
        var a = $("#attr_add_name").val();
        if (a == "") {
            $("#attr_add_name").focus();
            return
        }
        var b = $("#attr_add_type").val();
        var c = $("#attr_add_value_arera").children().val();
        var d = {
            name: a,
            type: b,
            value: c
        };
        Designer.addDataAttribute(d);
        this.setAttributeList();
        this.showAttrAdd()
    },
    cancelAttrAdd: function () {
        $("#attr_add_btn").show();
        $(".attr_add_items").hide();
        this.fitAttrList()
    },
    editAttr: function (f) {
        var m = $(".attr_item_" + f);
        if (m.hasClass("attr_editing")) {
            return
        }
        if ($(".attr_editing").length > 0) {
            var c = $(".attr_editing").attr("id");
            this.saveAttrEdit(c)
        }
        m = $(".attr_item_" + f);
        m.addClass("attr_editing");
        var g = Designer.getDataAttrById(f);
        var j = this.setAttrValueInput(g, g.type);
        j.val(g.value).select();
        if (g.category != "default") {
            var h = m.children(".attr_name");
            h.empty();
            var l = $("<input type='text' class='input_text' style='width: 88px'/>").appendTo(h);
            l.val(g.name).select();
            var b = m.children(".attr_type");
            b.empty();
            var i = $("<select class='input_select' style='width: 60px'></select>").appendTo(b);
            i.html($("#attr_add_type").html()).val(g.type);
            i.bind("change", function () {
                Dock.setAttrValueInput(g, $(this).val())
            })
        }
        var k = $("<div class='attr_edit_display'></div>").appendTo(m);
        k.append("<div class='dock_label'>显示为：</div>");
        k.append("<div id='attr_edit_showtype' class='toolbar_button active btn_inline' style='width: 75px;'><div class='text_content'></div><div class='ico ico_dropdown'></div></div>");
        k.append("<div style='clear: both'></div>");
        k.append("<div class='attr_display_options'></div>");
        this.appendDisplayItems();
        var e = "none";
        if (g.showType) {
            e = g.showType
        }
        this.setAttrDisplay(e);
        $("#attr_edit_showtype").attr("ty", e).button({
            onMousedown: function () {
                $("#attr_display_list").dropdown({
                    target: $("#attr_edit_showtype"),
                    onSelect: function (p) {
                        var o = p.attr("ty");
                        $("#attr_edit_showtype").attr("ty", o).button("setText", p.text());
                        Dock.setAttrDisplay(o)
                    }
                });
                var n = $("#attr_edit_showtype").text().trim();
                $("#attr_display_list").children().each(function () {
                    if ($(this).text() == n) {
                        $("#attr_display_list").dropdown("select", $(this));
                        return false
                    }
                })
            }
        });
        $("#attr_edit_showtype").attr("ty", e).button("setText", $("#attr_display_list").children("li[ty=" + e + "]").html());
        if (e != "none") {
            $("#attr_display_name").attr("checked", g.showName);
            if (e == "icon") {
                this.setAttrIcon(g.icon)
            }
        }
        var a = "mostright";
        if (g.horizontal) {
            a = g.horizontal
        }
        var d = "mostbottom";
        if (g.vertical) {
            d = g.vertical
        }
        $("#attr_location_h").button("setText", $("#attr_location_h_list").children("li[loc=" + a + "]").html());
        $("#attr_location_h").attr("loc", a);
        $("#attr_location_v").button("setText", $("#attr_location_v_list").children("li[loc=" + d + "]").html());
        $("#attr_location_v").attr("loc", d);
        m.append("<div class='attr_edit_btns'><div id='save_edit_attr' class='toolbar_button active'>确定</div><div id='cancel_edit_attr' class='toolbar_button active' style='margin-left: 5px;'>取消</div></div>");
        $("#save_edit_attr").bind("click", function (n) {
            n.stopPropagation();
            Dock.saveAttrEdit(f)
        });
        $("#cancel_edit_attr").bind("click", function (n) {
            n.stopPropagation();
            Dock.setAttributeList()
        })
    },
    setAttrValueInput: function (c, e) {
        var b;
        if (c != null) {
            b = $(".attr_editing").children(".attr_value")
        } else {
            b = $("#attr_add_value_arera")
        }
        b.empty();
        var a;
        if (e == "boolean") {
            a = $("<select class='input_select'><option value=''></option><option value='true'>true</option><option value='false'>false</option></select>").appendTo(b)
        } else {
            if (e == "list") {
                a = $("<select class='input_select'></select>").appendTo(b);
                if (c.listItems) {
                    for (var d = 0; d < c.listItems.length; d++) {
                        var f = c.listItems[d];
                        a.append("<option value='" + f + "'>" + f + "</option>")
                    }
                }
            } else {
                a = $("<input type='text' class='input_text'/>").appendTo(b)
            }
        }
        if (c == null) {
            b.children().css("width", "260px")
        } else {
            b.children().css("width", "128px")
        }
        return a
    },
    appendDisplayItems: function () {
        var e = $(".attr_display_options");
        var f = $("<div class='opt_area'></div>").appendTo(e);
        f.append("<input id='attr_display_name' type='checkbox'/><label for='attr_display_name'>显示属性名</label>");
        var d = $("<div id='attr_icon_area' style='padding-top:5px;'></div>").appendTo(f);
        d.append("<div class='dock_label'>图标：</div>");
        d.append("<div id='attr_display_icon' ico='' class='toolbar_button active btn_inline' style='width: 50px'><div class='text_content'></div><div class='ico ico_dropdown'></div></div>");
        d.append("<div style='clear: both'></div>");
        if ($("#attr_icon_list").children("li").html() == "") {
            var b = "";
            var a = 1;
            while (a <= 49) {
                if (a == 30) {
                    b += "<div></div>"
                }
                b += "<div onmousedown='Dock.setAttrIcon(" + a + ")' class='attr_icon_item'></div>";
                a++
            }
            $("#attr_icon_list").children("li").html(b)
        }
        var c = $("<div class='opt_area location_area'></div>").appendTo(e);
        c.append("<div>显示位置：</div>");
        c.append("<div class='dock_label'>水平：</div>");
        c.append("<div id='attr_location_h' class='toolbar_button active btn_inline' loc='mostright'><div class='text_content location_content'><div><span style='left: 11px'></span></div>Most Right</div><div class='ico ico_dropdown'></div></div>");
        c.append("<div style='clear: both'></div>");
        c.append("<div class='dock_label'>垂直：</div>");
        c.append("<div id='attr_location_v' class='toolbar_button active btn_inline' loc='mostbottom'><div class='text_content location_content'><div><span style='top: 11px'></span></div>Most Bottom</div><div class='ico ico_dropdown'></div></div>");
        c.append("<div style='clear: both'></div>");
        e.append("<div style='clear: both'></div>");
        $("#attr_display_icon").button({
            onMousedown: function () {
                $("#attr_icon_list").dropdown({
                    target: $("#attr_display_icon")
                })
            }
        });
        $("#attr_location_h").button({
            onMousedown: function () {
                $("#attr_location_h_list").dropdown({
                    target: $("#attr_location_h"),
                    onSelect: function (g) {
                        $("#attr_location_h").button("setText", g.html());
                        $("#attr_location_h").attr("loc", g.attr("loc"))
                    }
                })
            }
        });
        $("#attr_location_v").button({
            onMousedown: function () {
                $("#attr_location_v_list").dropdown({
                    target: $("#attr_location_v"),
                    onSelect: function (g) {
                        $("#attr_location_v").button("setText", g.html());
                        $("#attr_location_v").attr("loc", g.attr("loc"))
                    }
                })
            }
        })
    },
    setAttrDisplay: function (a) {
        if (a == "none") {
            $(".attr_display_options").hide()
        } else {
            $(".attr_display_options").show();
            if (a == "icon") {
                $("#attr_icon_area").show()
            } else {
                $("#attr_icon_area").hide()
            }
        }
    },
    setAttrIcon: function (a) {
        $("#attr_display_icon").attr("ico", a).button("setText", "");
        if (a) {
            $("#attr_display_icon").button("setText", "<img src='/images/data-attr/" + a + ".png'/>")
        }
    },
    saveAttrEdit: function (f) {
        var j = $(".attr_item_" + f);
        if (!j.hasClass("attr_editing")) {
            return
        }
        var i = Designer.getDataAttrById(f);
        if (i.category != "default") {
            var a = j.children(".attr_name").children("input").val();
            if (a == "") {
                j.children(".attr_name").children("input").focus();
                return
            }
            i.name = a;
            i.type = j.children(".attr_type").children("select").val()
        }
        i.value = j.children(".attr_value").children().val();
        var d = $("#attr_edit_showtype").attr("ty");
        i.showType = d;
        if (d != "none") {
            i.showName = $("#attr_display_name").is(":checked");
            i.horizontal = $("#attr_location_h").attr("loc");
            i.vertical = $("#attr_location_v").attr("loc");
            if (d == "icon") {
                i.icon = $("#attr_display_icon").attr("ico")
            }
        }
        var g = Utils.getSelectedIds();
        var h = Model.getShapeById(g[0]);
        if (i.category == "default" && h.category == "bpmn") {
            if (!h.attribute) {
                h.attribute = {}
            }
            if (!h.attribute.markers) {
                h.attribute.markers = []
            }
            var c = h.attribute.markers;
            if (i.name == "loopCharacteristics" || i.name == "循环特征") {
                Utils.removeFromArray(c, "loop");
                Utils.removeFromArray(c, "sequential");
                Utils.removeFromArray(c, "parallel");
                if (i.value == "StandardLoopCharacteristics" || i.value == "标准") {
                    Utils.addToArray(c, "loop")
                } else {
                    if (i.value == "MultipleLoopCharacteristics" || i.value == "多例") {
                        var b = Designer.getDefaultDataAttrByName("isSequantial");
                        if (b == null) {
                            b = Designer.getDefaultDataAttrByName("是否为序列")
                        }
                        if (b != null) {
                            if (b.value == "true") {
                                Utils.addToArray(c, "sequential")
                            } else {
                                Utils.addToArray(c, "parallel")
                            }
                        }
                    }
                }
            } else {
                if (i.name == "isSequantial" || i.name == "是否为序列") {
                    Utils.removeFromArray(c, "sequential");
                    Utils.removeFromArray(c, "parallel");
                    var e = Designer.getDefaultDataAttrByName("loopCharacteristics");
                    if (e == null) {
                        e = Designer.getDefaultDataAttrByName("循环特征")
                    }
                    if (e != null && (e.value == "MultipleLoopCharacteristics" || e.value == "多例")) {
                        if (i.value == "true") {
                            Utils.addToArray(c, "sequential")
                        } else {
                            Utils.addToArray(c, "parallel")
                        }
                    }
                } else {
                    if (i.name == "isForCompensation" || i.name == "是否为补偿") {
                        Utils.removeFromArray(c, "compensation");
                        if (i.value == "true") {
                            Utils.addToArray(c, "compensation")
                        }
                    } else {
                        if (i.name == "isCollection" || i.name == "participantMultiplicity" || i.name == "是否为集合" || i.name == "多重参与者") {
                            Utils.removeFromArray(c, "parallel");
                            if (i.value == "true") {
                                Utils.addToArray(c, "parallel")
                            }
                        } else {
                            if (i.name == "loopType" || i.name == "循环类型") {
                                Utils.removeFromArray(c, "loop");
                                Utils.removeFromArray(c, "sequential");
                                Utils.removeFromArray(c, "parallel");
                                if (i.value == "Standard" || i.value == "标准") {
                                    Utils.addToArray(c, "loop")
                                } else {
                                    if (i.value == "MultiInstanceSequential" || i.value == "实例化多例序列") {
                                        Utils.addToArray(c, "sequential")
                                    } else {
                                        if (i.value == "MultiInstanceParallel" || i.value == "实例化多例并行") {
                                            Utils.addToArray(c, "parallel")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Designer.updateDataAttribute(i);
        this.setAttributeList()
    },
    deleteAttr: function (c, b) {
        b.stopPropagation();
        var a = $(".attr_item_" + c);
        a.remove();
        this.fitAttrList();
        Designer.deleteDataAttribute(c)
    },
    fullScreen: function (a, b) {
        if (a.requestFullscreen) {
            a.requestFullscreen()
        } else {
            if (a.mozRequestFullScreen) {
                a.mozRequestFullScreen()
            } else {
                if (a.webkitRequestFullscreen) {
                    a.webkitRequestFullscreen()
                } else {
                    if (b) {
                        $("#fullscreen_tip").find(".t").text("由于您的浏览器限制，无法进入演示视图。")
                    } else {
                        $("#fullscreen_tip").find(".t").text("无法进入全屏视图，您可以按(F11)进入。")
                    }
                    $("#fullscreen_tip").fadeIn()
                }
            }
        }
    },
    enterPresentation: function () {
        $("#designer").bind("webkitfullscreenchange", function (a) {
            Dock.manageFullScreen()
        });
        $(document).bind("mozfullscreenchange", function (a) {
            Dock.manageFullScreen()
        }).bind("fullscreenchange", function (a) {
            Dock.manageFullScreen()
        });
        this.fullScreen(Utils.getDomById("designer"), true)
    },
    enterFullScreen: function () {
        this.fullScreen(document.documentElement)
    },
    manageFullScreen: function () {
        var a = Utils.getDomById("designer");
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
            $("#shape_panel").addClass("readonly");
            $("#designer_viewport").addClass("readonly");
            $(window).unbind("resize.designer");
            $("#designer_layout").height(window.screen.height);
            Designer.hotkey.cancel();
            Designer.op.cancel();
            $("#dock").hide();
            $(".dock_view").hide();
            Designer.contextMenu.destroy();
            Designer.op.canvasFreeDraggable()
        } else {
            $("#shape_panel").removeClass("readonly");
            $("#designer_viewport").removeClass("readonly");
            Designer.initialize.initLayout();
            Designer.hotkey.init();
            Designer.op.init();
            $("#dock").show();
            if (Dock.currentView != "") {
                Dock.showView(Dock.currentView)
            }
            Designer.contextMenu.init();
            $("#designer").unbind("webkitfullscreenchange");
            $("#designer").unbind("mozfullscreenchange").unbind("fullscreenchange")
        }
    }
};
var Navigator = {
    init: function () {
        $("#designer_layout").bind("scroll", function () {
            Navigator.setView()
        });
        $("#navigation_eye").bind("mousedown", function (m) {
            var f = $(this);
            var j = f.position();
            $("#designer_layout").unbind("scroll");
            var g = $("#designer_layout");
            var k = g.scrollTop();
            var d = g.scrollLeft();
            var n = $("#designer_canvas");
            var e = n.width();
            var a = n.height();
            var b = $("#navigation_canvas");
            var i = b.width();
            var c = b.height();
            var l = e / i;
            var h = a / c;
            $(document).bind("mousemove.navigator", function (q) {
                var o = q.pageX - m.pageX;
                var s = q.pageY - m.pageY;
                var r = d + o * l;
                g.scrollLeft(r);
                var p = k + s * h;
                g.scrollTop(p);
                f.css({
                    left: j.left + o,
                    top: j.top + s
                })
            });
            $(document).bind("mouseup.navigator", function (o) {
                $(document).unbind("mousemove.navigator");
                $(document).unbind("mouseup.navigator");
                Navigator.setView();
                $("#designer_layout").bind("scroll", function () {
                    Navigator.setView()
                })
            })
        });
        $("#navigation_canvas").bind("click", function (l) {
            var m = Utils.getRelativePos(l.pageX, l.pageY, $(this));
            var o = $("#designer_canvas");
            var h = o.width();
            var a = o.height();
            var b = $("#navigation_canvas");
            var k = b.width();
            var c = b.height();
            var n = h / k;
            var j = a / c;
            var g = m.x * n;
            var f = m.y * j;
            var i = $("#designer_layout");
            var d = Designer.config.pageMargin;
            i.scrollLeft(g + d - i.width() / 2);
            i.scrollTop(f + d - i.height() / 2)
        });
        this.setView()
    },
    draw: function () {
        if (this.drawNavigationTimeout) {
            window.clearTimeout(this.drawNavigationTimeout)
        }
        this.drawNavigationTimeout = setTimeout(function () {
            var c = $("#navigation_canvas");
            var r = c[0].getContext("2d");
            r.save();
            r.clearRect(0, 0, c.width(), c.height());
            r.scale(c.width() / Model.define.page.width, c.height() / Model.define.page.height);
            for (var g = 0; g < Model.orderList.length; g++) {
                var m = Model.orderList[g].id;
                var l = Model.getShapeById(m);
                r.save();
                if (l.name != "linker") {
                    var b = l.props;
                    var a = Utils.getShapeLineStyle(l.lineStyle);
                    r.translate(b.x, b.y);
                    r.translate(b.w / 2, b.h / 2);
                    r.rotate(b.angle);
                    r.translate(-(b.w / 2), -(b.h / 2));
                    r.globalAlpha = l.shapeStyle.alpha;
                    Designer.painter.renderShapePath(r, l)
                } else {
                    var h = l;
                    var a = Utils.getLinkerLineStyle(h.lineStyle);
                    var q = h.points;
                    var o = h.from;
                    var n = h.to;
                    r.beginPath();
                    r.moveTo(o.x, o.y);
                    if (h.linkerType == "curve") {
                        var f = q[0];
                        var e = q[1];
                        r.bezierCurveTo(f.x, f.y, e.x, e.y, n.x, n.y)
                    } else {
                        for (var d = 0; d < q.length; d++) {
                            var k = q[d];
                            r.lineTo(k.x, k.y)
                        }
                        r.lineTo(n.x, n.y)
                    }
                    r.lineWidth = a.lineWidth;
                    r.strokeStyle = "rgb(" + a.lineColor + ")";
                    r.stroke()
                }
                r.restore()
            }
            r.restore();
            Navigator.setView();
            this.drawNavigationTimeout = null
        }, 100)
    },
    setView: function () {
        var a = $("#navigation_eye");
        var r = $("#designer_layout");
        var u = r.width();
        var d = r.height();
        var b = $("#navigation_canvas");
        var g = b.width();
        var n = b.height();
        var o = $("#designer_canvas");
        var f = o.width();
        var m = o.height();
        var l = Designer.config.pageMargin;
        var h = l - r.scrollLeft();
        var t = h + f;
        if (h < 0) {
            h = 0
        } else {
            if (h > u) {
                h = u
            }
        }
        if (t > u) {
            t = u
        } else {
            if (t < 0) {
                t = 0
            }
        }
        var j = l - r.scrollTop();
        var e = j + m;
        if (j < 0) {
            j = 0
        } else {
            if (j > d) {
                j = d
            }
        }
        if (e > d) {
            e = d
        } else {
            if (e < 0) {
                e = 0
            }
        }
        var i = t - h;
        var p = e - j;
        if (i == 0 || p == 0) {
            a.hide()
        } else {
            var k = r.scrollLeft() - l;
            if (k < 0) {
                k = 0
            }
            k = k * (g / f);
            var q = r.scrollTop() - l;
            if (q < 0) {
                q = 0
            }
            q = q * (n / m);
            var s = i * (g / f);
            var c = p * (n / m);
            a.css({
                left: k - 1,
                top: q - 1,
                width: s,
                height: c
            }).show()
        }
    }
};
(function (c) {
    c.fn.button = function (e) {
        if (typeof e == "string") {
            if (e == "disable") {
                c(this).addClass("disabled");
                c(this).find("input").attr("disabled", true)
            } else {
                if (e == "enable") {
                    c(this).removeClass("disabled");
                    c(this).find("input").attr("disabled", false)
                } else {
                    if (e == "isDisabled") {
                        return c(this).hasClass("disabled")
                    } else {
                        if (e == "isSelected") {
                            return c(this).hasClass("selected")
                        } else {
                            if (e == "unselect") {
                                c(this).removeClass("selected")
                            } else {
                                if (e == "select") {
                                    c(this).addClass("selected")
                                } else {
                                    if (e == "setText") {
                                        c(this).children(".text_content").html(arguments[1])
                                    } else {
                                        if (e == "setColor") {
                                            c(this).children(".btn_color").css("background-color", "rgb(" + arguments[1] + ")")
                                        } else {
                                            if (e == "getColor") {
                                                var d = c(this).children(".btn_color").css("background-color").replace(/\s/g, "");
                                                return d.substring(4, d.length - 1)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return c(this)
        }
        var f = c(this);
        f.unbind("click");
        f.unbind("mousedown");
        if (e.onClick) {
            f.bind("click", function () {
                if (f.button("isDisabled")) {
                    return
                }
                e.onClick()
            })
        }
        if (e.onMousedown) {
            f.bind("mousedown", function (g) {
                if (f.button("isDisabled")) {
                    return
                }
                e.onMousedown();
                g.stopPropagation()
            })
        }
    }
    ;
    var b = null;
    c.fn.dropdown = function (e) {
        var i = c(this);
        i.find(".ico_selected").remove();
        if (typeof e == "string") {
            if (e == "close") {
                i.hide();
                b.target.removeClass("selected");
                c(document).unbind("mousedown.ui_dropdown");
                b = null
            } else {
                if (e == "select") {
                    arguments[1].prepend("<div class='ico ico_selected'></div>")
                }
            }
            return
        }
        if (b != null) {
            b.menu.dropdown("close")
        }
        var i = c(this);
        var d = e.target;
        b = {
            target: d,
            menu: i
        };
        var h = d.offset();
        d.addClass("selected");
        i.show();
        var g;
        if (e.position == "center") {
            g = h.left + d.outerWidth() / 2 - i.outerWidth() / 2
        } else {
            if (e.position == "right") {
                g = h.left + d.outerWidth() - i.outerWidth()
            } else {
                g = h.left
            }
        }
        var f = h.top + d.outerHeight();
        if (f + i.outerHeight() > c(window).height()) {
            f = c(window).height() - i.outerHeight()
        }
        i.css({
            top: f,
            left: g
        });
        if (typeof e.zindex != "undefined") {
            i.css("z-index", e.zindex)
        }
        i.unbind("mousedown").bind("mousedown", function (j) {
            j.stopPropagation()
        });
        if (typeof e.bind == "undefined" || e.bind == true) {
            i.find("li:not(.devider,.menu_text)").unbind().bind("click", function () {
                var j = c(this);
                if (!j.menuitem("isDisabled") && j.children(".extend_menu").length == 0) {
                    if (e.onSelect) {
                        e.onSelect(j)
                    }
                    i.dropdown("close")
                }
            })
        }
        c(document).bind("mousedown.ui_dropdown", function () {
            i.dropdown("close")
        })
    }
    ;
    c.colorpicker = function (f) {
        var e = c("#color_picker");
        e.find(".selected").removeClass("selected");
        if (!e.attr("init")) {
            e.find("div").each(function () {
                var h = c(this).css("background-color");
                h = h.replace(/\s/g, "");
                h = h.substring(4, h.length - 1);
                c(this).attr("col", h)
            });
            e.attr("init", true)
        }
        var g = c.extend({}, f, {
            bind: false
        });
        e.dropdown(g);
        e.children(".color_items").children("div").unbind().bind("click", function () {
            if (f.onSelect) {
                var h = c(this).css("background-color");
                h = h.replace(/\s/g, "");
                h = h.substring(4, h.length - 1);
                f.onSelect(h)
            }
            c("#color_picker").dropdown("close")
        });
        e.children(".color_items").children("div").off("mouseenter").on("mouseenter", function () {
            var h = c(this).css("background-color");
            h = h.replace(/\s/g, "");
            h = UI.RGB2Hex(h);
            e.children(".color_hex").find("input").val(h)
        });
        e.children(".color_hex").find("input").off("keyup").on("keyup", function () {
            var i = c(this).val();
            if (i.length == 3 || i.length == 6) {
                var h = UI.hex2RGB("#" + i);
                if (f.onSelect) {
                    f.onSelect(h)
                }
            }
        });
        if (f.color) {
            e.find("div[col='" + f.color + "']").addClass("selected");
            var d = UI.RGB2Hex("rgb(" + f.color + ")");
            e.children(".color_hex").find("input").val(d)
        }
        if (f.trans == true) {
            e.find(".color_transparent").show()
        } else {
            e.find(".color_transparent").hide()
        }
        c("#color_picker").children(".color_extend").remove();
        if (f.extend) {
            c("#color_picker").append("<div class='color_extend'>" + f.extend + "</div>")
        }
    }
    ;
    c.fn.colorButton = function (e) {
        var d = c(this);
        if (typeof e == "string") {
            if (e == "setColor") {
                d.children(".picker_btn_holder").css("background-color", "rgb(" + arguments[1] + ")")
            }
            return
        }
        d.html("<div class='picker_btn_holder'></div><div class='ico ico_colordrop'></div>");
        d.bind("mousedown", function (h) {
            if (d.button("isDisabled")) {
                return
            }
            h.stopPropagation();
            var g = c.extend({}, e);
            g.target = d;
            g.onSelect = function (i) {
                d.colorButton("setColor", i);
                if (e.onSelect) {
                    e.onSelect(i)
                }
            }
            ;
            var f = c(this).children(".picker_btn_holder").css("background-color");
            f = f.replace(/\s/g, "");
            f = f.substring(4, f.length - 1);
            g.color = f;
            c.colorpicker(g)
        })
    }
    ;
    c.fn.spinner = function (g) {
        var j = c(this);
        if (typeof g == "string") {
            if (g == "getValue") {
                var d = j.find("input").val();
                d = parseInt(d);
                return d
            } else {
                if (g == "setValue") {
                    j.find("input").val(arguments[1]);
                    j.attr("old", arguments[1])
                } else {
                    if (g == "setOptions") {
                        var i = arguments[1];
                        if (typeof i.min != "undefined") {
                            j.attr("min", i.min)
                        }
                        if (typeof i.max != "undefined") {
                            j.attr("max", i.max)
                        }
                    }
                }
            }
            return
        }
        j.html("<div class='spinner_input'><input/></div><div class='buttons'><div class='spinner_up'></div><div class='spinner_down'></div></div>");
        var h = {
            step: 1,
            unit: ""
        };
        g = c.extend(h, g);
        if (typeof g.min != "undefined") {
            j.attr("min", g.min)
        }
        if (typeof g.max != "undefined") {
            j.attr("max", g.max)
        }
        var e = j.children(".spinner_input");
        var f = e.find("input");
        j.spinner("setValue", g.min + g.unit);
        j.find(".spinner_up").bind("click", function () {
            if (j.button("isDisabled")) {
                return
            }
            var l = j.spinner("getValue");
            var k = l + g.step;
            a(j, k, g)
        });
        j.find(".spinner_down").bind("click", function () {
            if (j.button("isDisabled")) {
                return
            }
            var l = j.spinner("getValue");
            var k = l - g.step;
            a(j, k, g)
        });
        f.bind("keydown", function (l) {
            if (l.keyCode == 13) {
                var k = parseInt(c(this).val());
                if (isNaN(k)) {
                    k = g.min
                }
                a(j, k, g)
            }
        }).bind("focus", function (l) {
            c(this).select();
            c(this).bind("mouseup", function (m) {
                m.preventDefault();
                c(this).unbind("mouseup")
            });
            var k = c(this).parent().parent();
            if (!k.hasClass("active")) {
                k.addClass("active inset")
            }
        }).bind("blur", function (l) {
            var k = c(this).parent().parent();
            if (k.hasClass("inset")) {
                k.removeClass("active inset")
            }
        })
    }
    ;
    function a(j, h, g) {
        if (j.attr("max")) {
            var d = parseInt(j.attr("max"));
            if (h > d) {
                h = d
            }
        }
        if (j.attr("min")) {
            var f = parseInt(j.attr("min"));
            if (h < f) {
                h = f
            }
        }
        var e = j.attr("old");
        var i = h + g.unit;
        if (e != i) {
            if (g.onChange) {
                g.onChange(h)
            }
        }
        j.spinner("setValue", h + g.unit)
    }
    c.fn.menuitem = function (d) {
        var e = c(this);
        if (typeof d == "string") {
            if (d == "disable") {
                e.addClass("disabled")
            } else {
                if (d == "enable") {
                    e.removeClass("disabled")
                } else {
                    if (d == "isDisabled") {
                        return e.hasClass("disabled")
                    } else {
                        if (d == "isSelected") {
                            return e.children(".ico_selected").length > 0
                        } else {
                            if (d == "unselect") {
                                return e.children(".ico_selected").remove()
                            } else {
                                if (d == "select") {
                                    return e.prepend("<div class='ico ico_selected'></div>")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ;
    c.fn.dlg = function (d) {
        var g = c(this);
        if (typeof d == "string") {
            if (d == "close") {
                g.children(".dlg_close").trigger("click")
            }
            return
        }
        var e = {
            closable: true
        };
        d = c.extend(e, d);
        var f = g.children(".dlg_close");
        if (f.length == 0) {
            f = c("<div class='ico dlg_close'></div>").appendTo(g)
        }
        if (d.closable == false) {
            f.hide()
        } else {
            f.show()
        }
        c(".dlg_mask").remove();
        c("body").append("<div class='dlg_mask'></div>");
        f.unbind().bind("click", function () {
            g.hide();
            c(".dlg_mask").remove();
            if (d && d.onClose) {
                d.onClose()
            }
            c(document).unbind("keydown.closedlg");
            g.find("input,textarea,select").unbind("keydown.closedlg")
        });
        g.css({
            left: (c(window).width() - g.outerWidth()) / 2,
            top: (c(window).height() - g.outerHeight()) / 2
        });
        g.show();
        if (d.closable) {
            g.find("input,textarea,select").unbind("keydown.closedlg").bind("keydown.closedlg", function (h) {
                if (h.keyCode == 27) {
                    g.children(".dlg_close").trigger("click")
                }
            });
            c(document).unbind("keydown.closedlg").bind("keydown.closedlg", function (h) {
                if (h.keyCode == 27) {
                    g.children(".dlg_close").trigger("click")
                }
            })
        }
        g.children(".dialog_header").unbind("mousedown.drag_dlg").bind("mousedown.drag_dlg", function (j) {
            var i = c(this).parent();
            var m = j.pageX;
            var k = j.pageY;
            var l = i.offset().left;
            var h = i.offset().top;
            c(document).bind("mousemove.drag_dlg", function (p) {
                var o = p.pageX - m + l;
                var n = p.pageY - k + h;
                i.offset({
                    left: o,
                    top: n
                })
            });
            c(document).bind("mouseup.drag_dlg", function (n) {
                c(document).unbind("mousemove.drag_dlg");
                c(document).unbind("mouseup.drag_dlg")
            })
        })
    }
})(jQuery);
