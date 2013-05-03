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

    $.fn.toggleEditor_columns = function (show, params) {
        return this.each(function () {
            if (show) {
                var fields = $(this).val().trim().split(";");
                var div = $("<div class='selColumns' ></div>").insertBefore(this).css("padding", "10px").css("border", "1px solid gray");
                $(this).closest('form.metaObject').find('div.zip:not(.tmpl)').find('[path="Columns.ColumnName"]').each(function () {
                    $("<input type='checkbox' />").appendTo(div).attr('checked', _.indexOf(fields, $(this).val()) >=0?"checked":undefined);
                    $("<span >").appendTo(div).text($(this).val()).css("margin", "0 10px");
                });

                $(this).hide();
            }
            else {
                var txt = $.map(
                               $(this).prev('div.selColumns').find('span').filter(function () {

                                   return $(this).prev('input').attr('checked');
                               }),
                            function (ui, index) { return $(ui).text(); }
                        ).join(";");

                $(this).val(txt).show().prev('div.selColumns').remove();
            }
        });
    }

    $.fn.toggleEditor_pickList = function (show, params) {
        return this.each(function () {
            if (show) {
                var data = _.map(_.filter($(this).val().trim().split(";"), function (i) {
                    return i && i.trim();
                }), function (i) {
                    var l = i.split('.');
                    return { key: l[0], value: l[1] };
                });
                var d = $("#tp_pickList").tmpl({ data: data }).insertBefore(this);
                d.find("tr.tmpl input").change(function () {
                    var tr = $(this).closest('tr');
                    if (tr.hasClass("tmpl")) {
                        var newtr = tr.clone(true).insertBefore(tr).removeClass("tmpl");
                        $(this).val("");
                        newtr.children().eq($(this).closest('td')[0].cellIndex).find('input').focus();
                    }
                });
                d.find('a.removeRow').click(function () {
                    if (confirm("确认要删掉这一行吗?")) {
                        $(this).closest('tr').remove();
                    }
                    return false;
                });

                $(this).hide();
            }
            else {
                var txt = $.map(
                            $(this).prev('table.tp_pickList').find('tbody tr:not(.tmpl)'),
                            function (ui, index) {
                                var children = $(ui).find('input');
                                return children.eq(0).val() + "." + children.eq(1).val();
                            }
                        ).join(";");

                $(this).val(txt).show().prev('.tp_pickList').remove();
            }
        });
    }

    $.designTools = {
        "autoParams": function (ctrl) {
            var frm = $(ctrl).closest('form.metaObject');
            var fields = [];
            frm.find('textarea[path="' + $(ctrl).attr("params") + '"]').each(function () {
                var script = $(this).val().split('\n').join(" ");
                var reg = /:([_a-zA-Z][_a-zA-Z0-9]*)/ig;
                var matches = reg.exec(script);
                while (matches) {
                    if (_.indexOf(fields, matches[1]) < 0)
                        fields.push(matches[1]);
                    matches = reg.exec(script);
                }

            });
            var container = $(ctrl).closest('fieldset');
            for (var i in fields) {
                if (container.find("[name$='[ParamName]']").filter(function () {
                    return $(this).val() == fields[i];
                }).size() == 0) {
                    alert("添加参数：" + fields[i]);
                    frm.tmplRowEditor(null, { newRow: true, container: container, values: { ParamName: fields[i]} });
                }
            }

        },
        "sql": function (ctrl) {
            $("body>.sqlbuilder").remove();
            $("<div class='designer sqlbuilder'>").appendTo('body').dialog({
                width: $(window).width() * 0.75,
                height: $(window).height() * 0.75,
                modal: true,
                title: $(ctrl).attr("title")
            }).load("/sqlbuilder");
        },
        "queryFields": function (ctrl) {
            var mainQuery = $.trim($(ctrl).closest('div.zip').find('[path="ModulePages.Queries"]').val()).split(';')[0];
            $("body>.queryFields").remove();
            $("<div class='designer queryFields'>").appendTo('body').dialog({
                width: $(window).width() * 0.75,
                height: $(window).height() * 0.75,
                modal: true,
                title: $(ctrl).attr("title")
            }).load("/queryFields/" + mainQuery);
        },
        "createMeta": function (ctrl) {
            var parent = $(ctrl).closest('div.zip');
            var fname = parent.find('[name$="\[ColumnName\]"]').val();
            if (fname) {
                if (fname[0].toUpperCase() != fname[0])
                    fname = fname.substring(1);
                var data = {
                    FieldName: fname,
                    DisplayLabel: parent.find('[name$="\[Caption\]"]').val(),
                    Selection: parent.find('[name$="\[Selection\]"]').val(),
                    CharLength: parent.find('[name$="\[Size\]"]').val()
                };
                $.get("/findMetaField/" + data.FieldName, function (f) {
                    if (f && f._id && confirm("此字段已存在数据字典，是否覆盖?"))
                        data._id = f._id;
                    if (!(f && f._id && !data._id))
                        $.post("/save/MetaField", data, function (data) {
                            if (data && data.IsValid) alert("生成数据字典ok!");
                        });
                })
            }
        }

    }

    $.fn.designTools = function () { 
        return this.each(function(){
            $(this).button().click(function () {
                $.designTools[$(this).attr("designer")](this);
            });
        });
    }