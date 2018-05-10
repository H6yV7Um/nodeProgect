var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');
var config = require('./config')
var accessTokenJson = require('./token.json')
// var util = require('util')
var mongoose = require("mongoose");
// var Wxverify = mongoose.model("Wxverify");



var getAccessToken = function () {
    let queryParams = {
        'grant_type': 'client_credential',
        'appid': config.weappConfigTest.appId,
        'secret': config.weappConfigTest.appSecret
    };
    console.log('#################')
    let wxGetAccessTokenBaseUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+queryParams.appid+'&secret='+queryParams.secret;
    let options = {
        method: 'GET',
        url: wxGetAccessTokenBaseUrl
    };
    var currentTime = new Date().getTime();
    return new Promise((resolve, reject) => {
        if(accessTokenJson.access_token === "" || accessTokenJson.expires_time < currentTime){
            request(options, function (err, res, body) {
                if (res) {
                    var result = JSON.parse(body);
                    if(body.indexOf("errcode") < 0){
                        accessTokenJson.access_token = result.access_token;
                        accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                        //更新本地存储的
                        fs.writeFile('./token.json',JSON.stringify(accessTokenJson));
                        //将获取后的 access_token 返回
                        resolve(accessTokenJson.access_token);
                    }else{
                        //将错误返回
                        resolve(result);
                    }
                } else {
                    reject(err);
                }
            });
        }else{
            //将本地存储的 access_token 返回
            resolve(accessTokenJson.access_token);
        }
    })
};
module.exports = {
    getAccessToken:getAccessToken,
};