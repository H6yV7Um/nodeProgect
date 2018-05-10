var express = require('express');
var router = express.Router();
var config = require('../../common/config');
var errors = require("../../common/errors");
var md5 = require('md5')
var functions = require('../../common/functions');
var xlsx = require('node-xlsx');
var fs = require('fs');
var formidable = require('formidable');
var async = require("async");
var session = require("session");


/* 通用 */
router.use(function (req, res, next) {
    var user = req.session.user;
    if (user) {
        var params = {
            title: '中国石油',
            user: JSON.stringify(user)
        };
        req.body._params = params;
    } else {
        var params = {
            title: '中国石油'
        };
        req.body._params = params;
    }
    next();
})

/**
 * 管理员登录
 */
router.get('/gl', function (req, res, next) {
    var params = req.body._params;

    res.render('login',params);
});
router.post("/login",function(req,res){
    req.models.User.find({
        username:req.body.userName,
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                var encryptedPw = md5(md5(req.body.pass) + config.userSalt)
                if(encryptedPw == docs[0].password){
                    req.session.user = docs[0];
                    res.status(200).json({
                        error:0,
                        message:'success',
                        data:{
                            id:docs[0].id
                        }
                    });
                }else{
                    res.status(200).json(errors.error10002);
                }
            }else{
                res.status(200).json(errors.error10001);
            }
        }
    });
})
/**
 * 登陆成功后
 */
/*查询session中的用户数据*/
router.get('/userInfo', function (req, res, next) {
    var user=req.session.user
    if(user){
        req.models.User.find({
            id:user.id
        }, function (err, docs) {
            if(err){
                res.status(200).json(errors.error3);
            }else{
                res.json(docs[0])
            }
        });
    } else {
        res.json('noData')
    }
});

//首页
router.get('/index',function (req,res) {
    var user=req.session.user
    if(user) {
        var timeStamp = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
        req.models.SiteData.find({}, function (err, docs) {
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                req.models.Site.find({}, function (err, sites) {
                    if (err) {
                        res.status(200).json(errors.error3);
                    } else {
                        //7天截止时间
                        var nowtm = parseInt(timeStamp/1000)
                        var tmarr = []
                        for(var i=1;i<8;i++){
                            tmarr.push(nowtm - (7-i)*24*60*60)
                        }
                        var sjarr=[]
                        for(var s=0;s<tmarr.length;s++){
                            sjarr.push(functions.timeForday(tmarr[s]*1000))
                        }
                        var sitearr = []
                        for(var y=0;y<sites.length;y++){
                            for(var x=0;x<docs.length;x++){
                                if(sites[y].id == docs[x].siteId){
                                    var obj = {
                                        sitenum:sites[y].standard * docs[x].position,
                                        time:docs[x].createTime
                                    }
                                    sitearr.push(obj)
                                }
                            }
                        }

                        var rearr = []
                        for(var m=0;m<tmarr.length;m++){
                            var allnum = 0
                            for(var n=0;n<sitearr.length;n++){
                                if(m==0){
                                    if(sitearr[n].time < tmarr[m]){
                                        allnum += sitearr[n].sitenum
                                    }
                                }else{
                                    if((sitearr[n].time < tmarr[m]) && (sitearr[n].time > tmarr[m-1])){
                                        allnum += sitearr[n].sitenum
                                    }
                                }

                            }
                            rearr.push(allnum)
                        }
                        var data=[sjarr,rearr]
                        res.json(data)

                    }
                })

            }
        })
    }else {
        res.json('noData')
    }
})

router.get("/fgr",function(req,res){
    var timeStamp = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    var nowtm = parseInt(timeStamp/1000) + 24*60*60
    var ss = nowtm - (8-1)*24*60*60
    res.send({
        tm:ss
    })
})

/**
 * 添加用户时需要获取角色，站点，井组，单井信息
 */
router.get('/getData', function (req, res, next) {
    var user=req.session.user
    if(user) {
        req.models.Role.find({/*id:orm.gt(1)*/}, function (err, docs) {
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                req.models.Site.find({}, function (err, sites) {
                    if (err) {
                        res.status(200).json(errors.error3);
                    } else {
                        req.models.WellGroup.find({}, function (err, wellGroup) {
                            if (err) {
                                res.status(200).json(errors.error3);
                            } else {
                                req.models.Well.find({}, function (err, well) {
                                    if (err) {
                                        res.status(200).json(errors.error3);
                                    } else {
                                        var rolearr = []
                                        for (let i = 0; i < docs.length; i++) {
                                            if (docs[i].id > user.roleId) {           //查询id>session中的用户roleid
                                                rolearr.push({
                                                    type: docs[i].id,
                                                    name: docs[i].roleName
                                                })
                                            }
                                        }
                                        var sitearr = []
                                        for (let i = 0; i < sites.length; i++) {
                                            sitearr.push({
                                                type: sites[i].id,
                                                name: sites[i].siteName
                                            })
                                        }
                                        var wellGrouparr = []
                                        for (let i = 0; i < wellGroup.length; i++) {
                                            wellGrouparr.push({
                                                type: wellGroup[i].id,
                                                name: wellGroup[i].wellGroupName
                                            })
                                        }
                                        var wellarr = []
                                        for (let i = 0; i < well.length; i++) {
                                            wellarr.push({
                                                type: well[i].id,
                                                name: well[i].wellName
                                            })
                                        }
                                        console.log(rolearr)
                                        res.json({
                                            error: 0,
                                            data: {
                                                rolearr: rolearr,
                                                sitearr: sitearr,
                                                wellGrouparr: wellGrouparr,
                                                wellarr: wellarr
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        });
    }else {
        res.json('noData')
    }
});

/* 获取用户列表*/
router.get('/getUser/:page', function (req, res, next) {
    var user=req.session.user
    if(user) {
        var page = req.params.page;
        var start = (parseInt(page) - 1) * 10;
        console.log(start)
        // var searchUserName,searchPhone,searchRole
        // if(!req.query.userName||req.query.userName==''){
        //     searchUserName = '*';
        // }else {
        //     searchUserName =req.query.userName
        // }
        // if(!req.query.phone||req.query.phone==''){
        //     searchPhone = "*";
        // }else {
        //     searchPhone =req.query.phone
        // }
        // if(!req.query.type||req.query.type==''){
        //     searchRole = '*';
        // }else {
        //     searchRole =req.query.type
        // }
        // // console.log(searchUserName)
        // // console.log(searchRole)
        // console.log(searchPhone)
        req.models.User.count({
            // username: orm.like(searchUserName ),
            // phone:searchPhone,
            // roleId:searchRole,
        }, function (err, count) {
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                req.models.User.find({
                    // username:orm.like("%"+req.query.userName + "%"),
                    // phone:searchPhone,
                    // roleId:searchRole,
                }).limit(10).offset(start).order("roleId").run(function (err, docs) {
                    if (err) {
                        res.status(200).json(errors.error3);
                    } else {
                        var userArr = []
                        for (let i = 0; i < docs.length; i++) {
                            var jurisdiction = docs[i].jurisdiction.split("-")
                            var createTime = functions.timeFormat((docs[i].createTime) * 1000);
                            var type;
                            if (docs[i].roleId == 1) {
                                type = '超级管理员'
                            }
                            if (docs[i].roleId == 2) {
                                type = '管理员'
                            }
                            if (docs[i].roleId == 3) {
                                type = '站点管理员'
                            }
                            if (docs[i].roleId == 4) {
                                type = '井组管理员'
                            }
                            if (docs[i].roleId == 5) {
                                type = '单井管理员'
                            }
                            if (jurisdiction[0] == '') {
                                jurisdiction[0] = '全部'
                            }
                            userArr.push({
                                id: docs[i].id,                                //用户名
                                username: docs[i].username,                                //用户名
                                password: docs[i].password,                             //密码
                                phone: docs[i].phone,                             //用户电话
                                type: type,                           //用户角色id 1超级管理员2管理员3站点管理员4井组管理员5单井管理员
                                jurisdiction: jurisdiction,                      //创建时间
                                createTime: createTime                      //创建时间
                            })
                        }
                        res.json({
                            error: 0,
                            data: userArr,
                            count: count
                        })
                    }
                })
            }
        });
    }else {
        res.json('noData')
    }
});
/**
 * 添加用户
 */
router.post('/addUser', function (req, res, next) {
    req.models.User.find({
        username:req.body.username
    },function (err, users) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(users.length > 0){
                res.status(200).json(errors.error10001);
            }else{
                var password = md5(md5(req.body.password) + config.userSalt)
                var jurisdiction=(req.body.jurisdiction).join('-')
                req.models.User.create({
                    username:req.body.username,
                    password:password,
                    phone:req.body.phone,
                    roleId:req.body.type,
                    jurisdiction:jurisdiction,
                    createTime:parseInt(Date.now()/1000)                      //创建时间
                }, function (err, docs) {
                    if(err){
                        res.status(200).json(errors.error3);
                    }else{
                        var jurisdiction = docs.jurisdiction.split("-")
                        var createTime = functions.timeFormat((docs.createTime) * 1000);
                        var type;
                        if (docs.roleId == 1) {
                            type = '超级管理员'
                        }
                        if (docs.roleId == 2) {
                            type = '管理员'
                        }
                        if (docs.roleId == 3) {
                            type = '站点管理员'
                        }
                        if (docs.roleId == 4) {
                            type = '井组管理员'
                        }
                        if (docs.roleId == 5) {
                            type = '单井管理员'
                        }
                        if (jurisdiction[0] == '') {
                            jurisdiction[0] = '全部'
                        }
                        data={
                            username: docs.username,                                //用户名
                            password: docs.password,                             //密码
                            phone: docs.phone,                             //用户电话
                            type: type,                           //用户角色id 1超级管理员2管理员3站点管理员4井组管理员5单井管理员
                            jurisdiction: jurisdiction,                      //创建时间
                            createTime: createTime                      //创建时间
                        }
                        res.status(200).json({
                            error:0,
                            message:'success',
                            data:data
                        });
                    }
                })
            }
        }
    });
});

/*删除用户*/
router.post('/delUser', function (req, res, next) {
    var user=req.session.user;
    // if(user) {
        req.models.User.find({id: req.body.id},function (err,docs) {
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                // console.log(docs[0].roleId)
                if (user.roleId >= docs[0].roleId) {
                    res.status(200).json(errors.error10003);
                } else {
                    // console.log(req.body.id)
                    req.models.User.find({id: req.body.id}).remove(function (err) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            res.status(200).json({
                                error: 0,
                                message: 'success',
                            });
                        }
                    });

                }
            }
        });

    // }else {
    //     res.json('noData')
    // }
});

/*修改联合站计算因子*/
router.post('/sitParam', function (req, res, next) {
    var user=req.session.user;
    if(user) {
        req.models.Factor.find({}, function (err, doc) {
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                if (doc.length > 0) {
                    req.models.Factor.find({id: doc[0].id}).each(function (data) {
                        data.factor = req.body.factor;
                    }).save(function (err, docs) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            res.status(200).json({
                                error: 0,
                                message: 'success',
                                data: docs
                            });
                        }
                    })
                } else {
                    req.models.Factor.create({
                        factor: req.body.factor
                    }, function (err, docs) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            res.status(200).json({
                                error: 0,
                                message: 'success',
                                data: docs
                            });
                        }
                    })
                }
            }
        });
    }else {
        res.json('noData')
    }
});
/*修改联合站计算因子*/
router.get('/sitParam', function (req, res, next) {
    req.models.Factor.find({},function (err, doc) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            console.log(doc[0])
            res.status(200).json(doc[0]);
        }
    });
});

/*修改密码*/
router.post("/recode",function (req,res) {

    var user=req.session.user
    if(user) {
    var oldpass = functions.trim(req.body.oldpass);
    var newCodeAgain = functions.trim(req.body.repass);
    req.models.User.find({id:user.id}, function (err, docs) {
        if (docs) {
            var encryptedPw = md5(md5(oldpass) + config.userSalt);
            if (encryptedPw == docs[0].password) {
                var fixCode = md5(md5(newCodeAgain) + config.userSalt);
                req.models.User.find({id:user.id}).each(function (data) {
                    data.password=fixCode;
                }).save( function (err, docs) {
                    if (err) {
                        res.status(200).json(errors.error3)
                    } else {
                        var ret = errors.error0;
                        res.status(200).json(ret);
                    }
                })


            } else {
                res.status(200).json(errors.error10002);
            }
        } else {
            res.render("noData")
        }
    })

    }else {
        res.json('noData')
    }

})

/* 获取中心站*/
router.get('/getManageSite/:page', function (req, res, next) {
    var user=req.session.user
    if(user) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    req.models.ManageSite.find({}).limit(10).offset(start).run(function (err, docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            req.models.Site.find({}).run(function (err, doc1) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var data=[]
                    var obj
                    for(var i in docs){
                        var arr=[]
                        for (var j in doc1){
                            if(docs[i].id==doc1[j].manageId){
                                arr.push(doc1[j].siteName)
                            }
                        }
                        if(arr.length>0){
                            obj={
                                id:docs[i].id,
                                name:docs[i].name,
                                sites:arr
                            }
                        }
                        data.push(obj)
                    }
                    res.json({
                        error: 0,
                        data: data,
                        count: docs.length
                    })
                }
            })
        }
    })
    }else {
        res.json('noData')
    }
});
/**
 *  导入站点数据
 *  */
router.post('/uploadSite', function(req, res, next) {
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    form.uploadDir = config.rootDir + '/public/tempfiles/';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
    var files = [], fields = [], docs = [];

    form.parse(req, function(err, fields, files) {
        // res.writeHead(200, {'content-type': 'text/plain'}); res.write('received upload:\n\n'); res.end(sys.inspect({fields: fields, files: files}));
    });

    form.on('error', function (err) {
        if (err) {
            console.log("出错啦");
        }
    }).on('field', function (field, value) {
        fields.push([field, value]);
    }).on('file', function (field, file) {
        files.push([field, file]);
        docs.push(file);
        var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
        if (file.size > 2 * 2048 * 2048) {               //如果文件大于2M
            fs.unlink(file.path);
            res.status(200).json(errors.error6);
        } else if ((extension !== '.xls') && (extension !== '.xlsx')) {                                 //如果上传的文件格式不是xls,xlsx
            fs.unlink(file.path);
            res.status(200).json(errors.error7);
        } else {
            var fileId =   Math.round(+new Date() / 1000) + functions.createVercode(4)
            var oldpath=file.path;
            var newpath=file.path.substring(file.path.lastIndexOf('/')+1, -1)+fileId+file.name.substring(file.name.lastIndexOf('.'), file.name.length);
            var filename;
            fs.rename(oldpath,newpath,function (err) {
                if(err){
                    filename=oldpath
                }else{
                    filename =newpath
                }
                req.body.filename = filename;
                next();
            });

        }
    })
},function (req,res,next) {
    // 读取内容，写入数据库
    var user=req.session.user
    var fileRootName = req.body.filename;
    var obj = xlsx.parse(fileRootName);
    var excelObj=obj[0].data;
    if((excelObj[0].length != 10)||(excelObj[0][0] != '站点名')||(excelObj[0][1] != '外输量')||(excelObj[0][2] != '罐位')||(excelObj[0][3] != '产量')||(excelObj[0][4] != '库存')||(excelObj[0][5] != '卸液量')||(excelObj[0][6] != '接喷量')||(excelObj[0][7] != '扫线量')||(excelObj[0][8] != '录入人')||(excelObj[0][9] != '录入时间')){
        fs.unlink(fileRootName);
        //模版不正确
        res.json(errors.error8);
    }else {
        excelObj.shift()
        excelObj = functions.arrayUniq(excelObj)
        var async = require('async')
        req.models.Site.find({}).run(function (err1, data1) {
            if (err1) {
                res.status(200).json(errors.error3);
            } else {
                var sitedata=[]
                // var obj
                // async.each(excelObj, function (x, callback) {
                for(var i in excelObj){
                    for (var j in data1) {
                        if (data1[j].siteName == excelObj[i][0]) {

//传入一个时间格式，如果不传入就是获取现在的时间了，这样做不兼容火狐。
// 可以这样做
                            var date = new Date(excelObj[i][9]);

// 有三种方式获取，在后面会讲到三种方式的区别
                            time1 = date.getTime();

                            console.log(time1)
                            var str = parseInt(time1/ 1000); //转换成时间戳
                            var obj = {
                                siteId: data1[j].id,
                                throughput: excelObj[i][1],
                                position: excelObj[i][2],
                                oilTransfer: excelObj[i][3],
                                waterContent: excelObj[i][4],
                                liquidAmount: excelObj[i][5],
                                sprayAmount: excelObj[i][6],
                                dose: excelObj[i][7],
                                userName: excelObj[i][8],
                                createTime: str                      //创建时间
                            }

                        }
                    }
                    sitedata.push(obj)
                }
                req.models.SiteData.create(sitedata, function (err, docs) {
                    if(err){
                        res.status(200).json(errors.error3);
                    }else{
                        res.status(200).json(sitedata);
                    }
                })
            }
        })
    }
});
/**
 *  导入井组数据
 *  */

router.post('/uploadWellGroup', function(req, res, next) {
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    form.uploadDir = config.rootDir + '/public/tempfiles/';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
    var files = [], fields = [], docs = [];

    form.parse(req, function(err, fields, files) {
        // res.writeHead(200, {'content-type': 'text/plain'}); res.write('received upload:\n\n'); res.end(sys.inspect({fields: fields, files: files}));
    });

    form.on('error', function (err) {
        if (err) {
            console.log("出错啦");
        }
    }).on('field', function (field, value) {
        fields.push([field, value]);
    }).on('file', function (field, file) {
        files.push([field, file]);
        docs.push(file);
        var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
        if (file.size > 2 * 2048 * 2048) {               //如果文件大于2M
            fs.unlink(file.path);
            res.status(200).json(errors.error6);
        } else if ((extension !== '.xls') && (extension !== '.xlsx')) {                                 //如果上传的文件格式不是xls,xlsx
            fs.unlink(file.path);
            res.status(200).json(errors.error7);
        } else {
            var fileId =   Math.round(+new Date() / 1000) + functions.createVercode(4)
            var oldpath=file.path;
            var newpath=file.path.substring(file.path.lastIndexOf('/')+1, -1)+fileId+file.name.substring(file.name.lastIndexOf('.'), file.name.length);
            var filename;
            fs.rename(oldpath,newpath,function (err) {
                if(err){
                    filename=oldpath
                }else{
                    filename =newpath
                }
                req.body.filename = filename;
                next();
            });

        }
    })
},function (req,res,next) {
    // 读取内容，写入数据库
    var user=req.session.user
    var fileRootName = req.body.filename;
    var obj = xlsx.parse(fileRootName);
    var excelObj=obj[0].data;
    if((excelObj[0].length != 7)||(excelObj[0][0] != '井组名')||(excelObj[0][1] != '井组单量')||(excelObj[0][2] != '干线含水')||(excelObj[0][3] != '井组回压')||(excelObj[0][4] != '罐位')||(excelObj[0][5] != '录入人')||(excelObj[0][6] != '录入时间')){
        fs.unlink(fileRootName);
        //模版不正确
        res.json(errors.error8);
    }else {
        excelObj.shift()
        excelObj = functions.arrayUniq(excelObj)
        var async = require('async')
        req.models.WellGroup.find({}).run(function (err1, data1) {
            if (err1) {
                res.status(200).json(errors.error3);
            } else {
                var wellGroupdata=[]
                // var obj
                // async.each(excelObj, function (x, callback) {
                for(var i in excelObj){
                    for (var j in data1) {
                        if (data1[j].wellGroupName == excelObj[i][0]) {
                            var date = new Date(); //时间对象
                            var str = parseInt(date.getTime(excelObj[i][6]) / 1000); //转换成时间戳
                            var obj = {
                                wellGroupId: data1[j].id,
                                singleAmount: excelObj[i][1],
                                arteryWaterContent: excelObj[i][2],
                                pressure: excelObj[i][3],
                                position: excelObj[i][4],
                                userName: excelObj[i][5],
                                createTime: str                      //创建时间
                            }

                        }
                    }
                    wellGroupdata.push(obj)
                }
                req.models.WellGroupData.create(wellGroupdata, function (err, docs) {
                    if(err){
                        res.status(200).json(errors.error3);
                    }else{
                        res.status(200).json(wellGroupdata);
                    }
                })
            }
        })
    }
});

/**
 *  导入单井数据
 *  */

router.post('/uploadWell', function(req, res, next) {
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    form.uploadDir = config.rootDir + '/public/tempfiles/';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
    var files = [], fields = [], docs = [];

    form.parse(req, function(err, fields, files) {
        // res.writeHead(200, {'content-type': 'text/plain'}); res.write('received upload:\n\n'); res.end(sys.inspect({fields: fields, files: files}));
    });

    form.on('error', function (err) {
        if (err) {
            console.log("出错啦");
        }
    }).on('field', function (field, value) {
        fields.push([field, value]);
    }).on('file', function (field, file) {
        files.push([field, file]);
        docs.push(file);
        var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
        if (file.size > 2 * 2048 * 2048) {               //如果文件大于2M
            fs.unlink(file.path);
            res.status(200).json(errors.error6);
        } else if ((extension !== '.xls') && (extension !== '.xlsx')) {                                 //如果上传的文件格式不是xls,xlsx
            fs.unlink(file.path);
            res.status(200).json(errors.error7);
        } else {
            var fileId =   Math.round(+new Date() / 1000) + functions.createVercode(4)
            var oldpath=file.path;
            var newpath=file.path.substring(file.path.lastIndexOf('/')+1, -1)+fileId+file.name.substring(file.name.lastIndexOf('.'), file.name.length);
            var filename;
            fs.rename(oldpath,newpath,function (err) {
                if(err){
                    filename=oldpath
                }else{
                    filename =newpath
                }
                req.body.filename = filename;
                next();
            });

        }
    })
},function (req,res,next) {
    // 读取内容，写入数据库
    var user=req.session.user
    var fileRootName = req.body.filename;
    var obj = xlsx.parse(fileRootName);
    var excelObj=obj[0].data;
    if((excelObj[0].length != 7)||(excelObj[0][0] != '单井名')||(excelObj[0][1] != '液面')||(excelObj[0][2] != '含水')||(excelObj[0][3] != '井口压力')||(excelObj[0][4] != '开井时间')||(excelObj[0][5] != '录入人')||(excelObj[0][6] != '录入时间')){
        fs.unlink(fileRootName);
        //模版不正确
        res.json(errors.error8);
    }else {
        excelObj.shift()
        excelObj = functions.arrayUniq(excelObj)
        var async = require('async')
        req.models.Well.find({}).run(function (err1, data1) {
            if (err1) {
                res.status(200).json(errors.error3);
            } else {
                var welldata=[]
                // var obj
                // async.each(excelObj, function (x, callback) {
                for(var i in excelObj){
                    for (var j in data1) {
                        if (data1[j].wellName == excelObj[i][0]) {
                            var date = new Date(); //时间对象
                            var str = parseInt(date.getTime(excelObj[i][6]) / 1000); //转换成时间戳
                            var obj = {
                                wellId: data1[j].id,
                                liquidLevel: excelObj[i][1],
                                waterContent: excelObj[i][2],
                                wellPressure: excelObj[i][3],
                                wellTime: excelObj[i][4],
                                userName: excelObj[i][5],
                                createTime: str                      //创建时间
                            }

                        }
                    }
                    welldata.push(obj)
                }
                req.models.WellData.create(welldata, function (err, docs) {
                    if(err){
                        res.status(200).json(errors.error3);
                    }else{
                        res.status(200).json(welldata);
                    }
                })
            }
        })
    }
});
//Abnormal
/* 异常数据展示 */
router.get('/getRemark/:page', function (req, res, next) {
    var user=req.session.user
    // if(user) {
        var page = req.params.page;
        var start = (parseInt(page) - 1) * 10;
        req.models.Abnormal.find({}).limit(10).offset(start).run(function (err, docs1) {
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                let arr=[]
                async.each(docs1, function (x, callback) {
                    if(x.siteDataId&&!x.wellGroupDataId&&!x.wellDataId){
                        req.models.SiteData.find({id:x.siteDataId}).run(function (err, docs) {
                            if (err) {
                                callback(null)
                            } else {
                                async.each(docs, function (y, callback) {
                                    req.models.Site.find({id:y.siteId},function (err, sites) {
                                        if (err) {
                                            callback(null)
                                        } else {
                                            var createTime=functions.timeFormat((y.createTime) * 1000)
                                            var obj={
                                                type:'站点',
                                                id:y.id,
                                                siteId:y.siteId,
                                                name:sites[0].siteName,
                                                createTime: createTime,
                                                remark:x.remark,
                                                "罐标(m²)":sites[0].standard,
                                                '外输量(m³)':y.throughput,
                                                '罐位(m)':y.position,
                                                '产量(m³)':y.oilTransfer,
                                                '库存(m³)':y.waterContent,
                                                '卸液量(m³)':y.liquidAmount,
                                                '接喷量(m³)':y.sprayAmount,
                                                '扫线量(m³)':y.dose,
                                                '录入人':y.userName,
                                            }
                                            arr.push(obj)
                                        }
                                        callback(null)
                                    })
                                }, function (err) {
                                    callback(null)
                                })
                            }
                        })
                    } else if(x.wellGroupDataId&&!x.siteDataId&&!x.wellDataId){
                        req.models.WellGroupData.find({id:x.wellGroupDataId}).run(function (err, docs) {
                            if (err) {
                                callback(null)
                            } else {
                                async.each(docs, function (y, callback) {
                                    req.models.WellGroup.find({id:y.wellGroupId},function (err, wellGroup) {
                                        if (err) {
                                            callback(null)
                                        } else {
                                            var createTime=functions.timeFormat((y.createTime) * 1000)
                                            var obj={
                                                type:'井组',
                                                id:y.id,
                                                wellGroupId:y.wellGroupId,
                                                name:wellGroup[0].wellGroupName,
                                                createTime: createTime,
                                                remark:x.remark,
                                                '罐标(m²)':wellGroup[0].standard,
                                                '井组单量(m³)':y.singleAmount,
                                                '干线含水(%)':y.arteryWaterContent,
                                                '井组回压(Mpa)':y.pressure,
                                                '罐位(m)':y.position,
                                                '录入人':y.userName,
                                            }
                                            arr.push(obj)
                                        }
                                        callback(null)
                                    })
                                }, function (err) {
                                    callback(null)
                                })
                            }
                        })
                    }else if(x.wellDataId&&!x.wellGroupDataId&&!x.siteDataId){
                        req.models.WellData.find({id:x.wellDataId}).run(function (err, docs) {
                            if (err) {
                                callback(null)
                            } else {
                                async.each(docs, function (y, callback) {
                                    req.models.Well.find({id:y.wellId},function (err, well) {
                                        if (err) {
                                            callback(null)
                                        } else {
                                            var createTime=functions.timeFormat((y.createTime) * 1000)
                                            var obj={
                                                type:'单井',
                                                id:y.id,
                                                wellId:y.wellId,
                                                name:well[0].wellName,
                                                createTime: createTime,
                                                remark:x.remark,
                                                '功图工况':well[0].diagrams,
                                                '功图量油数据':well[0].oilData,
                                                '液面':y.liquidLevel,
                                                '含水(%)':y.waterContent,
                                                '井口压力(Mpa)':y.wellPressure,
                                                '开井时间(秒)':y.wellTime,
                                                '录入人':y.userName,
                                            }
                                            arr.push(obj)
                                        }
                                        callback(null)
                                    })
                                }, function (err) {
                                    callback(null)
                                })
                            }
                        })
                    }
                }, function (err) {
                    res.json({
                        error:0,
                        data:arr,
                    })
                })
            }
        })
    // }else {
    //     res.json('noData')
    // }
});

module.exports = router;