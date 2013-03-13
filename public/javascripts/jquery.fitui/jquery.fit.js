/* 保存界面状态 */
$.lastStateSetting = {};
$.lastState = {
    register: function (id, group, get, save) {
        $('<span style="display:none"><span>').addClass('statestr').attr('id', 'statestr_' + id).appendTo('body').attr('group', group);
        $.lastStateSetting[id] = { group: group, get: get, save: save };
    },
    getGroupState: function (group) {
        var r = {};
        $('.statestr[group=' + group + ']').each(function () {
            var txt = $(this).text();
            r[$(this)[0].id.substring(9)] = txt ? JSON.parse(txt) : null;
        }
        );
        return r;
    },
    change: function (id) {
        var state = $.lastStateSetting[id];

        //这里用了一个巧妙的方法, 延时0.5秒执行, 并只执行最后那一次
        $('#statestr_' + id).text(JSON.stringify(state.get()));

        var groupstatetxt = JSON.stringify($.lastState.getGroupState(state.group));

        setTimeout(function () {
            var groupstate = $.lastState.getGroupState(state.group);
            if (JSON.stringify(groupstate) == groupstatetxt) {
              //  if (console) console.log(groupstate);
                if ($.lastStateSetting[id].save) $.lastStateSetting[id].save(groupstate);
            }
        }, 500);

    }
}

$.fn.waitting = function (option) {
    option = $.extend({}, option);
    return this.each(function () {
        if (option.show) $(this).show();
        else $(this).hide();
    });
}

$.fn.ajaxpost = function () {
    return this.each(function () {
        var btn = $(this);
        btn.click(function () {
            var form = btn.closest('form');
            var action = btn.attr('action');
            var rel = btn.attr('rel');
            btn.waitting();
            $.post(action, form.serializeArray(), function (data) {
                if (typeof data == "string") {
                    var r = JSON.parse(data);
                    if (!r) r = { IsValid: !data };
                } else var r = data;

                if (r.IsValid) window.location = rel ? rel : "/";
                else {
                    alert(_.map(r.Errors, function (i) { return i.ErrorMessage; }).join("\n"));
                    form.find("[name]").removeClass("error");
                    _.each(r.Errors, function (i) {
                        _.each(i.MemberNames, function (j) {
                            form.find("[name=" + j + "]").addClass("error");
                        });
                    });
                    btn.waitting({ show: true });
                }
            });
            return false;
        });

    });
}

$.dic2array = function (data) {
    var result = [];
    for (var i in data) result.push({ key: i, value: data[i] });
    return result;
}

/**********  顺序执行n个函数 ****************/
var seq_async = function (funcs, callback) {
    this.funcs = funcs;
    this.callback = callback;
}

seq_async.prototype = {
    constructor: seq_async,
    execOne: function (params, index) {
        var obj = this;
        this.funcs[index](params, function (data) {
            if (arguments.length <= 1) data = data;
            else data = arguments;

            if (index == obj.funcs.length - 1)
                obj.callback(data);
            else obj.execOne(data, index + 1);
        })
    },
    exec: function () {
        this.execOne(null, 0);
    }
}

/**********  只执行一个函数，执行次数由数组决定     ***********/
var seq_asyncArray = function (func, paramsArray, callback) {
    this.func = func;
    this.paramsArray = paramsArray;
    this.callback = callback;
}


seq_asyncArray.prototype = {
    constructor: seq_asyncArray,
    execOne: function (params, index) {
        var obj = this;
        this.func(this.paramsArray[index], params, function (data) {
            if (arguments.length <= 1) data = data;
            else data = arguments;

            if (index == obj.paramsArray.length - 1)
                obj.callback(data);
            else obj.execOne(data, index + 1);
        })
    },
    exec: function () {
        if (this.paramsArray.length > 0) this.execOne(null, 0);
        else this.callback(null);
    }
}