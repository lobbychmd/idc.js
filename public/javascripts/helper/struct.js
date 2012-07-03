//将字段表格的索引信息同步到索引表格
$.fn.syncIndex = function (indexName, indexTable, newIndexName, del) {
    var tr = indexTable.find('[name$=".IndexName"]').filter(function () { return $(this).val() == indexName }).closest('tr');
    if (del) {
        tr.remove();
    }
    if (tr.size() == 0) tr = indexTable.Grid_NewRow();

    tr.find('[name$=".IndexName"]').val(newIndexName ? newIndexName : indexName);
    var cols = [];
    $(this).find('td._index[indexName=' + indexName + '] .idxCol').sort(function (a, b) {
        if ($(a).val() > $(b).val()) return 1; else return -1;
    }).each(function () {
        if ($(this).val()) {
            var columnName = $(this).closest('tr').find('[name$=".ColumnName"]').val();
            cols.push(columnName);
        }
    });
    tr.find('[name$=".Columns"]').val(cols.join(';'));

    //同步索引类型
    var indexType = $('[aria-pressed=true]').text(); //面板没创建之前娶不到
    if (!indexType) indexType = $(this).find('th._index[indexName=' + indexName + ']').attr('keyType');
    //alert(indexType);
    var c = tr.find('[name$=".IsUnique"]');
    if (indexType == 'PK' || indexType == 'U') c.attr('checked', 'checked'); else c.removeAttr('checked');
    c = tr.find('[name$=".PrimaryKey"]');

    if (indexType == 'PK') c.attr('checked', 'checked'); else c.removeAttr('checked');
}

//设置索引的 input 的行为
$.fn.idxCol = function (grid, init, checked) {
    return this.each(function () {
        var input = $(this);
        if (init)//初始化
            input.css('width', '10px').css('cursor', 'pointer').css('font-size', '0.8em').css('border', '1px solid #eee');
        else {
            if (checked == undefined) { //反向选择
                var indexName = $(this).closest('td').attr('indexName');
                var count = grid.find('tbody td[indexName=' + indexName + ']').filter(function(){
                    return $(this).find('.idxCol').val();
                }).size() + 1;
                
                if (!input.val()) {
                    input.css('border', '1px solid red').val(count);
                }
                else {
                    var oldValue = parseInt(input.val());
                    input.val(null).css('border', '1px solid #eee');
                    //消除不连续的序号
                    grid.find('tbody td[indexName=' + indexName + '] .idxCol').each(function () {
                        if ($(this).val()) if (parseInt($(this).val()) > oldValue) $(this).val(parseInt($(this).val()) - 1);
                    });
                }

                //                alert(count);
            }
            else if (checked) input.val(1);
            else input.val(null);
        }
    });
}

//索引的设置面板
$.fn.indexPanel = function (indexTable, th, quit) {
    var grid = $(this);
    var panel = grid.find('div.indexPanel');
    if (quit) {
        panel.hide();
        panel.closest('th').find('a').show();
    }
    else {
        if (panel.size() == 0) {
            panel = $('<div class="indexPanel"><input class="indexName" size=11/><a href="#" class="delIndex" style="text-decoration:none">×</a><div id="radio">' +
		                    '<input type="radio" id="radio1" name="radio" /><label for="radio1">PK</label>' +
		                    '<input type="radio" id="radio2" name="radio" /><label for="radio2">I</label>' +
		                    '<input type="radio" id="radio3" name="radio" /><label for="radio3">U</label>' + '</div></div>')
                    .find('input.indexName').css('border', "2px solid #73A6FF").css('margin', "0px 2px").keydown(function (event) {
                        th = $(this).closest('th');
                        if (event.which == 13) {
                            var newIndexName = $(this).val();
                            grid.syncIndex(th.attr('indexName'), indexTable, newIndexName);
                            th.attr('indexName', newIndexName);
                            grid.indexPanel(indexTable, th, true);
                            return false;
                        }
                        else if (event.which == 27) {
                            grid.indexPanel(indexTable, th, true);
                            return false;
                        }
                    }).end().find('#radio').buttonset().end().find('[name=radio]').click(function () {
                        grid.syncIndex(th.attr('indexName'), indexTable);
                    }).end().find('a.delIndex').click(function () {
                        var indexName = $(this).closest('th').attr('indexName');
                        grid.find('td[indexName=' + indexName + ']').remove();
                        grid.syncIndex (indexName, indexTable, null, true);
                        th.remove();                        
                        return false;
                    }).end();
        }
        else panel.show();
        panel.find('input').val(th.attr('indexName')).focus().select().end().find('[name=radio]').click(function () {
            grid.syncIndex(th.attr('indexName'), indexTable);
        }).each(function () {
            if ($(this).next().text() == th.attr('keyType')) {
                $(this).next().attr('aria-pressed', 'true').addClass('ui-state-active');
                $(this).attr('checked', 'checked');
            }
            else {
                $(this).next().removeAttr('aria-pressed').removeClass('ui-state-active');
                $(this).removeAttr('checked');
            }
        });
    }
    panel.appendTo(th).focus();
}

//在主表格增加一个索引 （th 和 td）
$.fn.addIndex = function (indexName, indexTable, cols, keyType) {
    var grid = $(this);
    $("<th class='_index'><a href='#'>I</a></th>").attr("indexName", indexName).attr("keyType", keyType).attr("alt", indexName).insertBefore(grid.find("th._addIndex")).find('a')
        .css('text-decoration', 'none').click(function () {
            //调出控制面板以便修改索引名称和类型
            var th = $(this).closest('th');
            grid.indexPanel(indexTable, null, true); //先隐藏
            grid.indexPanel(indexTable, th);
            $(this).hide();
            return false;
        });

    //创建选择索引字段的框框
    $("<td class='_index'><input class='idxCol' /></td>").attr("indexName", indexName).appendTo(grid.find('tbody tr')).find('input').click(function () {
        $(this).idxCol(grid, false);
        var idxName = $(this).closest('td').attr("indexName");
        grid.syncIndex(indexName, indexTable);
    }).idxCol(grid, true); //初始化框框

    //根据现有数据填充框框
    for (var c in cols) {
        grid
            .find('tbody [name$=".ColumnName"][value=' + cols[c] + ']').closest('tr') //行
            .find('td._index[indexName=' + indexName + ']') //列
        .find('input.idxCol').idxCol(grid, false);
    }
}

//入口
$.fn.mergeIndex = function (indexTable) {
    indexTable = $(indexTable).hide();  //隐藏索引的table
    return this.each(function () {
        var grid = $(this);

        $("<th class='_addIndex'><a style='text-decoration:none' href=#>+</a></th>").appendTo(grid.find('thead tr')).find('a').click(function () {
            var indexName = "i_" + Math.random().toString().substring(2, 10); //随机获取字段名
            grid.addIndex(indexName, indexTable, [], 'I');
            grid.syncIndex(indexName, indexTable); //同步至索引的 table
            return false;
        });
        //$("<td class='_addIndex'></td>").appendTo(grid.find('tbody tr'))

        grid.find('[name$=".ColumnName"]').change(function () {
            //字段名发生变化的时候同步所有索引
            grid.find('thead th._index').each(function () {
                var indexName = $(this).attr('indexName');
                grid.syncIndex(indexName, indexTable);
            });
        });

        grid.bind("OnDelRow", function (ui, tr) {
            //删除字段的时候，先从索引里面去除
            $(tr).find('td._index').each(function () {
                var input = $(this).find('.idxCol');
                if (input.val()) input.click();
            });
        });

        //将已有索引同步至主表格(初始化)
        indexTable.find('tbody tr:not(.tmpl)').each(function () {
            grid.addIndex(
                $(this).find('[name$=".IndexName"]').val(),
                indexTable,
                $(this).find('[name$=".Columns"]').val().split(';'),
                $(this).find('[name$=".PrimaryKey"]').attr('checked') ? "PK" : ($(this).find('[name$=".IsUnique"]').attr('checked') ? "U" : "I")
            );
        });
    });
}