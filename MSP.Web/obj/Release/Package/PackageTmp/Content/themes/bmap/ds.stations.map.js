
function markPoint(map, pointObj) {
    var point = new BMap.Point(pointObj.lng, pointObj.lat);  // 创建点坐标

    var myIcon = new BMap.Icon("/Images/marker.png", new BMap.Size(21, 32));
    var marker = new BMap.Marker(point, { icon: myIcon });
    map.addOverlay(marker);

    return point;
}

var handleMapAndMarker = function (opt) {
    "use strict";

    var pointX = parseFloat($('#pointX').val());
    var pointY = parseFloat($('#pointY').val());

    // 百度地图API功能
    var map = new BMap.Map(opt.mapContainerId);          // 创建地图实例

    var pointObj = opt.pointObj;

    if (pointObj && pointObj.lng && pointObj.lat) {
        var point = markPoint(map, pointObj);
        map.centerAndZoom(point, 16);
    }
    else {
        var point = new BMap.Point(pointY, pointX);  // 创建点坐标
        map.centerAndZoom(point, 16);
    }

    map.enableScrollWheelZoom();
    map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件

    if (typeof opt.markCallback === "function") {
        map.setDefaultCursor("crosshair");
        map.addEventListener("click", function (e) {
            map.clearOverlays();
            var pointObj = { lng: e.point.lng, lat: e.point.lat };
            markPoint(map, pointObj);
            opt.markCallback(pointObj);
        });
    }
};

var DSMap = function (opt) {
    "use strict";

    var options = {
        mapContainerId: "map",
        pointObj: null,
        markCallback: null,
    };

    if (opt) {
        options.mapContainerId = opt.mapContainerId || options.mapContainerId;
        options.pointObj = opt.pointObj || options.pointObj;
        options.markCallback = opt.markCallback || options.markCallback;
    }

    return {
        init: function (options) {
            handleMapAndMarker(options);
        }
    }
}()