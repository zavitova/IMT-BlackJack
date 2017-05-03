var socket = io();

var timerForBit,
    timerForMove,
    timer;

$('.game').hide();

socket.on("showMessageForGame", function (msg){
    $("#messageBoxForGame").html(msg).attr("class", "alert alert-info").show();
});

$("#createNewTable").on('click', createNewTable);

function createNewTable() {
    $("#messageBoxForGame").html('').hide();
    socket.emit("newTable");
}

socket.on("showTables", function (data) {
    var tables = '',
        str;
    $.each(data, function (id, val) {
        str = (val.players.length == 1) ? ' игрок' : ' игрока';
        tables += '<li title="Кликните для присоединения к столу" data-id="' + val._id + '"> Стол : ' + val.players.length + str + '</li>';
    });
    $("#tablesContainer").html(tables);
});

$("#tablesContainer").on('click', 'li', joinThisTable);

function joinThisTable() {
    $("#messageBoxForGame").html('').hide();
    var wantJoin = confirm("Вы хотите присоедениться к " + $(this).html());
    if (wantJoin) socket.emit('joinThisTable', { tableId: $(this).attr('data-id')});
}


socket.on("showStartGame", function () {
    $('#startGame').show();
});

function clearPlayersOnTable() {
    var elm;
    for (var ind = 0; ind < 5; ind++) {
        elm = $('#player-' + (ind + 1));
        elm.children('.bet').children('span').html('');
        elm.children('.points').children('span').html('');
        elm.children('.playerInfo').children('.avatar').children('img').attr('src', '');
        elm.children('.playerInfo').children('.name').html('');
        elm.children('.hand').html('');
        elm.removeClass('activePlayer');
    }
}

function clearTable() {
    var elm;
    clearPlayersOnTable();
    elm = $("#croupier");
    elm.children('.points').children('span').html('');
    elm.children('.hand').html('');
    if (timerForBit) {
        clearInterval(timerForBit);
        timerForBit = null;
    }
    if (timerForMove) {
        clearInterval(timerForMove);
        timerForMove = null;
    }
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    $('#messageBox').html('').hide();
}
socket.on("goToTable", function () {
    $('.lobby').hide();
    clearTable();
    $('.game').show();
    $('#chip-container').hide();
    $('#dialog').hide();
});

socket.on("showBalance", function (data) {
    $('#playerBalance').html(data.playerBalance);
});


socket.on("showPlayers", function (data) {
    clearPlayersOnTable();
    var players = '';
    $.each(data, function (ind, val) {
        var elm = $('#player-' + (ind + 1));
        if (val.isPlaying) {
            players += '<li>' + val.player + '</li>';
            elm.children('.bet').children('span').html(val.bet);
            elm.children('.points').children('span').html(val.points);
            elm.children('.playerInfo').children('.avatar').children('img').attr('src', val.avatarFile);
            elm.children('.playerInfo').children('.name').html(val.fullName);
            var elmCards = elm.children('.hand');
            elmCards.html('');
            $.each(val.hand, function (ind, card) {
                showCard(ind, card, elmCards)
            })
        } else {
            elm.children('.playerInfo').children('.name').html("Не играет");
            elm.children('.hand').html('');
        }
    });
    $('#playersContainer').html(players);
});

socket.on("showCroupier", function (croupier) {
    var elm = $("#croupier");
    elm.children('.points').children('span').html(croupier.points);
    var elmCards =elm.children('.hand');
    elmCards.html('');
    $.each(croupier.hand, function (ind, card) {
        showCard(ind, card, elmCards)
    })
});

socket.on("showMessage", function (msg) {
    $("#messageBox").html(msg).attr("class", "alert alert-danger").show();
    clearInterval(timer);
    timer = setTimeout(function () {
        $("#messageBox").hide();
    }, 2000)
});

$("#startGame").on('click', function () {
    socket.emit("startGame");
    $('#startGame').hide();
});

$("#quitGame").on('click', function () {
    if (timerForBit) {
        clearInterval(timerForBit);
        socket.emit("acceptBets");
        timerForBit = null;
    }
    if (timerForMove) {
        clearInterval(timerForMove);
        socket.emit('continueGame');
        timerForMove = null;
    }
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    $("#messageBox").hide();
    socket.emit("quitGame");
});

socket.on("quitGame1", function () {
    $('.lobby').show();
    $('.game').hide();
});