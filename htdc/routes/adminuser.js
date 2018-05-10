var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var User = mongoose.model("User");

/**
 * 所有用户列表
 *  
 */
router.get('/test',function (req,res) {
    User.update({account:'18734881530'},{'interspaceId':'591fdee4b06f7c6b47dc53b6'},function (err,doce) {
        if(err){
                res.render("nodata")
        }else {
            res.render('login')
        }
    })
})
router.get("/alluserslist",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ha', userinfo.arr);
        var pagesize = 7;
        var counturl = "/adminuser/getallusers/1/" + pagesize + '/1';
        var dataurl = "/adminuser/getallusers/2/" + pagesize;
        res.render('adminuser/userlist_mng',{
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})

/**
 * 查询所有用户
 */
router.get("/getallusers/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            User.count({}).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    res.status(200).json(docs);
                }
            })
            break;
        case '2':
            User.find({}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    res.status(200).json(docs);
                }
            })
            break;

    }
})
module.exports = router;