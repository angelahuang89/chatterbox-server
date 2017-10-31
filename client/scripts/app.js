class CBox {
  init() {
    this.roomList = [];
    this.friendsList = [];
    this.user;
    this.room;
  }
  send (message) {
    $.ajax({
      type: 'POST',
      url: 'http://127.0.0.1:3000/classes/messages',
      data: message
    });
  }
  fetch () {
    $.ajax({
      type: 'GET',
      data: 'order=-createdAt',
      url: 'http://parse.sfs.hackreactor.com/chatterbox/classes/messages',
      contentType: 'application/json',
      success: function(res) {
        $('#currentRoomHeader').html('Currently Viewing: #' + app.room);
        app.clearMessages();
        res.results.forEach(e => {
          e.text = _.escape(e.text);
          e.username = _.escape(e.username);
          app.renderMessage(e);
          app.renderRoom(e.roomname);
          
        });
        
      },
      error: function(error) {
        console.log('SOMETHING WENT WRONG!\n', error);
      }
    });
  }
  clearMessages () {
    $('#chats').html('');
  }
  renderMessage (message) {
    //current user will have a list of friends and if they are not there, add them
    if (this.room === message.roomname && message.user !== 'undefined') {
      if (this.friendsList.indexOf(message.username) === -1) {
        $('<p class=".message"><strong><button value="' + _.escape(message.username) + '"class="username">' 
        + _.escape(message.username) + '</button></strong>: ' 
        + _.escape(message.text) + '</p><hr>').appendTo('#chats');
      } else {
        $('<p class=".message"><strong><button value="' + _.escape(message.username) + '"class="username">' 
        + _.escape(message.username) + '</button>: ' 
        + _.escape(message.text) + '</strong></p><hr>').appendTo('#chats');
      }
    }


  }
  renderRoom (roomName) {
    if (this.roomList.indexOf(roomName) === -1 && this.room !== undefined) {
      this.roomList.push(roomName);
      $('<br><button value="' + roomName + '" class="roomButton">#' + roomName + '</button>').appendTo('#roomSelect');
    }

  }
  handleUsernameClick (username) {

    $('<button class="username">' + username + '</button><br>').appendTo('#friendsList');
    alert('User name ' + username + ' will be added to your friends list');
  }
  handleSubmit (message) {
    this.send(message);
    $('<p class=".message"><strong><button value="' + message.username + '"class="username">' 
      + message.username + '</button></strong>: ' 
      + message.text + '</p><hr>').prependTo('#chats');
  }
  addFriend (name) {
    this.friendsList[name] = name;
  }
  // escapeData (text) {
  //   //used to escape special characters before appending to page
  //   if (text !== undefined) { 
  //     return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");    
  //   }
  // }
  
}

var app = new CBox;

$(document).ready(function() {
  app.user = window.location.href.split('?')[1].split('=')[1];
  app.user = app.user.replace(new RegExp(/[0-9]/, 'g'), '');
  app.user = app.user.replace(new RegExp('%', 'g'), ' ');
  
  app.friendsList = [];
  app.room = 'lobby';
  app.roomList = [];
  app.fetch();
  $('#currentRoomHeader').html('Currently Viewing: #' + app.room);
  setInterval(function () {
    app.fetch(app.roomName);
  }, 1000);

  //handle username click will add the clicked name as a friend.
  $(document).on('click', '.username', function(event) {
    app.friendsList.push(this.value);
    app.handleUsernameClick(this.value);
    app.clearMessages();
    app.fetch();
  });
  
  //submit will post the POST the message and append to the DOM
  $(document).on('submit', '#send', function(e) {
    var $message = $('input[name="message"]').val();
    app.handleSubmit({roomname: app.room, text: $message, username: app.user});
    e.preventDefault();
  });
  
  $(document).on('submit', '#newRoom', function(e) {
    var $roomname = $('input[name="room"]').val();
    app.roomList.push($roomname);
    $('<br><button value="' + $roomname + '" class="roomButton">#' + $roomname + '</button>').appendTo('#roomSelect');
    e.preventDefault();
  });
  
  $(document).on('click', '.roomButton', function(e) {
    
    app.clearMessages();
    app.room = this.value;
    app.fetch();
  });
});








