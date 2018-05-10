/**
 * bug跟踪表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var BugTrackSchema = new mongoose.Schema({
	info:String,                        //bug信息
	createTime:Number,                  //时间
});


mongoose.model('BugTrack', BugTrackSchema);