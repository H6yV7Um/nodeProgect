var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var session = require('express-session');
var date = require("../common/date");
var orderstatus = require("../common/orderstatus")
var mongoose = require("mongoose");
var md5 = require("md5");
var errors = require("../common/errors")

/* GET home page. */
router.get('/index', function(req, res, next) {
    res.render('login');
});
/*
 /登录
 */
router.post('/login', function(req, res, next) {
    Shop.find({account:req.body.account},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            if(docs.length > 0){
                var encryptedPw = md5(md5(req.body.password)+docs[0].salt);
                if(encryptedPw == docs[0].password){
                    req.session.shopuser = {
                        userInfo: docs[0],
                    };
                    console.log(req.session.shopuser)
                    var ret = errors.error0;
                    res.status(200).json(ret);

                }else{
                    res.status(200).json(errors.error60003);
                }
            }else{
                //用户不存在
                res.status(200).json(errors.error60002);
            }
        }
    })
});

module.exports = router;