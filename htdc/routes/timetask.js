var express = require('express');
var router = express.Router();
var config = require("../common/config");
var functions = require("../common/functions");
var mongoose = require("mongoose");
var User = mongoose.model("User");


var schedule = require('node-schedule');
var task = new schedule.RecurrenceRule();
task.hour = 00;
var d = schedule.scheduleJob(task, function(){
    console.log('定时任务定时任务定时任务定时任务定时任务定时任务定时任务定时任务定时任务定时任务')
    User.update({$isolated : 1},{isDaySignin:0},{multi: true},function(err,docs){
        if(err){
            return true
        }else{
            return true
        }
    })
})

module.exports = router;