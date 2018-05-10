var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var fs = require('fs');
var config = require('../common/config');
var moment = require("moment");
var errors = require("../common/errors");
var md5 = require('md5')
var functions = require('../common/functions');
var formidable = require('formidable');
var session = require("session");
/**
 * 管理员登录
 */
router.get('/login', function (req, res, next) {
	// var params = req.body._params;
	res.render('admin/login');
});
router.get('/examine', function (req, res, next) {
	if(req.session.user){
		// var params = req.body._params;
		res.render('admin/examine');
	}else {
		res.redirect('/admin/login');
	}

});

router.post("/login",function(req,res){
	req.models.User.find({
		username:req.body.userName,
	}, function (err, docs) {
		if(err){
			res.status(200).json(errors.error3);
		}else{
			if(docs.length > 0){
				var encryptedPw = md5(md5(req.body.pass) + docs[0].salt)
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
 *  下载异业营销置换申请
 *  */
router.get('/download_marketing_exchange_info', function(req, res, next) {
	req.models.Marketing.find({},function (err,docs) {
		if(err){

		}else{
			var fileName = 'DifferentMarketingExchange_'+moment(Date.now()).format('YYYYMMDD_HHmmss') +'.xlsx';
			var fileRootName = config.rootDir +'/tempfiles/'+ fileName;

			var data = [];
			data.push(['编号','品类','店名','地址','纬度','经度','电话','置换意向','图片','开始时间','结束时间','录入时间']);

			for (var i in docs){
				let tempArray = [
					docs[i].id,
					docs[i].type,
					docs[i].shopname,
					docs[i].address,
					docs[i].latitude,
					docs[i].longitude,
					docs[i].phone,
					docs[i].exchange_intention,
					docs[i].picurl,
					moment(docs[i].start_time*1000).format('YYYY-MM-DD HH:mm:ss'),
					moment(docs[i].end_time*1000).format('YYYY-MM-DD HH:mm:ss'),
					moment(docs[i].create_time*1000).format('YYYY-MM-DD HH:mm:ss'),
				]
				data.push(tempArray);
			}


			var buffer = xlsx.build([{name: "异业营销置换", data: data}]);
			fs.writeFileSync(fileRootName, buffer, 'binary');
			//res.send('export successfully!');


			res.set({
				"Content-type":"application/octet-stream",
				"Content-Disposition":"attachment;filename="+encodeURI(fileName)
			});
			fReadStream = fs.createReadStream(fileRootName);
			fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
			fReadStream.on("end",function () {
				fs.unlink(fileRootName);
				res.end();
			});
		}
	})
});

/**
 *  下载附近优惠申请
 *  */
router.get('/download_nearby_benefit_info', function(req, res, next) {
	req.models.Benefit.find({},function (err,docs) {
		if(err){

		}else{
			var fileName = 'NearbyBenefitInfo_'+moment(Date.now()).format('YYYYMMDD_HHmmss') +'.xlsx';
			var fileRootName = config.rootDir +'/tempfiles/'+ fileName;

			var data = [];
			data.push(['编号','品类','店名','地址','纬度','经度','电话','优惠内容','图片','开始时间','结束时间','录入时间','审核结果']);

			for (var i in docs){
				let tempArray = [
					docs[i].id,
					docs[i].type,
					docs[i].shopname,
					docs[i].address,
					docs[i].latitude,
					docs[i].longitude,
					docs[i].phone,
					docs[i].benefit,
					docs[i].picurl,
					moment(docs[i].start_time*1000).format('YYYY-MM-DD HH:mm:ss'),
					moment(docs[i].end_time*1000).format('YYYY-MM-DD HH:mm:ss'),
					moment(docs[i].create_time*1000).format('YYYY-MM-DD HH:mm:ss'),
					(docs[i].status == 0)?'':"审核通过",
				]
				data.push(tempArray);
			}


			var buffer = xlsx.build([{name: "附近优惠", data: data}]);
			fs.writeFileSync(fileRootName, buffer, 'binary');

			res.set({
				"Content-type":"application/octet-stream",
				"Content-Disposition":"attachment;filename="+encodeURI(fileName)
			});
			fReadStream = fs.createReadStream(fileRootName);
			fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
			fReadStream.on("end",function () {
				fs.unlink(fileRootName);
				res.end();
			});
		}
	})
});

/**
 *  上传轮播广告配置文件
 *  */
router.post('/upload_pic_ads', function(req, res, next) {
	var form = new formidable.IncomingForm();                   //创建上传表单
	form.encoding = 'utf-8';		                            //设置编辑
	form.uploadDir = config.rootDir + '/tempfiles/';	            //设置上传目录
	form.keepExtensions = true;	                                //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
	var files = [], fields = [], docs = [];

	form.parse(req, function(err, fields, files) {
		//res.writeHead(200, {'content-type': 'text/plain'}); res.write('received upload:\n\n'); res.end(sys.inspect({fields: fields, files: files}));
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
		} else if ((extension !== '.xls') && (extension !== '.xlsx')) {                                 //如果上传的图片格式不是jpg,png,gif
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
	//读取内容，写入数据库
	//var fileRootName = config.rootDir +'/tempfiles/'+ 'banner_ads.xlsx';
	var fileRootName = req.body.filename;
	var obj = xlsx.parse(fileRootName);
	var excelObj=obj[0].data;
	/*console.log(excelObj);
	res.json(excelObj);*/
	req.models.Bannerads.find({}).remove(function (err1, data1) {
		if (err1){
			res.json(errors.error3);
		}else{
			let objArray = [];
			if((excelObj[0].length > 3)&&(excelObj[0][3] != '')){
				fs.unlink(fileRootName);
				//模版不正确
				res.json(errors.error8);
			}else {
				for (var i=0;i < excelObj.length;i++){
					if (i != 0){
						let obj = {
							sequence:excelObj[i][0],                            //排列顺序
							pic_url:excelObj[i][1],                             //图片地址
							ad_url:excelObj[i][2],                              //广告地址
							create_time:Date.now()/1000,                        //创建时间
						}
						objArray.push(obj);
					}
				}
				req.models.Bannerads.create(objArray,function (err2,data2) {
					if(err2){
						fs.unlink(fileRootName);
						res.json(errors.error3);
					}else{
						fs.unlink(fileRootName);
						res.json(errors.error0);
					}

				})
			}

		}

	})

});

/**
 *  上传附近优惠申请审核结果
 *  */
router.post('/upload_benefit_check_result',function(req,res,next){
	var form = new formidable.IncomingForm();                   //创建上传表单
	form.encoding = 'utf-8';		                            //设置编辑
	form.uploadDir = config.rootDir + '/tempfiles/';	            //设置上传目录
	form.keepExtensions = true;	                                //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
	var files = [], fields = [], docs = [];


	form.parse(req, function(err, fields, files) {
		//res.writeHead(200, {'content-type': 'text/plain'}); res.write('received upload:\n\n'); res.end(sys.inspect({fields: fields, files: files}));
	});

	form.on('error', function (err) {
		if (err) {
			console.log("出错啦");
		}
	}).on('field', function (field, value) {
		console.log(field);
		console.log(value);
		fields.push([field, value]);
	}).on('file', function (field, file) {
		files.push([field, file]);
		docs.push(file);
		var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
		if (file.size > 2 * 2048 * 2048) {               //如果文件大于2M
			fs.unlink(file.path);
			res.status(200).json(errors.error6);
		} else if ((extension !== '.xls') && (extension !== '.xlsx')) {                                 //如果上传的图片格式不是jpg,png,gif
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
				console.log(filename);
				next();
				/*var ret1 = errors.error0;
				ret1.data = filename;
				res.status(200).json(ret1);*/
			});

		}
	})
}, function(req, res, next) {
	//读取内容，写入数据库
	var fileRootName = req.body.filename;
	var obj = xlsx.parse(fileRootName);
	var excelObj=obj[0].data;

	if((excelObj[0].length < 13)||(excelObj[0][12] != '审核结果')){

		fs.unlink(fileRootName);
			//模版不正确
		res.json(errors.error8);

	}else{
		for (var i=0;i < excelObj.length;i++){
			if (i != 0){
				if(excelObj[i][12] == '审核通过'){
					req.models.Benefit.find({id:excelObj[i][0]}).each(function (benefit) {
						benefit.status = 1;
					}).save(function (err) {});
				}else if(excelObj[i][12] == '删除'){
					req.models.Benefit.find({id:excelObj[i][0]}).remove(function () {});
				}else{
					req.models.Benefit.find({id:excelObj[i][0]}).each(function (benefit) {
						benefit.status = 0;
					}).save(function (err) {});
				}
			}
		}
		fs.unlink(fileRootName);
		res.json(errors.error0);
	}

});

router.get('/test', function(req, res, next) {
	req.models.Benefit.create({
		type:'美食',                                //品类
		shopname:'张三食品店2',                            //店名
		address:'张三视频店2',                             //地址
		latitude:31.99887766,                          //纬度
		longitude:137.99887766,                         //经度
		phone:'13187168766',                               //电话
		benefit:'张三美发店有很大的置换意向',                  //置换意向
		picurl:'http://www.sina.com.cn/1.png',                              //图片
		start_time:Date.now()/1000,                       //开始时间
		end_time:Date.now()/1000+86400*30,                         //结束时间
		status:0,                           //状态。0未审核；1审核通过
		create_time:Date.now()/1000,                      //创建时间
	}, function (err, docs) {
		if(err){
			console.log(err)
			console.log(1)
		}else{
			console.log(docs)
			console.log("当前时间戳："+Date.now()+"            "+moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'))
			console.log(2)
		}
		res.json('il');
	});
});
module.exports = router;