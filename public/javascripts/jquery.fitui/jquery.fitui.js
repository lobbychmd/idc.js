/**********       **************/
$.fitui = {};

/**********   标签页    **************/
$.fn.headerTabs = function (option) {
    return this.each(function () {
        $(this).addClass('headerTabs').tabs(option);
    });
}

$.ajaxTabs1 = {
    addTab: function ($tabs, text, icon, url, loadNow, option) {
        var ul = $tabs.children('ul');

        if (url.indexOf('#') == 0) url = url.substring(1);

        var index = $tabs.attr('index');
        if (index) index = parseInt(index) + 1; else index = 1;

        $tabs.attr('index', index);
        var tabStr = "#ui-tabs-" + index;

        $tabs.tabs("add", tabStr, text);
        var idx = ul.children('li').size() - 1;
        $tabs.tabs("select", idx).find('li.ui-tabs-active').attr('url', url).attr('icon', icon);
        var tab = $(tabStr);
        if (option && option.create) option.create(tab);
        if (loadNow) $.ajaxTabs1.tabCheckLoad($tabs, tab, ul.children().eq(idx));
    },
    tabCheckLoad: function ($tabs, tab, li) {
        if (!tab.attr('load')) {
            tab.indicator({}).load(li.attr('url'), function () {
                tab.attr('load', '1');
            });
        }
    },
    tabCheckLoadIdx: function ($tabs, ul, idx) {
        $.ajaxTabs1.tabCheckLoad($tabs, $tabs.children('.ui-tabs-panel').eq(idx), ul.children().eq(idx));
    }
};
$.fn.ajaxTabs1 = function (option) {
    return this.each(function () {
        var $tabs = $(this).tabs({ tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>" });
        var ul = $tabs.children('ul');

        if (option.stateSetting) {
            var lastState = option.stateSetting.lastState;
            if (lastState) { //状态的恢复必须放在 状态机注册之前
                for (var i in lastState.OpenTabs) {
                    var t = lastState.OpenTabs[i];
                    $.ajaxTabs1.addTab($tabs, t.text, t.icon, t.url, i==lastState.LastIndex, option);
                }
                $tabs.tabs( "option", "active", lastState.LastIndex );
            }

            $tabs.attr('stateId', option.stateSetting.stateId);
            $.lastState.register(
                option.stateSetting.stateId,
                option.stateSetting.stateGroup, function () {
                    var state = { OpenTabs: [], LastIndex: 0 };
                    $tabs.children('ul').children('li').each(function () {
                        state.OpenTabs.push({ url: $(this).attr('url'), text: $(this).children('a').text(), icon: $(this).attr('icon') });
                    });
                    state.LastIndex = $tabs.tabs("option", "active");
                    return state;
                }, option.stateSetting.saveState);
            
            //状态的恢复完成触发一次 change。因为状态可能与其它控件共用一组
            if ($tabs.attr('stateId') && option.stateSetting.lastState) $.lastState.change(option.stateSetting.stateId); 
        }

        $tabs.tabs({ select: function (event, ui) {
            $.ajaxTabs1.tabCheckLoadIdx($tabs, ul, ui.index);
            var li = ul.children().eq(ui.index);
            //所有切换或者删除tab 都会触发这个事件，因此把状态改变事件放这里，但是这个事件发生的时机提前了，所以延时100 毫秒
            setTimeout(function () { if ($tabs.attr('stateId')) $.lastState.change(option.stateSetting.stateId); }, 100);
        }
        });

        $tabs.find("span.ui-icon-close").live("click", function () {
            var index = $("li", $tabs).index($(this).parent());
            $tabs.tabs("remove", index);
            //if (ul.children().size() == 0) if (option.stateId) $.lastState.change(option.stateId);
        });

        $(option.a_selector).die("click.withTab").live("click.withTab", function () {
            var url = $(this).attr('href');
            if (url) {
                var li = ul.children('li[url="' + url + '"]');
                if (li.size() > 0) {
                    var currIdx = $tabs.tabs("option", "selected");
                    var toIdx = $("li", $tabs).index(li);
                    if (currIdx != toIdx) {
                        $tabs.tabs("select", toIdx);
                    }
                }
                else {
                    var text = $(this).text();
                    var icon = $(this).attr('icon');
                    $.ajaxTabs1.addTab($tabs, text, icon, url, true, option);
                }
            }
            return false;
        });
    });
}


/**********   树    **************/
$.fitui.tmpl_tree_li = function () {$.template('tmpl_tree_li', '<li><span><a></a></span><ul></ul></li>');}
$.fitui.tmpl_tree_li();
$.fitui.render_li = function (parent, data, href) {
    for (var i in data) {
        var li = $.tmpl('tmpl_tree_li').appendTo(parent).find('a').text(data[i].text).end();
        var url = '';
        for (var j in data[i])
            if ((j != "text") && (j != "id") && (j != "children")) url = url + j + '=' + data[i][j] + '&'; //li.attr(j, data[i][j]);
        li.attr('data', url).attr('id', data[i]["id"]);
        if (href && !data[i]["nodeonly"]) li.find('a').attr('href', href + "?" + url);

        if (data[i].children) {
            $.fitui.render_li(li.children('ul'), data[i].children, href);
            li.addClass('open');
        }
        else $('<li fake=1>').appendTo(li.children('ul'));

        var span = li.children('span').addClass(data[i]['sub_type'] ? data[i]['sub_type'] : data[i]['type']);
        if (!data[i].children || data[i].children.length > 0)
            span.addClass('folder');
        else span.addClass('leaf');
    }
}

$.fn.ajaxtree = function (option) {
    return this.each(function () {
        if (!option) option = {};
        option.collapsed = true;
        var tree = $(this).addClass('filetree');
        var id = option.rootid?option.rootid: this.id;
        if (!option.rootid) $.lastState.register(option.stateId, option.stateGroup, function () {
            return   tree.find('li.collapsable').map(function(){return $(this).attr('id');}).get();
        }, option.saveState);

        //treeview 插件自带文件夹的图标
        
        option.toggle = function (data, ui) {
            var li = $(ui).parent();
            var ul = li.children('ul');
            if (ul.children('li[fake]').size() > 0) {
                var newli = ul.children('li.newNode');
                var url = option.url + "?" + li.attr('data');
                ul.indicator({ insert: true })
                $.get(url, function (data) {

                    ul.children('li[fake]').remove();
                    $.fitui.render_li(ul, data, option.href);
                    ul.indicator({ remove: true });
                    if (ul.children().size() > 0) {
                        ul.ajaxtree($.extend({rootid: id}, option));
                        ul.append(newli);
                    }
                    else if (newli.size() == 1) {
                        ul.append(newli);
                    }
                    else { ul.remove(); li.children('span').removeClass('folder').addClass('leaf'); }
                    $.lastState.change(option.stateId);
                });

            }
            $.lastState.change(option.stateId);
        };
        $(this).treeview(option);
        $.lastState.change(option.stateId);
    });
}   


/**********            导航        **************/
$.fitui.navigation = {
    createPathNav: function (nav, path, text, home) {
        var ul = $(nav).children('ul');
        var parent = ul;
        if ($(parent).find('[path="' + path + '"]').size() == 0) {
            $(parent).find('li.last').removeClass('last');
            var li = $('<a href=#>').text(text).addClass('changePath').wrap('<li>').parent().addClass('last')
                .appendTo(parent).attr('path', path);
            if (home) li.addClass('home');
            li.children('a').click(function () {
                var li = $(this).closest('li');
                if (li.hasClass('last')) return false;
                var path = li.attr('path');
                //$.fitui.resetParent(designer, $(this).closest('ul'));
                while (li.next().size() > 0) li.next().remove();
                li.addClass('last');

                $(nav).trigger('change', [path]);
                return false;
            });
        }
    }
}

$.fn.navigation = function (option) {
    return this.each(function () {
        if (option.createPath) {
            $.fitui.navigation.createPathNav(this, option.path, option.text, option.home);
        }
        else {
            $(this).addClass('metaPath').append('<ul>');
            $(this).navigation({ createPath: true, path: option.homePath, text: '', home: true });
            $(this).bind('change', function (ui, path) {
                if (option.change) option.change(path);
            });
        }
    });
}   