/**
 * Created by Administrator on 2017/4/20.
 */
/**
 * 课程表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CourseSchema = new mongoose.Schema({
     teacherId:String ,   //所属导师id
     cName:String,        //课程名称
     cPicUrl:String,      //课程图片
     startTime:Number,   //课程开始时间
     endTime:Number,     //结束时间
     detailPlace:String, //课程详细地址
     innerspace:String,   //课程隶属空间
     cInfo:String,        //课程简介
     detail:String,       //课程详情
     type:String,         //体系
     price1:Number,    //入孵企业占股权
     price2:Number,     //入孵企业未占股权
     price3:Number,     //未入孵企业
     useinfo:String,    //使用说明
     createTime:Number,   //创建时间
});
mongoose.model('Course', CourseSchema);