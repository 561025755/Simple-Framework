
//parameters  最大单个文件大小,允许上传的文件类型
function UploadInit(MaxFileSize, AcceptFileTypes) {
    var id = $("#Id").val();
    var controller = $("#ControllerName").val();
    var action = $("#ActionName").val();
    if (MaxFileSize == null) {
        MaxFileSize = 10e6;
    }
    if (AcceptFileTypes == null) {
        AcceptFileTypes = /(\.|\/)(gif|jpe?g|png|pdf|tif|bmp)$/i;
    }

    //文件上传
    $("#fileupload").fileupload({
        autoUpload: false,
        disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
        maxFileSize: MaxFileSize,
        acceptFileTypes: AcceptFileTypes,

        //开启此项  将失去文件预览功能
        disableImageLoad: true
    });
    $("#fileupload").fileupload(
        "option",
        "redirect",
        window.location.href.replace(/\/[^\/]*$/, "/cors/result.html?%s")
        );
    if ($.support.cors) {
        $.ajax({ type: "HEAD" }).fail(function () {
            $('<div class="alert alert-danger"/>').text("Upload server currently unavailable - " + new Date).appendTo("#fileupload")
        })
    }

    getfile(id, controller, action, $("tbody[class='files']").eq(0));

}


function delete_File(p, id) {
    $.post("/" + $("#ControllerName").val() + "/DeleteFiles", { id: id }, function (data) {
        if (data.success) {
            $(p).closest('tr').remove();
        } else {
            $.alertMsg(data.msg);
        }
    });
}


function getfile(id, controllerName, actionName, block) {
    $.post("/" + controllerName + "/GetUpFiles", { contractid: id, controllerName: controllerName, actionName: actionName }, function (data) {
        $.each(data.files, function (e) {
            var row;
            row = ("<tr class='template-download fade in'>");
            row += ("<td><span class='preview'>");
            row += ("</span></td>");
            row += ("<td><p class='name'>");
            row += ("<a href=" + data.files[e]["url"] + " title=" + data.files[e]["name"] + " download=" + data.files[e]["name"] + ">" + data.files[e]["name"] + "</a>");
            row += ("</p></td>");
            row += ("<td><span class='size'>" + data.files[e]["size"] + "KB</span></td>");
            row += ("<td>");
            row += ("<button type='button' onclick='delete_File(this, " + data.files[e]["file_id"] + ")' class='btn btn-danger' data-type='' >");
            row += ("<i class='glyphicon glyphicon-trash'></i>&nbsp<span>删除</span>");
            row += ("</button></td>");
            row += ("</tr>");
            block.append(row);
        })
    });
}