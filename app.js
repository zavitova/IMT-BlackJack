var server = require("./server");

var mongoose = require("mongoose");
var config = require("./config");
mongoose.connect(config.dbUrl);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	server(mongoose, config.port);
});

