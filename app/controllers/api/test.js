const crypto = require('crypto');
var secretkey="aaaaaaa";//唯一（公共）秘钥
    var content="fwewea";
    var cipher=crypto.createCipher('aes192', secretkey);//使用aes192加密
    var enc = cipher.update(content,"utf8","hex");//编码方式从utf-8转为hex;
    enc += cipher.final('hex');//编码方式转为hex;

    console.log(enc)


    //AES对称解密
    var decipher=crypto.createDecipher('aes192', secretkey);
    var dec=decipher.update(enc,"hex", "utf8");
    dec+=decipher.final("utf8");
    console.log("AES对称解密结果："+dec);