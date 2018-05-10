/**
 * 工位表表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var StationSchema = new mongoose.Schema({
    officeId:String,                    //办公室id
    stationId:String,              //工位编号
    price1:Number,                  //入驻企业有期权价格
    price2:Number,              //入驻企业无期权价格
    price3:Number,            //普通用户价格
    price4:Number,                   //
    enterpriseId:String,  //入驻企业id
    enterpriseName:String,
    enterpriseUserId:String,   //入驻企业userid
    status:Number,          //工位状态1入驻企业占用2维修中0可预约
    orderTime:Array,        //已被预约的时间
    createTime:Number,
});
mongoose.model('Station', StationSchema);