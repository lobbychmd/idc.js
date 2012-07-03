$.fn.Grid_Table_Events = {}

$.fn.Grid_Table = function () {
    return $(this).each(function () {
        var grid = this;
        $(this).find("a.newRow").click(function () {
            $(grid).Grid_Table_Newrow();
            $(grid).find('tr.tmpl').hide();
            return false;
        }).end().find('tr.tmpl').click(function () {
            if ($(this).hasClass('tmpl')) {
                $(grid).Grid_Table_Newrow();
                $(this).hide();
            }
        });
        $(this).Grid_Table_Editable();
    });
}

$.fn.Grid_Table_Newrow = function (values) {
    var grid = $(this)[0];
    var tr = $(grid).children('tbody').children('tr.tmpl');
    tr = tr.clone(true).show().removeClass('tmpl').insertBefore(tr);
    
    $(grid).trigger('newRow', [tr]);
    tr.find('[ef]').each(function () {
        var v = (values) ? values[$(this).attr('cn')] : '';
        $(this).val(v).attr("name", $(this).attr("ef").replace("[-1]", "[" + ($(grid).children('tbody').children('tr').size() - 3) + "]"));
        if (v) $(this).trigger('change', [tr]);
    });
    tr.find('input').first().focus();
    return tr;
}

$.fn.Grid_Table_Delrow = function (tr) {
    return this.each(function () {
        var grid = $(this)[0];
        var rowIndex = tr[0].rowIndex;
        
        tr.remove();
        if ($(grid).children('tbody').children('tr:not(.tmpl):not(.newRow)').size() == 0) 
            $(grid).children('tbody').children('tr.tmpl').show();

        $(grid).children('tbody').children('tr:not(tmpl):not(newRow)').slice(rowIndex).each(function () {
            var tr1 = this;
            $(this).find('[cn]').each(function () {
                var name = $(this).attr('name'); var reg = /\[(\d+)\]/i;
                name = name.replace(reg, '[' + (parseInt(tr1.rowIndex)) + ']');
                $(this).attr('name', name).attr('id', name);
            });
        });
    });
}

$.fn.Grid_Table_Editable = function () {
    return $(this).each(function () {
        $("#ctEditHead").tmpl(null).insertBefore($(this).find("thead>tr>th:first"));
        $("#ctEditBody").tmpl({ tmpl: true }).insertBefore($(this).find("tbody>tr:not(.newRow)>td:first-child"));

        var grid = this;
        if ($(grid).find('tbody tr:not(.tmpl):not(.newRow)').size() > 0) $(grid).find('tr.tmpl').hide();
        $(this).find('tbody a.delRow').click(function () {
            if (confirm('确认要删除吗?')) {
                var tr = $(this).closest('tr');
                $(grid).Grid_Table_Delrow(tr);
            }
            return false;
        });
    });
}