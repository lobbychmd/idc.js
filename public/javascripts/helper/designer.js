$.codeMirrors = {};

        $.fn.toggleEditor_code = function (show, params) {
            return this.each(function () {
                if (show) {
                    var width = $(this).width();
                    $.codeMirrors[$(this).attr("name")] = CodeMirror.fromTextArea(this, {
                        lineNumbers: true,
                        matchBrackets: true,
                        mode:params? params : $(this).attr('scriptType')//"text/x-plsql"
                    });
                    $(this).parent().find('.CodeMirror>.CodeMirror-scroll').width(width + "px");
                }
                else {
                    if ($.codeMirrors[$(this).attr("name")])
                        $.codeMirrors[$(this).attr("name")].toTextArea();
                    else alert("codemirror " + $(this).attr("name") + " not found.");
                }
            });
        }
    

    $.fn.toggleEditor_JSON = function (show, params) {
        this.each(function () {
            if (show) {
                try {
                    var data = eval("(" + $(this).val() + ")");
                } catch (e) {
                    alert(e);
                    return false;
                };
                console.log(data);
                $("<div ></div>").metaObject("FlowItem", data, true).insertBefore(this);
                $(this).hide();
            }
            else $(this).show();

            return true;
        });
    }

    $.fn.toggleEditor_visual = function (show, params) {
        return this.each(function () {
            if (show) {
                $('#tp_visual_uidesigner').tmpl({}).insertBefore(this);
                $(this).hide();
            }
            else {
                alert(1);
            }
        });
    }

    $.fn.toggleEditor_sql = function (show, params) {
        return this.each(function () {
            $("<div class='designer'>").appendTo('body').dialog({
                width: $(window).width() * 0.75,
                height: $(window).height() * 0.75,
                modal: true
            }).load("/sqlbuilder");
        });
    }