var edi; //codeMirror 编辑器的全局变量（只有1个）

$.fn.MetaGrid = function () {
    return this.each(function () {
        var summaryField = $(this).attr('summaryField');
        $(this).Grid().bind('OnNewRow', function (data, tr) {
            //$(tr).find('.editor').autoLength().delCmd();
            $(tr).MetaGrid_ToggleDetailRow(false, summaryField);
            $(tr).find("[name$='.ParamToValidate'], [name$='.ParamToCompare']").AutoCompleteParams();
        });
        $(this).find('a.addRow').text("增加一行" + $(this).attr('namePrefix'))
        .end().find('a.delRow').each(function () {
            var td = $(this).closest('td');
            $(this).insertAfter($(this).closest('tr').find('a.detail')).addClass('delContent').text('');
            td.remove();
        })
        .end().find('tr a.detail').click(function () {
            $(this).closest('tr').MetaGrid_ToggleDetailRow(false, summaryField).find('.editor:first').focus();
            return false;
        }).closest('tr').MetaGrid_ToggleDetailRow(true, summaryField);
    });
}

$.fn.MetaGrid_ToggleDetailRow = function (init, summaryField) {
    return this.each(function () {
        var detail = $(this).find('fieldset.detail');
        var a = $(this).find('a.detail');
        var adel = $(this).children().children('a.delRow');
        var editor = $(this).find('.editor[name$=".' + summaryField + '"]');
        var td = editor.closest('td').addClass('mark');

        //清除前一个codemirror
        if (edi) {
            edi.toTextArea();
            edi = null;
        }
        if (!init) {
            detail.toggle();
            $(this).toggleClass('data').toggleClass('expand');
        }

        if (detail.css('display') == 'none') {
            a.insertBefore(adel);
            editor.insertBefore(a);
            //$(this).addClass('focus');
        }
        else {
            var delBtn = detail.find('td.mark a.delContent');
            editor.insertBefore(delBtn);
            a.appendTo(detail.find('legend'));
            $(this).removeClass('focus'); //隐藏本行删除按钮,以及内部table  的多个删除按钮

            var textarea = td.find('textarea');
            //if (editor[0].tagName == "TEXTAREA")
            //edi = CodeMirror.fromTextArea(editor[0], {
            if (textarea .size() >0)
                edi = CodeMirror.fromTextArea(textarea[0], {
                    lineNumbers: true,
                    matchBrackets: true,
                    mode: "text/x-plsql"
                });
            td.find('.CodeMirror-scroll>div').css('width', '0'); //让宽度自动适应
        }
        $.resizeW();
    });
}

$.fn.SqlTools = function () {
    return this.each(function () {
        $(this).click(function () {
            $.createDialog({ url: '/home/_sqlTools', title:'生成SQL', width:800, height:400 });
        });
    });
}

$.fn.AutoParams = function (scriptField) {
    return this.each(function () {
        $(this).click(function () {
            var fs = [];
            $('textarea[name$=".' + scriptField + '"]').each(function () {
                var result = $(this).val().match(/:[a-zA-z_]+/g);
                if (result)
                    for (i = 0; i < result.length; i++) {
                        if ($.inArray(result[i], fs) < 0) fs.push(result[i]);
                    }

            });
            if (fs.length == 0) alert('no params ignored');
            else {
                //$("#gridParams tr:not(.tmpl) a.del").effect("bounce", null, 500);
                for (var i in fs) {
                    if ($("#gridParams [name$='.ParamName']").filter(function () { return $(this).val() == fs[i].substring(1); }).size() == 0)
                        $("#gridParams").Grid_NewRow({ ParamName: fs[i].substring(1) });
                }
            }
        });
    });
}

$.fn.AutoChecks = function () {
    return this.each(function () {
        $(this).click(function () {
            $("#gridParams [name$='.ParamName']").each(function () {
                //if ($("#gridChecks tr").filter(function () { return $('') }).size() == 0)
                    if (confirm("要为参数" + $(this).val() + "生成一个不允许为空的检查吗？")) {
                        $("#gridChecks").Grid_NewRow({ ParamToValidate: $(this).val(), Type: 'Required', CheckSummary: $(this).val() + '必须录入' });
                    }
            });

        });
    });
}

$.fn.AutoCompleteParams = function () {
    return this.each(function () {
        var availableTags = [];

        $('#gridParams [name$=".ParamName"]').each(function () {
            availableTags.push($(this).val());
        });
        $(this).autocomplete({
            source: availableTags
        });
    });
}
//$.fn.resize.settings = {}
//$.resize = function (setting) {
//    if (setting) {
//        for (var i in setting)
//            $.fn.resize.settings[i] = setting[i];
//    }
//    else {
//        var h = document.documentElement.clientHeight;
//        for (var i in $.fn.resize.settings) {
////            alert(i);
////            alert($(i).size());
////            alert(h - $.fn.resize.settings[i]);
//            $(i).height(h - $.fn.resize.settings[i]);
//        }
//    }
//}

//$.fn.selectNext = function (now) {
//    return $(this).each(function () {
//        var form = this;
//        if (now) {
//            //alert(1);
//            var a = $(form).find('input[name],input[ef]').get();
//            var i = $.inArray(now, a);
//            if (i) $(a[i + 1]).focus().select();
//        }
//        else
//            $(this).find('input[name],input[ef]').keydown(function (event) {
//                if (event.keyCode == 13) {
//                    var a = $(form).find('input[name],input[ef]').get();
//                    var i = $.inArray(this, a);
//                    if (i) $(a[i + 1]).focus().select();
//                    return false;
//                }
//            });
//    });
//}



//$.r = function (url) {
//    url = url + (url.indexOf('?') > 0 ? "&" : "?") + Date.parse(new Date());
//    return url;
//}

//$.fn.container = function (tagNameOrAtrName) {
//    var p = $(this)[0];
//    i = 0;
//    while ((p != undefined) && ((p.tagName != tagNameOrAtrName) && (!$(p).attr(tagNameOrAtrName))) && ($(p).parent()) && (i < 10)) {
//        p = $(p).parent()[0];
//        i++;
//    }

//    return i >= 10 ? null : $(p);
//}

//$.fn.smartLoad = function (option) {
//    return this.each(function () {
//        if ($('#' + $(this).attr('indicator')).hasClass('indicator'))
//            return; //上一次还没有处理完就不要再次处理

//        $(this).indicator({ remove: true }); //先移除上次的错误

//        if ((option.lookup) && (option.lookup == true))
//            $(this).indicator({ insert: true });
//        else if ((option.load) && (option.load == true))
//            $(this).indicator({});
//        else if ((option.post) && (option.post == true))
//            $(this).indicator({ insert: true, hide: true });
//        var t = this; //alert(option.url);
//        $.ajax({ url: option.url, data: option.data, type: option.post ? 'POST' : 'GET',
//            success: function (data, textStatus, XMLHttpRequest) {
//                //if ((option.lookup) && (option.lookup == true)) 
//                $(t).indicator({ remove: true });

//                if ((option.load) && (option.load == true))
//                    $(t).html(data);
//                if (option.callback) option.callback(data);
//            },
//            error: function (XMLHttpRequest, textStatus, errorThrown) {
//                $(t).indicator({ error: true, alt: XMLHttpRequest.responseText });
//            }
//        });
//    });
//}

//$.fn.indicator = function (option) {
//    return this.each(function () {

//        if ((option.remove) && (option.remove == true)) {
//            $('#' + $(this).attr('indicator')).remove();
//        } else if ((option.show) && (option.show == true)) {
//            $('#' + $(this).attr('indicator')).remove();
//            $(this).show();
//        } else if ((option.error) && (option.error == true)) {
//            $('#' + $(this).attr('indicator')).attr('src', '/Content/images/warning.png')
//            .attr('alt', option.alt).attr('title', option.alt).removeClass('indicator');
//        } else {
//            var img = $('<img style=\'cursor:pointer\' src=\'/Content/images/indicator_s.gif\' class=\'indicator\'/>')
//            .attr('id', 'indicator' + Math.round(Math.random() * 1000, 3))
//            .click(function () {
//                //                if ($.fn.dialog) {
//                //                    $("<DIV>").html($(this).attr('alt')).dialog({ width: 960 });
//                //                }
//                $(this).remove();
//            });
//            $(this).attr('indicator', img.attr('id'));
//            if ((option.insert) && (option.insert == true))
//                img.insertAfter(this);
//            else if ((option.hide) && (option.hide == true)) {
//                img.insertAfter(this);
//                $(this).hide();
//            }
//            else {
//                $(this)//.children().remove().end()
//                    .append(img);

//            }
//        }
//    });
//}

//$.readOnly = function (ctrl) {
//    return ($(ctrl).attr('readonly'));
//}


//$.fn.setReadOnly = function (readonly) {
//    return this.each(function () {
//        if (readonly) $(this).attr('readonly', 'readonly');
//        else $(this).removeAttr('readonly');
//        if (this.tagName == "SELECT") {
//            if (readonly) {
//                $('<input >').attr('name', $(this).attr('name')).attr('relID', $(this).attr('id')).insertBefore(this)
//                .val($(this).val()).attr('readonly', 'readonly').width($(this).width()).hide();
//                $(this).attr('disabled', 'disabled');
//            } else $(this).removeAttr('disabled');
//        } else if (($(this).attr('type') == "button") || ($(this).attr('type') == "checkbox")) {
//            if (readonly) $(this).attr('disabled', 'disabled');
//            else $(this).removeAttr('disabled');
//        } else if ($(this).hasClass('editGrid')) {
//            if (readonly) $(this).find('a.uf,a.newRow').hide();
//            else $(this).find('a.uf,a.newRow').show();
//        }
//    });
//}

//$.toggleReadOnly1 = function (editors) {
//    editors.toggle();
//}

//$.fn.toggleReadOnly = function (readonly) {
//    return this.each(function () {
//        if (!$(this).attr('rostate')) //设置初始状态
//            $(this).attr('rostate', $(this).attr('readonly') ? "true" : "false");

//        if ($(this).attr('rostate') == "true") {
//            if (this.tagName == "SELECT") {
//                if ($(this).parent().find('[relID]').size() == 0) {
//                    $(this).setReadOnly(true);
//                }
//            }
//            ; //初始是只读的就一直只读，不用设置
//        }
//        else if (readonly != undefined) $(this).setReadOnly(readonly); //按参数设置
//        else $(this).setReadOnly(!$(this).attr('readonly')); //切换

//    });
//}

