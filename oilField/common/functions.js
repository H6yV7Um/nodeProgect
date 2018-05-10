var express = require('express');
var app = express();
var now = new Date();
var config = require('../common/config');
var errors = require("../common/errors");
var md5 = require('md5')
var session = require("session");


//var schedule = require('node-schedule');
//var Mesg = mongoose.model("Mesg");
// var Contributelist = mongoose.model("Contributelist");

/**
 * 去除字符串左右空格
 * @returns {XML|*|void|{by}|string}
 */
var trim = function (str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}


// 给月和天，不足两位的前面补0
function fz(num) {
    if (num < 10) {
        num = "0" + num;
    }
    return num
}
// 获取间隔天数
var getDays = function (day1, day2) {

// 给Date对象添加getYMD方法，获取字符串形式的年月日
    Date.prototype.getYMD = function () {

        // 将结果放在数组中，使用数组的join方法返回连接起来的字符串，并给不足两位的天和月十位上补零
        return [this.getFullYear(), fz(this.getMonth() + 1), fz(this.getDate())].join("-");
    }

// 给String对象添加getDate方法，使字符串形式的日期返回为Date型的日期
    String.prototype.getDate = function () {
        var strArr = this.split('-');
        return new Date(strArr[0], strArr[1] - 1, strArr[2]);
    }
    // 获取入参字符串形式日期的Date型日期
    var st = day1.getDate();
    var et = day2.getDate();

    var retArr = [];

    // 获取开始日期的年，月，日
    var yyyy = st.getFullYear(),
        mm = st.getMonth(),
        dd = st.getDate();

    // 循环
    while (st.getTime() != et.getTime()) {
        retArr.push(st.getYMD());

        // 使用dd++进行天数的自增
        st = new Date(yyyy, mm, dd++);
    }

    // 将结束日期的天放进数组
    retArr.push(et.getYMD());
    retArr.splice(0, 1);


    return retArr; // 或可换为return ret;
}

//格局化日期：yyyy-MM-dd
var formatDate = function(date) {
    var myyear = date.getFullYear();
    var mymonth = date.getMonth() + 1;
    var myweekday = date.getDate();

    if (mymonth < 10) {
        mymonth = "0" + mymonth;
    }
    if (myweekday < 10) {
        myweekday = "0" + myweekday;
    }
    return (myyear + "-" + mymonth + "-" + myweekday);
}

/**
 * 把时间戳转换成日期格式
 * @param strms时间戳
 * @returns {string}日期格式
 */
var timeFormat = function (strms) {
    var date = new Date(strms);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes();
    // var s = date.getSeconds();
    return Y + M + D + h + m ;
}
/**
 * 把时间戳转换成日期格式
 * @param strms时间戳
 * @returns {string}日期格式
 */
var timeForday = function (strms) {
    var date = new Date(strms);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    // var h = date.getHours() + ':';
    // var m = date.getMinutes();
    // var s = date.getSeconds();
    return Y + M + D  ;
}

/**
 * 生成随机数
 * @param codeLength 随机数长度
 * @returns {string} 返回值
 */
var createVercode = function (codeLength) {
    code = "";
    var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);//随机数
    for (var i = 0; i < codeLength; i++) {//循环操作
        var index = Math.floor(Math.random() * 10);
        code += random[index];//根据索引取得随机数加到code上
    }
    return code;
}

/**
 *数组去重
 * @param arr
 */
var arrayUniq = function (arr) {
    var n = []; //一个新的临时数组
    //遍历当前数组
    for(var i = 0; i < arr.length; i++){
//如果当前数组的第i已经保存进了临时数组，那么跳过，
//否则把当前项push到临时数组里面
        arr[i]=arr[i].join()
        if (n.indexOf(arr[i]) == -1) {
            n.push(arr[i]);
        }
    }
    for(var j = 0; j < n.length; j++){
        n[j]=n[j].split(',')
    }
    return n;
};

module.exports = {
    createVercode: createVercode,
    trim: trim,
    timeFormat: timeFormat,
    fz: fz,
    formatDate: formatDate,
    getDays: getDays,
    timeForday: timeForday,
    arrayUniq: arrayUniq,
}