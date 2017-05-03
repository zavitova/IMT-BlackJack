var mongoose = require('mongoose');
var shuffle = require('shuffle-array');
var cardsArr = require('./cards');

var tableSchema = mongoose.Schema({

    cards: {
        type: Array,
        default: shuffleCardsArr
    },
    arhCards: Array,
    croupier: {
        hand: Array,
        points: {
            type: Number,
            default: 0
        }
    },
    players: [{
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fullName: {
            type: String,
            default: "Аноним"
        },
        avatarFile: String,
        hand: Array,
        balance: Number,
        bet: {
            type: Number,
            default: 0
        },
        points: {
            type: Number,
            default: 0
        },
        socketId: String,
        isPlaying: {
            type: Boolean,
            default: true
        }
    }],
    isTheGame: {
        type: Boolean,
        default: false
    },
    nextPlayer: {
        type: Number,
        default: 0
    }

});

tableSchema.methods.getPlayerBalance = function (userId) {
    var ind = this.players.findIndex(function(i){
        if (i['player'].equals(userId)) {
            return true
        }
    });
    return this.players[ind].balance
};

tableSchema.methods.getPlayerFullName = function (userId) {
    var ind = this.players.findIndex(function(i){
        if (i['player'].equals(userId)) {
            return true
        }
    });
    return this.players[ind].fullName
};

tableSchema.methods.addPlayer = function(user, socketId) {
    if (this.canJoin()) {
        var newPlayer = {
            player: user._id,
            avatarFile: user.local.sampleFile,
            balance: user.local.balance,
            socketId: socketId
        };
        if (user.local.fname || user.local.lname) newPlayer.fullName = user.local.fname + " " + user.local.lname ;
        this.players.push(newPlayer);
    }
};

tableSchema.methods.quitPlayer = function(userId, callback) {
    var ind = this.players.findIndex(function(i){
        if (i['player'].equals(userId)) {
            return true
        }
    });
    var balance = this.players[ind].balance + this.players[ind].bet;
    if (this.isTheGame) {
        this.players[ind].isPlaying = false;
    } else {
        this.players.splice(ind, 1);
    }
    if (this.players.length == 0 || !this.playersIsPresent()) {
        this.remove(callback(balance))
    } else {
        this.save(callback(balance));
    }
};

tableSchema.methods.canJoin = function () {
    if (!this.isTheGame)
        return (this.players.length < 5)
};

tableSchema.methods.startGame = function () {
    this.isTheGame = true;
};


tableSchema.statics.findActiveTables = function(callback){
    return this.find({isTheGame : false}).$where('this.players.length < 5').exec(callback)
};

function shuffleCardsArr() {
    return shuffle(cardsArr)
}

module.exports = mongoose.model('Table', tableSchema);