var now = new Date(); //当前日期
var nowDayOfWeek = now.getDay(); //今天本周的第几天
var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
var nowYear = now.getYear(); //当前年
nowYear += (nowYear < 2000) ? 1900 : 0; //

var lastMonthDate = new Date(); //上月日期
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
var lastYear = lastMonthDate.getYear();
var lastMonth = lastMonthDate.getMonth();

//格局化日期：yyyy-MM-dd
var formatDate = function(date) {
    // var date = {
    //     "M+": this.getMonth() + 1,
    //     "d+": this.getDate(),
    //     "h+": this.getHours(),
    //     "m+": this.getMinutes(),
    //     "s+": this.getSeconds(),
    //     "q+": Math.floor((this.getMonth() + 3) / 3),
    //     "S+": this.getMilliseconds()
    // };
    // if (/(y+)/i.test(format)) {
    //     format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    // }
    // for (var k in date) {
    //     if (new RegExp("(" + k + ")").test(format)) {
    //         format = format.replace(RegExp.$1, RegExp.$1.length == 1
    //             ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
    //     }
    // }
    // return format;
    // var myyear = date.getFullYear();
    // var mymonth = date.getMonth() + 1;
    // var myweekday = date.getDate();
    // if (mymonth < 10) {
    //     mymonth = "0" + mymonth;
    // }
    // if (myweekday < 10) {
    //     myweekday = "0" + myweekday;
    // }

    var date = new Date(date);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0'+(date.getHours()) : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
    return Y+M+D;
    //return (myyear + "-" + mymonth + "-" + myweekday);
}

//获得某月的天数
var getMonthDays = function(myMonth) {
    var monthStartDate = new Date(nowYear, myMonth, 1);
    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
}

//获得本季度的开端月份
var getQuarterStartMonth = function() {
    var quarterStartMonth = 0;
    if (nowMonth < 3) {
        quarterStartMonth = 0;
    }
    if (2 < nowMonth && nowMonth < 6) {
        quarterStartMonth = 3;
    }
    if (5 < nowMonth && nowMonth < 9) {
        quarterStartMonth = 6;
    }
    if (nowMonth > 8) {
        quarterStartMonth = 9;
    }
    return quarterStartMonth;
}

//获得本周的开端日期
var getWeekStartDate = function() {
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
    return formatDate(weekStartDate);
}

//获得本周的停止日期
var getWeekEndDate = function() {
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
    return formatDate(weekEndDate);
}

//获得本月的开端日期
var getMonthStartDate = function() {
    var monthStartDate = new Date(nowYear, nowMonth, 1);
    return formatDate(monthStartDate);
}

//获得本月的停止日期
var getMonthEndDate = function() {
    var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
    return formatDate(monthEndDate);
}

//获得上月开端时候
var getLastMonthStartDate = function() {
    var lastMonthStartDate = new Date(nowYear, lastMonth, 1);
    return formatDate(lastMonthStartDate);
}

//获得上月停止时候
var getLastMonthEndDate = function() {
    var lastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(lastMonth));
    return formatDate(lastMonthEndDate);
}

//获得本季度的开端日期
var getQuarterStartDate = function() {

    var quarterStartDate = new Date(nowYear, getQuarterStartMonth(), 1);
    return formatDate(quarterStartDate);
}

//或的本季度的停止日期
var getQuarterEndDate = function () {
    var quarterEndMonth = getQuarterStartMonth() + 2;
    var quarterStartDate = new Date(nowYear, quarterEndMonth, getMonthDays(quarterEndMonth));
    return formatDate(quarterStartDate);
}

var formatDatenow = function(now)   {
    var   year=now.getFullYear();
    //var   month=((now.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var   month=now.getMonth()+1;

    var   date=now.getDate();
    return   year+"-"+month+"-"+date
}
module.exports = {
    getQuarterEndDate:getQuarterEndDate,
    getQuarterStartDate:getQuarterStartDate,
    getLastMonthEndDate:getLastMonthEndDate,
    getLastMonthStartDate:getLastMonthStartDate,
    getMonthEndDate:getMonthEndDate,
    getMonthStartDate:getMonthStartDate,
    getWeekEndDate:getWeekEndDate,
    getWeekStartDate:getWeekStartDate,
    getQuarterStartMonth:getQuarterStartMonth,
    getMonthDays:getMonthDays,
    formatDate:formatDate,
    formatDatenow:formatDatenow
}