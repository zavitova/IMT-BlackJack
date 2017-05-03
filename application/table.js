module.exports = function(io, Table, userModel) {

    io.on('connection', function (socket) {
        socket.on("startGame", function () {
            if (socket.request.session.table) {
                Table.findById(socket.request.session.table._id, function (req, table) {
                    table.startGame();
                    table.save(function () {
                        Table.findActiveTables(function (req, tables) {
                            io.sockets.in('lobby').emit("showTables", tables);
                        });
                        acceptBets(socket);
                    });
                });
            }
        });

        socket.on("continueGame", function () {
            continueGame(socket);
        });


        socket.on("quitGame", function() {
            doQuitGame(socket);
        });
    });

    function doQuitGame(socket) {
        if (socket.request.session.table) {
            var user = socket.request.session.user,
                table = socket.request.session.table,
                room = 'table-' + table._id;
            Table.findById(table._id, function (req, table) {
                if (table) {
                    table.quitPlayer(user._id, function (balance) {
                        userModel.findById(user._id, function (req, user) {
                            user.resetGameTableId(table._id);
                            // user.save();
                            user.updateBalance(balance);
                            user.save();
                        });
                        Table.findActiveTables(function (req, tables) {
                            io.sockets.in('lobby').emit("showTables", tables);
                        });
                        socket.emit("quitGame1");
                        socket.leave(room);
                        socket.join('lobby');
                        io.sockets.in(room).emit("showPlayers", table.players);
                        socket.request.session.table = '';
                    });
                }
            });
        }
    }
};