metaTypes = ["MetaProject", "MetaModule", "MetaBiz", "MetaQuery"];
metaObjectConfig = {
    _base: {
        _id: { caption: "id", readonly: true },
        Version: { caption: "版本", readonly: true },
        ProjectName: { caption: "所属项目", readonly: true },
        HashCode: { caption: "校验码", readonly: true }
    },
    Project: {
        DBConnectionString: { caption: '数据库连接' }
    },
    MetaTheme: {
        Theme: { caption: "主题名称" },
        LayoutUI: { caption: "界面配置", editor: 'textarea', scriptType: 'application/json' },
        StyleSheet: { caption: "样式", type: "MetaThemeStyle" }
    },
    MetaQuerySrv: {
        SrvCode: { caption: "服务ID" },
        Name: { caption: "服务名称" },
        QueryName: { caption: '查询名称' },
        //SrvType: {caption: '服务类型', editor:'select', selection: [{ key: "Query", value: "查询" }, { key: "Biz", value: "业务逻辑"}], show:false},
        Summary: {caption: "服务描述", editor:"textarea", scriptType: 'application/json' }
    },
    MetaBizSrv: {   
        SrvCode: { caption: "服务ID" },
        Name: { caption: "服务名称" },
        BizID: { caption: "业务逻辑ID" },
        Summary: {caption: "服务描述", editor:"textarea", scriptType: 'application/json' }
    },
    MetaDataPublishSrv: {
        SrvCode: { caption: "服务ID" },
        Name: { caption: "服务名称" },
        QueryName: { caption: "查询名称" },
        IdField: {caption: "数据流水字段"}
    },
    MetaExternalSrv:{
        SrvCode: { caption: "服务ID" },
        Name: { caption: "服务名称" },
        SrvType: { caption: "服务类型", editor:'select', selection: [{ key: "NC", value: "用友财务接口" }, { key: "XS", value: "新生网络"}] },
        URI: {caption: "服务地址"},
        SrvParams: {caption: "其它参数", editor:"textarea", scriptType: 'application/json' }
    },
    MetaDataSubscribeSrv: {
        Name: { caption: "订阅服务名称" },
        SrvCode :{caption: "订阅服务代码"},
        Interval: { caption: "时间间隔" },
        IntervalUnit: { caption: "时间间隔单位", editor:'select', selection: [{ key: "mi", value: "分钟" }, { key: "hh", value: "小时"}, { key: "dd", value: "天"}, { key: "mm", value: "月"}, { key: "yy", value: "年"}]  },
        
        Items: { caption: "队列明细", type: "MetaDataSubscribeSrvItem" }
    },
    MetaDataSubscribeSrvItem: {
        QueueIdx: { caption: "调用顺序", lineShow: true, identity: true, maxLength: 3 },
        Enabled: { caption: "启用", lineShow: true, editor: 'checkbox'},
        SourceSrv: { caption: "数据发布服务", reference1: { type: "MetaPublishSrv", join: "SrvCode" }, lineShow: true },
        DestinationSrv: { caption: '接收方服务', lineShow: true },
        DestSrvParams: { caption: '接收方服务参数', editor:"textarea", scriptType: 'application/json'  }
    },
    MetaConnection: {
        Alias: { caption: "连接别名" },
        Summary: { caption: "连接说明", editor: 'textarea' }
    },
    MetaThemeStyle: {
        StyleSection: { caption: '控件', lineShow: true },
        StyleContent: { caption: '样式', editor: "textarea", scriptType: 'application/json' }
    },
    MetaModule: {
        Caption: { caption: "模块名称" },
        ModuleID: { caption: "模块编号" },
        ParentID: { caption: "上层模块编号" },
        Path: { caption: "模块路径(Url)" },
        Queryies: { caption: "所用查询" },
        Bizes: { caption: "所用业务逻辑" },
        ModulePages: { caption: "页面", type: "ModulePage" },
        Functions: { caption: "权限", type: "ModuleFunc", reference: { type: "MetaFunction", join: "FuncID"} }
    },
    ModulePage: {
        PageID: { caption: '页面ID', lineShow: true },
        PageType: { caption: '页面类型', editor: "select", selection: [{ key: "0", value: "查询" }, { key: "1", value: "录入"}], lineShow: true },
        PageParams: { caption: '页面参数', scriptType: 'application/json', editor: "textarea" },
        UI: { caption: '界面配置', editor: 'textarea', scriptType: 'application/json' },
        Queries: { caption: '所用查询', maxLength: 100, editor: 'textarea' },
        PageFlow: { caption: '流程定义', editor: 'textarea', scriptType: 'application/json', jsonType: "FlowItem" },
        PageLookup: { caption: '关联信息定义', editor: 'textarea', scriptType: 'application/json' }
    },
    FlowItem: {
        ID: { caption: '流程ID', lineShow: true },
        Summary: { caption: '流程名称', lineShow: true },
        Description: { caption: '描述', editor: 'textarea' },
        State: { caption: '状态', lineShow: true, editor: 'select', selection: [{ key: "fsNew", value: "新增" }, { key: "fsNormal", value: "普通" }, { key: "fsAuditing", value: "审核中" }, { key: "fsAudited", value: "审核完"}] },
        Action: { caption: '操作', type: 'FlowItemAction' },
        BlackList: { caption: '黑名单' },
        WhiteList: { caption: '白名单' }
    },
    FlowItemAction: {
        Summary: { caption: '名称', LineShow: true },
        Biz: { caption: '业务逻辑', LineShow: true },
        Description: { caption: '描述' }

    },
    ModuleFunc: {
        FuncID: { caption: '权限ID', lineShow: true }
        //FuncName: {caption:'权限名称', lineShow: true, reference: "FuncName"}
    },
    PageFlow: {
        FuncID: { caption: '权限ID' },
        FuncName: { caption: '权限名称' }
    },
    MetaBiz: {
        BizID: { caption: "业务逻辑ID" },
        ConnAlias: { caption: "数据连接" }
    },
    MetaBiz: {
        BizID: { caption: "业务逻辑ID" },
        ConnAlias: { caption: "数据连接" },
        Checks: { caption: "业务检查", type: 'BizCheck' },
        Scripts: { caption: "业务过程", type: 'BizScript' },
        Params: { caption: "业务参数", type: 'BizParam' }
    },
    BizCheck: {
        CheckIdx: { caption: '序号', lineShow: true, identity: true, maxLength: 3 },
        CheckEnabled: { caption: '启用', lineShow: true, editor: "checkbox" },
        ParamToValidate: { caption: '检查参数', lineShow: true, selection: "@Params.ParamName" },
        CheckSummary: { caption: '描述', lineShow: true },
        CheckRepeated: { caption: '重复执行', editor: "checkbox" },
        Type: { caption: '检查类型', editor: "select", selection: [{ key: "Required", value: "必须录入" }, { key: "CompareTo", value: "比较" }, { key: "Query", value: "存在于查询中" }, { key: "SQL", value: "返回ResultCode=0"}] },
        CompareType: { caption: '比较类型', editor: "select", selection: [{ key: "=", value: "相等" }, { key: ">", value: "大于" }, { key: ">=", value: "大于等于" }, { key: "<", value: "小于" }, { key: "<=", value: "小于等于" }, { key: "<>", value: "不等于"}] },
        ParamToCompare: { caption: '比较参数', selection: "@Params.ParamName" },
        CheckUpdateFlag: { caption: '检查标志', editor: 'select', selection: [{ key: "UpdateFlag", value: 'UpdateFlag' }, { key: "UpdateFlag2", value: 'UpdateFlag2' }, { key: "UpdateFlag3", value: 'UpdateFlag3' }, { key: "UpdateFlag4", value: 'UpdateFlag4' }, { key: "UpdateFlag5", value: 'UpdateFlag5'}] },
        CheckExecuteFlag: { caption: '检查执行标志', editor: 'select', selection: [{ key: "IUD", value: "增删改" }, { key: "IU", value: "增改" }, { key: "ID", value: "增删" }, { key: "UD", value: "删改" }, { key: "I", value: "增" }, { key: "U", value: "改" }, { key: "D", value: "删"}] },
        CheckSQL: { caption: '检查SQL脚本', editor: "textarea", scriptType: 'text/x-plsql' }
    },
    BizScript: {
        ProcIdx: { caption: '序号', lineShow: true, identity: true, maxLength: 3 },
        ProcEnabled: { caption: '启用', lineShow: true, editor: "checkbox" },
        ProcSummary: { caption: '摘要说明', lineShow: true },
        InterActive: { caption: '交互', editor: "checkbox" },
        ProcRepeated: { caption: '重复执行', editor: "checkbox" },
        ExpectedRows: { caption: '期望行数' },
        ProcUpdateFlag: { caption: '更新标志', editor: 'select', selection: [{ key: "UpdateFlag", value: 'UpdateFlag' }, { key: "UpdateFlag2", value: 'UpdateFlag2' }, { key: "UpdateFlag3", value: 'UpdateFlag3' }, { key: "UpdateFlag4", value: 'UpdateFlag4' }, { key: "UpdateFlag5", value: 'UpdateFlag5'}] },
        ProcExecuteFlag: { caption: '执行标志', editor: 'select', selection: [{ key: "IUD", value: "增删改" }, { key: "IU", value: "增改" }, { key: "ID", value: "增删" }, { key: "UD", value: "删改" }, { key: "I", value: "增" }, { key: "U", value: "改" }, { key: "D", value: "删"}] },
        ProcSQL: { caption: 'SQL 脚本', editor: "textarea", scriptType: 'text/x-plsql' }
    },
    BizParam: {
        ParamName: { caption: '参数名', lineShow: true, maxLength: 3 },
        ParamRepeated: { caption: '重复', editor: 'checkbox', lineShow: true },
        ParamType: { caption: '参数类型', lineShow: true, editor: 'select', selection: [{ key: 0, value: "字符串" }, { key: 1, value: "数字" }, { key: 2, value: "二进制" }, { key: 3, value: "日期/时间" }, { key: 4, value: "逻辑" }, { key: 5, value: "未知"}] },
        Output: { caption: '输出参数', editor: 'checkbox', lineShow: true }
    },
    MetaQuery: {
        QueryName: { caption: '查询名称' },
        QueryType: { caption: '查询类型', editor: 'select', selection: [{ key: 0, value: "通用查询" }, { key: 1, value: "数据对象"}] },
        ConnAlias: { caption: '数据连接' },
        Scripts: { caption: '查询脚本', type: 'QueryScript' },
        Params: { caption: '查询参数', type: 'QueryParam' }
    },
    QueryParam: {
        ParamIdx: { caption: '参数序号', identity: true, lineShow: true },
        ParamName: { caption: '参数名称', lineShow: true },
        ParamType: { caption: '参数类型', lineShow: true, editor: 'select', selection: [{ key: 0, value: "字符串" }, { key: 1, value: "数字" }, { key: 2, value: "二进制" }, { key: 3, value: "日期/时间" }, { key: 4, value: "逻辑" }, { key: 5, value: "未知"}] },
        ParamGroups: { caption: '参数分组' },
        LikeLeft: { caption: "模糊查询(左)", editor: 'checkbox' },
        LikeRight: { caption: "模糊查询(右)", editor: 'checkbox' },
        IsNull: { caption: '空值替代值(IsNull)' },
        DefaultValue: { caption: '界面默认值' }
    },
    QueryScript: {
        ScriptIdx: { caption: '序号', identity: true, lineShow: true },
        ScriptType: { caption: '脚本类型', lineShow: true, editor: 'select', selection: [{ key: 0, value: "SQL" }, { key: 1, value: "C#"}] },
        MetaColumn: { caption: '字段元数据', readonly: true },
        Script: { caption: '脚本', editor: "textarea", scriptType: 'text/x-plsql' }
    },
    MetaField: {
        FieldName: { caption: '字段名', lineShow: true },
        Context: { caption: '情景', lineShow: true },
        DisplayLabel: { caption: '中文', lineShow: true },
        Regex: { caption: '输入字符约束', lineShow: true },
        Inherited: { caption: '继承自' },
        CharLength: { caption: '字符长度' },
        Selection: { caption: '下拉选择' },
        EditorType: { caption: '编辑框类型', editor: 'select', selection: [{ key: 'STRING', value: '字符' }, { key: 'NUMBER', value: '数字' }, { key: 'DROPDOWNLIST', value: '下拉' }, { key: 'DATETIME', value: '时间' }, { key: 'DATE', value: '日期' }, { key: 'LIST', value: '列表' }, { key: 'BOOLEAN', value: '勾选' }, { key: 'TEXTAREA', value: '多行文本'}] },
        DicNO: { caption: '共通资料ID' }
    },
    MetaFunction: {
        FuncID: { caption: '权限ID', lineShow: true },
        FuncName: { caption: '权限说明', lineShow: true }
    }
}

