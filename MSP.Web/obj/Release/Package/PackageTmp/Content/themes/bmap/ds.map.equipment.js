//获取查询参数
//var oid = $("#OrderId").val();
//var size = $("#Size").val();
//var grade = $("#Grade").val();

var arrayMarker = new Array();

var pointX = parseFloat($('#pointX').val());
var pointY = parseFloat($('#pointY').val());

// 百度地图API功能
var map = new BMap.Map("map", { minZoom: 6, maxZoom: 18 });          // 创建地图实例
var point = new BMap.Point(pointY, pointX);  // 创建点坐标
map.centerAndZoom(point, 7);
map.enableScrollWheelZoom(); //启动地图缩放
map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件


map.addEventListener("zoomend", function () {
    map.clearOverlays();
    arrayMarker.splice(0, arrayMarker.length);
    clearAndReload();
});

map.addEventListener("moveend", function () {
    clearAndReload();
});
function clearAndReload() {
    if (map.getZoom() < 8) {
        loadAreaEquipments(1);
    }
    else if (map.getZoom() >= 8 && map.getZoom() < 10) {
        loadAreaEquipments(2);
    }
    else if (map.getZoom() < 13 && map.getZoom() >= 10) {
        loadAreaEquipments(3);
    }
    else {
        loadEquipmentLocation();
    }

}

function loadAreaEquipments(dataType) {
    ////获取可视范围参数
    var cp = map.getCenter(); //中心点
    var bs = map.getBounds();   //获取可视区域
    var sw = bs.getSouthWest();   //可视区域左下角
    var ne = bs.getNorthEast();   //可视区域右上角
    $.ajax({
        type: "POST",
        url: "/Equipment/GetEquipQuantity",
        async: false,
        data: {
            dataType: dataType,
            swLng: sw.lng,
            swLat: sw.lat,
            neLng: ne.lng,
            neLat: ne.lat,
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        success: function (data) {
            ////加载所有可用资源
            if (data.geoms && data.geoms.length > 0) {
                $.each(data.geoms, function (index, obj) {

                    setTimeout('addBigMarker(\'' + this.Coordinate + '\',\'' + this.Code + '\',\'' + this.Name + ":" + this.Quantity + "台设备" + '\',' + dataType + ')', 10)

                });

            }
            $(".loading-overlay").hide();
        }
    });
}

function ChangeMapForRegion(regionCode, changeType) {
    $.ajax({
        type: "POST",
        url: "/Equipment/GetBusinessesByCityCode",
        async: false,
        data: {
            Code: regionCode,
            changeType: changeType
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        success: function (data) {
            ////加载所有可用资源
            if (data.geoms && data.geoms.length > 0) {
                var centerpoint = parsePoint(data.Coordinate);
                //map.clearOverlays();
                if (changeType == 1)
                {
                    map.centerAndZoom(centerpoint, 9);
                    map.clearOverlays();
                }
                else if (changeType == 2)
                {
                    map.centerAndZoom(centerpoint, 11);
                    map.clearOverlays();
                }
                else
                {
                    map.centerAndZoom(centerpoint, 14);
                    map.clearOverlays();
                }
                $.each(data.geoms, function (index, obj) {
                    if (changeType == 1) {
                        setTimeout('addBigMarker(\'' + this.Coordinate + '\',\'' + this.Code + '\',\'' + this.Name + ":" + this.Quantity + "台设备" + '\',2)', 10)
                    } else if (changeType == 2) {
                        setTimeout('addBigMarker(\'' + this.Coordinate + '\',\'' + this.Code + '\',\'' + this.Name + ":" + this.Quantity + "台设备" + '\',3)', 10)
                    } else {
                        setTimeout('addSmallMarker(\'' + this.Coordinate + '\',\'' + this.PropertyNumber + '\')', 10)
                    }
                });

            }
            $(".loading-overlay").hide();
        }
    });

}


function loadEquipmentLocation() {

    ////获取可视范围参数
    var cp = map.getCenter(); //中心点
    var bs = map.getBounds();   //获取可视区域
    var sw = bs.getSouthWest();   //可视区域左下角
    var ne = bs.getNorthEast();   //可视区域右上角


    $.ajax({
        type: "POST",
        url: "/Equipment/getEquipmentLocations",
        async:false,
        data: {
            swLng: sw.lng,
            swLat: sw.lat,
            neLng: ne.lng,
            neLat: ne.lat,
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        success: function (data) {
            ////加载所有可用资源
            if (data.geoms && data.geoms.length > 0) {
                $.each(data.geoms, function (index, obj) {
                  
                    setTimeout('addSmallMarker(\'' + this.Coordinate + '\',\'' + this.PropertyNumber + '\')', 10)
                });

            }
            $(".loading-overlay").hide();
        }
    });
}

function addBigMarker(Coordinate, Code,name,changeType) {
    var point = parsePoint(Coordinate);
    if (point && !checkExsitOverlay(Code)) {
        var station;
        station = new BigMarker(point, Code, false, name, changeType);
        map.addOverlay(station);
    }
}


function addSmallMarker(Coordinate, PropertyNumber) {
    var point = parsePoint(Coordinate);
    if (point && !checkExsitOverlay(PropertyNumber)) {
        var station;
        station = new SmallMarker(point, PropertyNumber, true);
        map.addOverlay(station);
    }
}

//验证覆盖物是否存在
function checkExsitOverlay(id) {
    if ($.inArray(id, arrayMarker) > -1)
    {
        return true;
    }
    else
    {
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

    markerDiv.click(function () { openModal($(this).attr("id")); });//1表示查询站台广告牌
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
function BigMarker(point, id, isSelf, name, dataType) {
    this._point = point;
    this._id = id;
    this._name = name;
    this._isSelf = isSelf;
    this._dataType = dataType;
}

BigMarker.prototype = new BMap.Overlay();
BigMarker.prototype.initialize = function (map) {
    this._map = map;
    var markerDiv;
    if (this._isSelf) {
        markerDiv = $("<div class='marker_self' id='" + this._id + "' name='" + this._name + "' dataType='" + this._dataType + "' style='display:block'></div>")
        markerDiv.append("<div class='marker_self_bg'><strong>" + this._name + "</strong></div>");
        markerDiv.hover(
            function () { $(this).addClass("marker_self_hover"); },
            function () { $(this).removeClass("marker_self_hover"); });
    } else {
        markerDiv = $("<div class='marker' id='" + this._id + "' name='" + this._name + "' dataType='" + this._dataType + "' style='display:block'></div>")
        markerDiv.append("<div class='marker_bg'><strong>" + this._name + "</strong></div>");
        markerDiv.hover(
            function () { $(this).addClass("marker_hover"); },
            function () { $(this).removeClass("marker_hover"); });
    }
    markerDiv.click(function () { ChangeMapForRegion($(this).attr("id"), $(this).attr("dataType")); });
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





function openModal(PropertyNumber) {

    $(".modal-title").html("未知商家");

    $.ajax({
        type: "POST",
        url: "/Equipment/GetEquipment",
        async: false,
        data: {
            PropertyNumber: PropertyNumber
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        success: function (data) {
            $(".modal-title").html(data.geoms.Business.Name);
            $('#data-table').find("tbody").html("");
            $('#data-table').find("tbody").append("<tr><td>" + data.geoms.Business.Area + "</td><td>" + data.geoms.Business.Charge +
                "</td><td>" + data.geoms.Business.TradingAreaName + "</td><td>" + data.geoms.CameraCount + "</td><td>" + (data.geoms.Networking == true ? "已联网" : "未联网") + "</td></tr>");
            $(".loading-overlay").hide();
        }
    });

    $("#modal-Equipment-list").modal('show');
}



function searchLocal(key) {
    var local = new BMap.LocalSearch(map, { renderOptions: { map: map, autoViewport: false } });
    local.disableFirstResultSelection();
    local.searchInBounds(key, map.getBounds());
}
