/**
 * 求职表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ApplyforjobSchema = new mongoose.Schema({
    interspaceId:String,  //空间id
    name:String,           //求职者姓名
    sex:String,   //性别1男2女
    age:Number,    //年龄
    education:String,     //学历
    applyJob:String,     //应聘岗位
    phone:String,        //联系电话
    experience:String,     //经验
    speciality:String,     //特长
    createTime:Number,    //发布时间
});
mongoose.model('Applyforjob', ApplyforjobSchema);