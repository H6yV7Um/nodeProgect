
$(function () {
    //点击取消驳回隐藏和显示div.rejectContent
    $("button.rejectBtn").click(function () {
        document.getElementById("mask").style.display = "block";
        $(this).parents("div.form-group").prev("div.rejectContent").css("display", "block");
    });
    $("button.closeReject").click(function () {
        document.getElementById("mask").style.display = "none";
        $(this).parents(".rejectContent").css("display", "none");
    });
});