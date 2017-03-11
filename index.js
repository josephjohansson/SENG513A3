/**
 * Created by jose rodriguez 10121643 on 3/10/2017.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});



http.listen(3000, function(){
    console.log('listening on *:3000');
});


var history = [] ;



//Responses for the client requests
io.on('connection', function(socket){
    var socketId = socket.id;
    socket.on('send chat message', function(msg, usr, color){
        var d = new Date();
        var ts = ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
        history.push({user: usr, time: ts, message: msg, color: color});
        io.emit('chat message', socketId, ts, usr, color, msg);

    });
    socket.on('change nick', function(nick){
        var a = "";
        var duplicate = false;
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == socketId){
                for(var x=0;x<users.length;x++){
                    if (users[x].name == nick){
                        duplicate = true
                    }
                }
                if(duplicate == false){
                    users[i].name = nick;
                }
                a = users[i].color

            }
        }
        if(duplicate==false){

            io.to(socketId).emit('username', nick, a, true);
        }
        io.emit('online users', users )
    });

    //change colour
    socket.on('change nickcol',function (nickcol) {
        var a = "";
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == socketId){
                users[i].color = nickcol;
                a = users[i].name;
            }
        }

        io.to(socketId).emit('username', a, nickcol, true);
        io.emit('online users', users);
    });
});

var default_color = "#000000";
var usercount = 1;
var users = [];



//When a new user logs in
io.on('connection', function(socket){

    //get his id
    var socketId=socket.id;

    //give him a default user name based on counter
    var user = 'User'+usercount;

    //push this user to the list

    var cookie = socket.handshake.headers.cookie;

    if (typeof cookie != 'undefined'){

    }
    else {

        users.push({id: socketId, name: user, color: default_color});
        usercount += 1;
    }



    //display what user he is
    io.to(socketId).emit('username', user, default_color, false);




    //display the other online users
    io.emit('online users', users);
    for (var i = 0; i < history.length; i++) {
        io.to(socketId).emit('chat message', '',history[i].time, history[i].user, history[i].color, history[i].message);
    }



    //When a disconnect happens
    socket.on('disconnect', function(){
        //let server know
        console.log('user disconnected');

        //remove from user list
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == socketId){
                users.splice(i,1);
            }
        }
        //show remain users
        io.emit('online users', users );


        for (var i = 0; i < users.length; i++) {
            console.log(users[i]);

        }
    });
    socket.on('update users', function (name, color) {
        users.push({id: socketId, name: name, color: color});
        console.log(color)
        io.emit('online users', users);

    });

});