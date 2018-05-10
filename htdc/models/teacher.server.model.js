/**
 * 导师表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeacherSchema = new mongoose.Schema({
    tName:String,           //导师姓名
    title:String,           //职称
    headimgUrl:String,     //导师图片
    backImgUrl:String,        //背景图片
    sex:String,             //性别
    track:String,          //通道
    courseType:String,     //学科类型
    createTime:{type:Number,default:Date.now()},
    teamId:Number,          //团队
    teacherInfo:String,    //导师简介
    teacherDetail:String,    //导师详情
    tplaceId:String,      //显示位置
    isStick:{type:Number,default:0},       //是否置顶 0不置顶，1置顶
    stickTime:Number,      //置顶时间
});
mongoose.model('Teacher', TeacherSchema);