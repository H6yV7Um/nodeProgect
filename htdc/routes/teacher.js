var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors")
var mongoose = require("mongoose");
var Course = mongoose.model("Course")
var mongoose = require("mongoose");
var Teacher = mongoose.model("Teacher")
var Track = mongoose.model("Track");
var titles = require("../common/title")
var tplace = require("../common/tplace")

/**
 * 导师列表
 */
router.get("/teacherlist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pa', userinfo.arr);
        var pagesize = 7;
        var counturl = "/teacher/getteachers/1/"+pagesize + '/1';
        var dataurl = "/teacher/getteachers/2"+ '/' + pagesize;
        res.render('teacher/teacherlist_mng',{
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

/*置顶*/
router.get("/stick/:teacherid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var teacherid = req.params.teacherid;
        Teacher.find({_id:teacherid}).exec(function(err,docs){
            if(err){
                var ret1 = errors.error3;
                ret1.data = err;
                res.status(200).json(ret1);
            }else {
                var stick=docs[0].isStick;
                console.log(stick)
                if (stick == 0||stick== null) {
                    Teacher.update({_id: teacherid}, {isStick: 1,stickTime:Date.now()}).exec(function (err, doc) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            res.redirect('/teacher/teacherlist');
                        }
                    })
                } else {
                    Teacher.update({_id: teacherid}, {isStick: 0,stickTime:null}).exec(function (err, doc) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            res.redirect('/teacher/teacherlist');
                        }
                    })
                }
            }
        })
    }
})

/*
/查询所有导师
 */
router.get("/getteachers/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Teacher.count().exec(function(err,docs){
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
            Teacher.find().sort({stickTime:-1,createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var ids=new Array;
                    var isStick=new Array;
                    for(var i=0;i<docs.length;i++){
                        ids.push(docs[i].track)
                        isStick.push(docs[i].isStick)
                    }
                    Track.find({_id:{$in:ids}},function (err,tnames) {
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else {
                            var datas=new Array
                            for(var j=0;j<docs.length;j++){
                               for(var x=0;x<tnames.length;x++){
                                   if(docs[j].track==tnames[x]._id){
                                       var obj={
                                           trackName:tnames[x].name
                                       }
                                       var json = eval('('+(JSON.stringify(docs[j])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                       datas.push(json)
                                   }
                               }
                            }
                            res.status(200).json(datas);
                        }
                    })

                }
            })
            break;

    }
})
/**
 * 搜索列表
 */
router.get('/searchteachers/:tName',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
         var pagesize=7
        var leftNav = functions.createLeftNavByCodes('Pa', userinfo.arr);
        var tName=req.params.tName
        var counturl = "/teacher/getallga/1/"+tName+'/'+pagesize + '/1';
        var dataurl = "/teacher/getallga/2/"+tName +'/'+ pagesize;
        res.render('teacher/teacherlist_mng',{
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

router.get("/getallga/:type/:tName/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs=new RegExp(req.params.tName);
    var obj={
        tName:qs
    }
    switch(req.params.type){
        case '1':
            Teacher.count(obj).exec(function(err,docs){
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
            Teacher.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var ids=new Array
                    for(var i=0;i<docs.length;i++){
                        ids.push(docs[i].track)
                    }
                    Track.find({_id:{$in:ids}},function (err,tnames) {
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else {
                            var datas=new Array
                            for(var j=0;j<docs.length;j++){
                                for(var x=0;x<tnames.length;x++){
                                    if(docs[j].track==tnames[x]._id){
                                        var obj={
                                            trackName:tnames[x].name
                                        }
                                        var json = eval('('+(JSON.stringify(docs[j])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                        datas.push(json)
                                    }
                                }
                            }
                            res.status(200).json(datas);
                        }
                    })
                }
            })
            break;

    }
})

/**
 *根据赛道查询导师列表
 */
/*router.get("/getTeacherListByTrack/:track",function (req,res) {
    Teacher.find({track:req.params.track},function (err,docs) {
        if(err){
            res.render("nodata")
        }else {
            res.render('teacher/teacherlist_mng',{
                data:docs,
            });
        }
    })

})*/
/*
*添加导师
 */
router.get("/addteacher",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pb', userinfo.arr);
        Track.find({},function(err,tracks){
            if(err){
                res.render('nodata')
            }else{
                res.render("teacher/addteacher_mng",{
                    leftNav:leftNav,
                    tracks:tracks,
                    titles:titles,
                    tplace:tplace,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }
})


/*
/处理添加导师
 */
router.post("/insertteacher",function(req,res){
    console.log(req.body)
    var ad = new Teacher(req.body);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/teacher/teacherlist")
        }
    })
})

/*
 删除导师
 */
router.post("/delete",function(req,res){
    Teacher.remove({_id:req.body.teacherid},function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/teacher/teacherlist")
        }
    })
})
/*
/单个查询导师
 */
/*router.get("/getById/:teacherid",function(req,res){
    Teacher.find({_id:req.params.teacherid},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            Course.find({teacherId:req.params.teacherId},function (err,docs1) {
                if(err){
                    res.render("nodata")
                }else {
                    res.render()
                }
            })

        }
    })

})*/
/*
/编辑导师信息
 */
router.get("/updateteacher/:teacherid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pb', userinfo.arr);
        Teacher.find({_id:req.params.teacherid},function(err,docs){
            if(err){
                res.render("nodata")
            }else{
                Track.find({},function (err,tracks) {
                    if(err){
                        res.render("nodata")
                    }else {
                        var trackName;
                        for(var y=0;y<tracks.length;y++){
                            if(tracks[y]._id==docs[0].track){
                                trackName=tracks[y].name
                            }
                        }

                        var titleName;
                        for(var i=0;i<titles.length;i++){
                            if(titles[i].code==docs[0].title){
                                titleName=titles[i].name
                            }
                        }
                        var tPlace;
                        for(var j=0;j<tplace.length;j++){
                            if(tplace[j].code==docs[0].tplaceId){
                                tPlace=tplace[j].name
                            }
                        }
                        res.render("teacher/teacherinfo_mng",{
                            tracks:tracks,
                            data:docs[0],
                            leftNav:leftNav,
                            titles:titles,
                            tplace:tplace,
                            titleName:titleName,
                            tPlace:tPlace,
                            trackName:trackName,
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

/*
更新导师信息

 */
router.post("/update",function (req,res) {
    var obj = {
        tName:req.body.tName,
        title:req.body.title,
        tColor:req.body.tColor,
       headimgUrl:req.body.headimgUrl,
        backImgUrl:req.body.backImgUrl,
        // sex:req.body.sex,
        track:req.body.track,
        courseType:req.body.courseType,
        tplaceId:req.body.tplaceId,
        //teamId:req.body.teamId,
        teacherInfo:req.body.teacherInfo,
        teacherDetail:req.body.teacherDetail,
    }
    Teacher.update({_id:req.body.teacherid},obj,function(err,doce){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect('/teacher/teacherlist');
        }
    })
})


module.exports = router;