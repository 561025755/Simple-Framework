//获取查询参数
//var oid = $("#OrderId").val();
//var size = $("#Size").val();
//var grade = $("#Grade").val();

var arrayMarker = new Array();


// 百度地图API功能
var map = new BMap.Map("map", { minZoom: 10, maxZoom: 15 });          // 创建地图实例

map.centerAndZoom(new BMap.Point("104.06792346330406", "30.679942845419565"), 12);

map.enableScrollWheelZoom(); //启动地图缩放
map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件


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
        success: function (data) {
            ////设置中心坐标
            var centerPoint = parsePoint(data.Coordinate);
            map.centerAndZoom(centerPoint, 12);
            map.clearOverlays();

            $(data.list).each(function (index, obj)
            {
                debugger
                setTimeout('addSmallMarker(\'' + obj.Bdlongitude + "," + obj.Bdlatitude + '\',\'' + obj.PropertyNumber + '\')', 10)
                //setTimeout('addSmallMarker(\'' + data.Coordinate + '\',\'' + this.PropertyNumber + '\')', 100)
                //var point = new BMap.Point(obj.Business.BdLongitude, obj.Business.BdLatitude);
                //if (point && !checkExsitOverlay(obj.PropertyNumber)) {
                //    var station;
                //    station = new SmallMarker(point, obj.PropertyNumber, true);
                //    map.addOverlay(station);
                //}
            });
        }
    });
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
    if ($.inArray(id, arrayMarker) > -1) {
        return true;
    }
    else {
        arrayMarker.push(id);
        return false;
    }


    ////获取目前已经存在的所有站台
    //var overlays = map.getPanes().labelPane.children;
    //var flag = false;
    //$.each(overlays, function (i, n) {
    //    if ($(n).attr('id') == id) {
    //        flag = true;
    //        return false;
    //    }
    //});

    //return flag;
}


//重新格式化站台点位坐标
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
    var markerDiv = $("<div class='small_marker' id='" + this._id + "' isSelf='" + this._isSelf + "' style='display:block;'></div>")
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

