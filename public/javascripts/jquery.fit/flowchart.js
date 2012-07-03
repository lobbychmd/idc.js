

function showPos(flowName) {
    $('#msg').children().remove();
    for (var i in icon[flowName]) {
        $("<p>" + i + "(" + icon[flowName][i].title + ")" + ": [" + icon[flowName][i].position[0] + ", " + icon[flowName][i].position[1] + "]</p>").appendTo('#msg');

    }
    for (var i in line[flowName]) {
        $("<p>line from " + line[flowName][i].start + " to " + line[flowName][i].end + "</p>").appendTo('#msg');
    }
}

$.fn.dragItem = function (flowName) {
    return this.each(function () {
        //$(this).draggable({ scroll: true, containment: '#flow' + flowName + ' #icon',
        $(this).draggable({ scroll: true, containment: '#icon',
            stop: function (event, ui) {
                var name = $(this).attr('name');
                icon[flowName][name].position[0] = ui.position.left;
                icon[flowName][name].position[1] = ui.position.top;
                showPos(flowName);
                drawLine(flowName);
            }
        }).find('a.lineTo').click(function () {
            //var lineBegin = $('#flow' + flowName + ' #icon').find('a.lineTo.lineBegin');
            var lineBegin = $('#icon').find('a.lineTo.lineBegin');
            if (lineBegin.size() == 0) { //开始连线
                //$('#flow' + flowName + ' #icon').find('.ctNode').addClass('lining');
                $('#icon').find('.ctNode').addClass('lining');
                $(this).addClass('lineBegin');
            } else {
                if (lineBegin[0] == this) { //取消连线

                }
                else { //连线完成
                    var start = $(lineBegin).parent().parent().parent().attr('name');
                    var end = $(this).parent().parent().parent().attr('name');
                    var canLine = true;
                    for (var l in line[flowName]) {
                        if (((line[flowName][l].start == start) && (line[flowName][l].end == end)) ||
                                ((line[flowName][l].end == start) && (line[flowName][l].start == end))) {
                            canLine = false;
                            alert('连线已经存在');
                            break;
                        }
                    }
                    if (canLine) {
                        line[flowName].push({ start: start, end: end });
                        showPos(flowName);
                        drawLine(flowName);
                    }
                }
                //$('#flow' + flowName + ' #icon').find('.ctNode').removeClass('lining').end().find('a.lineTo').removeClass('lineBegin');
                $('#icon').find('.ctNode').removeClass('lining').end().find('a.lineTo').removeClass('lineBegin');
            }
            return false;
        }).end().find('a.del').click(function () {
            if (confirm("确认要删除节点吗?")) {
                var name = $(this).parent().parent().parent().attr('name');
                delete (icon[flowName][name]);
                $(this).parent().parent().parent().remove();
                for (var l in line[flowName]) {
                    if ((line[flowName][l].start == name) || (line[flowName][l].end == name)) {
                        delete (line[flowName][l]);
                    }
                }
                drawLine(flowName);
                showPos(flowName);
            }
            return false;
        }).end().find('a.module').click(function () {
            var a = $(this);
            var name = $(this).parent().parent().attr('name');
            if (!$('#tabs').hasClass('edit')) {
                if ($(this).attr('url') && ($(this).attr('url') != "null"))
                    window.location = $(this).attr('url');
                else if ($(this).attr('module') && ($(this).attr('module') != "null"))
                    window.location = $(this).attr('href');
            }
            else {
                $('div.dialog').remove();
                var dialog = $('<div class="dialog">dialog</div>').load($.r('/home/editNode'), function () {
                    dialog.find('input#txt').val($(a).text());
                    dialog.find('input#url').val($(a).attr('url'));
                    dialog.find('select#modules').val($(a).attr('module'));
                    dialog.find('select#typ').val($(a).attr('typ'));
                }).appendTo('body').dialog({ modal: true, width: 400,
                    buttons: {
                        Ok: function () {
                            var title = $('div.dialog input#txt').val();
                            var module = $('div.dialog select#modules').val();
                            var url = $('div.dialog input#url').val();
                            var typ = $('div.dialog #typ').val();
                            a.text(title);
                            a.attr('module', module).attr('typ', typ).parent().find('img.img').attr('src', '/content/images/flowchart/' + typ + '.png');
                            a.attr('href', url ? url : '/m/query/' + module + '/Query');
                            icon[flowName][name].title = title;
                            icon[flowName][name].module = module;
                            icon[flowName][name].url = url;
                            icon[flowName][name].type = typ;
                            $(this).dialog("close");
                            showPos();
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });
            }
            return false;
        });
    });
}
function draw(flowName) {

    var idx = 0;
    for (var i in icon[flowName]) {

        var x = icon[flowName][i].position[0], y = icon[flowName][i].position[1];
        //alert(icon[flowName][i].misHref);
        //$('#ctNode').tmpl(icon[flowName][i]).appendTo('#flow' + flowName + ' #icon')
        $('#ctNode').tmpl(icon[flowName][i]).appendTo('#icon')
        //.css('margin-left', (idx * -32) + "px")
                .css('left', x).css('top', y)
                    .dragItem(flowName);
        idx++;

    }

}
function drawLine(flowName) {

    //var canvas = $('#flow' + flowName + '  #canvas')[0];
    var canvas = $('#canvas')[0];
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(0, 0, 800, 610);

        for (var l in line[flowName]) {
            if (l == selLine) ctx.strokeStyle = "rgb(255,0,0)";
            else ctx.strokeStyle = "#666";
            ctx.beginPath();
            var x1 = icon[flowName][line[flowName][l].start].position[0] + 32;
            var y1 = icon[flowName][line[flowName][l].start].position[1] + 32;
            var x2 = icon[flowName][line[flowName][l].end].position[0] + 32;
            var y2 = icon[flowName][line[flowName][l].end].position[1] + 32;
            var t = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
            var angle1 = parseFloat(x1 - x2) / t;
            var angle2 = parseFloat(y2 - y1) / t;
            //alert(angle1);
            var endX = x2 + 48 * angle1;
            var endY = y2 - 48 * angle2;
            ctx.lineWidth = 2;
            drawArrowLine_dir(ctx, x1 - 48 * angle1, y1 + 48 * angle2, endX, endY);

            var angleA = Math.atan(parseFloat(y1 - y2) / parseFloat(x1 - x2)) * 360 / Math.PI;
            if (x2 > x1) {
                angleA = angleA + 120; var angleB = angleA + 120;
            } else {
                angleA = angleA - 120; var angleB = angleA - 120;
            }
            ctx.lineTo(endX - Math.sin(angleA * Math.PI / 360) * 8, endY + Math.cos(angleA * Math.PI / 360) * 8);
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - Math.sin(angleB * Math.PI / 360) * 8, endY + Math.cos(angleB * Math.PI / 360) * 8);

            ctx.stroke();
            //ctx.strokeStyle = "#fff solid";
            //ctx.stroke();

        }
    }
}

function AfterLoadFlow(flowName) {

    //alert(1);
    //---------------------
    $('#icon').children().remove();
    var canvas = $('#canvas')[0];
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        //ctx.clearRect();
    }

    showPos(flowName);

    draw(flowName);
    drawLine(flowName);

    $('.flowInfo').find('[type=button]').button();
    //$('#flow' + flowName + ' #icon').dblclick(function (event) {
    $('#icon').dblclick(function (event) {
        selLine[flowName] = -1;
        for (var l in line[flowName]) {
            var x1 = icon[flowName][line[flowName][l].start].position[0] + 32;
            var y1 = icon[flowName][line[flowName][l].start].position[1] + 32;
            var x2 = icon[flowName][line[flowName][l].end].position[0] + 32;
            var y2 = icon[flowName][line[flowName][l].end].position[1] + 32;
            var x3 = event.offsetX;
            var y3 = event.offsetY;
            var angle1 = Math.atan(parseFloat(x1 - x2) / parseFloat(y1 - y2));
            var angle2 = Math.atan(parseFloat(x1 - x3) / parseFloat(y1 - y3));
            // alert(angle1 + "\n" + angle2);
            //  alert(x2 + " " + y2 + "\n" + x3 + " " + y3);
            if (Math.abs(angle1 - angle2) < 0.2) {
                selLine[flowName] = l;
                if (confirm('要删除此连线吗？')) {
                    delete (line[flowName][l]);
                }
                break;
            }
        }
        drawLine(flowName);
    });

    $('#flow' + flowName + ' .btnDel').click(function () {
        if (confirm('确认要删除流程吗?'))
            $.post('/home/delFlow/' + flowName, null, function (data) {
                var r = $.HandleActionResult(data);
                if (typeof r == "string") {
                    if (r) alert(data);
                    else window.location = window.location.toString();
                }
            })
    });
    $('#flow' + flowName + ' .btnSave').click(function () {

        var newName = $('#flow' + flowName + ' #flowName').val();
        var userNO = $('#flow' + flowName + ' #userNO').val();
        if (!(newName)) {
            alert('请输入流程名字');
            return false;
        }
        var data = [{ name: 'FlowName', value: newName }, { name: 'UserNO', value: userNO}];

        var msg = "---------------\n";
        var ii = 0;
        for (var i in icon[flowName]) {
            data.push({ name: "Nodes[" + ii + "].Key", value: i });
            msg += "节点：" + icon[flowName][i].title + "\n";
            for (var j in icon[flowName][i]) {
                if (j == "position") {
                    data.push({ name: "Nodes[" + ii + "].Value.position[0]", value: icon[flowName][i][j][0] });
                    data.push({ name: "Nodes[" + ii + "].Value.position[1]", value: icon[flowName][i][j][1] });
                }
                else data.push({ name: "Nodes[" + ii + "].Value." + j, value: icon[flowName][i][j] });
            }
            ii++;
        }

        ii = 0;
        msg += "\n---------------\n";
        for (var i in line[flowName]) {
            data.push({ name: "Lines[" + ii + "].start", value: line[flowName][i].start });
            data.push({ name: "Lines[" + ii + "].end", value: line[flowName][i].end });
            msg += "连线：" + icon[flowName][line[flowName][i].start].title + " - " + icon[flowName][line[flowName][i].end].title + "\n";
            ii++;
        }

        if (confirm("确认更新以下数据吗？\n" + msg)) {
            $.post('/home/saveFlow/' + flowName, data, function (data) {
                $.HandleActionResult(data, function (r) {
                    if (typeof r == "string") {
                        if (r) alert(data);
                        else window.location = window.location.toString();
                    }
                });
            })
        }
    });

}

 function drawArrowLine_dir(context, x1, y1, x2, y2) {
    context.moveTo(x1, y1);
    context.lineTo(x2, y2); //斜线
    
}

function drawArrowLine_ret(context, x1, y1, x2, y2) {
    context.moveTo(x1, y1);
    context.lineTo(x1, y2);
    context.lineTo(x2, y2); 
}