var sqlHelper = function (table) { 
    this.meta = table;
}

sqlHelper.prototype = {
    constructor: sqlHelper,
    lock: function () {
        return _.find(this.meta.Columns, function (i) { return i.ColumnName == "dLastUpdateTime"; }) ? "and \n  DATEDIFF(ms, :Old_LastUpdateTime, LastUpdateTime) between 0 and 1000" : "";
    },
    select: function (fields) {
        return "select \n" +
                $.map(fields, function (value, index) { return "  " + value.substring(1) + " = " + value; }).join(", \n")
                + "\n  from " + this.meta.TableName +
                "\n where \n" +
                $.map(
                    _.filter(this.meta.Columns, function (i) { return i.PK; }),
                    function (value, index) { return "  " + value.ColumnName + " = :" + value.ColumnName.substring(1); }).join(", \n");
    },
    insert: function (fields) {
        return "insert  " + this.meta.TableName + "\n  (" +
                 fields.join(", ") +
                ")\n  values\n  (" +
                $.map(fields,
                    function (value, index) { return ":" + value.substring(1); }).join(", ")
                + ")";
    },
    update: function (fields) { return this.u(fields) + this.lock(); },
    u: function (fields) {
        return "update " + this.meta.TableName + "set \n" +
                 $.map(fields,
                    function (value, index) { return "  " + value + " = :" + value.substring(1); }).join(", \n")
                + "\n where\n  " +
                $.map(
                    _.filter(this.meta.Columns, function (i) { return i.PK; }),
                    function (value, index) { return "  " + value.ColumnName + " = :" + value.ColumnName.substring(1); }).join(", \n");
    },
    "delete": function (fields) { return this.d(fields) + this.lock(); },
    "d": function () {
        return "delete from " + this.meta.TableName + "\n" +
                $.map(
                    _.filter(this.meta.Columns, function (i) { return i.PK; }),
                    function (value, index) { return "  " + value.ColumnName + " = :" + value.ColumnName.substring(1); }).join(", \n");
    },
    IUD: function (fields) {
        return "if :UpdateFlag = 'I'\n" + 
        _.map( this.insert(fields).split("\n"), function(i){return "  " + i;}).join("\n") + 
            "\nelse if :UpdateFlag = 'U'\n" + 
            _.map( this.u(fields).split("\n"), function(i){return "  " + i;}).join("\n") + 
            "\nelse if :UpdateFlag = 'D'\n" +  
            _.map( this.d(fields).split("\n"), function(i){return "  " + i;}).join("\n") ;
    }
}