var express = require('express');
var router = express.Router();
var md5 = require('md5');
var functions = require("../common/functions")
var authorty = require("../common/authorty")
var config = require("../common/config")
var errors = require("../common/errors")
var mongoose = require("mongoose");
var Adminuser = mongoose.model("Adminuser");

router.get("/test",function(req,res){
    Adminuser.update({_id:'5929328aff85b50b4c611b75'},{'authorization':['O','V','A']},function(err,docs){
        res.send(docs)
    })
})

/**
 * 查看所有用户
 */
router.get("/adminuserlist",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Sa', userinfo.arr);
        var pagesize = 7;
        var counturl = "/adminuseradmin/getallusers/1/" + pagesize + '/1';
        var dataurl = "/adminuseradmin/getallusers/2/" + pagesize;
        //var userinfo = req.session.shopuser;
        res.render('adminuseradmin/adminuserlist_mng',{
            leftNav:leftNav,
            counturl:counturl,
            dataurl:dataurl,
            pagesize:pagesize,
            userinfo:userinfo,
        })
    }else {
        res.render('login')
    }

})

router.get("/getallusers/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var userinfo = req.session.adminuser;
    if(userinfo){
        var interspaceId=userinfo.adminuserInfo.interspaceId
        var type = userinfo.adminuserInfo.identity;
        if(type == '1'){
            var obj={
                identity:'3'
            }
        }else{
            var obj={
                interspaceId:interspaceId,
                identity:'4'
            }
        }
        switch(req.params.type){
            case '1':
                Adminuser.count(obj).exec(function(err,docs){
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
                Adminuser.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = new Array()
                        for(var i=0;i<docs.length;i++){
                            var str= ''
                            for(var y=0;y<docs[i].authorization.length;y++){
                                for(var x=0;x<authorty.length;x++){
                                    if((docs[i].authorization[y] == authorty[x].code) && (docs[i].authorization[y] != 'A') && (docs[i].authorization[y] != 'V'))
                                    str = str + ';'+authorty[x].name
                                }
                            }
                            var obj = {
                                admin:str.substr(1)
                            }
                            var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(newjson)
                        }
                        res.status(200).json(data);
                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 添加管理者
 */
router.get("/addadminuser",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var data = new Array()
        for(var i=0;i<userinfo.arr.length;i++){
            for(var j=0;j<authorty.length;j++){
                if(userinfo.arr[i] == authorty[j].code){
                    var obj = {
                        code:authorty[j].code,
                        name:authorty[j].name,
                    }
                    data.push(obj)
                }
            }
        }
        var leftNav = functions.createLeftNavByCodes('Sb', userinfo.arr);
        res.render('adminuseradmin/addadminuser_mng',{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo,
            admins:data
        })
    }else {
        res.render('login')
    }

})



/**
 * 处理添加管理者
 */
router.post("/insertadminuser",function(req,res){
var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var type = userinfo.adminuserInfo.identity;
        var salt = functions.createVercode(4);
        var encryptedPw = md5(md5('123456')+salt);
        if(typeof(req.body.authorization) == 'string'){
            var arr = []
            arr.push(req.body.authorization)
            arr.push('V','A')
            var obj = {
                account:req.body.account,     //用户账号（手机号）
                userName:req.body.String,   //用户姓名
                salt:salt,       //盐
                authorization:arr,
                password:encryptedPw,    //密码
                createTime:Date.now(),
            }
            if(type == '1'){
                obj.identity = '3'
            }else{
                obj.identity = '4';
                obj.interspaceId = interspacesid
            }
            var adminuser = new Adminuser(obj)
            adminuser.save(function(err,data){
                if(err){
                    res.render('nodata')
                }else{
                    res.redirect("/adminuseradmin/adminuserlist")
                }
            })
        }else{
            req.body.authorization.push('V','A')
            var obj = {
                account:req.body.account,     //用户账号（手机号）
                userName:req.body.String,   //用户姓名
                salt:salt,       //盐
                authorization:req.body.authorization,
                password:encryptedPw,    //密码
                createTime:Date.now(),
            }
            if(type == '1'){
                obj.identity = '3'
            }else{
                obj.identity = '4';
                obj.interspaceId = interspacesid
            }
            var adminuser = new Adminuser(obj)
            adminuser.save(function(err,data){
                if(err){
                    res.render('nodata')
                }else{
                    res.redirect("/adminuseradmin/adminuserlist")
                }
            })
        }

    }else{
        res.render('login')
    }

})

router.post("/getuser",function(req,res) {
    Adminuser.find({account: req.body.account}, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3)
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error60006)
            }else{
                res.status(200).json(errors.error0)
            }
        }
    })

})

/**
 * 编辑管理员
 */
router.get("/editadmin/:adminid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        Adminuser.find({_id:req.params.adminid},function(err,admin){
            if(err){
                res.render('nodata')
            }else{
                var data = new Array()
                for(var i=0;i<userinfo.arr.length;i++){
                    for(var j=0;j<authorty.length;j++){
                        if(userinfo.arr[i] == authorty[j].code){
                            var obj = {
                                code:authorty[j].code,
                                name:authorty[j].name,
                            }
                            data.push(obj)
                        }
                    }
                }
                var leftNav = functions.createLeftNavByCodes('Sa', userinfo.arr);
                res.render('adminuseradmin/editadminuser_mng',{
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo,
                    admins:data,
                    admin:admin[0]
                })
            }
        })
    }else{
        res.render('login')
    }

})

/**
 * 处理修改管理员信息
 */
router.post("/updateadminuser",function(req,res){
    var newarr = []
    //{ account: '123456', authorization: [ 'P', 'T', 'S' ] }
    if(typeof(req.body.authorization) == 'string') {
        newarr.push(req.body.authorization)
        newarr.push('V', 'A')

    }else{
        req.body.authorization.push('V', 'A')
        newarr = req.body.authorization
    }
    Adminuser.update({_id:req.body.adminid},{'authorization':newarr},function(err,admin){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/adminuseradmin/adminuserlist")
        }
    })
})

router.post("/delete",function(req,res){
    Adminuser.remove({_id:req.body.adminuserid},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/adminuseradmin/adminuserlist")
        }
    })
})
router.post('/update',function (res,req) {
    var obj={
        nickName:req.body.nickName
    }
    Adminuser.update({_id:req.body.adminuserid},obj,function (err,docs){
        if(err){
            res.render("nodata")
        }else {
            res.redirect("/login/index")
        }
    })
})

module.exports = router;