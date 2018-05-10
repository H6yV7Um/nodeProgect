module.exports = {
	siteName:'康陪',
    /*签名盐值*/
    salt:"kangpei",
	/*网站根目录*/
	siteUrl:'/data/www/kp',
	/*titles*/
	title:'康陪',

	userSalt: '0505',

	/*项目根目录*/
	productUrl:'http://kp.mengotech.com',

    rootDir : __dirname.substring(0,__dirname.indexOf('/common')),

	mongo:{
		mongoUser:"kangpei",
		mongoPassword:"kangpei2018",
		mongoHost:'10.66.235.120',
		mongoPort:27017,
		mongoDbName:'xingchina'
	},

	// /*小程序支付配置*/
	// weappConfig: {
	// 	wxAppid:'wxde4d2013834a93d9',
	// 	mchId:'1487317592',                           //微信支付商户号
	// 	wxPayKey:'woaixianmengguoxinxijishu2017ghb',      //微信支付秘钥
	// 	// certFile:'/WX_certificate/apiclient_cert.p12',                        //签名文件地址
	// },
	/*微信支付*/
	weappConfigTest: {
		appId:'wx36bad35da6f6f2d5',
		appSecret:'980a70a4d715481675e342e1d797a212',
		mchId:'1262331801',                           //微信支付商户号
		wxPayKey:'12623318018888888888888888888888',      //微信支付秘钥
		// certFile:'/data/wxpay_cert/apiclient_cert.p12',                        //签名文件地址
		prefix:'https://api.weixin.qq.com/cgi-bin/',                            //获取access_token的URL前缀
	},

	// 支付宝支付
    alipay:{
        app_id:'2018022602273788',
        notify_url:'http://smile.jiankangpeini.com/pay/alipaysuccess',
        privateKey:'-----BEGIN RSA PRIVATE KEY-----\n'+
        'MIIEowIBAAKCAQEAtczGhGo5RnI0IVqL7TSEUW5n6gbkcq3JNUAF3fqJOjHN2NAI\n'+
        'bWCPYGWxB3Fot5+XysWWiOwAxkY6YrjhHM829rAyTsKvpuvylPCiaqNtSpByG3hp\n'+
        'WlTzfBF9BF7ybDUNdp0/3ouro8m6UxBSB1UrgXOnqvEiQqljaWqdH3u5h7wjE14h\n'+
        'EjtnJbnYJisIodb0Lm/PcRmGydnnXodF2UOJIBmuFbLn8KiVcAuvUTfljzZtFneg\n'+
        'qH0nDnKBbf641oyxj3BZK0VR8h2Z1p2l4mD3mlLw2YQxh4BJAjZ0rN5awFEi+Wpm\n'+
        'qS88faoilUAz4zxnEbxKF2I1CR0/rBRwHPLpQwIDAQABAoIBACuKb8Em77C/iVyz\n'+
        'ou+ctFQMbTbPj8cneBkYzE7twg/9/Z7/tAT+K1ibAlsV/k58Go6l4/fHDihuiW07\n'+
        'ei68Mh3C9UmHtynzOJYTS9LecT56edm6bQEFd4svZRG267ievCq8Xp+eM+12Uvmx\n'+
        '3vOConjOikmWlu4AQ57rudXge/7V2LwsHhqfbXn6nPrIRcmDzXEz32KXIgf/KtN/\n'+
        '8I7HoCcCBcMal7eAGuCcY8XQKA0xteEFn/y6N5/KyypsH2ba0D+r6J9snH/kWaaV\n'+
        'iLAvidYv+m2pLNnODBQ1DXklIXGhI3/Scozqd0cXaRJ8J24RO1Vox0WdR1gYLPbp\n'+
        'x85AsYECgYEA5w21fXxUfRdvLmyXHIBtd+fjq2vXD6tcIMUbJGJEB0weFlmpIoTC\n'+
        '7O3ZgClvHWTbRSoAByAuLv9MWZFiG+Z+Wttv4C4++FUVK/5DJoV+C3G0uEnwVkMR\n'+
        'SwzhPHAR8DCJju9m3mUysYDVPT5Xxxd3AMc/htE8+C3sSfxIPspYebcCgYEAyW2z\n'+
        'sU5wkXAE36e/O27CnqPy8trgyqPSR7rpEEMx47WtGNNB9i+/x8/X0jfmThSJjm+K\n'+
        'ohsPvwHM/YBf6RbFrSuVWC8LHSDNjs746Tf1Bq7Z+GdUy0zeEHMYpmQpJQlYEMLv\n'+
        'qSgc1VXW+xk8jYKPv/PIO9zns4ErItjrRICnfNUCgYBjjBiBtCuCqbIRQl/ou7xu\n'+
        'SM5icNf7vEy5IbML/fppWnYsEv04DhMdmWx4N2HUPDvslKfmagr73Kq8fFLUyn3u\n'+
        'D1UoNUSUIbQ5fBbaZfFkZN0D+Xc+8y5kM2xnabGQ1pitqJ+deeRZbbRx6oZPFOEE\n'+
        'yNOp9kRaeQ6w4a0OwIdWCQKBgQCfTyVUsV40mO0x2uFTZymEANUwoE4z1teEJd8Z\n'+
        'HpwBpfnObZ94z5EVvlvKhq2eyX116uAxj8enYQw43uR8XKdha9wFT8exdPU+4pFZ\n'+
        'GwmvDHGWllspI5VqWy1+xC8KfNZrA1I7bl9Hl0mddPtATKfWwD94oSGcBigQupFw\n'+
        'r3RINQKBgF1De9b7segqDDF3zKE5zbj+9E0Bfp1ap7GhAU5Kbq6Nb6YPnet/RC0i\n'+
        'FWc87uVRMX6xLfHJLdth/yJS6j/AI3QyNoPA/WvaPgFkRs7eqj4VqdHSqG9jvi4O\n'+
        'RherP59N78dYHJQ0w7US0RHh0TEHQ4YCVV55ptupPhbfEy5I9GFs\n'+
        '-----END RSA PRIVATE KEY-----\n',
        alipayrsaPublicKey:'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjrQfp+RJUk7ZR9NEPBX+aa7Z5Z+Q1OUfrltIUxuYja+sxDZoTe3yamrSQkwwRWZTepYn/k48VWCkrm/WVerO0gEcGQ0AWKih+TtHv2uf77g/UvVnUq6cG7F7tiwxOzRdukUhPrAjcpXTCiq6USv0pUP4qaZBwxhp/tVxtkzA3for4XHY/L4VPl7vKf/ceLvhye3vsU7oiOvlNaPMO2Vui7sNyZSRChHfaLnIbbvxbU097ruVA/6D6djShEsGNEvyIQrazV00J0Y91bq22C09RXv4GirKM5oZbweceikUhgaX6aDFX2X2qWT75EXa22qathGFG1HCcUhjsL47vh389QIDAQAB'
    }
};




/*
'MIIEowIBAAKCAQEAtczGhGo5RnI0IVqL7TSEUW5n6gbkcq3JNUAF3fqJOjHN2NAIbWCPYGWxB3Fot5+XysWWiOwAxkY6YrjhHM829rAyTsKvpuvylPCiaqNtSpByG3hpWlTzfBF9BF7ybDUNdp0/3ouro8m6UxBSB1UrgXOnqvEiQqljaWqdH3u5h7wjE14hEjtnJbnYJisIodb0Lm/PcRmGydnnXodF2UOJIBmuFbLn8KiVcAuvUTfljzZtFnegqH0nDnKBbf641oyxj3BZK0VR8h2Z1p2l4mD3mlLw2YQxh4BJAjZ0rN5awFEi+WpmqS88faoilUAz4zxnEbxKF2I1CR0/rBRwHPLpQwIDAQABAoIBACuKb8Em77C/iVyzou+ctFQMbTbPj8cneBkYzE7twg/9/Z7/tAT+K1ibAlsV/k58Go6l4/fHDihuiW07ei68Mh3C9UmHtynzOJYTS9LecT56edm6bQEFd4svZRG267ievCq8Xp+eM+12Uvmx3vOConjOikmWlu4AQ57rudXge/7V2LwsHhqfbXn6nPrIRcmDzXEz32KXIgf/KtN/8I7HoCcCBcMal7eAGuCcY8XQKA0xteEFn/y6N5/KyypsH2ba0D+r6J9snH/kWaaViLAvidYv+m2pLNnODBQ1DXklIXGhI3/Scozqd0cXaRJ8J24RO1Vox0WdR1gYLPbpx85AsYECgYEA5w21fXxUfRdvLmyXHIBtd+fjq2vXD6tcIMUbJGJEB0weFlmpIoTC7O3ZgClvHWTbRSoAByAuLv9MWZFiG+Z+Wttv4C4++FUVK/5DJoV+C3G0uEnwVkMRSwzhPHAR8DCJju9m3mUysYDVPT5Xxxd3AMc/htE8+C3sSfxIPspYebcCgYEAyW2zsU5wkXAE36e/O27CnqPy8trgyqPSR7rpEEMx47WtGNNB9i+/x8/X0jfmThSJjm+KohsPvwHM/YBf6RbFrSuVWC8LHSDNjs746Tf1Bq7Z+GdUy0zeEHMYpmQpJQlYEMLvqSgc1VXW+xk8jYKPv/PIO9zns4ErItjrRICnfNUCgYBjjBiBtCuCqbIRQl/ou7xuSM5icNf7vEy5IbML/fppWnYsEv04DhMdmWx4N2HUPDvslKfmagr73Kq8fFLUyn3uD1UoNUSUIbQ5fBbaZfFkZN0D+Xc+8y5kM2xnabGQ1pitqJ+deeRZbbRx6oZPFOEEyNOp9kRaeQ6w4a0OwIdWCQKBgQCfTyVUsV40mO0x2uFTZymEANUwoE4z1teEJd8ZHpwBpfnObZ94z5EVvlvKhq2eyX116uAxj8enYQw43uR8XKdha9wFT8exdPU+4pFZGwmvDHGWllspI5VqWy1+xC8KfNZrA1I7bl9Hl0mddPtATKfWwD94oSGcBigQupFwr3RINQKBgF1De9b7segqDDF3zKE5zbj+9E0Bfp1ap7GhAU5Kbq6Nb6YPnet/RC0iFWc87uVRMX6xLfHJLdth/yJS6j/AI3QyNoPA/WvaPgFkRs7eqj4VqdHSqG9jvi4ORherP59N78dYHJQ0w7US0RHh0TEHQ4YCVV55ptupPhbfEy5I9GFs'
*/
