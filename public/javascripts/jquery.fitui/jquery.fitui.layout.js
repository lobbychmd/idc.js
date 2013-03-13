$.autoHeightSetting = {};
$.autoHeightEvent = [];

$.autoHeight = function (setting, init, callback) {
    for (var i in setting)
        $.autoHeightSetting[i] = setting[i];
    if (callback) $.autoHeightEvent.push(callback);
    if (init) {
        $(window).bind('resize.layout', function () {
            $.resizeW();
            for (var i in $.autoHeightEvent)
                $.autoHeightEvent[i]();
        });
    }
    $.resizeW();
    $(window).trigger('resize.layout', []);
}

$.fn.intcss = function (styleName) {
    var result = $(this[0]).css(styleName);
    try {
        result = parseInt(result.substring(0, result.length - 2));
    } catch (e) { result = 0; }
    return result;
}

$.resizeW = function () {
    var h = document.documentElement.clientHeight;
    //if (window.console) console.log($.autoHeightSetting);
    for (var i in $.autoHeightSetting) {
        $(i).css('height', (h - $.autoHeightSetting[i] 
                - $(i).intcss('margin-top') - $(i).intcss('margin-bottom')
                - $(i).intcss('padding-top') - $(i).intcss('padding-bottom')
            ) + "px");
    }
}


/*******  隐藏的控件不要做 layout ，取尺寸会有问题，显示再 layout    ******/
$.fn.layout = function (test) {
    return this.each(function () {
        var layout_type = $(this).attr('layout');
        if (layout_type) {
            var root = this.tagName == 'BODY';
            var setting = {};
            if (layout_type == 'h') {
                var nav = $(this).children('[align=left]').css('float', 'left').last().bind('resize.layout', function () {
                    var l = $(this).outerWidth(true);
                    var p = $(this).parent().closest('[layout]');
                    l += p.children('[align=spliter]').outerWidth(true);
                    var content = p.children('[align=auto]').css('margin-left', l);
                    //临时方案
                    if (content[0] && content[0].tagName == "TEXTAREA")
                        content.width(p.innerWidth() - p.intcss('padding-left') - p.intcss('padding-right') - l - 50);
                }).trigger('resize.layout', []);
                var spliter = $(this).children('[align=spliter]').draggable({
                    axis: "x", stop: function () { $(this).trigger('resize.split'); }
                }).bind('resize.split', function () {
                    var l = $(this).offset().left;
                    var nav = $(this).prev().width(l);
                    //var content = $(this).next().css('margin-left', l + $(this).width());
                    $(this).closest('[layout]').children('[align=left]:last').trigger('resize.layout');
                    $(this).css('left', 0);
                });
                var content = spliter.next(); //.layout();
                var parent = $(this);

                $("<div style='clear:both'>").appendTo(this);
                if ($(this).attr('align') == "auto" && !test) {
                    $(this).children('[align]').each(function () {
                        setting['#' + this.id] = root ? 0 : document.documentElement.clientHeight - parent.height() + $(this).intcss('padding-top') + $(this).intcss('padding-bottom');
                    });
                }
            } else if (layout_type == 'v') {
                
                var contents = [];
                var hOffset = $(this).intcss('padding-top') + $(this).intcss('padding-bottom');
                $(this).children().each(function () {
                    var align = $(this).attr('align');
                    if (align) {
                        if (align != 'auto')
                            hOffset += $(this).outerHeight(true);
                        else contents.push(this);
                    }
                });

                for (var i in contents) {
                    delete setting['#' + contents[i].id];
                    setting['#' + contents[i].id] = hOffset + (root ? 0 : document.documentElement.clientHeight - $(this).height());

                }
            }
            $.autoHeight(setting, false);

            $(this).children('[layout]').each(function () {
                $(this).layout();
            });
        }

    });
}

$.initLayout = function (option) {
    if (!option) option = {};
    $.extend({ navWidth: 200, containers: [] }, option)
    $('body').layout();
    $.autoHeight({}, true);
    
}

//创建缩略图
$.fn.thumbnail = function (option) {
    return this.each(function () {
        if (option && option.thumb) {  //重画缩略
            $(this).closest('.thumbContainer').find('.thumbnail').trigger('thumb', []);
        }
        else if (option && option.resetThumb) { //重新设定缩略图位置在右下角
            $(this).trigger('resize.thumbnail').trigger('scroll.thumbnail');
        }
        else {
            var chart = this;
            var container = $(this).parent().addClass('thumbContainer');
            var thumbnail = $('<div>').addClass('thumbnail')
                .appendTo(container).click(function (data) {
                }).bind('thumb', function () {  //重画缩略
                    var _thumbnail = this;
                    var rateH = $(_thumbnail).height() / $(chart).height();
                    var rateW = $(_thumbnail).width() / $(chart).width();
                    $(chart).find('.flowNode').each(function () {
                        var thumbNode = $(_thumbnail).find('[nodeId=' + $(this).attr('nodeId') + ']');
                        if (thumbNode.size() == 0)
                            thumbNode = $("<div>").addClass('thumbNode').css('position', 'absolute').attr('nodeId', $(this).attr('nodeId')).appendTo(_thumbnail);
                        if ($(this).hasClass('sel')) thumbNode.addClass('sel')
                        else thumbNode.removeClass('sel')
                        thumbNode.css('width', $(this).width() * rateW)
                        .css('height', $(this).height() * rateH)
                        .css('left', $(this).position().left * rateW)
                        .css('top', $(this).position().top * rateH);
                    });

                }).trigger('thumb', []);

            $('<div>').addClass('thumb')
                .appendTo(thumbnail).draggable(
                { containment: "parent", stop: function (event, ui) {
                    container.scrollTop($(this).position().top * $(chart).height() / thumbnail.height());
                    container.scrollLeft($(this).position().left * $(chart).width() / thumbnail.width());
                }
                });

            $(container[0].tagName == 'BODY' ? window : container).bind('resize.thumbnail', function () {
                var thumb = $(container).find('.thumbnail').find('.thumb');
                var wRate = $(chart).width() / container.width(); /*document.documentElement.clientWidth- $(container).offset().left*/
                var hRate = $(chart).height() / container.height();
                if (wRate > 1 || hRate > 1) {
                    thumb.show().width(thumbnail.width() / wRate)
                    .height(thumbnail.height() / hRate);
                }
                else thumb.hide();
            }).bind('scroll.thumbnail', function () {
                var thumbnail = $(container).find('.thumbnail');
                var topScroll = container.scrollTop(); //parseInt(thumbnail.css('top').substring(0, thumbnail.css('top').length - 2)) - thumbnail.position().top;
                var leftScroll = container.scrollLeft(); //parseInt(thumbnail.css('left').substring(0, thumbnail.css('left').length - 2)) - thumbnail.position().left;
                //alert(   topScroll);
                var thumb = thumbnail
                    .css('top', $(container).height() - thumbnail.height() + topScroll -30) //-30 是为了不被滚动条挡住
                    .css('left', $(container).width() - thumbnail.width() +  leftScroll-30)
                .find('.thumb')
                    .css('top', topScroll * thumbnail.height() / $(chart).height())
                    .css('left', leftScroll * thumbnail.width() / $(chart).width());
            }).thumbnail({ resetThumb: true });
        }
    });
}

