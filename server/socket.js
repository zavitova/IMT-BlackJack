module.exports = function(io){
//Whenever someone connects this gets executed
    io.on('connection', function(socket){
        console.log(socket.request);


        //Whenever someone disconnects this piece of code executed
        socket.on('disconnect', function () {
            console.log('A user ' + "with socket.id = " + socket.id + ' disconnected');
        });

    });

}
