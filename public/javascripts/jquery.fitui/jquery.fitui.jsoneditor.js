/**********            通用文档编辑        **************/
/**********   这个要同时引入模板 tmpl.jsoneditor.ejs **************/
$.fitui.jsoneditor = {
    prop_tmpl: { readonly: false, reference: false, editor: 'textbox', lineshow: false },
    prop2tmpl: function (name, path, value, /*tmplrow, */config) {
        var c = config;

        var data = { caption: c ? c.caption : i, value: value, path: path, name: name, /* tmplrow: tmplrow,*/
            input: c && c.editor != 'textarea' && c.editor != 'select'
        };
        $.extend(data, $.fitui.jsoneditor.prop_tmpl);
        $.extend(data, c);
        data.children = null;
        return data;
    },
    array2tmpl: function(value, config, path, name_prefix, handleStr){
        //字符串数组
        //alert(path);
        if (handleStr && config && config.split) {
            value = value ? value.toString().split(config.split) : [];
            if (!value) value = [];
            value.push("");
            for (var j in value) {
                var data = $.fitui.jsoneditor.prop2tmpl(name_prefix + '[' + j + ']', path + j, value[j], { caption: "值", editor: config.roweditor, lineshow: true });
                value[j] = { array: false, data: data };
            }
        }
        //对象数组
        else {
            if (handleStr && config && config.editor ) {try { value = eval(value); }catch(e){ value=[]}}
            if (!value) value = [];
            value.push({});
            for (var j in value){
                value[j] = $.fitui.jsoneditor.object2tmpl(value[j], config.children, path + '.' + j, name_prefix + '[' + j + ']', value.length - 1 == j);
                //用关键字段的值来标识行
                for (var k in value[j]) if (value[j][k].data.key) { value[j].summary = value[j][k].data.value; break; }
            }
            
        }
        value[value.length - 1]["tmplrow"] = true;
        //alert(JSON.stringify(value))
        return value; //如果传进来的value 是字符串必须返回，如果是数组就不必
    },

    object2tmpl: function (doc, configure, path, name_prefix, tmplrow) {
        var config = $.extend(
                doc._id?{_id: { caption: 'id', readonly: true },
                _t: { hide: true }}:{}, configure);
        var pa = [];
        for (var i in config) { //按照配置来，而不是按照数据属性来(必须设定配置)
            var c = config[i];
            var array = c && c.children && !c.editor;

            var paths = path ? path + '.' + i : i;
            var name = name_prefix ? name_prefix + '[' + i + ']' : i;
            var value = doc[i];
            if (array) {
                $.fitui.jsoneditor.array2tmpl(doc[i], c, paths, name, false);
            }
            var data = $.fitui.jsoneditor.prop2tmpl(name, paths, value, /*tmplrow, */c) ;
            if (array) data.jsonvalue = doc[i];
            if (!c.editor && array) delete data["editor"];
            if (c.editor && (c.children||c.split)) {
                //designer是从配置extend 过来的，属于引用对象，不能直接修改它，否则影响下一次
                data["designer"] = data["designer"]?eval(JSON.stringify(data["designer"])) : [];
                data["designer"].push("json");
            }

            pa.push({ array: !!array, data: data});
        }
        return pa;
    },
    zip: function (a) {
        $(a).live('click', function () {
            var container = $(this).parent().closest('.zip');
            if (container.hasClass('unzip')) {
                container.removeClass('unzip').children('[layout]').layout();
            }
            else {
                container.addClass('unzip').children('[layout]').children('.label').css('float', 'none');
            }
        });
    },
    tmplRowEditor: function (designer, multi) {
        $(designer).find("[fieldname]").live('change.tmpl', function () { //新增行 
            if ($(this).val()) { //不加这个会触发2次,因为后面 val('')
                var row = $(this).closest('div.zip');

                var fieldset = row.closest('fieldset');
                var rowCount = fieldset.children('div.zip').size();
                row.clone(true).unbind('change.tmpl').removeClass('tmpl').insertBefore(row).find('[fieldname]').each(function () {
                    $(this).attr('name', $(this).attr('fieldname').replace(/\[(\d+)\]/i, "[" + (rowCount - 1) + "]")).removeAttr('fieldname');
                }).end().find('span.rowIndex').text(rowCount).end().find('[identity]').val(rowCount).end().focus();
                $(this).val('');
            }
        }).end().find("a.delRow").live("click", function () {

            var fieldset = $(this).closest('fieldset');
            var row = $(this).closest("div.zip");

            if (multi) {  //不删除行 代替 updateflag 的做法
                row.toggleClass('deleted');
                var _id = row.find('[name$=".ProjectName"]');
                if (row.hasClass('deleted')) _id.attr('_id', _id.val()).val('');
                else _id.val(_id.attr('_id')).removeAttr('_id');
            }
            else {  //删除行
                if (confirm("确认要删除整行吗？")) {
                    var rowIndex = parseInt(row.find('span.rowIndex').text()) - 1;
                    row.remove();
                    fieldset.children('div.zip:not(.tmpl)').slice(rowIndex).each(function () {
                        var span = $(this).find('span.rowIndex');
                        var idx = parseInt(span.text());
                        span.text(idx - 1);
                        $(this).find('[name]').each(function () {
                            var name = $(this).attr('name'); var reg = /\[(\d+)\]/i;
                            name = name.replace(reg, '[' + (idx - 2) + ']');
                            $(this).attr('name', name).attr('id', name);
                        });
                    });
                }
            }
            return false;
        });
    },
    getConfigByPath: function(path){
        var c = $.fitui.jsoneditor.config;
        var paths = path.split('.');
        for(var i in paths)
            if (c[paths[i]]) c = c[paths[i]];
            else c = c.children;
        return c;
    },
    designer: {
        codemirror: function (texteditor, designer, show, callback) {
            if (show) {
                var width = $(texteditor).width(); 
                
                var codem = CodeMirror.fromTextArea(texteditor, {
                    lineNumbers: true,
                    matchBrackets: true
                    //mode: $(texteditor).attr('scriptType')//"text/x-plsql"
                }); 
                if (!$.fitui.jsoneditor["codeMirrors"]) $.fitui.jsoneditor["codeMirrors"] = {};
                $.fitui.jsoneditor.codeMirrors[$(texteditor).attr("name")] = codem;
                $(texteditor).parent().find('.CodeMirror>.CodeMirror-scroll').width(width + "px");
                return $(texteditor).parent().find('.CodeMirror');

            }
            else {
                if ($.fitui.jsoneditor.codeMirrors[$(texteditor).attr("name")])
                    $.fitui.jsoneditor.codeMirrors[$(texteditor).attr("name")].toTextArea();
                else alert("codemirror " + $(texteditor).attr("name") + " not found.");
                if (callback) callback();
            }
        },
        json: function(texteditor, designer, show, callback){
            var path = $(texteditor).closest('.prop').attr('path');
            if (show){
                var data = $(texteditor).val();
                var name = $(texteditor).attr('name');
                var c = $.fitui.jsoneditor.getConfigByPath (path);
            
                data = $.fitui.jsoneditor.array2tmpl(data, c, path, name, true);
                if (console) console.log({ all1: data });
                $(texteditor).hide();
                return $('#metaPropArray').tmpl({readonly: false, jsonvalue: data}).insertBefore(texteditor);
            }
            else {
                $.post($.fitui.jsoneditor.json2strurl + '?path=' + path, designer.serializeArray(), function(data){
                    //console.log(data);
                    $(texteditor).val(data);
                    designer.remove();
                    if (callback) callback();
                });
            }
        },
        moduleurl: function (texteditor, designer, show, callback) {
            if (show){
                var url = $(texteditor).val();
                var type = url.match( /^\/module\/stdr\?mid=\w+$/) ? "stdreceipt" : null;
                if (!type){
                    var m = url.match( /^\/module\/query\/(\w+)\?mid=\w+$/)
                    if (m){
                        type = "stdquery";
                        var query = m[1].toString();
                    }else {
                        type = "custom";
                    }
                }
                return $('#tpModuleUrl').tmpl({name: $(texteditor).attr('name'), type: type, query: query, url: type == "custom"?url:""}).insertBefore(texteditor).addClass('moduleurl')
                    .find('input:text').change(function(){ 
                        $(this).prev().click();
                    }).end();
            }else {
                var v = designer.find('input[type=radio]:checked').val();
                var mid = $(texteditor).closest('.jsoneditor').find('[name=ModuleID]').val();
                if (v == "stdreceipt")
                    $(texteditor).val("/module/stdr?mid=" + mid);
                else if (v =="stdquery")
                    $(texteditor).val("/module/query/" + designer.find('.queryName').val() + "?mid=" + mid);
                else $(texteditor).val(designer.find('.url').val());
                designer.remove();
                callback();
            }
        },
        ui: function (texteditor, designer, show, callback) {
            if (show){
                
                return $('#tpUIDesigner').tmpl().insertBefore(texteditor).uidesigner($(texteditor).val());
            }else {
                
                $(texteditor).val(designer.uidesigner2txt());
                designer.remove();
                callback();
            }
        }
    },
    reference: function(main, type){
        $(main).find('[reference]:not(select)').each(function(){
            var r = $(this).attr('reference').split('.');
            $(this).autocomplete({
                 source:'/index/reference/' + r[0] + '/' + r[1], minLength:0
            }); 
        });
        var cache = {};
        $(main).find('select[reference]').each(function(){
            var r = $(this).attr('reference'); 
            
            if (!cache[r]) cache[r] = [];
            var name = $(this).attr('group');//.replace(/\[\d+\]/,''); 
            if (cache[r].indexOf(name) < 0) cache[r].push(name);
        });
        for(var i in cache){
            var src_array = i.split('.')[0];
            var src_field = i.split('.')[1];
            
            $(main).find('fieldset.array[path="' + type + '.' + src_array + '"]').bind('change', function(){
                $(this).find('[name$="\[' + src_field + '\]"]').each(function(){
                    var value = $(this).val();
                    
                    for(var j in cache[i]){
                        $('<option>').text( value).attr('value', value) .appendTo($('[group="' + cache[i][j] +'"]'));
                    }
                });
            }).trigger('change');
        }
 
    },
    toggleDesigner: function (main) {
        $(main).find('a[designer]').live('toggle', function(){
            var p = $(this).closest('.prop');
            //隐藏当前编辑器
            var editor = p.children('.editor:not(.designer)');
            var designer = $(this).attr('designer');
            //显示编辑器
            if (designer == 'editor') editor.show();
            else $.fitui.jsoneditor.designer[$(this).attr('designer')](editor[0], null, true).addClass('editor').addClass('designer').attr('designer', $(this).attr('designer'));

            //隐藏和显示图标
            p.find('a[designer]').show();
            $(this).hide();
            return false;
        }).live('click', function () {
            var p = $(this).closest('.prop');
            //隐藏当前编辑器
            var a = this;
            var currdesign = p.find('.editor.designer');
            var editor = p.children('.editor:not(.designer)');
            if (currdesign.size() ==1) {
                $.fitui.jsoneditor.designer[currdesign.attr('designer')](editor[0], currdesign, false, function(){
                    $(a).trigger('toggle');
                });
            }
            else {
                editor.hide();
                $(a).trigger('toggle');
            }
            return false;
        });
    }
};

$.jsoneditorSetup = function (option) {
    //先记录下来
    $.fitui.jsoneditor.config = option.config; 
    $.fitui.jsoneditor.json2strurl = option.json2strurl;  
    $.fitui.jsoneditor.referenceurl = option.referenceurl;  
}

$.fn.jsoneditor = function (doc, type) {
    return this.each(function () {
        $(this).addClass('jsoneditor').attr('title', type); //基础路径
        var data = $.fitui.jsoneditor.object2tmpl(doc, $.fitui.jsoneditor.config[type], type);
        //if (console) console.log({ all: data });
        $('#metaObject').tmpl(data).appendTo(this).layout(true);
        $.fitui.jsoneditor.zip($(this).find('a.zip'));
        $.fitui.jsoneditor.tmplRowEditor(this, false);
        $.fitui.jsoneditor.toggleDesigner(this);
        $.fitui.jsoneditor.reference(this, type);
    });
}

$.fn.jsoneditorcreateNavigation = function (nav, option) {
    return this.each(function () {
        var designer = this;
        if (option && option.reset) {
            //放回原处
            // var currPath = ul.children('li.last').attr('path');
            // if (currPath != $(designer).attr('title')) {
            var curr = $(designer).find('[zw]');
            var id = curr.attr('zw');
            var zw = $(designer).find('#' + id);
            curr.insertBefore(zw).removeAttr('zw');
            zw.remove();
            // } //放回原处 end
        }
        else {
            var basepath = $(designer).attr('title');
            $(nav).navigation({ homePath: option.homePath, change: function (path) {
                $(designer).jsoneditorcreateNavigation(nav, { reset: true });
                if (path == $(designer).attr('title')) //最顶层
                    $(designer).children(':not(.hide)').show();
                else {
                    $(designer).find('a.fullscr[title="' + path + '"]').click();
                }
            }
            });
            $(designer).find('.fullscr').live('click', function () {
                var title = $(this).attr('title').split('.');
                var p = '';
                for (var i in title) {
                    p = p + (p ? '.' : '') + title[i];
                    $(nav).navigation({ createPath: true, path: p, text: $(designer).find('[caption][path="' + p + '"]').attr('caption') });
                }
                $(designer).jsoneditorcreateNavigation(nav, { reset: true });

                var id = "zw" + Math.random().toString().substring(2);

                var zw = $('<span>').attr('id', id);
                var container = $(this).closest('[path]').show();
                if (container.hasClass('unzip')); container.children('a.zip').click();

                zw.insertBefore(container);
                container.insertBefore($(designer).children().eq(0)).attr('zw', id)
                    .css('marginleft', container.css('margin-left')).css('margin-left', 0);
                $(designer).children().not(container).hide();

                return false;
            });
        }
    });
}

/************ UI 设计器 **************/
$.fitui.uidesigner = {
    DataFromTxt: function (txt) {
        var evalResult = [{ Value: -1, item: { children: []}}];
        txt = txt.split('\n');
        for (var i in txt) {
            var s = $.trim(txt[i]);
            if (s) {
                var indent = txt[i].indexOf(s);
                var ui = s.substring(0, s.indexOf(' '));
                //try {
                var params = eval("(" + s.substring(s.indexOf(' ') + 1) + ")");  //这是字典(给模拟器用)
                if (!params.name) params.name = ui + Math.random().toString().substring(2, 5);
                var attrs = $.dic2array(params); //这是数组，给设计器用
                //} catch(e){var attrs = [ ];}
                var item = { ui: ui, id: ui, params: params, attrs: attrs, children: [] };

                for (var i = evalResult.length - 1; i >= 0; i--)
                    if (evalResult[i].Value < indent) {
                        evalResult[i].item.children.push(item);
                        break;
                    }
                evalResult.push({ item: item, Value: indent });
            }
        }
        if (console) console.log(evalResult[0].item)
        return evalResult[0].item;
    },
    /* 处理一下以便调用模板jqtpl */
    data2tmpl: function (data) {
        var c = $.fitui.uidesigner.config[data.ui];
        if (c && c.desc) data.description =  c.desc;
        data.itemid= 'uiitem' + Math.random().toString().substring(2);
        data.icon = $.fitui.uidesigner["uiiconpath"] + data.ui + ".png"; 
        for(var i in data.children){
            $.fitui.uidesigner.data2tmpl(data.children[i]);
        }
        return data;
    },

    /* 将一个页面DOM 元素（.uiitem）  的各个属性取出来，生成json，准备渲染属性编辑器的 jqtpl */
    prop2tmpl: function (element, type, itemid) {
        var result = { props: [], itemid: itemid, uitype: $(element).children('div').children('input.ui').val() };
        for (var i in $.fitui.uidesigner.config[type].property)
            result.props.push({ key: i, value: $(element).attr(i) });
        return result;
    },

    /* 点击的时候将自身属性生成属性编辑器，属性编辑器改变的时候反过来设置 attr */
    uiitem: function (item) {
        $(item).children('div').children('.uiitem-description, .ui, .uiitem-id').click(function () {
            var designer = $(this).closest('.uidesigner');
            var item = $(this).closest('.uiitem');
            designer.find('.uiitem').removeClass('focus');

            item.addClass('focus');
            var pe = $('.uipropedit');
            var id = item.attr('id');
            if (pe.attr('itemid') == id) { }
            else {
                if (pe.size() > 0) pe.closest('.ui-dialog').remove();
                $('#tpuipropedit').tmpl($.fitui.uidesigner.prop2tmpl(item, item.children('div').children('input.ui').val(), id)).appendTo(designer).dialog({position:{my: "right top", at: "right middle"  }}).find('input').change(function () {
                    var uiitem = $('#' + $(this).closest('.uipropedit').attr('itemid'));
                    uiitem.attr($(this).attr('key'), $(this).val());
                }).focus(function(){
                    var key = $.trim($(this).closest('.proprow').find('.key').text());
                    var pe = $(this).closest('.uipropedit');
                    pe.find('.propdesc').text($.fitui.uidesigner.config[pe.attr('uitype')].property[key]["desc"]);
                });
            }
            return false;
        }).end().find('a.deluiitem').click(function(){
            $(this).closest('.uiitem').remove();
        });
    },

    tmplitem: function (item) {
        $(item).find('.ui').autocomplete({
            minLength: 0,
            source: $.fitui.uidesigner.uis,
            focus: function (event, ui) {
                $("#ui").val(ui.item.label);
                return false;
            },
            select: function (event, ui) {
                var p = $(this).closest('.uiitem');
                p.find('.ui').val('').end().find('.uiitem-description').text('');
                var newitem = $("#tpuiitem").tmpl(
                    $.fitui.uidesigner.data2tmpl({
                    "ui": ui.item.label,
                    "id": ui.item.value, children:[]
                })).insertBefore(p).removeClass('tmpl').parent().removeClass('empty').end();
                $.fitui.uidesigner.uiitem(newitem);
                $.fitui.uidesigner.tmplitem(newitem.find('.uiitem.tmpl'));
                return false;
            }
        }).data("autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                    .data("item.autocomplete", item)
                    .append("<a>" + item.label + "<br>" + item.desc + "</a>")
                    .appendTo(ul);
        };
    }
};

/******* 初始化，config 是json格式的配置，包含了各种UI控件的字段信息， 描述信息*******/
/******* uiiconpath 是控件图标位置                                        *******/
$.uidesignerSetup = function(option){
    $.fitui.uidesigner["config"] = option.config;
    $.fitui.uidesigner["uiiconpath"] = option.uiiconpath;
    
    //uis 是按照 autocomplete 的格式
    $.fitui.uidesigner.uis = []; 
    for(var i in option.config){
        $.fitui.uidesigner.uis.push({
            value: "ui" + i,
            icon: i,
            label: i,
            desc: option.config[i].desc
        });
    }
}

/******* 将页面UI设计器变成UI配置（文本格式，缩进代表上下级关系） *******/
/*        <div name="aa" biz="xxxModify"><input class=ui value="PageButton"></div> */
/* 转换为  PageButton {name: "aa", biz: "xxxModify",}  */
$.fn.uidesigner2txt = function(){
    var txt = "";
    var f = function(parent, indent){
        parent.children('.uiitem:not(.tmpl)').each(function(){
            for(var i = 0; i< indent + 4;i++) txt += ' ';
            var ui = $(this).children('div').children('input.ui').val(); //类型
            txt += ui + ' {';
            var config = $.fitui.uidesigner["config"][ui];
            if (config){
                config = config.property;
                for (var i in config)
                    txt += i + ": '" + ($(this).attr(i)?$(this).attr(i):"") + "',";
            }
            txt += "}\n";
            f($(this).children('fieldset'), indent + 4);
        });
    }
    f(this.eq(0), 0);
    return txt;
}

/******* 页面的UI 设计器 *******/
$.fn.uidesigner = function (txt, option) {
    if (option&& option.getdata) { 
        return $.fitui.uidesigner.DataFromTxt(txt);
    }
    else return this.each(function () {
        var data = $.fitui.uidesigner.DataFromTxt(txt);
        $.fitui.uidesigner.data2tmpl(data);

        $(this).addClass('uidesigner').append($('#tpuiitemArray').tmpl(data))
        .click(function () {
            //$(this).find('.uiitem').removeClass('focus');
        }).find('.uiitem:not(.tmpl)').each(function () {
            $.fitui.uidesigner.uiitem(this);

        }).end().find('.uiitem.tmpl').each(function () {
            $.fitui.uidesigner.tmplitem(this);
        });

    });

}