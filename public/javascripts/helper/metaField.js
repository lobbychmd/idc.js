$(function () {
    var query = $.trim($("#tree li[current]").eq(0).parent().closest('li').parent().closest('li').children('span').text());
    var parent = $("#tree li[current]").parent().closest('li'); //.children('span').text());

    var sel = $("select#Context");


    if ((parent.size() > 1) || $.trim(parent.children('span').text()) == '字段') {
        if (sel.find('option[value=' + query + ']').size() == 0) sel.append($('<option>').text(query).attr('value', query));
    }
    if ((parent.size() > 1) || $.trim(parent.children('span').text()) == '参数') {

        query = query + "_p";
        if (sel.find('option[value=' + query + ']').size() == 0) sel.append($('<option>').text(query).attr('value', query));
    }
});
