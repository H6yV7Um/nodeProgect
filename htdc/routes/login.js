var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var session = require('express-session');
var date = require("../common/date");
var orderstatus = require("../common/orderstatus")
var mongoose = require("mongoose");
var md5 = require("md5");
var errors = require("../common/errors")
var Adminuser = mongoose.model("Adminuser");
var Interspace = mongoose.model("Interspace");
var Goodsclass = mongoose.model("Goodsclass");
var Officeorder = mongoose.model("Officeorder");
var Link = mongoose.model("Link");


router.get("/test",function(req,res){
    Adminuser.find({},function(err,docs){
        res.send(docs)
    })

})

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login');
});

router.get('/index', function(req, res, next) {
    var userinfo = req.session.adminuser;
    if(userinfo){
        var leftNav = functions.createLeftNavByCodes('A',userinfo.arr);
        if(userinfo.adminuserInfo.identity=='1'){
            res.render('adminuser/useroneinfo_mng',{
                leftNav:leftNav,
                userinfo:userinfo.adminuserInfo,
            });
        }else if(userinfo.adminuserInfo.identity=='2'){
            var interspaceId=userinfo.adminuserInfo.interspaceId
            Interspace.find({_id:interspaceId},function (err,docs) {
                if(err){
                    res.render("nodata")
                }else {
                    res.render('interspace/interspaceinfo_mng',{
                        leftNav:leftNav,
                        userinfo:userinfo.adminuserInfo,
                        data:docs[0]
                    });
                }
            })

        }else {
            res.render('adminuser/useroneinfo_mng',{
                leftNav:leftNav,
                userinfo:userinfo.adminuserInfo,
            });
        }

    }else{
        res.render('login')
    }

});

/*
 /登录
 */
router.post('/login', function(req, res, next) {
    console.log(typeof (req.body.account))
     var account=req.body.account.replace(/\s/g, "")
    Adminuser.find({account:account},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            if(docs.length > 0){
                var encryptedPw = md5(md5(req.body.password)+docs[0].salt);
                if(encryptedPw == docs[0].password){
                   switch(docs[0].identity){
                       case '1':
                           var arr = ['D','H','K','O','P','T','U','A','S','V','Y','X','Z','L','N','#']
                           req.session.adminuser = {
                               adminuserInfo: docs[0],
                               arr:arr
                           };
                           break;
                       case '2':
                           var arr = ['B','C','E','F','G','J','M','Q','R','S','V','A','I','W'];
                           req.session.adminuser = {
                               adminuserInfo: docs[0],
                               arr:arr
                           };
                           break;
                       default:
                           var arr = docs[0].authorization;
                           req.session.adminuser = {
                               adminuserInfo: docs[0],
                               arr:arr
                           };
                           break;
                   }

                    var ret = errors.error0;
                    res.status(200).json(ret);
                }else{
                    res.status(200).json(errors.error60003);
                }
            }else{
                //用户不存在
                res.status(200).json(errors.error10007);
            }
        }
    })
});

/**
 * 修改密码页面
 */
router.get('/revisepw',function(req,res){
    res.render('revisepw_mng')
})

/**0 * 处理修改密码
 */
router.post('/updatepw',function(req,res){
    Adminuser.find({account:req.body.account},function(err,docs){
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                var encryptedPw = md5(md5(req.body.oldpassword)+docs[0].salt);
                if(encryptedPw == docs[0].password){
                    var salt = functions.createVercode(4);
                    var newpw = md5(md5(req.body.newpassword)+salt);
                    var obj = {
                        salt:salt,
                        password:newpw
                    }
                    Adminuser.update({account:req.body.account},obj,function(err,data){
                        if(err){
                            res.status(200).json(errors.error3);
                        }else{
                     /*       req.session.shopuser = {
                                userInfo: docs[0],
                            };
                            req.session.order = {
                                shopid:docs[0].shopId,
                                order: 0,
                                voiceorder:0,
                                runorder:0
                            };*/
                            res.status(200).json(errors.error0);
                        }
                    })
                }else{
                    res.status(200).json(errors.error60004);
                }
            }else{
                res.status(200).json(errors.error60002);
            }

        }
    })
})

/*联系方式列表*/
router.get("/contactlist",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('W', userinfo.arr);
        Goodsclass.find({interspaceId:interspacesid},function(err,services){
            Link.find({interspaceId:interspacesid},function(err,link){
                var data = []
                var officephone = ''
                var loadrowphone = ''
                var meetingphone = ''
                var printphone = ''
                for(var x=0;x<services.length;x++){
                    var obj = {
                        linkPhone:''
                    }
                    var json = eval('('+(JSON.stringify(services[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                    data.push(json)
                }
                for(var i=0;i<data.length;i++){
                    for(var j=0;j<link.length;j++){
                        if(data[i].classOrder == link[j].serviceType){
                            data[i].linkPhone = link[j].linkPhone
                        }
                        if(link[j].serviceType == '1'){
                            officephone = link[j].linkPhone
                        }
                        if(link[j].serviceType == '2'){
                            meetingphone = link[j].linkPhone
                        }
                        if(link[j].serviceType == '3'){
                            loadrowphone = link[j].linkPhone
                        }
                        if(link[j].serviceType == '7'){
                            printphone = link[j].linkPhone
                        }
                    }
                }
                res.render('adminuser/contactlist_mng', {
                    leftNav: leftNav,
                    services:data,
                    officephone:officephone,
                    meetingphone:meetingphone,
                    loadrowphone:loadrowphone,
                    printphone:printphone,
                    userinfo: userinfo.adminuserInfo
                });
            })

        })
    }else {
        res.render('login')
    }
})

/**
 * 修改联系方式
 */
router.post("/updatelink",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var servicetype = JSON.parse(req.body.servicetype)
        //var data = []
        // for(var i=0;i<req.body.office.length;i++){
        //     if(req.body.office[i]){
        //         var obj = {
        //             servicetype:servicetype[i],
        //             linkPhone:req.body.office[i]
        //         }
        //         data.push(obj)
        //     }
        // }
        var data = []
        for(var i=0;i<servicetype.length;i++){
            var obj = {
                servicetype:servicetype[i],
                linkPhone:req.body.office[i]
            }
            data.push(obj)
        }
        //console.log(arrdata)
        var phoned = []
        Link.find({interspaceId:interspacesid},function(err,link){
            for(var x=0;x<data.length;x++) {
                for(var m=0;m<link.length;m++){
                    if(link[m].serviceType == data[x].servicetype){
                        phoned.push(data[x])
                    }
                }
            }
            console.log(phoned)
            var arr = functions.array_diff(data,phoned)
            for(var a=0;a<phoned.length;a++){
                Link.update({interspaceId:interspacesid,serviceType:phoned[a].servicetype},{linkPhone:phoned[a].linkPhone},function(err,link){
                     console.log(link)
                })
            }
            for(var b=0;b<arr.length;b++){
                var json = new Link({
                    interspaceId:interspacesid,   //空间id
                    linkPhone:arr[b].linkPhone,     //联系电话
                    serviceType:arr[b].servicetype,   //服务类型
                })
                json.save(function(err,newlink){

                })
            }
            res.redirect("/login/contactlist")
            // if(link.length > 0){
            //     Link.update({interspaceId:interspacesid,serviceType:type},{linkPhone:phone},function(err,link){
            //
            //     })
            // }else{
            //
            //     var json = new Link({
            //         interspaceId:interspacesid,   //空间id
            //         linkPhone:phone,     //联系电话
            //         serviceType:type,   //服务类型
            //     })
            //     json.save(function(err,newlink){
            //         console.log(newlink)
            //     })
            // }
        })


    }
})

/**
 * 退出
 */
router.get("/logout",function(req,res){
    req.session.adminuser = null;
    res.redirect("/login/");
})

module.exports = router;