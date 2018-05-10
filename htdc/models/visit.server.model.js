/**
 * 用户记录Schema
 * 创建者：陆胜鹰
 * 创建时间：2018.3.24
 *
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var VisitSchema = new mongoose.Schema({
    //                              GET示例    /1.0/users/getuser/123/123/456/789
    functionClass:String,     //模块   users
    functionName:String,      //方法名 getuser
    Method:String,            //方法类型 GET、POST
    body:Object,              //userid  {userid:"123123",age : 21} 只有在POST等包含body类型中使用
    paramsList:Array,        //["123","123","456"] GET方法及其他有地址栏参数才有
    paramsJson:Array,        //对包含userId的字段进行捕捉得到的Json的对象，只存在于有userId的GET请求中
    userId:String,            //userid
    type:{
        type:Number,
        default:2
    },            //1 为 中间件获取 ，2 为 单独getUserid 获取方式获取
    createTime:Number,  //时间
});


mongoose.model('Visit', VisitSchema);

