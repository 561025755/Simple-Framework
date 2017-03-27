
var arrayMarker = new Array();

var pointX = parseFloat($('#pointX').val());
var pointY = parseFloat($('#pointY').val());

// 高德地图API功能
var map = new AMap.Map("map", { zooms: [6, 18] });          // 创建地图实例
var point = new AMap.LngLat(pointY, pointX);  // 创建点坐标
map.setZoomAndCenter(6, bd_decrypt(point));
AMap.event.addListener(map, "zoomend", function () {
    map.clearMap();
    arrayMarker.splice(0, arrayMarker.length);
    clearAndReload();
});

AMap.event.addListener(map, "moveend", function () {
    clearAndReload();
});
function clearAndReload() {
    if (map.getZoom() < 10) {
        loadAreaEquipments(true);
    }
    else if (map.getZoom() < 13 && map.getZoom() >= 10) {
        loadAreaEquipments(false);
    }
    else if (map.getZoom() >= 13) {
        loadEquipmentLocation();
    }

}

function loadAreaEquipments(IsProvince) {

    $.ajax({
        type: "POST",
        url: "/Equipment/GetEquipQuantity",
        async: false,
        data: {
            IsProvince: IsProvince
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
                var centerpoint = parsePoint(data.geoms[0].Coordinate);
               
                if (changeType == 1) {
                    map.setZoomAndCenter(9, centerpoint);
                    map.clearMap();
                }
                else if (changeType == 2) {
                    map.setZoomAndCenter(12, centerpoint);
                    map.clearMap();
                }
                else {
                    map.setZoomAndCenter(14, centerpoint);
                    map.clearMap();
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
        async: false,
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

function addBigMarker(Coordinate, Code, name, changeType) {
    var point = parsePoint(Coordinate);
    if (point && !checkExsitOverlay(Code)) {
        var station;
        station = new AMap.Marker({
            position: point,
            content: Bigmarkers(Code, false, name, changeType)
        });
        map.add(station);
    }
}

function addSmallMarker(Coordinate, PropertyNumber) {
    var point = parsePoint(Coordinate);
    if (point && !checkExsitOverlay(PropertyNumber)) {
        var station;
        station = new AMap.Marker({
            position: point,
            content: Smallmarkers(this.PropertyNumber, true)
        });
        map.add(station);
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

//重新格式化站台点位坐标
function parsePoint(location) {
    var pointObj = location.split(',');
    if (pointObj && pointObj.length == 2) {
        return bd_decrypt(new AMap.LngLat(pointObj[0], pointObj[1]));
    }
    return null;
}

function Smallmarkers(id, isSelf) {
    var markerDiv = $("<div class='small_marker' id='" + id + "' isSelf='" + isSelf + "' style='display:block'></div>")
    if (isSelf) {
        markerDiv.append("<div><img src='/Images/marker-s.png'></div>");
    } else {
        markerDiv.append("<div><img src='/Images/marker-sa.png'></div>");
    }

    markerDiv.click(function () { openModal($(this).attr("id")); });
    var div = markerDiv.get(0);
    return div;
}

function Bigmarkers(id, isSelf, name, IsProvince) {
    var markerDiv;
    if (isSelf) {
        markerDiv = $("<div class='marker_self' id='" + id + "' name='" + name + "' style='display:block'></div>")
        markerDiv.append("<div class='marker_self_bg'><strong>" + name + "</strong></div>");
        markerDiv.hover(
            function () { $(this).addClass("marker_self_hover"); },
            function () { $(this).removeClass("marker_self_hover"); });
    } else {
        markerDiv = $("<div class='marker' id='" + id + "' name='" + name + "' style='display:block'></div>")
        markerDiv.append("<div class='marker_bg'><strong>" + name + "</strong></div>");
        markerDiv.hover(
            function () { $(this).addClass("marker_hover"); },
            function () { $(this).removeClass("marker_hover"); });
    }
    if (IsProvince) {
        markerDiv.click(function () { ChangeMapForRegion($(this).attr("id"), 1); });
    }
    else {
        markerDiv.click(function () { ChangeMapForRegion($(this).attr("id"), 2); });
    }

    var div = markerDiv.get(0);
    return div;
}


function openModal(PropertyNumber) {

    $(".modal-title").html("未知商家");

    $.ajax({
        type: "POST",
        url: "/Equipment/GetEquipment",
        async: false,
        data: {
            Id: PropertyNumber
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

//百度转高德
function bd_decrypt(point) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = point.lng - 0.0065, y = point.lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    return new AMap.LngLat(z * Math.cos(theta), z * Math.sin(theta));
}
//高德转百度
function bd_encrypt(point) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = point.lng, y = point.lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    return new AMap.LngLat((z * Math.cos(theta) + 0.0065), (z * Math.sin(theta) + 0.006));
}