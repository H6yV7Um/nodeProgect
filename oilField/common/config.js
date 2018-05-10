module.exports = {
	rootDir : __dirname.substring(0,__dirname.indexOf('/common')),
    siteUrl: __dirname.substring(0,__dirname.indexOf('/common')),

    /*密码盐值*/
    userSalt:'94869',
	/*Mysql参数*/
	mysql:{
		// host:'10.66.116.224',
		host:'56fe42081b13c.sh.cdb.myqcloud.com',
		database: 'petrochina',
		user:'petrochina',
		password:'petrochina2017',
		protocol: 'mysql',
		// port:'3306',
		port:10238,
		query:{
			pool: true
		},
	}

};
