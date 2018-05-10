/**
 * 请求表Schema
 * 此表记录每一次接口调用请求数据，调测用
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var RequestSchema = new mongoose.Schema({
    _requestId:String,          //请求ID
    request:{},                 //请求的参数
    response:{},                //返回的结果
});

mongoose.model('Request', RequestSchema);