
var ambary = require('../searchModels/ambary');
var balsam_pear = require('../searchModels/balsam_pear');
var barley = require('../searchModels/barley');
var broad_bean = require('../searchModels/broadbean');
var cabbage = require('../searchModels/cabbage');
var carrot = require('../searchModels/carrot');
var celery = require('../searchModels/celery');
var coriander = require('../searchModels/coriander');
var corn = require('../searchModels/corn');
var cotton = require('../searchModels/cotton');
var cucumber = require('../searchModels/cucumber');
var day_lily = require('../searchModels/day_lily');
var flax = require('../searchModels/flax');
var leek = require('../searchModels/leek');
var lettuce = require('../searchModels/lettuce');
var mung = require('../searchModels/mung');
var oats = require('../searchModels/oat');
var onion = require('../searchModels/onion');
var peanut = require('../searchModels/peanut');
var peas = require('../searchModels/peas');
var pepper = require('../searchModels/pepper');
var radish = require('../searchModels/radish');
var rape = require('../searchModels/rape');
var red_bean = require('../searchModels/red_bean');
var rice = require('../searchModels/rice');
var soybean = require('../searchModels/soybeans');
var squash = require('../searchModels/squash');
var sunflower = require('../searchModels/sunflower');
var tomatoes = require('../searchModels/tomatoes');
var towel_gourd = require('../searchModels/towel_gourd');
var wheat = require('../searchModels/wheat');

var fs = require("fs");
var COS = require('./cos/sdk/cos');
var config = require("../common/config");



var getDataByName = function (name) {
    var data;
    switch (name) {
        case 'ambary':
            data = ambary;
            break;
        case 'balsam_pear':
            data = balsam_pear;
            break;
        case 'barley':
            data = barley;
            break;
        case 'broad_bean':
            data = broad_bean;
            break;
        case 'cabbage':
            data = cabbage;
            break;
        case 'carrot':
            data = carrot;
            break;
        case 'celery':
            data = celery;
            break;
        case 'coriander':
            data = coriander;
            break;
        case 'corn':
            data = corn;
            break;
        case 'cotton':
            data = cotton;
            break;
        case 'cucumber':
            data = cucumber;
            break;
        case 'day_lily':
            data = day_lily;
            break;
        case 'flax':
            data = flax;
            break;
        case 'leek':
            data = leek;
            break;
        case 'lettuce':
            data = lettuce;
            break;
        case 'mung':
            data = mung;
            break;
        case 'oats':
            data = oats;
            break;
        case 'onion':
            data = onion;
            break;
        case 'peanut':
            data = peanut;
            break;
        case 'peas':
            data = peas;
            break;
        case 'pepper':
            data = pepper;
            break;
        case 'radish':
            data = radish;
            break;
        case 'rape':
            data = rape;
            break;
        case 'red_bean':
            data = red_bean;
            break;
        case 'rice':
            data = rice;
            break;
        case 'soybean':
            data = soybean;
            break;
        case 'squash':
            data = squash;
            break;
        case 'sunflower':
            data = sunflower;
            break;
        case 'tomatoes':
            data = tomatoes;
            break;
        case 'towel_gourd':
            data = towel_gourd;
            break;
        case 'wheat':
            data = wheat;
            break;
        default:
            data = wheat;
            break;
    }
    return data;
};

/**
 * 上传图片到万象优图
 * @param filePath 图片在服务器上的路径+名字
 * @param fileid 存储key值
 * @param fn 回调函数
 */
var uploadPicToWxyt = function (filePath, fileid, fn) {
    var params = {
        Bucket: config.wxytConfig.bucket, /* 必须 */
        Region: 'cn-east',  //cn-south、cn-north、cn-east  /* 必须 */
        Key: fileid, /* 必须 */
        Body: filePath, /* 必须 */
        ContentLength: fs.statSync(filePath).size, /* 必须 */
    };

    COS.putObject(params, function (err, data) {
        if (err) {
            fn(errors.error4, null);
        } else {
            fn(null, data);
        }
    });
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
module.exports = {
    getDataByName: getDataByName,
    uploadPicToWxyt:uploadPicToWxyt,
    createVercode:createVercode
};