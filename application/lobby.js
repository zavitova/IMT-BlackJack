module.exports = function(io, Table, userModel){

    io.on("connection", function(socket){
        console.log("socket " + socket.id + " connected");

        if (!socket.request.session.user) {
            socket.emit("showMessageForGame", "Вы не зарегистрированы. Зарегистрируйтесь.");
        }


        socket.join('lobby');
        showTablesForLobby();

        socket.on('newTable', function () {
            var table = new Table(),
                userId = socket.request.session.user._id,
                room = 'table-' + table._id;
            userModel.findById(userId, function (req, user) {
                if (user.local.gameTableId) {
                    socket.emit("showMessageForGame", "Можно играть только за одним столом.");
                } else {
                    user.setGameTableId(table._id);
                    user.save();
                    table.addPlayer(user, socket.id);
                    table.save(function () {
                        socket.request.session.table = table;
                        socket.leave('lobby');
                        socket.join(room);
                        socket.emit("goToTable");
                        socket.emit("showBalance", {playerBalance: user.local.balance});
                        socket.emit("showPlayers", table.players);
                        socket.emit("showStartGame");
                        showTablesForLobby();
                    });
                }
            });
        });

        socket.on('joinThisTable', function (data) {
            if (socket.request.session.user) {
                var userId = socket.request.session.user._id;
                Table.findById(data.tableId, function (req, table) {
                    userModel.findById(userId, function (req, user) {
                        if (user.local.gameTableId) {
                            socket.emit("showMessageForGame", "Можно играть только за одним столом.");
                        } else {
                            console.log(user.local.gameTableId);
                            user.setGameTableId(table._id);
                            user.save();
                            if (table) {
                                var room = 'table-' + table._id;
                                socket.request.session.table = table;
                                socket.leave('lobby');
                                socket.join(room);
                                table.addPlayer(user, socket.id);
                                table.save(function () {
                                    socket.emit("goToTable");
                                    socket.emit("showBalance", {playerBalance: user.local.balance});
                                    io.sockets.in(room).emit("showPlayers", table.players);
                                    showTablesForLobby();
                                });
                            }
                        }
                    });
                });
            }
        });

    });

    function showTablesForLobby() {
        Table.findActiveTables(function (req, tables) {
            io.sockets.in('lobby').emit("showTables", tables);
        });
    }
}