
//pc端的顶部按钮
c_m_header = {
    param_parentId : "",    //容器id
    param_selectedId : 1,   //选中哪个栏目
    htmlCode :  '\
                <div id="id_c_m_header_main" class="c_m_header_main">\
                    <label id="id_c_m_header_title" class="abs txt_c txt_36 txt_w2" style="color:#000; top:60px; width:750px; height:90px;" data-lang=""></label>\
                    <div id="id_c_m_header_btn_back" class="abs" style="left:30px; top:55px;"><img src="./img/btn_back2.png"></div>\
                </div>\
                ',
    cssCode :   '\
                .c_m_header_main{position:fixed; width:100%; height:130px; background-color:#fff; border:0px solid #eee; border-bottom:2px solid #eee;}\
                ',

    //初始化
    init : function(p_str_parentId, p_str_title){
        this.param_parentId = p_str_parentId;
        
        this.loadCss();
        this.loadHtml();

        $('#id_c_m_header_btn_back').click({myType:"id_c_m_header_btn_back"}, c_m_header.btnClickHandler);

        $('#id_c_m_header_title').attr("data-lang", p_str_title);
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

    //窗口尺寸重置
    windowResize : function(p_left){
        // $('#id_c_m_header_container').css({"left":p_left+"px"});
    },


    //按钮点击事件
    btnClickHandler : function(p_obj_event){
        switch(p_obj_event.data.myType){
            case "id_c_m_header_btn_back":
                common.onBackFun();
                break;
        }
    },

    //重置按钮
    resetBtn : function(){
    }
}

