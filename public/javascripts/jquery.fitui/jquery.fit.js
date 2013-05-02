

$.fn.waitting = function (option) {
    option = $.extend({}, option);
    return this.each(function () {
        if (option.show) {
            $(this).show().next("a.waitting").remove();
        }
        else if (option.error) {
            var obj = $(this);
            obj.next("a.waitting").addClass("error").click(function () {
                $("<div class='waittingError'>").html(option.error.responseText).appendTo('body').dialog({
                    modal: true,
                    width: $(window).width() * 0.75,
                    height: $(window).height() * 0.75,
                    close: function () { $(".waittingError").remove(); }
                });
                $(this).remove();
                obj.show();
            });
        } else {
            var img = $("<a>").addClass("waitting");
            if (option.insert) {
                img.appendTo(this);
            } else {
                $(this).hide();
                img.insertAfter(this);
            }
        }

    });
}

$.fn.getpost = function (option) {
    option = $.extend({}, option);
    return this.each(function () {
        var btn = $(this);
        btn.click(function () {
            var con = $(this).attr("confirm");
            if (con && !confirm(con)) return false;

            var form = option.form ? option.form : btn.closest('form');
            var action = btn.attr('action');
            if (!action) action = $(form).attr('action');
            var href = $(this).attr('href');
            if (!action && href) {
                window.location = href;
                return false;
            }
            else if (!option.ajax && !option.container) {
                form[0].submit();
                return false;
            }
            var rel = btn.attr('rel');

            if (form.size() == 0) alert("form not found.");
            var method = form[0].method;

            if (form.validateFormat()) {
                btn.waitting();
                $.ajax(action, { data: form.serializeArray(), type: method }).done(function (data) {
                    if (!option.ajax) {
                        $(option.container).html(data);
                    }
                    else {
                        if (typeof data == "string") {
                            var r = JSON.parse(data);
                            if (!r) r = { IsValid: !data };
                        } else var r = data;

                        if (r.IsValid) {
                            var url = rel ? rel : window.location.toString();
                            if (r.ReturnValues && option.useReturnValues)
                                for (var i in r.ReturnValues)
                                    url += (url.indexOf("?") >= 0 ? "&" : "?") + i + "=" + r.ReturnValues[i];
                            if (option.container) {
                                $(option.container).load(url);
                            } else if (url != "#") window.location = url;
                        }
                        else {
                            alert(_.map(r.Errors, function (i) { return i.ErrorMessage; }).join("\n"));
                            form.find("[name]").removeClass("error");
                            _.each(r.Errors, function (i) {
                                _.each(i.MemberNames, function (j) {
                                    if (j.indexOf('.') > 0) j = "[name$=\"\[" + j.split('.')[1] + "\]." + j.split('.')[0] + "\"]";
                                    else j = '[name="' + j + '"]';
                                    form.find(j).addClass("error");
                                });
                            });
                            btn.waitting({ show: true });
                        }
                    }
                }).fail(function (jqXHR, ajaxSettings, thrownError) {
                    //console.log(jqXHR);
                    if (jqXHR.status != 401) {
                        alert(thrownError);
                    } btn.waitting({ error: jqXHR });
                });
            }
            return false;
        });

    });
}

//1)可以绑定，
//2)也可以调用返回是否有错误
$.fn.validateFormat = function ( ) {
    this.each(function () {
        var binded = $(this).attr('vfbind');
        $(this).find('[name]').each(function () {
            if (!binded)
                $(this).blur(function () {
                    var f = $(this).attr('format');
                    $(this).removeClass("formatError").removeAttr('title');
                    if ((f) && ($(this).val())) {
                        var reg = eval("/" + f + "/");
                        if (!reg.exec($(this).val())) {
                            $(this).addClass("formatError");
                            $(this).attr("title", $(this).attr('formatErrorMsg')).tooltip().tooltip("open");
                        }
                    }
                })
            $(this).trigger('blur');
        });
    });
    return this.find('.formatError').size() == 0;
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

            if (index == obj.paramsArray.length - 1) {
                if (obj.callback ) obj.callback(data);
            }
            else obj.execOne(data, index + 1);
        })
    },
    exec: function () {
        if (this.paramsArray.length > 0) this.execOne(null, 0);
        else this.callback(null);
    }
}



$.readOnly = function (ctrl) {
    return ($(ctrl).attr('readonly'));
}

$.fn.setReadOnly = function (readonly) {
    return this.each(function () {
        if (readonly) $(this).attr('readonly', 'readonly');
        else $(this).removeAttr('readonly');

        if (!$(this).attr('editor')) {
            $(this).trigger('readonly', [readonly]);
        }
        else {
            //alert(readonly);
            if (this.tagName == "SELECT") {
                if (readonly) {
                    if ($(this).prev('[name="' + $(this).attr('name') + '"]').size() == 0)
                        $('<input >').attr('name', $(this).attr('name')).attr('relID', $(this).attr('id')).insertBefore(this)
                        .val($(this).val()).attr('readonly', 'readonly').width($(this).width()).hide();
                    $(this).attr('disabled', 'disabled');
                } else {
                    $(this).removeAttr('disabled').prev('[name="' + $(this).attr('name') + '"]').remove();
                    //$(this).removeAttr('disabled').prev().remove();
                }
            } else if (($(this).attr('type') == "button") || ($(this).attr('type') == "checkbox") || ($(this).attr('type') == "file")) {
                if (readonly) $(this).attr('disabled', 'disabled');
                else $(this).removeAttr('disabled');
            } else if ($(this).hasClass('editGrid')) {
                if (readonly) $(this).find('a.uf,a.newRow').hide();
                else $(this).find('a.uf,a.newRow').show();
            } else if ($(this).hasClass('DateEditor')) {
                if (readonly) $(this).datepicker({ disabled: true });
                else $(this).datepicker({ disabled: false });
            }
        }
    });
}


$.fn.toggleReadOnly = function (readonly, rostate) {
    return this.each(function () {
        if (!rostate) rostate = "rostate";
        if (!$(this).attr(rostate)) //设置初始状态
            $(this).attr(rostate, $(this).attr('readonly') ? "true" : "false");

        if ($(this).attr(rostate) == "true") {
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
