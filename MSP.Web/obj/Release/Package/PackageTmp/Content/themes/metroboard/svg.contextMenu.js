var menu = {
    init: function () {
        $("#svg_contextmenu").unbind("mousedown").bind("mousedown", function (a) {
            a.stopPropagation()
        });
        $("#designer_contextmenu").find("li:not(.devider)").unbind("click").bind("click", function () {
            var a = $(this);
            if (!a.menuitem("isDisabled") && a.children(".extend_menu").length == 0) {
                Designer.contextMenu.execAction(a);
                Designer.contextMenu.hide()
            }
        });
        $("#canvas_container").unbind("contextmenu").bind("contextmenu", function (b) {
            b.preventDefault();
            if (!b.ctrlKey) {
                var a = $("#designer_canvas");
                var c = Utils.getRelativePos(b.pageX, b.pageY, a);
                Designer.contextMenu.show(c.x, c.y)
            }
        })
    },
    destroy: function () {
        $("#canvas_container").unbind("contextmenu");
        this.hide()
    },
    menuPos: {
        x: 0,
        y: 0,
        shape: null
    },
    show: function (i, h) {
        this.menuPos.x = i;
        this.menuPos.y = h;
        var c = $("#designer_contextmenu");
        var a = Utils.getShapeByPosition(i, h, false);
        c.children().hide();
        c.children("li[ac=selectall]").show();
        c.children(".devi_selectall").show();
        c.children("li[ac=drawline]").show();
        var b = Designer.clipboard.elements.length;
        if (b == 0) {
            if (localStorage.clipboard) {
                var d = JSON.parse(localStorage.clipboard);
                b = d.length
            }
        }
        if (a == null) {
            if (b > 0) {
                c.children("li[ac=paste]").show();
                c.children(".devi_clip").show()
            }
        } else {
            var f = a.shape;
            this.menuPos.shape = f;
            if (f.locked) {
                if (b > 0) {
                    c.children("li[ac=paste]").show();
                    c.children(".devi_clip").show()
                }
                c.children("li[ac=unlock]").show();
                c.children(".devi_shape").show()
            } else {
                c.children("li[ac=cut]").show();
                c.children("li[ac=copy]").show();
                c.children("li[ac=duplicate]").show();
                if (b > 0) {
                    c.children("li[ac=paste]").show()
                }
                c.children(".devi_clip").show();
                c.children("li[ac=front]").show();
                c.children("li[ac=back]").show();
                c.children("li[ac=lock]").show();
                c.children("li[ac=setSizeId]").show();
                var g = Utils.getSelectedIds();
                var e = g.length;
                if (e >= 2) {
                    c.children("li[ac=group]").show();
                    $("#ctxmenu_align").show()
                }
                var j = Utils.getSelectedGroups().length;
                if (j >= 1) {
                    c.children("li[ac=ungroup]").show()
                }
                c.children(".devi_shape").show();
                if (e == 1 && f.name != "linker" && f.link) {
                    c.children("li[ac=changelink]").show()
                }
                if (f.name == "linker" || (f.textBlock && f.textBlock.length > 0)) {
                    c.children("li[ac=edit]").show()
                }
                c.children("li[ac=delete]").show();
                c.children(".devi_del").show()
            }
        }
        c.css({
            display: "block",
            "z-index": Model.orderList.length + 3,
            left: i,
            top: h
        });
        $(document).bind("mousedown.ctxmenu", function () {
            Designer.contextMenu.hide()
        })
    },
    hide: function () {
        $("#designer_contextmenu").hide();
        $(document).unbind("mousedown.ctxmenu")
    },
    execAction: function (a) {
        var b = a.attr("ac");
        if (b == "cut") {
            Designer.clipboard.cut()
        } else {
            if (b == "copy") {
                Designer.clipboard.copy()
            } else {
                if (b == "paste") {
                    Designer.clipboard.paste(this.menuPos.x, this.menuPos.y)
                } else {
                    if (b == "duplicate") {
                        Designer.clipboard.duplicate()
                    } else {
                        if (b == "front") {
                            Designer.layerShapes("front")
                        } else {
                            if (b == "back") {
                                Designer.layerShapes("back")
                            } else {
                                if (b == "lock") {
                                    Designer.lockShapes()
                                } else {
                                    if (b == "unlock") {
                                        Designer.unlockShapes()
                                    } else {
                                        if (b == "group") {
                                            Designer.group()
                                        } else {
                                            if (b == "ungroup") {
                                                Designer.ungroup()
                                            } else {
                                                if (b == "align_shape") {
                                                    var c = a.attr("al");
                                                    Designer.alignShapes(c)
                                                } else {
                                                    if (b == "edit") {
                                                        Designer.op.editShapeText(this.menuPos.shape, this.menuPos)
                                                    } else {
                                                        if (b == "delete") {
                                                            Designer.op.removeShape()
                                                        } else {
                                                            if (b == "selectall") {
                                                                Designer.selectAll()
                                                            } else {
                                                                if (b == "drawline") {
                                                                    Designer.op.changeState("creating_free_linker")
                                                                } else {
                                                                    if (b == "changelink") {
                                                                        UI.showInsertLink()
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