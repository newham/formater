var from = 'en';
var to = 'zh';
var tip = "正在翻译..."

function clean() {
    $("#inputstr").val("");
    $("#outputstr").val("");
    $("#translate").val("");
    count();
}

function paste() {
    $("#inputstr").select(); // 选中文本
    document.execCommand("Paste"); // 执行浏览器复制命令
    StrReplace();
}

function format() {
    clean();
    paste();
    doTranslate();
}

function isChinese(str) {
    var pattern = new RegExp("[\u4E00-\u9FA5]+");
    if (pattern.test(str)) {
        return true;
    }
    return false;
}
// 全角转半角
function ToCDB(str) {
    var tmp = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) == 12288) {
            tmp += String.fromCharCode(str.charCodeAt(i) - 12256);
            continue;
        }
        if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) {
            tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
        } else {
            tmp += String.fromCharCode(str.charCodeAt(i));
        }
    }
    return tmp
}

function setLan() {
    if (isChinese($("#inputstr").val())) { //中文
        from = 'zh';
        to = 'en';
        tip = 'translating...';
    } else { //英文，不去空格，回车转空格{
        from = 'en';
        to = 'zh';
        tip = '正在找【百度】翻译...';
    }
}

function StrReplace() {
    // 设置语言
    setLan();
    var StrInput = $("#inputstr").val();
    // 中文，去掉空格
    if (isChinese(StrInput)) {
        StrInput = formatStr(StrInput, "");
        StrInput = replaceSpace(StrInput, "");
        StrInput = replaceComma(StrInput, "，")
    } else { //英文，不去空格，回车转空格
        StrInput = formatStr(StrInput, " ");
    }
    //都要转半角
    StrInput = ToCDB(StrInput);
    $("#outputstr").val(StrInput);
    // $("#inputstr").val(StrInput);
    //重绘textarea区域
    // do_resize();
    if (is_paste) {
        copyText('outputstr')
        is_paste = false
    }
}

// 替换回车
function formatStr(strInput, str) {
    strInput = strInput.replace(/\n/ig, str);
    return strInput;
}

// 替换空格
function replaceSpace(strInput, str) {
    return strInput.replace(/[ ]/g, str);
}

// 替换空格
function replaceComma(strInput, str) {
    return strInput.replace(/,/ig, str);
}

$(function() {
    $("#inputstr").keyup(function() {
        StrReplace();
    });
    // 回车事件
    $("#inputstr").keypress(function(e) {
        if (e.which == 13) {
            doTranslate();
            return false;
        }
    });
});

function copyText(id) {
    $("#" + id).select(); // 选中文本
    document.execCommand("Copy"); // 执行浏览器复制命令
}

function getCopyType() {
    // if ($('#copy_type').attr("checked")) {
    //     return 'trans'
    // }
    if (copy_type) {
        return 'trans';
    }
}

function doTranslate() {
    if ($("#inputstr").val() == "") {
        return;
    }
    setLan();
    $("#translate").val(tip);
    // 判断复制的对象
    copy = false;
    if (getCopyType() == 'trans') {
        copy = true;
    } else {
        copyText('outputstr');
        // copyText('inputstr');
    }
    baiduTrans(copy);
}

function count() {
    //统计字数
    // $("#words_count").text($("#inputstr").val().length + '/' +
    //     $("#outputstr").val().length + '/'+
    //     $("#translate").val().length);
    $('#input_count').text($("#inputstr").val().length)
    $('#output_count').text($("#outputstr").val().length)
    $('#translate_count').text($("#translate").val().length)
}

function baiduTrans(copy) {
    // 调用百度翻译API
    var appid = '20190519000299180';
    var key = 'JJR47pfMUM_gPF9Ea5gZ';
    var salt = (new Date).getTime();
    var query = $("#outputstr").val();
    // var query = $("#inputstr").val();
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var str1 = appid + query + salt + key;
    var sign = MD5(str1);
    $.ajax({
        url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
        type: 'post',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        },
        success: function(data) {
            if (data == null || data.trans_result == null) {
                $("#translate").val('空');
                return;
            }
            $("#translate").val(data.trans_result[0].dst);
            if (copy) {
                copyText('translate');
            }
            count();
        },
        error: function(data) {
            $("#translate").val(data);
            console.log(data);
        }
    });
}

$("#inputstr").select(); // 选中输入

// function do_resize() {
//     // alert($(document.body).height() + "," + $(window).height());
//     h = $(window).height() - $("#title-bar").height();
//     $("#translate").height(h);
//     $("#inputstr").height(h);
// }

// $(window).resize(do_resize);

// do_resize();

var copy_type = true;

function changeTrans(isTrans) {
    copy_type = isTrans
    if (isTrans) {
        // $("#trans_switch").removeClass('light-blue');
        // $("#trans_switch").addClass('amber');
        // $("#trans_switch").text("原");
        $("#copy_out").removeClass('active');
        $("#copy_trans").addClass('active');
    } else {
        // $("#trans_switch").removeClass('amber');
        // $("#trans_switch").addClass('light-blue');
        // $("#trans_switch").text("译");
        $("#copy_trans").removeClass('active');
        $("#copy_out").addClass('active');
    }
}

var pre_key = 0
var is_paste = false

document.onkeydown = function(e) {
    if (pre_key == 91 && e.keyCode == 86) {
        console.log('paste')
        is_paste = true
    }
    // console.log(e.keyCode)
    pre_key = e.keyCode
}