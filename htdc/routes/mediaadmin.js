var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Goods = mongoose.model("Goods");
var Media = mongoose.model("Media");
var Mediaserver = mongoose.model("Mediaserver");
var Systemconfig = mongoose.model("Systemconfig");
var Mediaorder = mongoose.model("Mediaorder");
var User = mongoose.model("User");

router.get("/dsfaf",function(req,res){
    Mediaorder.remove({},function(err,docs){
        res.send(docs)
    })
})

/**
 * 添加立体媒体服务
 */
router.get("/addmedia",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Gb', userinfo.arr);
        res.render("mediaadmin/addmedia_mng",{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        })
    }else {
        res.render('login')
    }


})

/**
 * 处理添加立体媒体服务
 */
router.post("/insertmedia",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo){
        var interspaces = userinfo. adminuserInfo.interspaceId
        var obj = new Media({
            interspaceId:interspaces,    //空间id
            picLogo:req.body.picLogo,    //服务logo图片
            content:req.body.content,    //服务内容
            createTime:Date.now(),  //时间
        })
        obj.save(function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.redirect('/mediaadmin/getmedia')
            }
        })
    }

})

/**
 * 获取服务列表
 */
router.get("/getmedia",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaces = userinfo. adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Ga', userinfo.arr);
        Media.find({interspaceId:interspaces},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                var serverids = new Array()
                // Mediaserver
                for(var i=0;i<docs.length;i++){
                    serverids.push(docs[i]._id)
                }
                Mediaserver.find({mediaId:{$in:serverids}},function(err,server){
                    if(err) {
                        res.render('nodata')
                    }else{
                        var data = new Array()
                        for(var x=0;x<docs.length;x++){
                            var servers = new Array()
                            for(var y=0;y<server.length;y++){
                                if(docs[x]._id == server[y].mediaId){
                                    servers.push(server[y])
                                }
                            }
                            var obj = {
                                servers:servers
                            }
                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(newjson)
                        }
                        res.render("mediaadmin/medialist_mng",{
                            leftNav:leftNav,
                            data:data,
                            userinfo: userinfo.adminuserInfo

                        })
                    }
                })
            }
        })
    }else {
        res.render('login')
    }



})

/**
 * 添加各种类型服务
 */
router.get("/addserver",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaces = userinfo. adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Gc', userinfo.arr);
        Media.find({interspaceId:interspaces},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.render("mediaadmin/addmediaserver_mng",{
                    leftNav:leftNav,
                    medias:docs,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }


})

/**
 * 处理添加服务类型
 */
router.post("/insertserver",function(req,res){
    var obj = new Mediaserver({
        mediaId:req.body.mediaId,    //空间id
        content:req.body.content,    //服务内容
        createTime:Date.now(),  //时间
    })
    obj.save(function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/mediaadmin/getmedia')
        }
    })
})




/*
 /编辑立体媒体
 editclass/#{x._id}
 */
router.get("/editclass/:interspaceId",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ga', userinfo.arr);
        Media.findOne({_id:req.params.interspaceId},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('mediaadmin/mediainfo_mng',{
                    data:docs,
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }

})
router.post("/updatemedia",function(req,res){
    //console.log(req.body)

    var  media = {
        content:req.body.content,    //服务内容
        picLogo:req.body.picLogo,    //服务logo图片
    }
    Media.update({_id:req.body.boardid},media,function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/mediaadmin/getmedia')
        }
    })
})
/*
 /删除立体媒体
 */
router.get("/deleteclass/:interspaceId",function (req,res) {
    Media.remove({_id:req.params.interspaceId},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/mediaadmin/getmedia")
        }
    })
})


/*
 /编辑立体媒体服务
 editctype/#{x._id}
 */
router.get("/edittype/:interspaceId",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ga', userinfo.arr);
        Mediaserver.findOne({_id:req.params.interspaceId},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('mediaadmin/mediaserverinfo_mng',{
                    data:docs,
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }


})
router.post("/updatemediaserver",function(req,res){
      var mediaserver = {
         content:req.body.content,    //服务内容
          data:req.body.data
      }

    Mediaserver.update({_id:req.body.boardid},mediaserver,function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/mediaadmin/getmedia')
        }
    })
})

/*
 /删除立体媒体服务
 */
router.get("/deletetype/:interspaceId",function (req,res) {
    Mediaserver.remove({_id:req.params.interspaceId},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/mediaadmin/getmedia")
        }
    })
})

/**
 * 获取立体媒体服务联系方式
 */
router.get("/linkway",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Gd', userinfo.arr);
        Systemconfig.find({interspaceId:interspacesid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                if(docs.length > 0){
                    var link = docs[0].mediaLink
                }else{
                    var link = {
                        linkName:'',
                        linkPhone:'',
                        email:'',
                        data:'',
                    }
                }
                res.render("mediaadmin/medialink_mng",{
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo,
                    linkdata:link
                })
            }
        })

    }else {
        res.render('login')
    }
})

/**
 * 修改立体媒体服务联系方式
 */
router.post("/updatelinkway",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        Systemconfig.find({interspaceId: interspacesid}, function (err, docs) {
            if (err) {
                res.render('nodata')
            } else {
                var obj = {
                    linkName:req.body.linkName,
                    linkPhone:req.body.linkPhone,
                    email:req.body.email,
                }
                if (docs.length > 0) {
                    Systemconfig.update({interspaceId: interspacesid},{'mediaLink':obj},function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            res.redirect('/mediaadmin/linkway')
                        }
                    })
                }else{
                    var config = new Systemconfig({
                        interspaceId:interspacesid,
                        mediaLink:obj,
                    })
                    config.save(function (err,docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            res.redirect('/mediaadmin/linkway')
                        }
                    })
                }
            }
        })
    }
})

/**
 * 立体媒体服务申请
 */
router.get("/mediaorder",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ge', userinfo.arr);
        var pagesize = 3;
        var counturl = "/mediaadmin/mediaorder/1/"+pagesize + '/1';
        var dataurl = "/mediaadmin/mediaorder/2"+ '/' + pagesize;
        res.render('mediaadmin/mediaorder_mng',{
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

router.get("/mediaorder/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Mediaorder.count({interspaceId:interspaceid}).exec(function(err,docs){
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
                Mediaorder.find({interspaceId:interspaceid}).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var userids = new Array()
                        for(var i=0;i<docs.length;i++){
                            userids.push(docs[i].userId)
                        }
                        User.find({_id:{$in:userids}},function(err,users){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                var data = new Array()
                                for(var x=0;x<docs.length;x++){
                                    for(var y=0;y<users.length;y++){
                                        if(docs[x].userId == users[y]._id){
                                            var obj = {
                                                nickName:users[y].nickName,
                                                time:functions.timeFormat(docs[x].createTime),
                                                orderstatus:'',
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                for(var m=0;m<data.length;m++){
                                    if(data[m].isDispose == '1'){
                                        data[m].orderstatus = '已处理'
                                    }else{
                                        data[m].orderstatus = '未处理'
                                    }
                                }
                                res.status(200).json(data);
                            }
                        })

                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 处理订单
 */
router.get("/updateorder/:orderid/:status",function(req,res){
   if(req.params.status == '1'){
       res.redirect("/mediaadmin/mediaorder")
   }else{
       Mediaorder.update({_id:req.params.orderid},{'isDispose':'1'},function(err,docs){
           if(err){
               res.render('nodata')
           }else{
               res.redirect("/mediaadmin/mediaorder")
           }
       })
   }
})
module.exports = router;