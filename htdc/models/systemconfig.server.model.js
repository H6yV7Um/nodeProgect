/**
 * 系统参数表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var SystemconfigSchema = new mongoose.Schema({
    interspaceId:String,    //空间id
    meetingLink:{               //会议接待联系方式
        linkName:String,
        linkPhone:String,
        email:String,
        data:String,
    },
    mediaLink:{                //立体媒体联系方式
        linkName:String,
        linkPhone:String,
        email:String,
    }
});


mongoose.model('Systemconfig', SystemconfigSchema);

