var Station = {
    init: function (id) {        
        var tip = d3.tip().direction("se").offset([10,-10]).attr('class', 'd3-tip').html(function (d) {
            return "<strong> 规格尺寸:</strong> <br/><span style='color:red'>" + "四封" + "</span>";
        })
       
        if (typeof id == "undefined" || id == "") {
            return;
        }
        $.get("/metrostation/GetLightbox", { id: id }, function (data) {
            if (data.length > 0) {
                var dataA = [];
                for (var i = 0; i < data.length; i++) {
                    dataA.push(data[i].ChartElementId);
                }
                var path = d3.select(".svg-document").select("svg").selectAll("path").filter(function () { return dataA.indexOf(this.id) >= 0; })
               
                path.call(tip);               
                 path
                .on("mouseover", function () {
                    var info = $('<dl><dt>Description lists</dt><dd>A description list is perfect for efining terms.</dd>        <dt>Euismod</dt>        <dd>Vestibulum id ligula porta felis euismod semper eget lacinia odio sem nec elit.</dd>        <dd>Donec id elit non mi porta gravida at eget metus.</dd>        <dt>Malesuada porta</dt>        <dd>Etiam porta sem malesuada magna mollis euismod.</dd>    </dl>');
                    tip.html(function () {
                        return '<div class="text-success box-info">' + info.html() + '</div>';
                    });
                    tip.show();
    
                } )
                .on("mousemove", function () {
                    //debugger;
                    //var matrix = this.transform.baseVal[0].matrix;
                    //return info
                    // .style("left", (d3.event.clientX+2) + "px")
                    // .style("top", (d3.event.clientY +2) + "px")
                          
                })
                .on("mouseout", /*function () {
                    var tooltip = this.nextElementSibling;
                   return $(tooltip).tooltip("hide");
                   // return info.style("visibility", "hidden");
                }*/tip.hide)
                .on("click", function () {
                    click()
                });
               
                
                
            }
        })
        var click = function () {
            $("#edit-info-modal").modal("show");

        };
          

        $("svg").dblclick(function () {
            var div = this.parentNode;
            var guid = $(div).attr("guid");
            window.location.href = '/diagraming/createNewdiagram?stationid=' + id + "&chartId=" + guid;
        })
       
       
    },
    editInfo: function (id) {
        debugger;

    },
    showSaleInfo: function () {
        $("#sale-info-modal").modal("show");
    },
    getBoxInfo: function () {

    }
};
var contextMenu = {
    menu: [],
    init: function (role) {
        if (role == "editor") {
            this.menu = [
                {
                    title: "编辑相关信息",
                    action: function () {
                        Station.editInfo();    
                    }
                },
                {
                    title: "查看售卖情况",
                    action: function () {
                        Station.showSaleInfo();
                    }
                }
            ]

        } else if (role=="saler") {
            this.menu = [
             {
                 title: "加入订单",
                 action: function (eve) {
                     Order.addToOrder(eve);
                 }

             },
             {
                 title: "移出订单",
                 action: function (eve) {
                     Order.removeFromOrder(eve);
                 }
             }
            ]

        } else if (true) {

        }
        return this.menu;
    }, 
    

};
var Order = {
    boxes: {
        element:[],
        empty: function () {
            Util.emptyArray(this.element);
        },
        add: function (box) {
            Util.addToArray(this.element,box);
        },
        remove: function (box) {
            Util.removeFromArray(this.element, box);
        }
    },
    combos: {
        array: [],
        element:{},
        rules:{},
        get: function (list) {
            this.empty();
            for (var i = 0; i < list.length; i++) {
                Util.addToArray(this.array, list[i]);
            }
        },
        empty: function () {
            Util.emptyArray(this.array);
        },
        choose: function (comboId) {
            this.rules = {},
           this.element = Util.getFromArray(this.array, comboId);
            var c = this.element;
            debugger;
            $.post("/metrolightOrder/GetComboRules", { comboId: comboId }, function (d) {
                if (d.success)
                {
                    Order.combos.rules = d.data;
                    $("#Combo").val(comboId);
                    if (c) {
                        //var label=
                        debugger;
                    }
                }
            })
        }
    },
    startDate: "",
    endDate: "",    
    init: function (orderId) {
        if (typeof orderId!="undefined") {

        } else {
            this.boxes.empty();
            this.combos.empty();
            this.startDate = "";
            this.endDate = "";
        }

    }, 
   
    submit: function () {

    },
    chooseSvg: function (stationId) {

    },
    orderWizard: function () {

    },
    getCombos: function (typeId, b) {
        $("#customer").css("display", "none");
        $.post("/MetroLightOrder/GetCombos", { type: typeId }, function (data) {
            if (data.success) {
                $("#combo-choose").empty();
                var combos = data.data;
                Order.combos.get(combos);
                for (var i = 0; i < combos.length; i++) {
                    $('<a href="javascripe:;" onclick="Order.combos.choose(' + combos[i].Id + ')" class="btn btn-primary btn-lg"><i class="fa fa-bullseye pull-left"> <br /><small>' + combos[i].Name + '</small></i></a>').appendTo($("#combo-choose"));
                    var labelText = combos[i].Name + combos[i].Size + combos[i].Continiuty + '连封' + combos[i].Count+'块';
                    $('<span class="label label-warning" id="selected-combo' + combos[i].Id + '">' + labelText + '</span>').appendTo($("#combo-selected"));
                }
                $(".label-warning").css("display", "none");
            }
        })
        if (b) {
            $("#customer").css("display", "block");
        }
    },
     
};

var Util = {
    removeFromArray: function (array, element) {
        var a = arrayc.indexOf(element);
        if (a >= 0) {
            array.splice(a, 1)
        }
        return array
    },
    addToArray: function (array, element) {
        var a = array.indexOf(element);
        if (a < 0) {
            array.push(element)
        }
        return array
    },
    emptyArray: function (array) {
        array = [];
        return array;
    },
    getFromArray: function (array, element) {
        function findElement(e,element) {
            return e.Id == element;
        }
        var b = array.find(findElement);       
        return b;
    }
}


