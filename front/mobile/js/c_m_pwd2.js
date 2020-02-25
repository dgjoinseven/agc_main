//需要导入 jquery.cookie.js

//弹窗
c_m_pwd2 = {
    param_parentId : "",       //参数-父级对象的id
    param_orderId : 0,       
    param_orderType : 0,     
    param_reason : "",
    param_is_haveKeyEvent : 0, 
    htmlCode :  '\
                <div class="c_m_pwd2_container" id="id_c_m_pwd2_container">\
                    <div id="id_c_m_pwd2_bg" class="c_m_pwd2_bg"></div>\
                    <div id="id_c_m_pwd2_win" class="abs" style="width:600px; height:600px; background-color:#fff; border-radius:10px;" hidden>\
                        <div class="abs" style="left:30px; top:180px; width:540px; height:360px;">\
                            <div class="abs" style="left:0px; top:0px;">\
                                <div class="abs" style="left:0px; width:90px; height:90px; border:2px solid #A8A8A8;"><label id="id_c_m_pwd2_star_1" class="abs txt_64 txt_c" style="width:90px; height:90px; line-height:120px; display:none;">*</label></div>\
                                <div class="abs" style="left:90px; width:90px; height:90px; border:2px solid #A8A8A8;"><label id="id_c_m_pwd2_star_2" class="abs txt_64 txt_c" style="width:90px; height:90px; line-height:120px; display:none;">*</label></div>\
                                <div class="abs" style="left:180px; width:90px; height:90px; border:2px solid #A8A8A8;"><label id="id_c_m_pwd2_star_3" class="abs txt_64 txt_c" style="width:90px; height:90px; line-height:120px; display:none;">*</label></div>\
                                <div class="abs" style="left:270px; width:90px; height:90px; border:2px solid #A8A8A8;"><label id="id_c_m_pwd2_star_4" class="abs txt_64 txt_c" style="width:90px; height:90px; line-height:120px; display:none;">*</label></div>\
                                <div class="abs" style="left:360px; width:90px; height:90px; border:2px solid #A8A8A8;"><label id="id_c_m_pwd2_star_5" class="abs txt_64 txt_c" style="width:90px; height:90px; line-height:120px; display:none;">*</label></div>\
                                <div class="abs" style="left:450px; width:90px; height:90px; border:2px solid #A8A8A8;"><label id="id_c_m_pwd2_star_6" class="abs txt_64 txt_c" style="width:90px; height:90px; line-height:120px; display:none;">*</label></div>\
                            </div>\
                            <input id="id_c_m_pwd2_input" type="text" class="abs" style="width:540px; height:90px; opacity:0;" maxlength="6">\
                            <div class="abs txt_32 txt_c" style="top:150px; width:540px; height:180px; line-height:40px; color:#A8A8A8" data-lang="main.tips_content_1"></div>\
                        </div>\
                        <div class="abs" style="top:0px; width:600px; height:90px; border:0px solid #eee; border-bottom:2px solid #eee;">\
                            <div id="id_c_m_pwd2_title" class="abs txt_c txt_w2 txt_32" style="width:600px; height:90px; line-height:90px;" data-lang="main.交易密码"></div>\
                            <div id="id_c_m_pwd2_btn_close" class="abs" style="right:15px; top:15px; cursor:pointer;"><img src="./img/btn_close_1.png"></div>\
                        </div>\
                        <div class="abs" style="left:30px; top:480px; width:400px; height:80px;">\
                            <div id="id_c_m_pwd2_btn_1" class="btn_a btn_a_yellow" style="width:540px; height:80px; line-height:80px;" data-lang="main.确认"></div>\
                        </div>\
                    </div>\
                </div>\
                ',
    cssCode :   '\
                .c_m_pwd2_container{position:fixed; z-index:2000; width:100%; height:100%;}\
                .c_m_pwd2_bg{filter:alpha(Opacity=50);-moz-opacity:0.5;opacity:0.5; background-color:#000; width:100%; height:100%; position:absolute; top:0; left:0;}\
                ',

    //运行元件
    //@p_int_orderId    订单ID
    //@p_int_orderType  订单类型（1付款 2收款）
    //@p_int_orderUserId    确认人id
    init : function(p_str_parentId, p_int_orderId, p_int_orderType, p_str_reason){
        this.param_parentId = p_str_parentId;
        this.param_orderId = p_int_orderId;
        this.param_orderType = p_int_orderType;
        this.param_reason = p_str_reason;

        this.loadCss();
        this.loadHtml();

        $('#id_c_m_pwd2_btn_1').click({myType:"id_c_m_pwd2_btn_1"}, c_m_pwd2.btnClickHandler);
        $('#id_c_m_pwd2_btn_close').click({myType:"closeWin"}, c_m_pwd2.btnClickHandler);


        $('#'+this.param_parentId).show();
        $('#id_c_m_pwd2_win').fadeIn(500);

        this.setSizePos();
        common.lang();

        c_m_pwd2.cleanKey();
        $("#id_c_m_pwd2_input").bind("input propertychange", function(){
            c_m_pwd2.updateKey($("#id_c_m_pwd2_input").val());
        });
    },

    //加载html
    loadHtml : function(){
        document.getElementById(this.param_parentId).innerHTML = this.htmlCode;
    },

    //加载CSS
    loadCss : function(){
        var style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        //for Chrome,Firefox,Opera,Safari
        style.appendChild(document.createTextNode(this.cssCode));
        //for IE
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(style);
    },

    //设置尺寸位置
    setSizePos : function(p_scale){
        if(!$('#id_c_m_pwd2_win').css("width")){
            return;
        }
        
        if(!p_scale){
            p_scale = 1;
        }
        var zMyWidth = document.documentElement.clientWidth;
        var zMyHeight = document.documentElement.clientHeight;
        
        var zW_1 = parseInt($('#id_c_m_pwd2_win').css("width").replace("px", ""));
        var zH_1 = parseInt($('#id_c_m_pwd2_win').css("height").replace("px", ""));
        var zMiddleWidth = (zMyWidth-parseInt(zW_1))/2/p_scale;
        var zMiddleHeight = (zMyHeight-parseInt(zH_1))/2/p_scale;
        // console.log(zMyWidth, parseInt(zObjWidth), zMiddleWidth);
        $('#id_c_m_pwd2_win').css({"left":zMiddleWidth+"px", "top":zMiddleHeight+"px"});
    },

    //按钮点击事件
    btnClickHandler : function(p_obj_event){
        // console.log(p_obj_event.data.myType);
        switch(p_obj_event.data.myType){
            case "closeWin":
                $('#id_c_m_pwd2_container').hide();
                break;
            case "id_c_m_pwd2_btn_1":
                c_m_pwd2.api_orderComfirm();
                break;
        }
    },

    //更新数字
    updateKey : function(pKey){
        $('#id_c_m_pwd2_star_1').hide();
        $('#id_c_m_pwd2_star_2').hide();
        $('#id_c_m_pwd2_star_3').hide();
        $('#id_c_m_pwd2_star_4').hide();
        $('#id_c_m_pwd2_star_5').hide();
        $('#id_c_m_pwd2_star_6').hide();
        for(var i=1; i<=pKey.length; i++){
            $('#id_c_m_pwd2_star_'+i).show();
        }
    },

    //清除数字
    cleanKey : function(){
        $("#id_c_m_pwd2_input").val("");
        $('#id_c_m_pwd2_star_1').hide();
        $('#id_c_m_pwd2_star_2').hide();
        $('#id_c_m_pwd2_star_3').hide();
        $('#id_c_m_pwd2_star_4').hide();
        $('#id_c_m_pwd2_star_5').hide();
        $('#id_c_m_pwd2_star_6').hide();
    },

//////////////////////////////////// php相关 ////////////////////////////////////
    //支付/确认
    api_orderComfirm : function(){
        c_m_waiting.init("id_tips");
        $.ajax({
            url: common.getApiUrl("order_edit"),
            type: "post",
            beforeSend: function(Request) {
                Request.setRequestHeader("Authorization",common.getCookie('token'));
            },
            data:{type:c_m_pwd2.param_orderType, id:c_m_pwd2.param_orderId, pwd2:$("#id_c_m_pwd2_input").val(), reason:c_m_pwd2.param_reason},
            dataType: "json", //指定服务器返回的数据类型
            cache:false,
            success: function (evt) {
                console.log("api_orderList success:");
                console.log(evt);
                switch(evt.code){
                    case 1:
                    case 10:
                        $('#id_c_m_pwd2_container').hide();
                        c_m_popUpWin.init("id_popupwin", 1, "tips.t_tips", "tips.1", "tips.b_ok", function(){common.onRefreshFun()});
                        break;
                    default:
                        c_m_popUpWin.init("id_popupwin", 1, "tips.t_tips", "tips."+evt.code, "tips.b_ok");
                        break;
                }
                c_m_waiting.close();
            },error: function(error){
                console.log("api_orderList error:"+error.msg);
                c_m_waiting.close();
            }
        });
    }



}

