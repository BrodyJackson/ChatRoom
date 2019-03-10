var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = __dirname + '/public/'; 

var users = []

var messages = []

var user = {
    nickname: "nickname",
    socketId: "socketID",
    chatColor: "blue"
}


app.use(express.static(__dirname + '/public' ));

app.get('/', function(req, res){
    res.sendFile(path + 'index.html');
});


io.on('connection', function(socket){

    var waitingFlag = true;

    socket.emit('cookie controller'); 

    socket.on('cookie response', function(cookie){
        console.log("in cookie response"); 
        console.log(cookie);
        if(cookie === null){
            users.push({nickname:"Anonymous User: " + socket.id, socketId: socket.id, chatColor: "000000"});
        }
        else{
            console.log("cookie restored to: ");
            console.log(cookie); 
            users.push({nickname:cookie.nickname, socketId: socket.id, chatColor: cookie.chatColor});  
            //need to create the new user object with cookie values here 
        }
        io.sockets.emit("updateUserList", users);

        var userIndex = users.findIndex(val => val.socketId == socket.id);
        socket.emit("cookie update", users[userIndex]);

        waitingFlag = false; 
    }); 

    //wait for flag of user push to be set; (could think of better way for this)
    function waiting(){
        if(waitingFlag == true){
            setTimeout(waiting, 100);
        }
        else
        {
        }
    }
    waiting(); 

    console.log('a user connected' + socket.id);
    console.log("nicknamed anonymous user: "+ socket.id);

    io.sockets.emit("updateUserList", users); 
    
    socket.emit("getPastMessages", messages); 
    socket.emit('updateWelcome'); 
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        var actualMessage = true; 

        messageSplit = msg.split(" ");
         
        if (messageSplit[0] === "/nick"){
            actualMessage = false; 
            messageSplit.shift();
            var newName = messageSplit.join(" ");
            console.log(newName);
            var foundFlag = false;
            users.forEach(function (userObject){
                if (userObject.nickname == newName){
                    foundFlag = true; 
                }     
            });
            console.log(("object 3" + JSON.stringify(users)));
            if (foundFlag == false){
                var userIndex = users.findIndex(val => val.socketId == socket.id);
                console.log("user index: " + userIndex); 
                var oldName = users[userIndex].nickname; 
                console.log( "old name " + oldName); 
                users.forEach(function (userObject){
                    if (userObject.nickname == oldName){
                        userObject.nickname = newName;
                        console.log("nick " + userObject.nickName);  
                    }     
                });
                //updating cookie
                socket.emit("cookie update", users[userIndex]);
                socket.emit('updateWelcome');
                io.sockets.emit("updateUserList", users); 
            }
        }

        console.log(("object 2" + JSON.stringify(users)));
        if (messageSplit[0] === "/nickcolor"){
            actualMessage = false; 
            messageSplit.shift();
            var newColor = messageSplit.join(" ");
            console.log("newcolor " + newColor); 
            var userIndex = users.findIndex(val => val.socketId == socket.id);
            console.log("user index: " + userIndex);  
            console.log(("object" + JSON.stringify(users[userIndex])));
            var nameValue = users[userIndex].nickname;
            console.log("nameValue " + nameValue) 
            users.forEach(function (userObject){
                if (userObject.nickname == nameValue){
                    console.log(JSON.stringify(userObject));
                    console.log(nameValue + "inside");  
                    userObject.chatColor = newColor;
                    console.log(JSON.stringify(userObject));  
                }     
            });
            // users[userIndex].chatColor = newColor; 
            console.log(users[userIndex].newColor); 

            //updating cookie
            socket.emit("cookie update", users[userIndex]);
            socket.emit('updateWelcome');
            io.sockets.emit("updateUserList", users);
        }
        if(actualMessage == true){
            console.log("twas false");
            var userIndex = users.findIndex(val => val.socketId == socket.id);
            var nickname = users[userIndex].nickname;  
            var timeVal = new Date(); 
            var color = users[userIndex].chatColor; 
            messages.push({text: msg, time: timeVal, name: nickname, textcolor: color })
            socket.broadcast.emit('chat message', {text: msg, time: timeVal, name: nickname, textcolor: color});
            
        }
    });

    socket.on('disconnect', function(){
        var specificUser = users.find(val => val.socketId === socket.id)
        //remove from userList
        var userIndex = users.findIndex(val => val.socketId == socket.id);

        users.splice(userIndex, 1);
         

        console.log("found the object that is being removed " + specificUser); 
        io.sockets.emit("updateUserList", users); 
        console.log("a user disconnected, specifically. " + socket.id); 
    }); 

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

