
//等待动画
c_m_waiting = {
    param_parentId : "",    //容器id
    param_timeId : 0,
    htmlCode :  '\
                <div id="id_c_m_waiting" class="abs txt_36" style="position:fixed; z-index:2000; width:100%; height:100%;">\
                    <div class="bg_mask"></div>\
                    <div id="id_loading_img" class="abs ball_spin_fade_loader" style="left:50%; top:50%;">\
                        <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>\
                    </div>\
                </div>\
                ',
    cssCode :   '',

    //运行元件
    init : function(p_str_parentId){
        this.param_parentId = p_str_parentId;

        this.loadCss();
        this.loadHtml();

        $('#id_c_m_waiting').show();
        c_m_waiting.param_timeId = setTimeout(c_m_waiting.close, 10000);
    },

    //加载html
    loadHtml : function(){
        document.getElementById(this.param_parentId).innerHTML = this.htmlCode;

        $('#id_c_m_waiting_content').attr("data-localize","tips."+this.param_info);
        common.lang();
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

    close : function(){
        $('#id_c_m_waiting').hide();
        clearTimeout(c_m_waiting.param_timeId);
        c_m_waiting.param_timeId = 0;
    }
}

