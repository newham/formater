const { clipboard, remote } = require('electron')
const { readConf, writeConf } = require('./conf')
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
    // $("#inputstr").select(); // 选中文本
    // document.execCommand("Paste"); // 执行浏览器复制命令
    $("#inputstr").val(clipboard.readText()); //直接用electron的方法
    StrReplace();
}

function formatAndTrans() {
    // 检查剪切板是否有内容
    if (clipboard.readText() == "") {
        return
    }
    clean();
    paste();
    if (copy_type) {
        doTranslate();
    } else {
        copyText('inputstr')
    }
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

    // $("#outputstr").val(StrInput);
    // 改->直接粘贴到输入栏
    $("#inputstr").val(StrInput);

    if (!StrInput) { //输入栏为空，则清空翻译
        clean()
    }

    // $("#inputstr").val(StrInput);
    // 重绘textarea区域
    // do_resize();
    // if (is_paste) {
    //     copyText('outputstr')
    //     is_paste = false
    // }
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
    // $("#" + id).select(); // 选中文本
    // document.execCommand("Copy"); // 执行浏览器复制命令
    var txt = $("#" + id).val()
    clipboardTxt = txt;
    clipboard.writeText(txt)
}

function getCopyType() {
    // if ($('#copy_type').attr("checked")) {
    //     return 'trans'
    // }
    if (copy_type) {
        return 'trans';
    }
}

function showTip(isShow) {
    // return
    // console.log("progress", isShow)
    if (isShow) {
        $("#progress").show()

        // $("#translate").val(tip);
    } else {
        $("#progress").hide()
    }
}

function doTranslate() {
    if ($("#inputstr").val() == "") {
        return;
    }
    setLan();
    showTip(true)

    copy = false; // 判断复制的对象
    if (getCopyType() == 'trans') {
        copy = true;
    } else {
        // copyText('outputstr');
        copyText('inputstr');
    }
    baiduTrans(copy);
}

// 统计字数
function count() {
    var input_count = 0
    var trans_count = 0
    if (isChinese($("#inputstr").val())) {
        input_count = $("#inputstr").val().length //输入是中文
        trans_count = wordStatic($("#translate").val()) //翻译是英文
    } else {
        input_count = wordStatic($("#inputstr").val()) //输入英文
        trans_count = $("#translate").val().length //翻译中文
    }

    // $('#input_count').text(input_count)
    // $('#output_count').text($("#outputstr").val().length)
    // $('#translate_count').text(trans_count)

    $('#word_count').text(input_count + '/' + trans_count)
}

function wordStatic(value) {
    var length = 0;
    // 获取文本框对象
    if (value) {
        // 替换中文字符为空格
        value = value.replace(/[\u4e00-\u9fa5]+/g, " ");
        // 将换行符，前后空格不计算为单词数
        value = value.replace(/\n|\r|^\s+|\s+$/gi, "");
        // 多个空格替换成一个空格
        value = value.replace(/\s+/gi, " ");
        // 更新计数
        var match = value.match(/\s/g);
        if (match) {
            length = match.length + 1;
        } else {
            length = 1;
        }
    }
    return length
}

function baiduTrans(copy) {
    // 调用百度翻译API
    var appid = '20190519000299180';
    var key = 'JJR47pfMUM_gPF9Ea5gZ';
    var salt = (new Date).getTime();
    // var query = $("#outputstr").val();
    var query = $("#inputstr").val();
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
            var result = data.trans_result[0].dst;
            $("#translate").val(result + '\n\n' + query);
            if (copy) {
                copyText('translate');
            }
            showTip(false)
            count(); //显示统计字数
            transLock = false
        },
        error: function(data) {
            $("#translate").val(data);
            showTip(false)
            console.log(data);
        }
    });
}

// function do_resize() {
//     alert($(document.body).height() + "," + $(window).height());
//     h = $(window).height() - $("#title-bar").height();
//     $("#translate").height(h);
//     $("#inputstr").height(h);
// }

// $(window).resize(do_resize);

// do_resize();

var copy_type = true;
// true 复制译文，false 复制格式化文

function changeTrans(isTrans) {
    if (isTrans == null) {
        copy_type = !copy_type
    } else {
        copy_type = isTrans
    }
    if (copy_type) {
        // $("#trans_switch").removeClass('light-blue');
        // $("#trans_switch").addClass('amber');
        // $("#trans_switch").text("原");

        // $("#copy_out").removeClass('active');
        // $("#copy_trans").addClass('active');
        $("#btn-switch-trans").addClass("main-color")
        $("#btn-switch-trans").text('● 自动翻译')
    } else {
        // $("#trans_switch").removeClass('amber');
        // $("#trans_switch").addClass('light-blue');
        // $("#trans_switch").text("译");

        // $("#copy_trans").removeClass('active');
        // $("#copy_out").addClass('active');
        $("#btn-switch-trans").removeClass("main-color")
        $("#btn-switch-trans").text('自动翻译')
    }
}

var is_paste = false

// 粘贴直接格式化功能，由双击功能取代
// document.onkeydown = function(e) {
//     if (pre_key == 91 && e.keyCode == 86) {
//         console.log('paste')
//         is_paste = true
//     }
//     // console.log(e.keyCode)
//     pre_key = e.keyCode
// }

//双击直接粘贴并格式化
$("#inputstr").dblclick(() => {
    // is_paste = true
    // paste()
    formatAndTrans()
})

$("#translate").dblclick(() => {
    copyText('translate')
})

$("#outputstr").dblclick(() => {
    copyText('outputstr')
})

$("#inputstr").bind("contextmenu", function() {
    copyText('inputstr')
    return false;
})

$("#translate").bind("contextmenu", function() {
    copyText('translate')
    return false;
})

function setFontSize(font_size) {
    $("#inputstr").css("font-size", font_size)
    $("#translate").css("font-size", font_size)
}

var conf = { 'font-size': 15 } //默认配置文件

function enlargeFont(increase) {
    var old_size = parseInt($("#inputstr").css("font-size"))
    var new_size = old_size + increase
    if (new_size <= 10 || new_size >= 25) { //限制最大、最小字号
        return
    }
    setFontSize(new_size) // 设置
    setConf(new_size) //更新配置
}

function setConf(font_size) {
    conf['font-size'] = font_size
    writeConf(conf) // 写入配置文件
}

var clipboardTxt = ''
var transLock = false

function clipboardTrans() {
    if (transLock) {
        return false
    }
    var txt = clipboard.readText()
    if (txt != '' && txt != clipboardTxt) {
        console.log('clipboard')
        transLock = true
        formatAndTrans()

        // clipboardTxt = clipboard.readText()

    }
}

function setFullUI() {

    var btn = $("#btn-switch-full")
    if (!isTransFull) {
        $("#right").removeClass('s6')
        $("#right").addClass('s12')
        $("#left").hide()

        //按钮
        btn.addClass("main-color")
        btn.text('● 剪切板')
        $("#btn-switch-trans").hide()

        remote.getCurrentWindow().setSize(450, 600)
    } else {
        $("#right").removeClass('s12')
        $("#right").addClass('s6')
        $("#left").show()

        //按钮
        btn.removeClass("main-color")
        btn.text('剪切板')
        $("#btn-switch-trans").show()

        remote.getCurrentWindow().setSize(900, 600)
    }
    isTransFull = !isTransFull
}

var isTransFull = false
var clipboardTransId = -1

function fullTrans() {
    setFullUI()

    // 开始监控剪切板
    if (isTransFull) {
        clipboardTxt = clipboard.readText() //防止第一次翻译
        clipboardTransId = self.setInterval('clipboardTrans()', 100)
    } else if (clipboardTransId >= 0) {
        window.clearInterval(clipboardTransId)
    }
}

// 初始化
window.onload = () => {
    readConf((ok, data) => {
        if (ok) {
            conf = data
            setFontSize(conf['font-size']) //设置字体
        } else {
            // 首次打开文件不存在，写入默认配置
            writeConf(conf)
        }
        $("#inputstr").select(); // 选中输入   
    })
}