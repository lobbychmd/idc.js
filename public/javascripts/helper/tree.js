

function ObjectId(id) { return id; }
function ISODate(date) { return date; }

function treeData(data, checkboxMode) {
    for (var i in data) {
        var type = data[i]["type"].split('.')[0];
        var subtype = data[i]["type"] == type? null: data[i]["type"].split('.')[1];
        data[i]["data"]["text"] = data[i]["data"][metaTreeConfig[type].text];
        if (!data[i]["data"]["_id"]) {
            data[i]["link"] = metaTreeConfig[type].text + '=' + data[i]["data"][metaTreeConfig[type].text] + "&parent_type=" + data[i]["data"]["parent_type"] + "&parent_id=" + data[i]["data"]["parent_id"];
        }
        data[i]['folder'] = data[i]['type'] && ((!metaTreeConfig[data[i]['type']]) || metaTreeConfig[data[i]['type']].children); //是否允许展开
        data[i]['meta'] = data[i]['type'] && metaTreeConfig[data[i]['type']] && metaTreeConfig[data[i]['type']].table; //是否实体(实体有图标，组没有)
        data[i]['multiEdit'] = data[i]['type'] && metaTreeConfig[data[i]['type']] && metaTreeConfig[data[i]['type']].multiEdit; //是否实体(实体有图标，组没有)

        if (checkboxMode) data[i]["checkbox"] = true;
        else {
            data[i]["checkbox"] = false;
            var typeOfNew = subtype?subtype:type;
            if (typeOfNew  && metaTreeConfig[typeOfNew ] && metaTreeConfig[typeOfNew ].newType)
                data[i]['newType'] =  metaTreeConfig[typeOfNew ].newType;
        }
        if (data[i].children) treeData(data[i].children, checkboxMode) ;
    }
    return data;
}

//增加obj 之后调用
$.fn.treeviewNewNode = function (metaType, parent_id, new_metaType, new_id, new_text) {
    return this.each(function () {
        var branches = $('#jt_tree_li').tmpl({type: new_metaType, data: {_id:new_id, text:new_text}, children:[], meta: true, folder: true, newType:null})
            .appendTo($(this).find('li[metatype=' + metaType + '][_id=' + parent_id + ']>ul'));
		$(this).treeview({
			add: branches
		});
    });
}

//1) ajax 下级   
$.fn.treeviewEx = function (option) {
    return this.each(function () {
        if (!option) option = {};
        var tree = $(this);
        option.toggle = function (data, ui) {
            var li = $(ui).parent();
            var ul = li.children('ul');
            if (ul.children('li[metaType=fake]').size() > 0) {
                var newli = ul.children('li.newNode');
                var url = "/tree?type=" + li.attr("metaType") + "&_id=" + li.attr("_id") + (tree.attr('recursionAll') ? "&ra=1" : "");
                ul.indicator({ insert: true })
                $.get(url, function (data) {
                    ul.children('li[metaType=fake]').remove();
                    data = treeData(data, tree.attr('checkbox'));
                    $("#jt_tree_li").tmpl(data).appendTo($(ul));
                    ul.indicator({ remove: true });
                    if (ul.children().size() > 0) {
                        ul.treeviewEx(option);
                        if (tree.attr('checkbox')) ul.attr('checkbox', 1);
                        ul.append(newli);
                    }
                    else if (newli.size() == 1) {
                        ul.append(newli);
                    }
                    else { ul.remove(); li.children('span').removeClass('folder').addClass('leaf'); }
                });
                
            }
            $.lastState.save();
        };
        $(this).treeview(option);
    });
}   


$.fn.smartTabs = function (options) {
    return this.each(function () {
        options = $.extend({ maxOpen: 5 }, options);
        $.smartTab.setup($(this), options.lastState);

        $(options.a_selector).die("click.withTab").live("click.withTab", function () {
            var url = $(this).attr('href');
            if (url) {
                $.smartTab.openTab($(this).closest('li').attr('metatype'), url.substring(1), $(this).text() ? $(this).text() : $(this).attr('title'), true);
                $.lastState.save(); //打开会切换，切换时会保存,但是有问题, 切换事件发生在未创建tab之前
            }
            return false;
        });
    });
}

$.smartTab = {
    setup: function (tabs, lastState) {
        $tabs = tabs.tabs({
            tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
        });
        if (lastState) $.lastState.restore(lastState);
        //切换事件必须在还原后绑定，因为还原过程连续ajax，前面的会终止，造成li.url 为空，会造成保存状态事件连续执行且数据有误
        $tabs.tabs({ select: function (event, ui) { 
            $.smartTab.tabCheckLoad(ui.index);
            $.lastState.save(ui.index); 
        } });

        if ($('#tabs').attr("idx")) $tabs.tabs("select", parseInt( $('#tabs').attr("idx")));
        tabs.find("span.ui-icon-close").live("click", function () {
            var index = $("li", $tabs).index($(this).parent());
            $tabs.tabs("remove", index);
            $.lastState.save();
        });
    },
    openTab: function (metatype, url, text, loadNow) {
        var opened = $tabs.find('li[url="' + url + '"]');
        if (opened.size() == 0) {
            var index = $tabs.tabs("length") ;
            if (index == 10 - 1) alert('打开的窗口太多'); else {
                $tabs.tabs("add", "#ui-tabs-" + index, text);
                $.autoHeight({}, true);
                $tabs.tabs("select", index).find('li.ui-tabs-selected').attr('url', url).attr('index', index).attr('metatype', metatype);
                if (loadNow) $.smartTab.tabCheckLoad(index);
            }
        } else $tabs.tabs("select", parseInt(opened.attr('index')));
    },
    tabCheckLoad :function(index, forceLoad){//alert(index);
        var panel = $tabs.find('#ui-tabs-' + index + '.ui-widget-content');
        if (forceLoad || (panel.find('.metaObject').size() ==0)) panel.indicator({}).load($tabs.find('li[index=' + index + "]").attr('url'));
    },
    updateTab : function(index, url, text){
        $tabs.find('li[index=' + index + ']').attr('url', url).children('a').text(text);
    }
};

$.lastState = {  //保存和恢复最后状态
    save: function (activeTabIndex) {
        var state = { OpenTabs: [], OpenNodes:[], LastIndex: activeTabIndex != undefined?activeTabIndex: $('#tabs>ul>li.ui-state-active').attr('index') };
        $('#tabs>ul>li').each(function () {
            if ($(this).attr('url')) //因为有时候会null， 待查 
                state.OpenTabs.push({ Url: $(this).attr('url'), Text: $(this).children('a').text(), MetaType: $(this).attr('metatype')});
        });
        var li = $('#browser li.collapsable').each(function () {
            if ($(this).attr('_id') || $(this).attr('metaType')) state.OpenNodes.push($(this).attr('metaType') + "." + $(this).attr('_id') );
        });  
        var statestr = JSON.stringify(state) ;
        
        //这里用了一个巧妙的方法, 延时0.5秒执行, 并只执行最后那一次
        $('#statestr').text(statestr);
        setTimeout(function(){  
            if ($('#statestr').text() == statestr)
                $.post("/SaveLastState", { lastState: statestr});
        }, 500);
        //end;
    },
    restore: function (lastState) {
        
        for (var i in lastState.OpenTabs) $.smartTab.openTab(lastState.OpenTabs[i].MetaType, lastState.OpenTabs[i].Url, lastState.OpenTabs[i].Text);
        $tabs.tabs("select", lastState.LastIndex);
        $.smartTab.tabCheckLoad($tabs.find('li.ui-state-active').attr('index'));

    }
}

/********************************8   metaObject  8***************************************/


$.array2json = function (conf, a, type, prefix) {
    a.push({});//模板
    for(var j in a) {
        a[j] = $.json2array(conf, type, a[j], true, prefix,j, j== a.length - 1 );//递归
        a[j]["index"] =parseInt(j )+ 1; a[j]["tmplRow"] = j== a.length - 1;
    }
    return { name: prefix, value: a };
}
$.json2array = function(conf, type, d, leaf, parent, index, tmplRow){
        var data = {prop: new Array(), array: new Array(), leaf: leaf, index: -1, tmplRow: tmplRow};
        var allConf = d["_id"] ? $.extend({ _id: { caption: "id", readonly: true }, Version: { caption: "版本", readonly: true }, ProjectName: { caption: "所属项目", readonly: true }, HashCode: { caption: "校验码", readonly: true }, LastUpdateTime: { caption: "最后修改时间", readonly: true } }
                                 ,conf[type]) :conf[type];
        for (var i in allConf)
            if(allConf[i].type){ //if (d[i] instanceof Array) {
                if (!d[i]) d[i] = new Array();
                var prefix = (parent ? parent + "." : "") + i;
                data.array.push($.extend(allConf[i], $.array2json(conf, d[i], allConf[i].type, prefix)));
            }else {
                var p = $.extend(
                            $.extend({caption: null, lineShow: false, maxLength: -1, editor: null, scriptType: null, selection: null, identity: false, reference:null, readonly: false},allConf[i]),
                            {tmplRow: tmplRow, name: parent + (index?"[" + index + "]":"" ) + (parent||index?("[" + i + "]"):i), path: (parent?(parent + "."):"") + i, value: d[i]== undefined?null: d[i]});
                //if (window.console ) console .log(p) ;
                if (!p.editor) p.editor = "input";
                p.isInput = (p.editor == "input") || (p.editor == "checkbox");
                data.prop.push(p); 
            }
        
        return data;
    }

    $.fn.metaObject = function (metaType, metaData, multi){
        return this.each(function(){
            var data = multi ? $.array2json(metaObjectConfig, metaData, metaType, "multi")
                : $.json2array(metaObjectConfig, metaTreeConfig[metaType].table, metaData, false, "", null);;
            //if (window.console ) console.log(metaData); //alert(JSON.stringify(data));

            $(this).append($(multi ? '#metaPropArray' : '#metaObject').tmpl(data))
                .find('div.zip').zip().end()
                .find('legend>a').zipArray().end()
                .tmplRowEditor(multi)
                .selection()
                .reference().toggleEditor().initEditor();
                //.scriptEditor(true);
        });
    }

    $.fn.initEditor = function () {  //把根的代码编辑器自动设置为第一个
        return this.each(function () {
            $(this).children('div.prop').children('select.toggleEditor').each(function () {
                $(this).val($(this).children().eq(1).val()).trigger('change');
            });
        });
    }

    $.fn.toggleEditor = function () {  
        return this.each(function () {
            $(this).find('select.toggleEditor').change(function () {
                var t = $(this).val();
                if (t == 'text') {
                    eval("$(this).next().toggleEditor_" + $(this).attr('curr_editor') + "(false);");
                    $(this).removeAttr('curr_editor');
                }
                else {
                    eval("$(this).next().toggleEditor_" + t + "(true);");
                    $(this).attr('curr_editor', t);
                }
            })
        });
    }

    $.fn.resetAllEditor = function () {
        return this.each(function () {
            $(this).find('select.toggleEditor[curr_editor]').val('text').trigger('change').size();
        });
    }

    

 

    $.fn.zip = function(){
        return this.each(function(){
            $(this).find('a.zipRow').click(function(){
                var div = $(this).closest('div.zip').toggleClass('inline');
                if ($(this).text() == "▲") {
                    $(this).text('▼');
                    div.initEditor();
                }else {
                    $(this).text('▲');
                    div.resetAllEditor();
                }
                return false;
            });
        });
    }

    $.fn.zipArray = function(){
        return this.each(function(){
            $(this).click(function(){
                if ($(this).text() == "▲") $(this).text('▼'); else $(this).text('▲') ;
                var fieldset= $(this).closest('fieldset');
                fieldset.children('div.zip').toggle().end().find('span.count').text( fieldset.children('div.zip:not(.tmpl)').size() + '条' + fieldset.find('legend>span').text()).toggle(); 
                return false;
            });
        });
    }

    $.fn.tmplRowEditor = function(multi){
        return this.each(function(){ 
            $(this).find("[fieldname]").live('change.tmpl', function(){ //新增行 
                if ($(this).val()){ //不加这个会触发2次,因为后面 val('')
                    var row = $(this).closest('div.zip');

                    var fieldset = row.closest('fieldset');
                    var rowCount = fieldset.children('div.zip').size();
                    row.clone(true).unbind('change.tmpl').removeClass('tmpl').insertBefore(row).find('[fieldname]').each(function(){
                        $(this).attr('name', $(this).attr('fieldname').replace(/\[(\d+)\]/i, "[" + (rowCount - 1) + "]")).removeAttr('fieldname');
                    }).end().find('span.rowIndex').text(rowCount  ).end().find('[identity]').val(rowCount).end().focus();
                    $(this).val('');
                }
                //fieldset.trigger('change');
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
                        var rowIndex = parseInt(row.find('span.rowIndex').text()) -1 ;
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
        });
    }


    $.fn.reference = function(){
        return this.each(function(){  
            $(this).find('fieldset[ref_join]').each(function(){
                $(this).find('[path$=".' + $(this).attr('ref_join') +  '"]').autocomplete({source: "/project/reference/" + $(this).attr('ref_type') });
            });
        });
    }
    
    $.fn.selection = function(show){
        return this.each(function(){
            var div = $(this);
//            var setting = $.unique($.map($(this).find('[selection][name]'), function(ctrl){return $(ctrl).attr('name').toString().replace(/\[\d+\]/i, "") + "=" + $(ctrl).attr('selection');}));

            var setting1 = {};
            $(this).find('[selection][name]').each(function(){
                var v = setting1[$(this).attr('selection')];
                if (!v) v=new Array();
                var src = $(this).attr('name').toString().replace(/\[\d+\]/i, "");
                if ($.inArray(src, v) < 0) v.push(src);
                setting1[$(this).attr('selection')] = v;
            });
            //if (window.console) console.log(setting1);
            for(var i in setting1){
                var tri = i.substring(1).split('.');
                var fieldset = $('fieldset[prefix=' + tri[0] + ']');
                fieldset.bind('change.' + tri[1], function(){
                    var token = "";
                    //for(var j in setting1[i]) token += '[name$="' + setting1[i][j].split('.')[1] + '\[\D+\].' + setting1[i][j].split('.')[1] + '"],';
                    for(var j in setting1[i]) token += '[path="' + setting1[i][j] + '"],';
                    var list = $.map($(this).find('[name$=".' + tri[1] + '"]'), function(input){return $(input).val();});
                    div.find(token).autocomplete({source: list});
                    //if (window.console) console.log(list);
                }).trigger('change');
            }
        });
    }

    //保存对象后刷新用的
    $.fn.objRefresh = function(newObj, msg, metaType, parent_type, parent_id, returnValues){
       if (newObj){
            alert(msg?msg:'新增成功');
            var text = mo.find("[name=" + metaTreeConfig[metaType].text + "]").val();
            mo.attr('id', 'metaObject-' + returnValues["_id"]);
            $.smartTab.updateTab($tabs.find('li.ui-state-active').attr('index'), 
                "/design/" + metaType + "/?_id=" + returnValues["_id"] , text); //这里地址要跟模板的一抹一样

            $("#browser").treeviewNewNode(parent_type, parent_id, metaType, returnValues["_id"], text);
        }
        else alert(msg?msg:'修改成功');

        $.smartTab.tabCheckLoad($tabs.find('li.ui-state-active').attr('index'), true); 
    }

    $.fn.objRemove = function () {
            alert('删除成功');
            $tabs.tabs('remove', $tabs.find('li.ui-state-active').attr('index'));
    }
/********************************8   metaObject end 8***************************************/