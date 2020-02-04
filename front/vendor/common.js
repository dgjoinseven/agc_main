common = {
    VER : "1.8",    //版本号
    isZSF : 0,      //是否正式服（这个值不是真正的值，根据zsf.json设置是否正式服）
    PC_WIDTH : 1200,    //PC端的标准宽度
    MOBILE_WIDTH : 750, //mobile端的标准宽度
    JS_LOAD_COUNTER : 0,    //已经加载的js个数
    JS_IS_LOADED : false,   //所有预加载的js是否都加载完毕
    ROOT_URL : "",          //基础路径
    COIN_NAME : "AGC",      //币的名字
    PHP_URL_ZSF : "https://api.ctwangelcity.com/api/",
    // PHP_URL_TEST : "http://120.25.106.197:7002/api/",
    // PHP_URL_ZSF : "http://127.0.0.1:7002/api/",
    PHP_URL_TEST : "http://127.0.0.1:7002/api/",

    //初始化
    init : function(p_cp_list){
        var curWwwPath = window.document.location.href;
        var pos = curWwwPath.indexOf("src");
        var localhostPaht = curWwwPath.substring(0, pos);
        common.ROOT_URL = localhostPaht;

        //是否正式服
        $.getJSON("../vendor/zsf.json?ver="+$.cookie('commonJsVer'), function (data){
          $.each(data, function (infoIndex, info){
            if(infoIndex=="is_zsf"){
                common.isZSF = parseInt(info);
                common.initCssJs(p_cp_list);
            }
          })
        })
    },

    initCssJs : function(p_cp_list){
        //加载css和js
        common.JS_LOAD_COUNTER = 0;
        common.JS_IS_LOADED = false;
        var zHead = document.getElementsByTagName('head')[0];
        //css
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = './css/common.css?ver='+common.VER;
        zHead.appendChild(link);
        if(!p_cp_list){
            p_cp_list = [];
             common.JS_IS_LOADED = true;
             return;
        }

        //js
        var zScriptListB = [];
        zScriptListB.push("../lang/lang_en.js");
        zScriptListB.push("../lang/lang_zhhk.js");
        zScriptListB.push("../lang/lang_jp.js");
        zScriptListB.push("../lang/lang_ko.js");
        zScriptListB.push("../lang/lang_fr.js");
        for(var j=0; j<p_cp_list.length; j++){
            var zJvalue = "./js/"+p_cp_list[j]+".js";
            if(p_cp_list[j].indexOf("/")!=-1){
                zJvalue = p_cp_list[j];
            }
            zScriptListB.push(zJvalue);
        }
        for(var i=0; i<zScriptListB.length; i++){
            var zScriptB = document.createElement('script');
            zScriptB.type = 'text/javascript';
            zScriptB.src = zScriptListB[i] +"?ver="+common.VER;
            zScriptB.onload = zScriptB.onreadystatechange = function() {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ){
                   common.JS_LOAD_COUNTER ++;
                    if(common.JS_LOAD_COUNTER>=zScriptListB.length){
                        common.JS_IS_LOADED = true;
                    } 
                }
            }
            zHead.appendChild(zScriptB);
        };
    },

    //初始化缩放
    initScale : function (p_float_scaleMax){
        var phoneWidth = parseInt(window.screen.availWidth);
        var phoneHeight = parseInt(window.screen.availHeight);
        var zMaxWidth = common.PC_WIDTH;
        if(phoneWidth <= 750){
            zMaxWidth = common.MOBILE_WIDTH;
        }

        var phoneScale = phoneWidth/zMaxWidth;//除以的值按手机的物理分辨率
        if(p_float_scaleMax>0){
            if(phoneScale > p_float_scaleMax){
                phoneScale = p_float_scaleMax;
            }
        }

        var ua = navigator.userAgent;
        var oMeta = document.createElement('meta');
        oMeta.charset = 'utf-8';
        oMeta.name = "viewport";
        //安卓系统
        if (/Android (\d+\.\d+)/.test(ua)) {
            var version = parseFloat(RegExp.$1);
             if (version > 2.3) {
                oMeta.content = "width=device-width, initial-scale="+phoneScale+",minimum-scale="+phoneScale+",maximum-scale="+phoneScale+",user-scalable=no";
             } else {
                oMeta.content = "width=device-width,user-scalable=no";
             }
        // 其他系统
        } else {
            oMeta.content = "width=device-width, initial-scale="+phoneScale+",minimum-scale="+phoneScale+",maximum-scale="+phoneScale+",user-scalable=no";
        }
        // console.log("scale:" + phoneWidth+","+zMaxWidth+","+phoneScale);
        document.getElementsByTagName('head')[0].appendChild(oMeta);
        return phoneScale;
    },

    //获取当前的语言名字
    getCurLang : function(){
        var zResult = "";
        var zLang = common.getCookie("lang")?common.getCookie("lang"):"en";
        switch(zLang){
            case "en":
                zResult = "English";
                break;
            case "zh-hk":
                zResult = "繁體中文";
                break;
            case "jp":
                zResult = "日本語";
                break;
            case "ko":
                zResult = "한국어";
                break;
            case "fr":
                zResult = "Français";
                break;
            default:
                zResult = "English";
                break;
        }
        return zResult;
    },

    //更新当前语言
    lang : function(){
        var lang = lang_en;
        switch(common.getCookie("lang")){
            case "en":
                lang = lang_en;
                break;
            case "zh-hk":
                lang = lang_zhhk;
                break;
            case "jp":
                lang = lang_jp;
                break;
            case "ko":
                lang = lang_ko;
                break;
            case "fr":
                lang = lang_fr;
                break;
            default:
                lang = lang_en;
                break;
        }
        $('[data-lang],[data-placeholder]').each(function (){
            if($(this).attr("data-lang")){
                var zDotIndex1 = $(this).attr("data-lang").indexOf(".");
                var zTitle1 = $(this).attr("data-lang").substring(0, zDotIndex1);
                var zContent1 = $(this).attr("data-lang").substring((zDotIndex1+1));
                if($(this).prop("tagName")=="INPUT" || $(this).prop("tagName")=="TEXTAREA"){
                    $(this).val(lang[zTitle1][zContent1]);
                }else{
                    $(this).html(lang[zTitle1][zContent1]);
                }
            }
            if($(this).attr("data-placeholder")){
                var zDotIndex2 = $(this).attr("data-placeholder").indexOf(".");
                var zTitle2 = $(this).attr("data-placeholder").substring(0, zDotIndex2);
                var zContent2 = $(this).attr("data-placeholder").substring((zDotIndex2+1));
                $(this).attr("placeholder", lang[zTitle2][zContent2]);
            }
        });
    },

    //获取文本地whxy值
    getTextWHXY : function(p_str_idName){
        var obj = document.getElementById(p_str_idName);
        var xy = obj.getBoundingClientRect();
        var top = xy.top-document.documentElement.clientTop+document.documentElement.scrollTop,//document.documentElement.clientTop 在IE67中始终为2，其他高级点的浏览器为0
            bottom = xy.bottom,
            left = xy.left-document.documentElement.clientLeft+document.documentElement.scrollLeft,//document.documentElement.clientLeft 在IE67中始终为2，其他高级点的浏览器为0
            right = xy.right,
            width = xy.width||right - left, //IE67不存在width 使用right - left获得
            height = xy.height||bottom - top;

        return {
            top:top,
            right:right,
            bottom:bottom,
            left:left,
            width:width,
            height:height
        }
    },

    //从网页中获得参数
    getParam : function(p_str_name){
        var zList = {};
        var curWwwPath = decodeURI(window.document.location.href);
        if(curWwwPath.indexOf("?") != -1){
            var zV1 = curWwwPath.split("?")[1];
            var zV1_list = zV1.split("&");
            for(var i=0; i<zV1_list.length; i++){
                var zV2 = zV1_list[i].split("=");
                zList[zV2[0]] = zV2[1];
            }
        }
        if(p_str_name){
            return zList[p_str_name];
        }else{
            return zList;
        }
    },

    //时间转化
    formatUnixtimestamp : function (unixtimestamp, p_bool_isNoTime){
        var unixtimestamp = new Date(unixtimestamp*1000);
        var year = 1900 + unixtimestamp.getYear();
        var month = "0" + (unixtimestamp.getMonth() + 1);
        var date = "0" + unixtimestamp.getDate();
        var hour = "0" + unixtimestamp.getHours();
        var minute = "0" + unixtimestamp.getMinutes();
        var second = "0" + unixtimestamp.getSeconds();
        var zResult = year + "-" + month.substring(month.length-2, month.length)  + "-" + date.substring(date.length-2, date.length)
            + "      " + hour.substring(hour.length-2, hour.length) + ":"
            + minute.substring(minute.length-2, minute.length) + ":"
            + second.substring(second.length-2, second.length);
        if(p_bool_isNoTime==true){
            zResult = year + "-" + month.substring(month.length-2, month.length)  + "-" + date.substring(date.length-2, date.length);
        }
        return zResult;
    },

    //去空格
    trim : function (p_str){
        return p_str.replace(/(^\s*)|(\s*$)/g, "");
    },

    //自动往前面补零
    //@p_int_num    数值
    //@p_int_n      位数
    preZero : function(p_int_num, p_int_n) {
        return (Array(p_int_n).join(0) + p_int_num).slice(-p_int_n);
    },

    //把数字逢千加逗号
    numQian : function(p_num){
        var zValueList = p_num.toString().split(".");
        var zZhengShu = zValueList[0].toString();
        var zXiaoShu = zValueList[1];
        var zStrLen = zZhengShu.length;
        var zValueList = [];
        var zStrTotal = "";
        for(var i=1; i<=6; i++){
            var zVA = (i-1)*3;
            var zVB = i*3;
            if(zStrLen>zVA){
                var zValue = zZhengShu.substr(-1*((zStrLen>zVB)?zVB:zStrLen), (zStrLen>zVB)?3:(zStrLen-zVA));
                zValueList.push(zValue);
            }
        }
        for(var j=(zValueList.length-1); j>=0; j--){
            var zValue = zValueList[j];
            if(j==(zValueList.length-1)){
                zStrTotal = zValue;
            }else{
                zStrTotal = zStrTotal + "," + zValue;
            }
        }
        if(zXiaoShu){
            zStrTotal = zStrTotal + "." + zXiaoShu;
        }
        return zStrTotal;
    },

    //把时间戳转为 x天 x:x:x
    getTimeStrFromNum : function(p_int_num){
        if(p_int_num<0){
            p_int_num = 0;
        }
        var zTimeHour = Math.floor(p_int_num/3600);
        var zTimeMinutes = Math.floor(p_int_num%3600/60);
        var zTimeSeceond = Math.floor(p_int_num%60);
        return common.preZero(zTimeHour, 2)+" : "+common.preZero(zTimeMinutes, 2)+" : "+common.preZero(zTimeSeceond, 2);
    },

    //返回上一层
    onBackFun : function(){
        window.history.go(-1);
    },

    //刷新页面
    onRefreshFun : function(){
        window.history.go(0);
    },

    //设置cookie
    setCookie : function(p_str_name, p_all_value, p_all_value2){
        switch(p_str_name){
            case "token":
                $.cookie("token", p_all_value);
                break;
            case "userInfo":
                $.cookie("userInfo", p_all_value);
                break;
            case "conf":
                $.cookie("conf", p_all_value);
                break;
            case "isLogin":
                $.cookie("isLogin", p_all_value);
                break;
            case "lang":
                $.cookie("lang", p_all_value);
                break;
            case "noticeDetail":
                $.cookie("noticeDetail", p_all_value);
                break;
            case "exchangeRate":
                $.cookie("exchangeRate", p_all_value);
                break;
            case "groupRounds":
                $.cookie("groupRounds", p_all_value);
                break;
        }
    },

    //获取cookie
    getCookie : function(p_str_name, p_all_value){
        var zValue = 0;
        switch(p_str_name){
            case "token":
                zValue = $.cookie("token");
                break;
            case "userInfo":
                zValue = $.cookie("userInfo");
                break;
            case "conf":
                zValue = $.cookie("conf");
                break;
            case "isLogin":
                zValue = $.cookie("isLogin");
                break;
            case "lang":
                zValue = $.cookie("lang");
                break;
            case "noticeDetail":
                zValue = $.cookie("noticeDetail");
                break;
            case "exchangeRate":
                zValue = $.cookie("exchangeRate");
                break;
            case "groupRounds":
                zValue = $.cookie("groupRounds");
                break;
        }
        return zValue;
    },

    //token报失效的处理
    fnTokenFail : function(){
        $.removeCookie('token');
        $.removeCookie('userInfo');
    },

    //获取申请php的地址
    getApiUrl : function(p_str_name){
        // var zIsZSF = common.getCookie("isZSF");
        var zPreUrl = common.PHP_URL_ZSF;
        if(common.isZSF!=1){
            zPreUrl = common.PHP_URL_TEST;
        }
        var zUrl = zPreUrl + p_str_name;
        return zUrl;
    },

    //跳转到页面
    gotoWebSite : function(p_str_url, p_bool_isNeedVer, p_bool_isNewWin){
        if(p_bool_isNeedVer==false){
            javascript:location.href=p_str_url;
        }else{
            if(p_str_url.indexOf("?")!=-1){
                var zUrl = p_str_url+'&ver='+common.VER;
                if(p_bool_isNewWin==true){
                    window.open(zUrl, '_blank');
                }else{
                    javascript:location.href=zUrl;
                }
            }else{
                var zUrl = p_str_url+'?ver='+common.VER;
                if(p_bool_isNewWin==true){
                    window.open(zUrl, '_blank');
                }else{
                    javascript:location.href=zUrl;
                }
            }
            // javascript:location.href=p_str_url;
        }
    }


}
