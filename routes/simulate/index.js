
exports.index = function (req, res) {
    return require("./" + req.params.metaType).index(req, res);
}