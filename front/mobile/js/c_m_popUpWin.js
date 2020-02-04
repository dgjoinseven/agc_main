//需要导入 jquery.cookie.js

//弹窗
c_m_popUpWin = {
    param_parentId : "",       //参数-父级对象的id
    param_imgIndex : 1,     //参数-高度等级:1 2 3
    param_txtTitle : "TITLE",   //参数-标题
    param_txtContent : "Contents", //参数-内容
    param_btn1Txt : "OK",    //参数-按钮1显示的文字
    param_btn2Txt : "CANCEL",    //参数-按钮2显示的文字
    param_feedbackFun1 : null,   //参数-按钮1操作的回调函数
    param_feedbackFun2 : null,   //参数-按钮2操作的回调函数
    param_isShowCloseBtn : false,  //参数-是否右上角显示关闭按钮
    feebackDo : 1,                  //点击按钮后使用哪个feedback
    htmlCode :  '\
                <div class="c_m_popUpWin_container" id="id_c_m_popUpWin_container">\
                    <div id="id_c_m_popUpWin_bg" class="c_m_popUpWin_bg"></div>\
                    <div id="id_c_m_popUpWin_win" class="abs" style="width:600px; height:600px; background-color:#fff; border-radius:10px;" hidden>\
                        <div class="abs" style="left:30px; top:110px; width:540px; height:360px;">\
                            <img id="id_c_m_popUpWin_img" class="abs" style="left:190px; top:10px;" src="./img/bg_popwin_1.jpg">\
                            <div id="id_c_m_popUpWin_content" class="abs txt_36 txt_c" style="top:200px; width:540px; height:180px; line-height:60px; color:#A8A8A8"></div>\
                        </div>\
                        <div class="abs" style="top:0px; width:600px; height:90px; border:0px solid #eee; border-bottom:2px solid #eee;">\
                            <div id="id_c_m_popUpWin_title" class="abs txt_c txt_w2 txt_36" style="width:600px; height:90px; line-height:90px;">Tips</div>\
                            <div id="id_c_m_popUpWin_btn_close" class="abs" style="right:15px; top:15px; cursor:pointer;"><img src="./img/btn_close_1.png"></div>\
                        </div>\
                        <div class="abs" style="left:30px; top:480px; width:400px; height:80px;">\
                            <div id="id_c_m_popUpWin_btn_2" class="btn_a btn_a_yellow" style="width:260px; height:80px; line-height:80px;">CANCEL</div>\
                            <div id="id_c_m_popUpWin_btn_1" class="btn_a btn_a_yellow" style="width:540px; height:80px; line-height:80px;">OK</div>\
                        </div>\
                    </div>\
                </div>\
                ',
    cssCode :   '\
                .c_m_popUpWin_container{position:fixed; z-index:2000; width:100%; height:100%;}\
                .c_m_popUpWin_bg{filter:alpha(Opacity=50);-moz-opacity:0.5;opacity:0.5; background-color:#000; width:100%; height:100%; position:absolute; top:0; left:0;}\
                ',

    //运行元件
    init : function(p_str_parentId, p_int_imgIndex, p_str_title, p_str_content, p_str_btn1Txt, p_fun_feedbackFun1, p_str_btn2Txt, p_fun_feedbackFun2){
        this.param_parentId = p_str_parentId;
        this.param_imgIndex = p_int_imgIndex;
        this.param_txtTitle = p_str_title;
        this.param_txtContent = p_str_content;
        this.param_btn1Txt = p_str_btn1Txt;
        this.param_feedbackFun1 = p_fun_feedbackFun1;
        this.param_btn2Txt = p_str_btn2Txt;
        this.param_feedbackFun2 = p_fun_feedbackFun2;

        this.loadCss();
        this.loadHtml();
        
        $('#id_c_m_popUpWin_title').attr("data-lang", this.param_txtTitle);
        if(this.param_txtContent.substr(0,1)=="@"){
            $('#id_c_m_popUpWin_content').html(this.param_txtContent.substr(1,this.param_txtContent.length-1));
        }else{
            $('#id_c_m_popUpWin_content').attr("data-lang", this.param_txtContent);
        }
        $('#id_c_m_popUpWin_img').attr("src", "./img/bg_popwin_"+this.param_imgIndex+".jpg");


        //1个按钮1
        if(this.param_feedbackFun1){
            $('#id_c_m_popUpWin_btn_1').click({myType:"id_c_m_popUpWin_btn_1"}, c_m_popUpWin.btnClickHandler);
        }else{
            $('#id_c_m_popUpWin_btn_1').click({myType:"closeWin"}, c_m_popUpWin.btnClickHandler);
        }

        //2个按钮
        if(this.param_btn2Txt){
            $('#id_c_m_popUpWin_btn_1').attr("data-lang", this.param_btn1Txt);
            $('#id_c_m_popUpWin_btn_2').attr("data-lang", this.param_btn2Txt);
            $('#id_c_m_popUpWin_btn_1').css({"left":"270px", "width":"260px"});
            $('#id_c_m_popUpWin_btn_2').css({"left":"0px","width":"260px"});
            $('#id_c_m_popUpWin_btn_1').show();
            $('#id_c_m_popUpWin_btn_2').show();
        }
        else{
            if(this.param_btn1Txt){
                $('#id_c_m_popUpWin_btn_1').attr("data-lang", this.param_btn1Txt);
            }
            $('#id_c_m_popUpWin_btn_1').css({"left":"0px","width":"540px"});
            $('#id_c_m_popUpWin_btn_2').hide();
        }

        //回调函数
        if(this.param_feedbackFun2){
            $('#id_c_m_popUpWin_btn_2').click({myType:"id_c_m_popUpWin_btn_2"}, c_m_popUpWin.btnClickHandler);
        }else{
            $('#id_c_m_popUpWin_btn_2').click({myType:"closeWin"}, c_m_popUpWin.btnClickHandler);
        }

        $('#id_c_m_popUpWin_btn_close').click({myType:"closeWin"}, c_m_popUpWin.btnClickHandler);


        $('#'+this.param_parentId).show();
        $('#id_c_m_popUpWin_win').fadeIn(500);

        this.setSizePos();
        common.lang();
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
        if(!$('#id_c_m_popUpWin_win').css("width")){
            return;
        }
        
        if(!p_scale){
            p_scale = 1;
        }
        var zMyWidth = document.documentElement.clientWidth;
        var zMyHeight = document.documentElement.clientHeight;
        
        var zW_1 = parseInt($('#id_c_m_popUpWin_win').css("width").replace("px", ""));
        var zH_1 = parseInt($('#id_c_m_popUpWin_win').css("height").replace("px", ""));
        var zMiddleWidth = (zMyWidth-parseInt(zW_1))/2/p_scale;
        var zMiddleHeight = (zMyHeight-parseInt(zH_1))/2/p_scale;
        // console.log(zMyWidth, parseInt(zObjWidth), zMiddleWidth);
        $('#id_c_m_popUpWin_win').css({"left":zMiddleWidth+"px", "top":zMiddleHeight+"px"});
    },

    //按钮点击事件
    btnClickHandler : function(p_obj_event){
        // console.log(p_obj_event.data.myType);
        switch(p_obj_event.data.myType){
            case "closeWin":
                $('#id_c_m_popUpWin_container').hide();
                break;
            case "id_c_m_popUpWin_btn_1":
                c_m_popUpWin.feebackDo = 1;
                $('#id_c_m_popUpWin_container').fadeOut(500, c_m_popUpWin.popupWinHide);
                break;
            case "id_c_m_popUpWin_btn_2":
                c_m_popUpWin.feebackDo = 2;
                $('#id_c_m_popUpWin_container').fadeOut(500, c_m_popUpWin.popupWinHide);
                break;
        }
    },

    //隐藏显示窗口
    popupWinHide : function(){
        $('#id_c_m_popUpWin_win').hide();
        parent.$('#'+this.param_parentId).hide();

        // console.log(c_m_popUpWin.feebackDo);

        if(c_m_popUpWin.feebackDo == 1 && c_m_popUpWin.param_feedbackFun1!=undefined && c_m_popUpWin.param_feedbackFun1!=null){
            c_m_popUpWin.param_feedbackFun1();
        }else if(c_m_popUpWin.feebackDo == 2 && c_m_popUpWin.param_feedbackFun2!=undefined && c_m_popUpWin.param_feedbackFun2!=null){
            c_m_popUpWin.param_feedbackFun2();
        }
        

    }
}

