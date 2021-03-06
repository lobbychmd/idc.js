﻿$.ReverseProxy = function (site) { //消除网页内部一些 由 request.url 产生的 包含 localhost 的url，防止反向代理产生的问题
    if (site != "localhost")
        $('input[href]').each(function () {
            if (window.location.toString().indexOf(site) > 0) {
                var href = $(this).attr('href').replace(/localhost:\d+/, site); //alert(href);
                $(this).attr('href', href);
            }
        });
}

$.request = {
    queryString : function(item){
        var svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)","i"));
        return svalue ? svalue[1] : svalue;
    }
 }

$.r = function (url) {
    url = url + (url.indexOf('?') > 0 ? "&" : "?") + Date.parse(new Date());
    return url;
}

$.fn.smartLoad = function (option) {
    return this.each(function () {
        if ($('#' + $(this).attr('indicator')).hasClass('indicator'))
            return; //上一次还没有处理完就不要再次处理
        
        $(this).indicator({ remove: true }); //先移除上次的错误

        if ((option.lookup) && (option.lookup == true))
            $(this).indicator({ insert: true });
        else if ((option.load) && (option.load == true))
            $(this).indicator({});
        else if ((option.post) && (option.post == true))
            $(this).indicator({ insert: true, hide: true });
        var t = this; 
        $.ajax({ url: option.url, data: option.data, type: option.post ? 'POST' : 'GET',
            success: function (data, textStatus, XMLHttpRequest) {
                //if ((option.lookup) && (option.lookup == true)) 
                $(t).indicator({ remove: true });

                if ((option.load) && (option.load == true))
                    $(t).html(data);
                if (option.callback) option.callback(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(t).indicator({ error: true, alt: XMLHttpRequest.responseText });
            }
        });
    });
}

$.fn.indicator = function (option) {
    return this.each(function () {
        if ((option.remove) && (option.remove == true)) {
            $('#' + $(this).attr('indicator')).remove();
        } else if ((option.show) && (option.show == true)) {
            $('#' + $(this).attr('indicator')).remove();
            $(this).show();
        } else if ((option.error) && (option.error == true)) {
            $('#' + $(this).attr('indicator')).attr('src', 'images/warning.png')
                .attr('alt', option.alt).attr('title', option.alt).removeClass('indicator');
        } else {
            var img = $('<div class=\'indicator\'/>')
                .attr('id', 'indicator' + Math.round(Math.random() * 1000, 3))
                .click(function () {
                    if ($.fn.dialog) {
                        $("<DIV>").html($(this).attr('alt')).dialog({width:960});
                    }
                    $(this).remove();
                });
            $(this).attr('indicator', img.attr('id'));
            if ((option.insert) && (option.insert == true))
                img.insertAfter(this);
            else if ((option.hide) && (option.hide == true)) {
                img.insertAfter(this);
                $(this).hide();
            }
            else {
                $(this).children().remove().end().append(img);

            }
        }
    });
}

$.readOnly = function (ctrl) {
    return ($(ctrl).attr('readonly'));
}

$.fn.setReadOnly = function (readonly) {
    return this.each(function () {
        if (readonly) $(this).attr('readonly', 'readonly');
        else $(this).removeAttr('readonly');
        
        if (this.tagName == "SELECT") {
            if (readonly) {
                $('<input >').attr('name', $(this).attr('name')).attr('relID', $(this).attr('id')).insertBefore(this)
                    .val($(this).val()).attr('readonly', 'readonly').width($(this).width()).hide();
                $(this).attr('disabled', 'disabled');
            } else $(this).removeAttr('disabled');
        } else if (($(this).attr('type') == "button") || ($(this).attr('type') == "checkbox")) {
            if (readonly) $(this).attr('disabled', 'disabled');
            else $(this).removeAttr('disabled');
        } else if ($(this).hasClass('editGrid')) {
            if (readonly) $(this).find('a.uf,a.newRow').hide();
            else $(this).find('a.uf,a.newRow').show();
        } else if ($(this).hasClass('DateEditor')) {
            if (readonly) $(this).datepicker({disabled: true});
            else $(this).datepicker({disabled: false});
        }
    });
}

$.fn.toggleReadOnly = function (readonly) {
    return this.each(function () {
        if (!$(this).attr('rostate')) //设置初始状态
            $(this).attr('rostate', $(this).attr('readonly') ? "true" : "false");

        if ($(this).attr('rostate') == "true") {
            if (this.tagName == "SELECT") {
                if ($(this).parent().find('[relID]').size() == 0) {
                    $(this).setReadOnly(true);  
                }
            }
            ; //初始是只读的就一直只读，不用设置
        }
        else if (readonly != undefined) $(this).setReadOnly(readonly); //按参数设置
        else $(this).setReadOnly(!$(this).attr('readonly')); //切换

    });
}

$.fn.setReadOnlyByName = function(fieldNames){
    return this.each(function(){
        for(var i in fieldNames){ 
            $(this).find("[name="+ fieldNames[i] + "],[name$=\"." + fieldNames[i] + "\"]").setReadOnly(true);
        }
    });
}


$.autoHeightSetting = {};
$.autoHeight = function (setting, init) {
    for (var i in setting)
        $.autoHeightSetting[i] = setting[i];
    if (init) {
        //alert(1);
        $(window).resize(function () {
            // alert(2);
            $.resizeW();
        });
    }
    $.resizeW();
}

$.resizeW = function () {
    var h = document.documentElement.clientHeight;
    
    for (var i in $.autoHeightSetting) {
        $(i).css('height', (h - $.autoHeightSetting[i]) + "px");
        //alert(h - $.autoHeightSetting[i]);
        //alert($(i).height());
    }
}

//绑定的事件 : 1) confirm :按下确认按钮
$.createDialog = function (option, onConfirm, loadCallback) {
    var dialog;
    option.buttons = { '确认': function () {
        dialog.trigger('confirm');
    }, '取消': function () { $(this).dialog('close'); }
    };
    option.modal = true;
    option.width = document.documentElement.clientWidth * 0.8; 
    option.height = document.documentElement.clientHeight * 0.8;
    $('div.commonDialog').remove();
    dialog = $('<div ></div>').addClass('commonDialog').attr('title', option.title).appendTo('body').dialog(option).bind('confirm', function () {
        if (onConfirm($(this)))
            $(this).dialog('close');
    });
    if (option.url) dialog.smartLoad({ url: option.url, load: true, callback: function () {
        if (loadCallback) loadCallback(dialog);
    }
    });
    return dialog;
}

$.fn.showJson = function(data){
    alert(JSON.stringify(data));
}

$.fn.StatusBar = function () {
    return this.each(function () {
        $(this).tabs({selected: parseInt( $(this).attr("index"))});
    });
}

$.fn.QueryParams = function () {
    return this.each(function () {
        //记录并设置上次的当前活动页面
        var g = $(this).find('input[name=ParamGroup]');
        var gi = $(this).find('input[name=pgi]');
        $(this).children().accordion({ active: gi.val() ? parseInt(gi.val()) : 0, change: function (event, ui) {
            gi.val(ui.options.active);
            g.val($.trim(ui.newHeader.text()));
        }
        }).find('.ui-accordion-content').css('height', 'auto');

        var sqp = $(this).hide();
        //把table 的宽度设置自动适应
        var grid = $('#' + $(this).attr('grid'));

        grid.wrap('<div style="overflow:auto;width:5000px" ></div>');
        var a = grid.width();
        grid.parent().width('auto');
        grid.width(a + 10 * $(grid).find('thead>tr>th').size()); //预留排序位置
        grid = grid.parent();
        //把table 的宽度设置自动适应 end;

        var summary = sqp.attr('paramAsString');
        if (!grid.attr('sqp')) {
            var title = $('<span class="caption"><a href="#">查询条件:</a>' + ((summary) ? summary : "无") + '</span>').insertBefore(grid);
            //alert(grid.size());
            title.find('a').attr('sqp', sqp.attr('id')).click(function () {
                var params = $('#' + $(this).parent().hide().end().attr('sqp')).show();
                grid.add(params).wrap('<div>');
                params.insertBefore(grid);
                params.css('float', 'left');
                grid.css('margin-left', "25%").css('width', '75%');
                $("<div style='clear:both'></div>").insertAfter(grid);
                return false;
            });
            grid.attr('sqp', sqp.attr('id'));
        }

        $('<div style="clear:both"></div>').insertAfter(grid);

        //隐藏和显示
        var sp = this;
        $('<a class="hidesq" href="#">隐藏 </a>').insertBefore($(this).children(0)).click(function () {
            $(sp).hide();
            $(grid).css('margin-left', "0").css('width', '99%');
            title.show();
            return false;
        });

        //指定查询按钮
        var button = $(this).attr('button');
        if (button) $('#' + button).click(function () {
            if ($(sp).find('form').ValidateFormat()) {
                $(this).indicator({ hide: true });
                $(sp).find('form').submit();
            }
        });
    });
}

$.fn.DialogQueryParams = function () {
    return this.each(function () {
        var qp = $(this);
        $(this).find('[type=submit]').click(function () {
            var form = qp.find('form');
            //alert(form.attr('action') + "?" + form.serialize());
            $("#" + qp.attr('ajaxContainer')).indicator({ hide: true }).load(form.attr('action') + "?" + form.serialize(), function (data) {
                $("#" + qp.attr('ajaxContainer')).indicator({ show: true });
                $('.commonDialog').trigger('onLoad');
            });
            return false;
        });
    });
}


$.fn.DateEditor = function () {
    return this.each(function () {
        $(this).datepicker({ dateFormat: 'yy-mm-dd' });
    });
}

$.fn.Accordion = function () {
    return this.each(function () {
        $(this).accordion();
    });
}

$.fn.Toolbar = function () {
    return this.each(function () {
        //$(this).toolbar();
        $(this).find("input").button();
    });
}

$.fn.enterAsTab = function (onEnter) {
    return this.each(function () {
        var allFields = '';
        var panel = $(this);
        $(this).find('[ctrlName], [name]').each(function(){
            $(this).bind('keydown', function(event){
                if (event.keyCode == 13){
                    if (!(onEnter) || onEnter(this)){
                        var fieldList = panel.attr('fieldList').split(';'); 
                        var i = $.inArray($(this).attr('ctrlName') ,fieldList);
                        panel.find('[ctrlName$="' + fieldList[(i == fieldList.length - 1)? 0 : (i + 1)] + '"]').focus().select();
                    }
                }
            });
            allFields += (allFields?";":"") + $(this).attr('ctrlName');
        }).end().attr('fieldList', allFields);
    });
}

$.fn.QuickRecPanel = function () {
    return this.each(function () {
        var kf = $(this).attr('keyFields');
        var grid = $("#" + $(this).attr('grid'));

        $(this).find('[name]').each(function(){ //去掉 name ，避免提交
            $(this).attr('ctrlName', $(this).attr('name')).removeAttr('name');
        }).end().enterAsTab(function (editor){
            if ($(editor).attr('ctrlName') == kf) {
                var v = $(editor).val();
                if (v) {
                    var tr = grid.find('[name$=".' + kf + '"][value=' + v + ']').closest('tr');
                    if (tr.size() == 0) {
                        tr = grid.Grid_NewRow ();
                        tr.find('[name$=".' + kf + '"]').val(v).trigger('change');
                    }
                    tr.click();
                }
            }else {
                var tr = grid.find('tr.selected');
                if (tr.size() == 1) tr.find('[name$=".' + $(editor).attr('ctrlName')  + '"]').val($(editor).val());
            }
            return true;
        });
    });
}

$.fn.Menu = function () {
    return this.each(function () {
        $(this).find('.sf-menu').superfish({ delay: 400 });
        $(this).find('.sf-menu').find('a[mis]').each(function () {
            var mid = $(this).attr('mid');
            var c = $('a.menu[pmid=' + mid + ']');
            if (c.size() == 0) {
                //$(this).invokeMis();  //这个会弹出新窗口
                $(this)./*attr('target', 'blank').*/attr('href', $(this).attr('mis'));
            }
        });
    });
}

$.fn.invokeMis = function () {
    return this.each(function () {
        $(this).click(function () {
            window.open($(this).attr('mis'));
            return false;
        });
    });
}

$.fn.DialogGrid = function () {
    return this.each(function () {
        $(this).Grid_Selectable();
        //$(this).width('2048px').width($(this).width());
    });
}

$.fn.Grid_Selectable = function () {
    return this.each(function () {
        $(this).find('tbody tr').click(function () {
            $(this).closest('tbody').children().removeClass('selected');
            $(this).addClass('selected');
        });
        //$(this).width('2048px').width($(this).width());
    });
}

//在编辑框后面加个删除的按钮
$.fn.delCmd = function () {
    return this.each(function () {
        $("<a class='delContent'></a>").insertAfter(this).click(function () {
            $(this).prev().val('').focus().addClass('empty');
        });
    });
}

$.fn.ListText = function (split) {
    var l = new Array();
    this.eq(0).find('option').each(function () { l.push($(this).text()); });
    return l.join(split);
}

//一个编辑框的长度自动根据文字变化
$.fn.autoLength = function () {
    return this.each(function () {
        $(this).keypress(function () {
            var w = Math.max(50, 10 + $(this).val().length * 12);
            $(this).width(w);
        }).keydown(function () {
            if ($(this).val()) $(this).addClass('empty'); else $(this).removeClass('empty');
        });
    });
}



//设置一个编辑框的值的变化，引起其它编辑框是否 readonly
//例如 $(".Grid").find('[name$=".Type"]').Block("tr", {Size: ['0', '1'], Precision: ['1'], Scale: ['1']  });
$.fn.Block = function (container, setting) {
    return this.each(function () {
        $(this).bind("change.block", function () {
            var v = $(this).val();
            for (var name in setting) {
                var values = setting[name]; //alert($.inArray(v, values) );
                var ctrl = $(this).closest(container).find('[name$=' + '"].' + name + '"]');
                ctrl.toggleReadOnly($.inArray(v, values) == -1);
            }
        }).trigger('change.block');
    });
}


//是否显示模板行
$.Grid_displayTemp = function (grid, tmplRow) {
    if (grid.find('tbody tr').size() > 1) tmplRow.hide();
    else tmplRow.show();
}

$.fn.Grid_NewRow = function (defVal) {

    var grid = this;
    if (!defVal) defVal = {};
    grid.find('thead th[defVal]').each(function () { //准备缺省值待用
        if ($(this).attr('defVal')) defVal[$(this).attr('fn')] = $(this).attr('defVal');
    });
    var tmplRow = grid.find('tbody tr.tmpl');
    var tr = grid.find('tr.tmpl').clone(true).insertAfter(grid.children('tbody').children('tr:last')).show().removeClass('tmpl');
    tr.find('[ctrlName]').each(function () {
        var v = defVal[$(this).closest('td').attr('fn')]; //缺省值

        //checkbox 的辅助控件不能设置 null，应该是 false或者true，否则反序列化不成功
        if (($(this).attr('type') != 'hidden') && ($(this).attr('type') != 'checkbox')) $(this).val(v);

        $(this).attr("name", $(this).attr("ctrlName").replace("[-1]", "[" + ($(grid).children('tbody').children('tr').size() - 2) + "]"))
                    .removeAttr('ctrlName').unbind("keydown.tmpl");
        if (v) $(this).trigger('change');
    });
    if ($(this).hasClass('uf')) {
        tr.addClass('changed').find('input.uf').val('I');
    }
    $.Grid_displayTemp(grid, tmplRow);
    grid.trigger('OnNewRow', tr);
    return tr;
}

$.SmartLookup_execute = function(l, url, container){
    $.get(url, function(data){
        for(var k in l.LookupFields){
            //alert(l.LookupFields[k]);
            container.find('[name=' + k + '], [name$="' + k + '"]').val(data[l.LookupFields[k]]);
        }
    });
}

$.fn.SmartLookup = function(settings){
    return this.each(function(){
        //var keyFields = $(this).hasClass('QuickRecPanel')?$(this).attr('keyFields').split(';'):null;
        var container = $(this).hasClass('Grid') ?"tr": "#" + $(this).attr("id");

        $(this).find('[name]').bind('change.lookup', function(){
            var n = $(this).attr('name');
            for(var i in settings){
                var l = settings[i];
                var trigger = false;
                for( k in l.KeyFields){
                    if ((n == l.KeyFields[k]) || (n.indexOf('.' + l.KeyFields[k]) > 0)){
                        trigger = true; break;}
                }
                //alert(trigger);
                trigger  = trigger  && l.LookupQuery && !l.PickList;
                //alert(l.LookupQuery );
                if (trigger){
                    var keyValues = [];
                    for(var ss in l.KeyFields){
                        var ff = l.KeyFields[ss];
                        var c = $(container).find('[name$=".' + ff + '"]');
                        if (c.size() ==0) c = $(this).closest('form').find('[name=' + ff + ']'); 
                        keyValues.push(ff + "=" + c.val());
                    }
                    var url = "/module/lookup/" + l.LookupQuery + "?" + keyValues.join('&');
                    //alert(url); //alert(l.LookupQuery);
                    $.SmartLookup_execute(l, url, $(container));
                }
            }
        });

        for(var i in settings){
            var l = settings[i];
            var dsName = $(this).attr('dataSource');
            if (!dsName || (dsName == l.Table)) { //主表字段的不能触发从表的查询
                if (l.SearchQuery && !l.PickList) { //弹出

                    var fs = l.LookupFields?l.KeyFields.concat(l.LookupFields):l.KeyFields;
                    var editor;
                    for(var j in fs ){
                        var e = $(this).find('[name=' + fs[j] + '], [ctrlName=' + fs[j] + ']');
                        if ((e.size() == 0) && (e.attr('display') == 'none')) ;//continue;
                        else editor = e;
                   }
                    $('<input type="button" value=".." style="width:20px;padding:2px" />')
                        .attr('queryName', l.SearchQuery)
                        .attr('keyFields', l.KeyFields.join(';'))
                        .attr('lookupFields', l.LookupFields.join(';'))
                        .attr('container', container)
                        .insertAfter(editor).LookupBtn();
                }
                
            }
        }
    });
}

$.fn.LookupBtn = function () {
    return this.each(function () {
        var btn = $(this);
        $(this).click(function () {
            var keyfields = $(this).attr('keyFields').split(';');
            var lookupfields = $(this).attr('lookupFields').split(';');
            var container = $(this).closest($(this).attr('container'));
            var dialog = $.createDialog({ title: '关联查找', url: "/Module/QueryDialog/" + $(this).attr('queryName') + "?page=1", width: 800, height: 600 },
                function (dialog) {
                    var tr = dialog.find('.QueryGrid tr.selected');
                    if (tr.size() > 0){
                        for(var l in lookupfields) container.find('[name=' + lookupfields[l] + "],[ctrlName=" + lookupfields[l] + "]").val(tr.children('td[fn=' + lookupfields[l] + ']').text());
                        for(var l in keyfields) container.find('[name=' + keyfields[l] + "],[ctrlName=" + keyfields[l] + "]").val(tr.children('td[fn=' + keyfields[l] + ']').text());
                        return true;
                    }else return false;
                }, function(){ dialog.trigger('onLoad'); }
            ).bind('onLoad', function(){
                //alert(1);
                dialog.find('table a').click(function(){
                    $(this).closest('tr').trigger('click');
                    dialog.trigger('confirm');
                    return false;
                });
            });
        });
    });
}


$.fn.Grid_SelRow = function (container) {
    return this.each(function () {
        var grid = $(this);
        $(this).find('tbody [name], tbody [ctrlName]').unbind("focus.Grid_SelRow").bind("focus.Grid_SelRow", function () {
            var tr = $(this).closest('tr');
            if (!tr.hasClass('focus')) {
                (container?$(container):grid).find('tr').removeClass('focus');
                tr.addClass('focus');
            }

        }).blur(function () {
            //$(this).closest('tr').removeClass('focus');
        });
    });
}

$.fn.Grid_UpdateFlag = function () {
    return this.each(function () {
        $(this).find('th.uf').hide().end().find('input.uf').closest('td').hide();
        $(this).addClass('uf').find('[name]').bind("change.updateFlag", function(){
            var uf = $(this).closest('tr').addClass('changed').find('input.uf');
            if (uf.val() == '') uf.val('U'); else if (uf.val() == 'D') uf.val('UD'); 
        });
    });
}

$.fn.Grid = function () {
    return this.each(function () {
        var grid = $(this);
        grid.Grid_Selectable();
        if ($(this).find('.uf').size() > 0) $(this).Grid_UpdateFlag();

        $("<th ><a class='delRow' href='#'>×</a></th>").insertBefore(grid.children('thead').children('tr').children('th:first'));
        $("<td ><a class='delRow' href='#'>×</a></td>").insertBefore(grid.children('tbody').children('tr').children('td:first-child'));

        $("<tr ><td cols=" + grid.find('th').size() + "><a class='addRow' href='#'></a></td></tr>").appendTo(grid.find('tfoot'));
        var tmplRow = grid.find('tbody tr.tmpl');
        if (tmplRow.size() == 0) //tmplRow = grid.find('tbody tr:first').clone(true).appendTo(grid.find('tbody')).addClass('tmpl');
            tmplRow = grid.children('tbody').children('tr:last').addClass('tmpl'); //最后一行是模板行
        tmplRow.find('[name]').each(function () {
            //checkbox 的辅助控件不能设置 null，应该是 false或者true，否则反序列化不成功
            if (($(this).attr('type') != 'hidden') && ($(this).attr('type') != 'checkbox'))  $(this).val(null); 

            $(this).attr('ctrlName', $(this).attr('name').replace(/\[(\d+)\]/i, "[-1]")).removeAttr('name').bind("keydown.tmpl", function () {
                grid.find('a.addRow').click(); //模板行不能录入，只能显示，如果敲入字符就自动创建新行，并隐藏自己
            });
        });
        $.Grid_displayTemp(grid, tmplRow);

        grid.find('a.addRow').click(function () {
            $(grid).Grid_NewRow();
            return false;
        });
        grid.find('tbody a.delRow').click(function () {
            if ($(this).closest('tr').hasClass('tmpl')) return false;
            else {
                var handled = false;
                if (grid.hasClass('uf')){
                    var tr1 =$(this).closest('tr');
                    var uf = tr1.find('input.uf');
                    if (uf.val() == '') {uf.val('D'); tr1.addClass('deleted'); handled = true; }
                    else if (uf.val() == 'U') {uf.val('UD'); tr1.addClass('deleted'); handled = true; }
                    else if (uf.val() == 'D') {uf.val(''); tr1.removeClass('deleted'); handled = true; }
                    else if (uf.val() == 'UD') {uf.val('U'); tr1.removeClass('deleted'); handled = true; }
                }
                if (!handled && confirm('确认要删除吗?')) {
                    var tr = $(this).closest('tr');
                    var rowIndex = tr[0].rowIndex;
                    grid.trigger('OnDelRow', [tr]);
                    tr.remove();
                    $.Grid_displayTemp(grid, tmplRow);
                    grid.children('tbody').children('tr:not(tmpl)').slice(rowIndex ).each(function () {
                        //alert(rowIndex);
                        var tr1 = this;
                        $(this).find('[name]').each(function () {
                            var name = $(this).attr('name'); var reg = /\[(\d+)\]/i;
                            name = name.replace(reg, '[' + (parseInt(tr1.rowIndex )) + ']');
                            $(this).attr('name', name); //.attr('id', name);
                        });
                    });
                }
            }
            return false;
        });
        grid.Grid_SelRow();
    });
}

$.fn.EditorsGrid = function () {
    return this.each(function () {
        $(this).Grid_SelRow();
    });
}

$.fn.ListEditor = function (urlPrefix) {
    return this.each(function () {
        var textarea = $(this).parent().find('textarea').hide();
        var select = $(this).find("select");
        select.dblclick(function () {
            var v = $(this).val();
            if (v) $(this).children().each(function () {
                if ($(this).text() == v) $(this).remove();
                textarea.val(select.ListText('\n'));
            });
        });
        $(this).find("a.add").click(function () {
            var v = $(this).prev().val();
            if (v) 
                if (select.find('option').filter(function(){return $(this).text() == v;}).size()==0){
                    select.append("<option>" + v + "</option>");
                    textarea.val(select.ListText('\n'));
                    $(this).prev().val('');
                }
            return false;
        });
        $(this).find("input").autocomplete({
            source: urlPrefix + $(this).attr('fieldName'),
			minLength: 1
        });
    });
}

//在 jquery.treeview 插件的基础上实现ajax 逐级刷新
$.fn.treeviewAjax = function (root, ajaxUrl) {
    return this.each(function () {
        root = $(root);
        $(this).treeview({
            toggle: function (data, ui) {
                var sel = $(ui).parent();
                var ul = sel.children('ul');
                //alert(ul.html());
                if (ul.children('li[metaType=fake]').size() > 0) { //if (!sel.attr('loaded')) {
                    var url = ajaxUrl + "/" + sel.attr('metaType') + "?" + sel.attr('link');
                    var li = ul.children('.new'); //alert(url);
                    ul.indicator({ insert: true }).load(url, function (data) {
                        ul.indicator({ remove: true });
                        ul.treeviewAjax(root, ajaxUrl);
                        ul.append(li);
                        root.trigger("OnAjaxLoad", [ul]);
                    })
                    //sel.attr('loaded', 'loaded');
                }
            }
        });

        $(this).find('a').click(function () {
            var path = [];
            var li = root.find('li.collapsable');
            li.each(function () {
                if ($(this).attr('path')) path.push("path" + "=" + $(this).attr('path'));
            });

            var url = $(this).attr('href');
            url = url + (url.indexOf('?') < 0 ? "?" : "&") + path.join('&');
            //记录下父节点，生成关系信息
            if ($(this).hasClass('new')) url += "&" + $(this).closest('li').parent().closest('li').attr('link');
            window.location = url;
            return false;
        }); //
    });
}

//    