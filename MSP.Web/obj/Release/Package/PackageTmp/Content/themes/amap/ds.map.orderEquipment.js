var arrayMarker = new Array();


// 百度地图API功能
var map = new AMap.Map("map", { zooms: [10, 15] });          // 创建地图实例

var point = new AMap.LngLat("104.06792346330406", "30.679942845419565");  // 创建点坐标
map.setZoomAndCenter(12, bd_decrypt(point));



function clearAndReload(orderId, cityCode) {
    arrayMarker.splice(0, arrayMarker.length);
    loadEquipmentLocation(orderId, cityCode);
}



function loadEquipmentLocation(orderId, cityCode) {
    $.ajax({
        type: "POST",
        url: "/DF_OwnOrder/getOrderEquipmentLocations",
        async: false,
        data: {
            orderId: orderId,
            cityCode: cityCode
        },
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) { $(".loading-overlay").hide(); },
        success: function (data) {
            ////设置中心坐标
            var centerPoint = parsePoint(data.Coordinate);
            map.setZoomAndCenter(12, centerPoint);
            map.clearMap();
            $(data.list).each(function (index, obj)
            {
                //setTimeout('addSmallMarker(\'' + data.Coordinate + '\',\'' + this.PropertyNumber + '\')', 100)
                setTimeout('addSmallMarker(\'' + obj.Bdlongitude + "," + obj.Bdlatitude + '\',\'' + obj.PropertyNumber + '\')', 10)
            });
            $(".loading-overlay").hide();
        }
    });
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
    if ($.inArray(id, arrayMarker) > -1) {
        return true;
    }
    else {
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