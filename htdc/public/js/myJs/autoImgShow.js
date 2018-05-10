//左右翻转图片代码
function rightTra(rightImg){
    var img = ($(rightImg).parent().prev().find("img.autoImg"))[0];
    var nowRotate = (img.style.transform).replace("rotate(","");
    var numRotate = Number(nowRotate.replace("deg)",""));
    var afterRotate = numRotate+90;
    img.style.webkitTransform = "rotate("+afterRotate+"deg)";
    img.style.msTransform = "rotate("+afterRotate+"deg)";
    img.style.transform = "rotate("+afterRotate+"deg)";
}
function leftTra(leftImg){
    var img = $(leftImg).parent().prev().find("img.autoImg")[0];
    var nowRotate = (img.style.transform).replace("rotate(","");
    var numRotate = Number(nowRotate.replace("deg)",""));
    var afterRotate = numRotate-90;
    img.style.webkitTransform = "rotate("+afterRotate+"deg)";
    img.style.msTransform = "rotate("+afterRotate+"deg)";
    img.style.transform = "rotate("+afterRotate+"deg)";
}

