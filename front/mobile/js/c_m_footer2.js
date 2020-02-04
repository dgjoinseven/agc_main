
//
c_m_footer2 = {
    param_parentId : "",    //容器id
    param_selectedId : 1,   //选中哪个栏目
    htmlCode :  '\
                <div id="id_c_m_footer2_main" class="c_m_footer2_main">\
                    <div class="c_m_footer2_bg"></div>\
                    <div id="id_c_m_footer2_btn_1" class="c_m_footer2_btn" style="left:0px; width:375px; height:90px;" data-lang="main.公告"></div>\
                    <div id="id_c_m_footer2_btn_2" class="c_m_footer2_btn" style="left:375px; width:375px; height:90px;" data-lang="main.用户评论"></div>\
                </div>\
                ',
    cssCode :   '\
                .c_m_footer2_main{position:fixed; bottom:0px; height:80px; z-index:2000;}\
                .c_m_footer2_bg{position:absolute; background-color:#FFF; width:750px; height:90px; border:0px solid #eee; border-top:2px solid #eee;}\
                .c_m_footer2_btn{position:absolute; text-align:center; width:375px; height:90px; line-height:90px; color:#A8A8A8; font-size:32px; font-weight:100; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;}\
                .c_m_footer2_select{background-color:#FFD821; color:#000 !important;}\
                ',

    //初始化
    init : function(p_str_parentId, p_int_selectId){
        this.param_parentId = p_str_parentId;
        this.param_selectedId = p_int_selectId;

        this.loadCss();
        this.loadHtml();

        $("#id_c_m_footer2_btn_1").click({myType:"id_c_m_footer2_btn_1"}, c_m_footer2.btnClickHandler);
        $("#id_c_m_footer2_btn_2").click({myType:"id_c_m_footer2_btn_2"}, c_m_footer2.btnClickHandler);

        c_m_footer2.selected(p_int_selectId, false);
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


    //按钮点击事件
    btnClickHandler : function(p_obj_event){
        switch(p_obj_event.data.myType){
                case "id_c_m_footer2_btn_1":
                    c_m_waiting.init("id_tips");
                    c_m_footer2.selected(1, true);
                    break;
                case "id_c_m_footer2_btn_2":
                    c_m_waiting.init("id_tips");
                    c_m_footer2.selected(2, true);
                    break;
        }
    },

    //选择
    selected : function(p_int_id, p_bool_isUpdatePage){
        c_m_footer2.resetBtn();
        switch(p_int_id){
            case 1:
                $('#id_c_m_footer2_btn_1').addClass("c_m_footer2_select");
                if(p_bool_isUpdatePage==true) common.gotoWebSite('noticeList.html');
                break;
            case 2:
                $('#id_c_m_footer2_btn_2').addClass("c_m_footer2_select");
                if(p_bool_isUpdatePage==true) common.gotoWebSite('userComment.html');
                break;
        }
    },

    //重置按钮
    resetBtn : function(){
        var zMyList=document.getElementsByClassName("c_m_footer2_btn");
        for(var i=0; i<zMyList.length; i++){
            var zId = i+1;
            var zMyId = zMyList[i].id;
            $('#id_c_m_footer2_btn_'+zId).removeClass("c_m_footer2_select");
        }
    },

    //更新y
    updateTop : function(p_int_top){
    },

    //窗口尺寸重置
    windowResize : function(p_int_left){
        // $('#id_c_m_footer2_container').css({"left":p_int_left+"px"});
    }
}

