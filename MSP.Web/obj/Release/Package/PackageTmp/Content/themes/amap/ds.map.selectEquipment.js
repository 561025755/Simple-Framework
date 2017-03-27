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
var map = new AMap.Map("map", { zooms: [10, 18] });          // 创建地图实例
var point = parsePoint(DefaultCoordinate);  // 创建点坐标
map.setZoomAndCenter(12, point);


AMap.event.addListener(map, "zoomend", function () {
    clearAndReload(true);
});

AMap.event.addListener(map, "moveend", function () {
    clearAndReload(false);
});


function SetCenterTag() {
    map.clearMap();
    arrayMarker.splice(0, arrayMarker.length);
    var radius = $("#Radius").val();
    radius = $("#Radius").val() * 100;

    var showall = false;
    if ($('#ckShowAllStation').attr("checked") || $('#ckShowAllStation').attr("checked") == "checked")
        showall = true;
    if ($("#pointVS").val() == "") {
        var bdpoint = bd_encrypt(map.getCenter());
        $("#pointVS").val(bdpoint.lng + "," + bdpoint.lat)
    }
    var currpoint =parsePoint($("#pointVS").val());

    //重新标注区域中心坐标
    //map.setZoomAndCenter(13, currpoint);

    var myIcon = new AMap.Icon({ image: "/Images/marker-blue.png", size: new AMap.Size(24, 36) });
    var marker = new AMap.Marker({
        icon: myIcon,
        position: currpoint
    });

    marker.setDraggable(true);
    marker.on("dragend", function (e) {
        var ePoint = bd_encrypt(e.lnglat);
        $("#pointVS").val(ePoint.lng + "," + ePoint.lat)
        SetCenterTag();
    });
    map.add(marker);

    var circle = new AMap.Circle({ radius: radius, center: currpoint, fillColor: "blue", strokeWeight: 1, fillOpacity: 0.1, strokeOpacity: 0.1 });
    map.add(circle);
    loadBusinessLocationByRadius($("#DefaultCityCode").val(), $("#pointVS").val(), radius);
}

function clearAndReload(IsClear) {
    if (IsClear) {
        arrayMarker.splice(0, arrayMarker.length);
        map.clearMap();
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
            debugger
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
        station = new AMap.Marker({
            position: point,
            content: Bigmarkers(Code, false, name )
        });
        map.add(station);
    }
}


function addSmallMarker(Coordinate, Code, isSelf) {

    var point = parsePoint(Coordinate);
    if (point && !checkExsitOverlay(Code)) {
        var station;
        station = new AMap.Marker({
            position: point,
            content: Smallmarkers(Code, isSelf)
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

    markerDiv.click(function () { openModal($(this).attr("id"), $(this)); });
    var div = markerDiv.get(0);
    return div;
}

function Bigmarkers(id, isSelf, name) {
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
  
    var div = markerDiv.get(0);
    return div;
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
                if (obj.IsChecked)
                {
                    checkNumber++;
                    operationBtn = '<a href="javascript:;" onclick="DeleteEquipment(\'' + obj.PropertyNumber + '\')" class="btn show-detail-json  btn-success btn-xs">移除</a>'
                }
                else
                {
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

function DeleteEquipment(PropertyNumber)
{
    $.ajax({
        type: 'POST',
        url: '/DF_OwnOrder/DeleteEquipment',
        data: { PropertyNumber: PropertyNumber, orderId: orderId },
        dataType: 'JSON',
        success: function (datas) {
            if(datas.success)
            {
                $("#modal-Equipment-list").modal('hide');
                gritter("友情提示！", "移除成功");
                checkNumber--;
                if(checkNumber==0)
                {
                    $(markerObj).find("img").attr("src", "/Images/marker-sa.png");
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