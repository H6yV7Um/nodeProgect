module.exports = {
    /*签名盐值*/
    salt:"htdc",
    /*日志等级*/
    levels:",DEBUG,INFO,WARN,ERROR,FATAL,",
    /*网站根目录*/
    siteUrl:'/data/www/htdc',
    /*域名地址*/
    baseUrl:'http://htdc.mengotech.com/',
    /*Redis配置*/

    /*MongoDB参数*/
    mongo:{
        mongoUser:"mongouser",
        mongoPassword:"htdc2017",
        mongoHost:'10.66.218.189',
        mongoPort:27017,
        mongoDbName:'Htdc',
    },
    /*腾讯云通信配置参数*/
    tengxunim:{
        adminName:'htdcadmin1',
        sdkappId:'1400029175',
        accountType:'12135',
        privateKey:'-----BEGIN PRIVATE KEY-----\n'+
        'MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgQGLi66DFXzUlK8h/qsNc\n'+
        'hVyi2ZwnAdOx7WFPxeZFhAmhRANCAAQqyHn5wCHrJryK1Eb4c6hU2w5wWP4ftmdL\n'+
        'j/6OFn/PH99gzIGnjPQrF6yhrtBcOYDm0+YEs0gHUpziAv/n7VPK\n'+
        '-----END PRIVATE KEY-----',
    },
    /*云通讯短信接口参数*/
    ytx:{
        ytxAccountSid:'8aaf07085c09bb1b015c1433a2880583',
        ytxAuthToken:'d456c9fd01c44261b830d2c2709bb6d6',
        ytxUrl:'https://app.cloopen.com:8883',
        ytxAppId:'8a216da85c09e9ba015c14fb2e320611',
        ytxVersion:'2013-12-26',
        templateId:176698,
        nodeTemplateId:204859,
    },

    /*七牛云配置参数*/
    qiniu:{
        url:'http://oonn7gtrq.bkt.clouddn.com/',
        bucket:"htdc",
        accessKey:'qBYE7RMx6_yIKs_v9Rg0ZllL-gkIw3mcxFh2tnnb',
        secretKey:'Q127OHxkCoERgTbdCYUnthIFU1WSqDhFGU1M6feR',
    },
    /*ping++配置参数*/
    pingpp:{
        apiKey:'sk_live_4Gi98Gmn10KSHaDm5S580Cq1',
        //apiKey:'sk_test_GqHO88Pu5e1GLCuvj9CS0mrL',
        privateKey:'-----BEGIN RSA PRIVATE KEY-----\n'+
        'MIICXAIBAAKBgQDwNMJawlI/2M8L/3fC7CvgjD3+o4SGCv6sUHh/sgp2oGjd7x4M\n'+
        '26ZtTOsf5BeG06bOQOg47XfQNciojNbip4kLctBkVi6J3OnbQk5YK44xBfU1ZMwy\n'+
        'awbooubfMxHHMggZ4O2xq/zlWfNrllrykutuVViF5jwrrolZgfP7ewM2yQIDAQAB\n'+
        'AoGAfA5Tfjoz7mOT8xdai+IbexoS/osG64+MHgRlZ1XVT5Ti9BQFyhA68OIz4MGV\n'+
        'YP24fXdKN/R016SfYGV0qZRrEu1o7oVvo80e9tZV1MYczwOQIMP8Ng3l7TY4rev5\n'+
        'plD8wbm+JwSVvwonJf+y0CmK13QVQo0bz+Ks4VYiqRfybQECQQD8DDFvO/lvBKH5\n'+
        '6FgQGaAdT0X5zwtzJZJCxwg+3fLuxj7zs2pDWuZXYLd0WhLFKctBGbdHe1NzJZLf\n'+
        'XpjRwbzpAkEA8/kHsHteuV9xGzl3TM9bUaaD31ZqbQP2R+B09unVcBPjACrdz1LR\n'+
        'NtHnFNRNy9fCmLa2lKkxnPXCB2Gx78X+4QJAM5evWsyU/1OccFJODGWib711XnAy\n'+
        'MMzFBqRFHNFD0/qCklHsc4Mc2U/z3X4+j1tBvr6r1Jb6+vv693wenfkhWQJBAL5s\n'+
        'EOReZoCpTc7B+6un7M69+Q/IkyijfwZ62tAdksn3u6XVz2qSaVkwW/yV+GKx9ODd\n'+
        'O4SsylyINPkt94P+NgECQCP4TEf/hlgQnnbDYFZ70PaYkmpcFuqyYK90qNupHYXG\n'+
        'dJ8wFaRksBcG97SsbfvGrCSVdfNAir/17XsY0h6+Jo4=\n'+
        '-----END RSA PRIVATE KEY-----',
        publicKey:'-----BEGIN PUBLIC KEY-----\n'+
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDwNMJawlI/2M8L/3fC7CvgjD3+\n'+
        'o4SGCv6sUHh/sgp2oGjd7x4M26ZtTOsf5BeG06bOQOg47XfQNciojNbip4kLctBk\n'+
        'Vi6J3OnbQk5YK44xBfU1ZMwyawbooubfMxHHMggZ4O2xq/zlWfNrllrykutuVViF\n'+
        '5jwrrolZgfP7ewM2yQIDAQAB\n'+
        '-----END PUBLIC KEY-----\n',
        appId:'app_OqfD8KrL8W1K4GqH',
        pingPublicKey:'-----BEGIN PUBLIC KEY-----\n'+
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx1tg/1ezOxEZW83z8hBm\n'+
        '9FRWpK4PKDwO+c1BsNfoatMS/rsoMxzzkkCHOAUglfkIRzZ9/cyDtGH7zwmtvp0O\n'+
        'fE4UNUp/DIUgqaNttTF52bnFGVES5Ws3cWvyMj3UpYPKDc4O909YJ3BhEiLLT2Le\n'+
        'CKsXqSg+KNxszxe2DCbIDpUXwPA2aiSx8CL9WODYxQQi+1W/VcUDibj0vdc1G++n\n'+
        'jcRVszqJw+lQ0OoMsGcSgvbatv0NMc0xUOy1ktAGXADNAJicd+cwBytkjESuWavp\n'+
        'dRlJ8achPygIZY+xUcC4G4n6Wj17NzBfCUNvr1jJVG0/uGvuPSfSN+NiI/utNKIT\n'+
        'GQIDAQAB\n'+
        '-----END PUBLIC KEY-----\n',
    },
    /*极光推送配置参数*/
    jpush:{
        appKey:'f29a2f6ac903096d48539905',
        masterSecret:"b47017a03d2f6bf683f9a4a5",
    },
    //支付宝配置
    alipay:{
        app_id:'2017052007293620',
        notify_url:'http://htdc.mengotech.com/1.0/pay/alipaysuccess',
        privateKey:'-----BEGIN RSA PRIVATE KEY-----\n'+
        'MIICWwIBAAKBgQDD0FycuIXaB+HxiMqu0/BntU5OIacUyVuJnFdSJJ7P3/JnFJmm\n'+
        'irEeKfx7AR70ZIuZZ+7qt9aNiEMDz5cV1oh6WjjA95V9PCdflM91Av3ndBTkTBYY\n'+
        'J/OZyafZYtrZVGtPzd256ms3IUIXnGvoXpNcapycE2FZMoez8pDnMHWq8wIDAQAB\n'+
        'AoGAeJzvbtl6GUKhudU4g1eozTiwcw/nirY83Bag8sf7yq928GeP/TWQw7O5AUs/\n'+
        'deo40tViJNH4JlW4cbB8r8blaOQlA0xDUuc3giFhn41kdDs8kGYX+s3VZA9+54E2\n'+
        'GcJUy66uYzFNVv4Hebr00D5P1DZcmgVuleU+6NEyMif1AoECQQDlEu6dYtdHbsUc\n'+
        'udzZ+CI83CzJrCTwzP4SPelQKNwC738GvpFOH86WQQUs7TF+7UorlxyIMg9ee/LI\n'+
        'nLPGLgZnAkEA2tSZ7coknup3NC3wvyrlleJ/e6n4QHwH80KgN9jiEmFyZFS4l+2Z\n'+
        'yJqkoiLQ7kJqR6QWg1E1NNCCqOuOD9PnlQJBAIzIHtehCDdBb2ihHYbkBX6rvebP\n'+
        'ogBPq5HgdMQr6FLxh3rIoZqG17rmCN08hN/By4SQoRte0K07tdDu5VlVrd8CP1E0\n'+
        'k+qqGOzgFVxHsA9A2/HDG4vIh1dmr4yWLN6MnVg00T5qMhYvFeJbgLyqLt47xzTO\n'+
        'r4wLlrMCrXoB77Xv7QJAIEJldjNJcd0mV4yZACjwTV8IPILJOPHjw0DbX/YhcWOF\n'+
        'Mht9RfJTfCE3loJxLmLNY76BGD+F3ED5bhoccdpxHQ==\n'+
        '-----END RSA PRIVATE KEY-----\n',
    },
    //微信配置
    wx:{
        appid:'wxba47c11f6e36a3ea',
        mch_id:'1480312382',
        partner_key:'MG20170601HTDCFROMMENGOTECHabcde',
        notify_url:'htdc.mengotech.com/1.0/pay/wxsuccess',
    },
    /*Redis配置*/
    redisConfig: {
        host: '10.66.239.4',
        port: '6379',
        password: 'htcc%100*',
    },
    //4OwRvjDbmKrId1bz2khgPaHzyhkbEYx2
    /*百度地图配置参数*/
    // baiduditu:{
    //     ak:'4OwRvjDbmKrId1bz2khgPaHzyhkbEYx2',
    // },
}