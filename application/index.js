module.exports = function (io, userModel) {
    var Table = require("../models/table.js");
    require("./lobby.js")(io, Table, userModel);
    require("./table.js")(io, Table, userModel);
};