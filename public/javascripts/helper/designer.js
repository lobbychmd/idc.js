$.codeMirrors = {};

    $.fn.toggleEditor_code = function (show) {
        return this.each(function () {
            if (show) $.codeMirrors[$(this).attr("name")] = CodeMirror.fromTextArea(this, {
                lineNumbers: true,
                matchBrackets: true,
                mode: $(this).attr('scriptType')//"text/x-plsql"
            });
            else {
                if ($.codeMirrors[$(this).attr("name")])
                    $.codeMirrors[$(this).attr("name")].toTextArea();
                else alert("codemirror " + $(this).attr("name") + " not found.");
            }
        });
    }
    