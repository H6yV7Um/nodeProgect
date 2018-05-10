module.exports = {
	rootDir : __dirname.substring(0,__dirname.indexOf('/common')),
    siteUrl: __dirname.substring(0,__dirname.indexOf('/common')),

	/*Mysql参数*/
	mysql:{
		host:'10.66.116.224',
		//host:'56fe42081b13c.sh.cdb.myqcloud.com',
		database: 'linkxian',
		user:'linkxianadmin',
		password:'linkxian2017',
		protocol: 'mysql',
		port:'3306',
		//port:10238,
		query:{
			pool: true
		},
	},
    /*百度地图*/
    baidu:{
    	key:'YEShGi8EuIrn06sYOoN5lATUzQZumi6G'
	}

};
