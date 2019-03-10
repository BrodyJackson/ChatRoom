
socket.on('cookie controller', function(){
    if ( Cookies.get('nickname') === undefined){
        console.log("cookie does not exist"); 
        socket.emit('cookie response', undefined);  
    }
    else{
        console.log("cookie exists");
        socket.emit('cookie response', Cookies.get());  
    }
}); 

socket.on('cookie update', function(user){
    console.log('hitting cookie update'); 
    console.log(user.nickname); 
    Cookies.set('nickname', user.nickname); 
    Cookies.set('chatColor', user.chatColor); 
    console.log(Cookies.get()); 
}); 


$('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    var name = Cookies.get('nickname');
    var timeStamp = new Date();
    var formattedTime = timeStamp.getHours() + ":" + (timeStamp.getMinutes()<10?'0':'')+timeStamp.getMinutes();
    var color = Cookies.get('chatColor'); 
    
    var textEnter = "<p><span class='messageSpan'>" + $('#messageBar').val() + "</span><br>" + name + " sent at " + formattedTime +  "</p>"; 
    $('.messageContainer').append($(`<div class="individualMessage" style="align-self:flex-end; color:#${color}"></div>`).append(textEnter));
    console.log("scrolling2"); 
    socket.emit('chat message', $('#messageBar').val());
    $('#messageBar').val('');
    $('.messageContainer').children().first().addClass("marginFirst"); 
    $('.messageContainer').animate({ scrollTop: $('.messageContainer').prop("scrollHeight")}, 1000); 
    console.log(document.cookie); 
    return false;
});

socket.on('chat message', function(msgObject){
    console.log("hit handler"); 
    console.log(typeof(msgObject.time)); 
    var actualText = msgObject.text;
    var name = msgObject.name; 
    var test = msgObject.time;
    var clientTimestamp = new Date(test);
    var color = msgObject.textcolor; 
    console.log("text color is" + color); 
    //put this code into the personal sent ones as well
    var formattedTime = clientTimestamp.getHours() + ":" + (clientTimestamp.getMinutes()<10?'0':'')+clientTimestamp.getMinutes(); 
    console.log(formattedTime); 
    $('.messageContainer').append($(`<div class="individualMessage" style="color:#${color}"></div>`).append("<p><span class='messageSpan'>" + actualText + "</span><br>" + name + " sent at " + formattedTime +  "</p>"));
    $('.messageContainer').children().first().addClass("marginFirst"); 
    $('.messageContainer').animate({ scrollTop: $('.messageContainer').prop("scrollHeight")}, 1000); 
    console.log("scrolling");      
});

socket.on('updateUserList', function(userArray){
    console.log("new user being added");
    var userString = "<div class='col-lg-12 userOnlineHeader'><p class='userHeaderText'>Online Users</p></div>"; 
    console.log("size is: " + userArray.length); 
    userArray.forEach(function (userObject){
        if(userString.includes(userObject.nickname)){
            return; 
        }
        userString += `<div class="col-lg-12 userNameStyles"><p style="text-align:center; color:#${userObject.chatColor}">`+userObject.nickname+'</p></div>'; 
        console.log("users color would be " + userObject.chatColor); 
    }); 
    $('.users').html(userString); 
});

socket.on("getPastMessages", function(messages){
    messages.forEach(function (msg){
        var actualText = msg.text;
        var name = msg.name;
        var test = msg.time;
        var color = msg.textcolor; 
        var clientTimestamp = new Date(test);
        var fontWeight = 500;  
        if(name == Cookies.get('nickname')){
            fontWeight = 700; 
        }
        var formattedTime = clientTimestamp.getHours() + ":" + (clientTimestamp.getMinutes()<10?'0':'')+clientTimestamp.getMinutes(); 
        $('.messageContainer').append($(`<div class="individualMessage" style="color:#${color}; font-weight:${fontWeight}"></div>`).append("<p><span class='messageSpan'>" + actualText + "</span><br>" + name + " sent at " + formattedTime +  "</p>"));
        $('.messageContainer').children().first().addClass("marginFirst");  
    })
}); 

socket.on("updateWelcome", function(){
    var welcomeName = Cookies.get('nickname'); 
    $('.welcome').empty(); 
    $('.welcome').append("<h1 class='welcomeMessage'> Welcome to the chat " + "<span id='nameHeaderSpan'>" + welcomeName + "</span></h1>"); 
})
