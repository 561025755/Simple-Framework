//获取查询参数
//var oid = $("#OrderId").val();
//var size = $("#Size").val();
//var grade = $("#Grade").val();
var markerObj;
var checkNumber = 0;
var arrayMarker = new Array();
var orderId = $('#orderId').val();
var DefaultCoordinate = $('#CurrentCityCoordinate').val();

// 百度地图API功能
var map = new BMap.Map("map", { minZoom: 10, maxZoom: 18 });          // 创建地图实例
var point = parsePoint(DefaultCoordinate);  // 创建点坐标
map.centerAndZoom(point, 12);
map.enableScrollWheelZoom(); //启动地图缩放
map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件


map.addEventListener("zoomend", function () {

    clearAndReload(true);

});

map.addEventListener("moveend", function () {
    clearAndReload(false);
});

function SetCenterTag() {
    map.clearOverlays();
    debugger;
    arrayMarker.splice(0, arrayMarker.length);
    var radius = $("#Radius").val();
    radius = $("#Radius").val() * 100;

    var showall = false;
    if ($('#ckShowAllStation').attr("checked") || $('#ckShowAllStation').attr("checked") == "checked")
        showall = true;
    if ($("#pointVS").val() == "") {
        $("#pointVS").val(map.getCenter().lng + "," + map.getCenter().lat)
    }
    var currpoint = new BMap.Point($("#pointVS").val().split(',')[0], $("#pointVS").val().split(',')[1])


    var myIcon = new BMap.Icon("/Images/marker-blue.png", new BMap.Size(24, 36));
    var marker = new BMap.Marker(currpoint, { icon: myIcon });
    marker.enableDragging();
    marker.addEventListener("dragend", function (e) {
        $("#pointVS").val(e.point.lng + "," + e.point.lat)
        SetCenterTag();
    });
    map.addOverlay(marker);

    var circle = new BMap.Circle(currpoint, radius, { fillColor: "blue", strokeWeight: 1, fillOpacity: 0.1, strokeOpacity: 0.1 });
    map.addOverlay(circle);

    loadBusinessLocationByRadius($("#DefaultCityCode").val(), $("#pointVS").val(), radius);
}

function clearAndReload(IsClear) {
    if (IsClear) {
        arrayMarker.splice(0, arrayMarker.length);
        map.clearOverlays();
    }
    if ($('#ckSetTag').attr("checked") == "checked") {
        SetCenterTag();
    }
    else {
        if (map.getZoom() < 13) {
            loadAreaEquipments($("#DefaultCityCode").val());
        }
        else
            loadBusinessLocation($("#DefaultCityCode").val());
    }

}


function loadAreaEquipments(cityCode) {
    $.ajax({
        type: "POST",
        url: "/DF_OwnOrder/GetEquipQuantity",
        async: false,
        data: {
            cityCode: cityCode
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        success: function (data) {
            ////加载所有可用资源
            if (data.geoms && data.geoms.length > 0) {
                $.each(data.geoms, function (index, obj) {

                    setTimeout('addBigMarker(\'' + this.Coordinate + '\',\'' + this.Code + '\',\'' + this.Name + ":" + this.Quantity + "台设备" + '\')', 10)

                });

            }
            else {
                loadBusinessLocation(cityCode);
            }
            $(".loading-overlay").hide();
        }
    });
}


function loadBusinessLocation(cityCode) {

    ////获取可视范围参数
    var cp = map.getCenter(); //中心点
    var bs = map.getBounds();   //获取可视区域
    var sw = bs.getSouthWest();   //可视区域左下角
    var ne = bs.getNorthEast();   //可视区域右上角


    $.ajax({
        type: "POST",
        url: "/DF_OwnOrder/getBusinessEquipQuantitys",
        async: false,
        data: {
            orderId: orderId,
            cityCode: cityCode,
            swLng: sw.lng,
            swLat: sw.lat,
            neLng: ne.lng,
            neLat: ne.lat,
            showAll: $("#ckShowAllStation").attr("checked") == "checked"
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        beforeSend: function () { $(".loading-overlay").show(); },
        success: function (data) {
            ////加载所有可用资源
            if (data.geoms && data.geoms.length > 0) {
                $.each(data.geoms, function (index, obj) {
                    setTimeout('addSmallMarker(\'' + this.Coordinate + '\',\'' + obj.EquipPropertyNumbers.join() + '\',' + obj.IsChecked + ')', 10)
                });

            }
            $(".loading-overlay").hide();
        }
    });
}


function loadBusinessLocationByRadius(cityCode, Coordinate, Radius) {
    $.ajax({
        type: "POST",
        url: "/DF_OwnOrder/getBusinessEquipQuantitysByRadius",
        async: false,
        data: {
            orderId: orderId,
            cityCode: cityCode,
            Coordinate: Coordinate,
            Radius: Radius,
            showAll: $("#ckShowAllStation").attr("checked") == "checked"
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        beforeSend: function () { $(".loading-overlay").show(); },
        success: function (data) {
            ////加载所有可用资源
            if (data.geoms && data.geoms.length > 0) {
                $.each(data.geoms, function (index, obj) {
                    setTimeout('addSmallMarker(\'' + this.Coordinate + '\',\'' + obj.EquipPropertyNumbers.join() + '\',' + obj.IsChecked + ')', 10)
                });
            }
            $("#DeliveryEquipNumber").attr("Max", data.equipCount);
            $("#lableCkAll").text("选择全部设备,当前最多投放数量为：" + data.equipCount);
            $("#ckSelectAddBorad").attr("EquipMaxNumber", data.equipCount);
            $("#ckSelectAddBorad").removeAttr("checked");
            $("#DeliveryEquipNumber").val("");

            $(".loading-overlay").hide();
        }
    });
}


function addBigMarker(Coordinate, Code, name) {
    var point = parsePoint(Coordinate);
    if (point && !checkExsitOverlay(Code)) {
        var station;
        station = new BigMarker(point, Code, false, name);
        map.addOverlay(station);
    }
}


function addSmallMarker(Coordinate, Code, isSelf) {
    var point = parsePoint(Coordinate);
    if (point && !checkExsitOverlay(Code)) {
        var station;
        station = new SmallMarker(point, Code, isSelf);
        map.addOverlay(station);
    }
}

//验证覆盖物是否存在
function checkExsitOverlay(id) {
    if ($.inArray(id, arrayMarker) > -1) {
        return true;
    }
    else {
        arrayMarker.push(id);
        return false;
    }
}


//重新格式化站台点位坐标=
function parsePoint(location) {
    var pointObj = location.split(',');
    if (pointObj && pointObj.length == 2) {
        return new BMap.Point(pointObj[0], pointObj[1]);
    }
    return null;
}

//聚合区域或者街道商圈遮盖物
function SmallMarker(point, id, isSelf) {
    this._point = point;
    this._id = id;
    this._isSelf = isSelf;
}
//地图小图标标记站台
SmallMarker.prototype = new BMap.Overlay();
SmallMarker.prototype.initialize = function (map) {
    this._map = map;
    var markerDiv = $("<div class='small_marker' id='" + this._id + "' isSelf='" + this._isSelf + "' style='display:block'></div>")
    if (this._isSelf) {
        markerDiv.append("<div><img src='/Images/marker-s.png'></div>");
    } else {
        markerDiv.append("<div><img src='/Images/marker-sa.png'></div>");
    }

    markerDiv.click(function () { openModal($(this).attr("id"), $(this)); });//1表示查询站台广告牌
    var div = markerDiv.get(0);
    map.getPanes().labelPane.appendChild(div);
    this._div = div;
    return div;
}
SmallMarker.prototype.draw = function () {
    var map = this._map;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x + "px";
    this._div.style.top = pixel.y + "px";
}

//站台遮盖物
function BigMarker(point, id, isSelf, name) {
    this._point = point;
    this._id = id;
    this._name = name;
    this._isSelf = isSelf;
}

BigMarker.prototype = new BMap.Overlay();
BigMarker.prototype.initialize = function (map) {
    this._map = map;
    var markerDiv;
    if (this._isSelf) {
        markerDiv = $("<div class='marker_self' id='" + this._id + "' name='" + this._name + "' style='display:block'></div>")
        markerDiv.append("<div class='marker_self_bg'><strong>" + this._name + "</strong></div>");
        markerDiv.hover(
            function () { $(this).addClass("marker_self_hover"); },
            function () { $(this).removeClass("marker_self_hover"); });
    } else {
        markerDiv = $("<div class='marker' id='" + this._id + "' name='" + this._name + "' style='display:block'></div>")
        markerDiv.append("<div class='marker_bg'><strong>" + this._name + "</strong></div>");
        markerDiv.hover(
            function () { $(this).addClass("marker_hover"); },
            function () { $(this).removeClass("marker_hover"); });
    }
    //markerDiv.click(function () { ChangeMapForRegion($(this).attr("id")); });
    var div = markerDiv.get(0);
    map.getPanes().labelPane.appendChild(div);
    this._div = div;
    return div;
}
BigMarker.prototype.draw = function () {
    var map = this._map;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x - 0 + "px";
    this._div.style.top = pixel.y - 40 + "px";
}





function openModal(PropertyNumbers, obj) {
    markerObj = obj;
    checkNumber = 0
    $.ajax({
        type: "POST",
        url: "/DF_OwnOrder/GetEquipments",
        async: false,
        data: {
            orderId: orderId,
            PropertyNumbers: PropertyNumbers
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        success: function (datas) {
            $('#data-table').find("tbody").html("");
            var operationBtn = "";
            $(datas.geoms).each(function (index, obj) {
                if (obj.IsChecked) {
                    checkNumber++;
                    operationBtn = '<a href="javascript:;" onclick="DeleteEquipment(\'' + obj.PropertyNumber + '\')" class="btn show-detail-json  btn-success btn-xs">移除</a>'
                }
                else {
                    operationBtn = '<a class="btn btn-default btn-xs show-detail-json" href="javascript:;" onclick="addToOrder(\'' + obj.PropertyNumber + '\')">备选</a>';
                }
                $('#data-table').find("tbody").append("<tr><td>" + obj.Business.Name + "</td><td>" + obj.Business.Area + "</td><td>" + obj.Business.Charge +
                "</td><td>" + obj.Business.TradingAreaName + "</td><td>" + obj.CameraCount + "</td><td>" + (obj.Networking == true ? "已联网" : "未联网") + "</td><td>" + operationBtn + "</td></tr>");
            });


            $(".loading-overlay").hide();
        }
    });

    $("#modal-Equipment-list").modal('show');
}

function DeleteEquipment(PropertyNumber) {
    $.ajax({
        type: 'POST',
        url: '/DF_OwnOrder/DeleteEquipment',
        data: { PropertyNumber: PropertyNumber, orderId: orderId },
        dataType: 'JSON',
        success: function (datas) {
            if (datas.success) {
                $("#modal-Equipment-list").modal('hide');
                gritter("友情提示！", "移除成功");
                checkNumber--;
                if (checkNumber == 0) {
                    if ($("#ckShowAllStation").attr("checked") == "checked")
                        $(markerObj).find("img").attr("src", "/Images/marker-sa.png");
                    else
                        $(markerObj).remove();
                }

            }
        }
    });
}

function addToOrder(PropertyNumber) {
    $.ajax({
        type: 'POST',
        url: '/DF_OwnOrder/AddScope',
        data: { orderId: orderId, PropertyNumber: PropertyNumber, cityCode: $('#DefaultCityCode').val() },
        dataType: 'JSON',
        success: function (datas) {
            if (datas.success) {
                $("#modal-Equipment-list").modal('hide');
                gritter("友情提示！", "添加成功");
                $(markerObj).find("img").attr("src", "/Images/marker-s.png");
            }
            else {
                var error = datas.error || "添加设备过程中发生错误，请稍后重试。";
                gritter("我们真的很抱歉！", error);
            }

        }
    });

}
