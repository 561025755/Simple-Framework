/*
获取城市列表，代理商，销售人员的联动下拉列表
*container  控件位置
* mediaType 媒介类型，必要的参数，用以获得代理商以及对应的销售
* needCity 是否需要城市列表，不填则为不需要
* citylistId
* agentListId
* salerListId
*
*/


; (function ($, window, document, undefined) {

    var name = "casDropdownList",
        instance = null,
        defaults = {
            containerID: "",
            needCity: true,
            getCityUrl: "/DF_Report/GetAllCities",
            getAgentUrl: "/DF_Report/GetAgents",
            getSalerUrl: "/DF_Report/GetSalers",
            mediaType: 1,
            cityListId: "CityId",
            agentListId: "AgentId",
            salerListId: "UserId",
            callback: undefined // function( pages, items ) { }
        };


    function Plugin(element, options) {
        this.options = $.extend({}, defaults, options);

        this._container = $("#" + this.options.containerID);
        if (!this._container.length) return;

        this.jQwindow = $(window);
        this.jQdocument = $(document);  

        this.init();
    }

    Plugin.prototype = {

        constructor: Plugin,

        init: function () {
            this.writeDropDownList();
            this.setStyles();
            this.getCityOptions();
            this.getAgentOptions();
            this.getUserOptions();          
            
        },

        getCityOptions: function () {           
            if (this.options.needCity) {
                var domid = this.options.cityListId;
                $.post(this.options.getCityUrl, function (d) {
                    if (d.success) {
                        var city = d.data;
                        for (var i = 0; i < city.length; i++) {
                            $("select#" + domid).append($('<option value="' + city[i].Code + '">' + city[i].Name + '</option>'));
                        }
                       
                    }
                })
            }         
    
        },

        getAgentOptions: function () {
            var mtype = this.options.mediaType;
            var domid = this.options.agentListId;
            $.post(this.options.getAgentUrl, { mediaType:mtype}, function (d) {
                if (d.success) {
                    var data = d.data;
                    for (var i = 0; i < data.length; i++) {                       
                        $("select#" + domid).append($('<option cc="' + data[i].CityCode + '" value="' + data[i].Id + '">' + data[i].Company + '</option>'));
                    }                
                   
                }
            })
           
        },

        getUserOptions: function () {
            var mtype = this.options.mediaType;
            var domid = this.options.salerListId;
            $.post(this.options.getSalerUrl, { mediaType: mtype }, function (d) {
                if (d.success) {
                    var data = d.data;
                    for (var i = 0; i < data.length; i++) {                       
                        $("select#" + domid).append($('<option ag="' + data[i].Agent.Id + '" value="' + data[i].Id + '">' + data[i].UserName + '</option>'));
                    }
                  
                }               
            })
            
        },

        writeDropDownList: function () {
            $('<div class="row">'+
                '<div class="ui-sortable" id="' + this.options.cityListId + '" ><select class="form-control" id="' + this.options.cityListId + '"><option value="">请选择一个城市</option></select></div>' +
                '<div class="ui-sortable" id="' + this.options.agentListId + '" ><select class="form-control" id="' + this.options.agentListId + '"><option value="">请选择一个代理</option></select></div>' +
                '<div class="ui-sortable" id="' + this.options.salerListId + '" ><select class="form-control" id="' + this.options.salerListId + '"><option value="">请选择一个销售</option></select></div>' +
               ' </div>').appendTo(this._container);  

            if (!this.options.needCity) {
                $("div#" + this.options.cityListId).remove();
            }
    
        },

        setStyles: function () {
            var agentId = this.options.agentListId;
            var cityId = this.options.cityListId;
            var userId = this.options.salerListId;
            if (!this.options.needCity) {
                $("div#" + agentId).addClass("col-sm-6");
                $("div#" + userId).addClass("col-sm-6");
                //$("select#" + this.options.agentListId).unbind("change", agentChange).bind("change", agentChange);
            } else {
                $("div#" + cityId).addClass("col-sm-4");
                $("div#" + agentId).addClass("col-sm-4");
                $("div#" + userId).addClass("col-sm-4");
                //$("select#" + this.options.cityListId).unbind("change", cityChange).bind("change", cityChange);
                //$("select#" + this.options.agentListId).unbind("change", agentChange).bind("change", agentChange);
            }
           
            $("select#" + cityId).change(function () {
                var selected = $(this).val();

                $("select#" + agentId).children("span").each(function () {
                    $(this).children().clone().replaceAll($(this));
                })
                var agent = [];
                if (selected!="") {
                    $("select#" + agentId)
                        .children("option[cc!='" + selected + "'][value!='']")
                        .each(function () {
                           $(this).wrap("<span style='display:none'></span>");    
                        });

                    $("select#" + agentId)
                       .children("option[cc='" + selected + "']")
                       .each(function () {
                           agent.push($(this).val());
                       });
                }
                $("select#" + agentId).change();
                
            })

            $("select#" + agentId).change(function () {
                var selected = $(this).val();

                $("select#" + userId).children("span").each(function () {
                    $(this).children().clone().replaceAll($(this));
                })
                if (selected != "") {
                    $("select#" + userId)
                        .children("option[ag!='" + selected + "'][value!='']")
                        .each(function () {
                            $(this).wrap("<span style='display:none'></span>");
                        });
                } else {
                    $("select#" + userId)
                        .children("[value!='']")
                        .each(function () {
                            $(this).wrap("<span style='display:none'></span>");
                        });
                }

            })
          

        },

       
      

    };

    $.fn[name] = function (arg) {
        var type = $.type(arg);

        if (type === "object") {
            if (this.length && !$.data(this, name)) {
                instance = new Plugin(this, arg);
                this.each(function () {
                    $.data(this, name, instance);
                });
            }
            return this;
        }

        if (type === "string" && arg === "destroy") {
            instance.destroy();
            this.each(function () {
                $.removeData(this, name);
            });
            return this;
        }

        if (type === 'number' && arg % 1 === 0) {
            if (instance.validNewPage(arg)) instance.paginate(arg);
            return this;
        }

        return this;
    };

})(jQuery, window, document);
