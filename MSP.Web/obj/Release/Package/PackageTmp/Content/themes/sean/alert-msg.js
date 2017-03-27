var alertHtml = "";
alertHtml += "<div class=\"modal fade\" id=\"sys_alert_div\" aria-hidden=\"true\">";
alertHtml += "<div class=\"modal-dialog\">";
alertHtml += "<div class=\"modal-content\">";
alertHtml += "<div class=\"modal-header\">";
alertHtml += "<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>";
alertHtml += "<h4 class=\"modal-title\">系统提示</h4>";
alertHtml += "</div>";

alertHtml += "<div class=\"modal-body\">";
alertHtml += "<div class=\"alert alert-danger m-b-0\" id=\"sys_alert_msg\">";
alertHtml += "</div>";
alertHtml += "</div>";
alertHtml += "<div class=\"modal-footer\">";
alertHtml += "<a href=\"javascript:;\" data-dismiss=\"modal\" class=\"btn btn-sm btn-success\" id=\"sys_commit_btn\">确认</a>";
alertHtml += "</div>";
alertHtml += "</div>"
alertHtml += "</div>";
alertHtml += "</div>";


var alertConfirmHtml = "";
alertConfirmHtml += "<div class=\"modal fade\" id=\"sys_alertConfirm\" aria-hidden=\"true\">";
alertConfirmHtml += "<div class=\"modal-dialog\">";
alertConfirmHtml += "<div class=\"modal-content\">";
alertConfirmHtml += "<div class=\"modal-body\">";
alertConfirmHtml += "<div class=\"alert alert-danger m-b-0\">";
alertConfirmHtml += "<h4><i class=\"fa fa-info-circle\"></i> <span>已经为该订单创建了确认单</span> </h4>";
alertConfirmHtml += "<p>您确定要删除该订单连同确认单吗？</p>";
alertConfirmHtml += "</div>";
alertConfirmHtml += "</div>";
alertConfirmHtml += "<div class=\"modal-footer\">";
alertConfirmHtml += "<a href=\"javascript:;\" class=\"btn btn-sm btn-white\" data-dismiss=\"modal\">取消</a>";
alertConfirmHtml += "<a id=\"sys_confirmBtn\" href=\"javascript:;\" class=\"btn btn-sm btn-danger\" data-dismiss=\"modal\" onclick=\"deleteOrder()\">确定</a>";
alertConfirmHtml += "</div>";
alertConfirmHtml += "</div>";
alertConfirmHtml += "</div>";
alertConfirmHtml += "</div>";

$(function () {
    $("body").append(alertHtml);
    $("body").append(alertConfirmHtml);
});

jQuery.alertMsg = function (msg) {
    $("#sys_alert_msg").text(msg);
    $("#sys_alert_div").modal("show");
};


jQuery.alertConfirm = {
    //WarnMsg: function (msg) {
        
    //},
    //ConfirmMsg: function (msg) {
        
    //},
    //ConfirmFun: function (fun) {
        
    //},

    //参数:提示信息,确认信息,回调方法名
    ConfirmShow: function (WarnMsg, ConfirmMsg, Func) {
        var ele=$("#sys_alertConfirm");

        ele.find("span").eq(0).text(WarnMsg);
        ele.find("p").eq(0).text(ConfirmMsg);
        Func += "()";
        ele.find("a").eq(1).attr("onclick", Func);
        ele.modal("show");
    }
};
