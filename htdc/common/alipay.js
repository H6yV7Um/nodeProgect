//将支付宝发来的数据生成有序数列
var getVerifyParams = function(params) {
    var sPara = [];
    if(!params) return null;
    for(var key in params) {
        // if((!params[key]) || key == "sign" || key == "sign_type") {
        //     continue;
        // };
        sPara.push([key, params[key]]);
    }
    sPara = sPara.sort();
    var prestr = '';
    for(var i2 = 0; i2 < sPara.length; i2++) {
        var obj = sPara[i2];
        if(i2 == sPara.length - 1) {
            prestr = prestr + obj[0] + '=' + obj[1] + '';
        } else {
            prestr = prestr + obj[0] + '=' + obj[1] + '&';
        }
    }
    return prestr;
}

//验签,将支付串进行RSA-SHA1算法
var veriySign = function(params) {
    try {
        var publicPem = fs.readFileSync('./rsa_public_key.pem');
        var publicKey = publicPem.toString();
        var prestr = getVerifyParams(params);
        var sign = params['sign'] ? params['sign'] : "";
        var verify = crypto.createVerify('RSA-SHA1');
        verify.update(prestr);
        return verify.verify(publicKey, sign, 'base64')

    } catch(err) {
        console.log('veriSign err', err)
    }
}
//发送订单号
var sendAlipay = function(req, res) {
    var code = ""
    for(var i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }
    //订单号暂时由时间戳与四位随机码生成
    AlipayConfig.out_trade_no = Date.now().toString() + code;
    var myParam = getParams(AlipayConfig);
    var mySign = getSign(AlipayConfig)
    var last = myParam + '&sign="' + mySign + '"&sign_type="RSA"';
    console.log(last)
    return res.send(last)
}
module.exports = {
    getVerifyParams:getVerifyParams,
    veriySign:veriySign,
    sendAlipay:sendAlipay
}