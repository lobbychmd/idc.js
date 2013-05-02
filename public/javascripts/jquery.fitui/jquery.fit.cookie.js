/* 保存界面状态 */
$.lastStateSetting = {};
$.lastState = {
    register: function (id, group, get, save) {
        $('<span style="display:none"><span>').addClass('statestr').attr('id', 'statestr_' + id).appendTo('body').attr('group', group).hide();
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