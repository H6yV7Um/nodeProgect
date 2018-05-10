/**
  路演厅表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var RoadshowSchema = new mongoose.Schema({
    interspaceId:String,  //空间id
    lockMac:String,   //锁的mac
    name:String,   //会议室名称
    area:String,   //会议室面积
    personNum:Number,  //容纳人数
    address:String,   //详细地址
    deposit:Number,    //押金
    roomInfo:String,   //详细信息
    price1:Number,                  //入驻企业有期权价格
    price2:Number,              //入驻企业无期权价格
    price3:Number,            //普通用户价格
    price4:Number,                   //
    picUrl:String,
    unit:String,              //价格单位
    status:String,           //办公室状态1正常2维修中
    orderInfo:Array,        //预定情况
    createTime:Number,             //时间
});
mongoose.model('Roadshow', RoadshowSchema);