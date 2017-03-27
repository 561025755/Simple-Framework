
function markPoint(map, pointObj) {
    var point = bd_decrypt(new AMap.LngLat(pointObj.lng, pointObj.lat));  // 创建点坐标

    var myIcon = new AMap.Icon({ image: "/Images/marker.png", size: new AMap.Size(21, 32) });
    var marker = new AMap.Marker({ position: point, icon: myIcon });
    map.add(marker);

    return point;
}

var handleMapAndMarker = function (opt) {
    "use strict";
    var location = opt.pointObj;
    var pointX = parseFloat($('#pointX').val());
    var pointY = parseFloat($('#pointY').val());

    var map = new AMap.Map(opt.mapContainerId);          // 创建地图实例

    var pointObj = opt.pointObj;

    if (pointObj && pointObj.lng && pointObj.lat) {
        var point = markPoint(map, pointObj);
        map.setZoomAndCenter(13, point);
    }
    else {
        var point = new AMap.LngLat(pointY, pointX);  // 创建点坐标
        map.setZoomAndCenter(13, point);
    }

    //map.enableScrollWheelZoom();
    //map.addControl(new AMap.NavigationControl());  //添加默认缩放平移控件

    if (typeof opt.markCallback === "function") {
        map.setDefaultCursor("crosshair");
        map.on("click", function (e) {
            map.clearMap();
            var pointObj = { lng: e.lnglat.lng, lat: e.lnglat.lat };
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