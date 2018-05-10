
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

    //点击查看原图进行的操作
    $("button.lookImgtextBtn,button.lookBackImgBtn").click(function () {
        var $imgWarp = $("#imgWarp");
        var imgSrc = $(this).prevAll("img").attr("src");
        if ($imgWarp.css("display") == "none") {
            var imgStr = '<img src="' + imgSrc + '" />';
            var closeRealImg = "<button id='closeRealImg' class='btn btn-primary btn-sm'>关闭原图</button>";
            $imgWarp.append(imgStr + closeRealImg).show();
            //点击关闭原图关闭整个图片包裹框
            $("button#closeRealImg").click(function () {
                $("#imgWarp").empty().hide();
            });
        }else{
            $imgWarp.find("img").attr("src",imgSrc);
        }
    });
});