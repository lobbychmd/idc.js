
$.fn.PageButton = function () {
    return this.each(function () {
        $(this).button().click(function () {
            var btn = $(this);
            var href = $(this).attr('href');
            var action = $(this).attr('action');
            btn.trigger("beforeAction");
            _confirm = $(this).attr('confirm');
            _confirm = (!_confirm) || confirm(_confirm);
            if (_confirm) {
                if (!action && href) {  //只是链接
                    if (href) window.location = href;
                } else { //执行 biz    //ie. 即使 input 没有指定 form 属性，attr('form') 也不会为空
                    var form = typeof $(this).attr('form') == "string" ? $('#' + $(this).attr('form')) : $(this).closest('form');
                    if (form.size() > 0) {
                        if (form.ValidateFormat()) {
                            var action = action ? action : form.attr('action');
                            var post_data = form.serializeArray();
                            btn.trigger("onGetPostData", [post_data, function (data) {
                                post_data = data;
                            }]);
                            btn.indicator({ hide: true });
                            $.post(action, post_data, function (data) {
                                $.HandleActionResult(data, function (r) {
                                    if (typeof r != "string") form.HandleBizResult(btn, r, href ? href : (form.attr('href') ? form.attr('href') : window.location.toString()));
                                });
                                btn.indicator({ show: true });
                            });
                        }
                    }
                }
                return false;
            }
        });
    });
}


$.HandleActionResult = function (data, callback) {
    try { r = (eval("(" + data + ")")); } catch (e) { r = data; };
    if (r.login == true) {
        alert('登录过期了，请在新窗口登录后回到此页面继续操作。');
        window.open(r.url);
    }
    else callback(r);
}

$.fn.HandleBizResult = function (btn, result, url) {
    return this.each(function () {
        $(this).find('[name]').removeClass('modalError');
        if (!result.IsValid) {
            for (var e in result.Errors) for (var n in result.Errors[e].MemberNames) {
                var nn = result.Errors[e].MemberNames[n];  //alert(nn);
                if (nn.indexOf('.') > 0) nn = "[name$=\"\[" + nn.split('.')[1] + "\]." + nn.split('.')[0] + "\"]";
                else nn = '[name=' + nn + ']';
                $(this).find(nn).addClass('modalError').attr("title", result.Errors[e].ErrorMessage);
            }
            alert($.map(result.Errors, function (o) { return $.trim(o.ErrorMessage) }).join('\n'));
            btn.trigger("onFailed");
        }
        else {
            if (result.Href) url = result.Href; //可以由控制器动态改变跳转页面
            //将biz 返回值返回到 url 上面
            if ((url.indexOf('?') > 0) && (result.ReturnValues)) {
                var qs = url.split('?')[1].split('&');
                for (var key in qs) {
                    var kv = qs[key];
                    if (kv) {
                        var dc = kv.split('=');
                        var v = result.ReturnValues[dc[0]];
                        url = url.replace(kv, dc[0] + '=' + (v ? v : dc[1]));
                    }
                }
            }

            if (url && (url != "#")) window.location = url;
            else { btn.trigger("onSucceed", [result.ReturnValues]); } //没有 url 的话，执行biz 之后就不采取任何动作，不跳转了，
        }
    });
}

//1)可以绑定，
//2)也可以调用返回是否有错误
$.fn.ValidateFormat = function (url) {
    this.each(function () {
        var binded = $(this).attr('vfbind');
        $(this).find('[name]').each(function () {
            $(this).blur(function () {
                if (!binded) {
                    var f = $(this).attr('format');
                    $(this).removeClass("formatError").removeAttr('title');
                    if ((f) && ($(this).val())) {
                        var reg = eval("/" + f + "/");
                        if (!reg.exec($(this).val())) {
                            $(this).addClass("formatError");
                            $(this).attr("title", $(this).attr('formatErrorMsg'));
                        }
                    }
                }
            }).trigger('blur');
        });
        if (!binded) {
            $(this).attr('vfbind', 'true').find('[type=submit]').click(function () {
                //待实现。。
            });
        }
    });
    return this.find('.formatError').size() == 0;
}



