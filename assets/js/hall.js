/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */

(function (io) {

function addRoom( room ) {
  var lnk = '<a data-roomid="'+room.id+'" data-roomname="'+room.slug+'" href="/sala/'+room.slug+'" class="list-group-item">'+room.name+'<span class="badge"><span class="fa fa-comments-o"></span> <span class="label-participants">'+room.participants+'</span></span></a>';
	$( '#list-rooms' ).prepend(lnk);
	return false;
}

function updateParticipants( roomName, participants ) {
  $( '#list-rooms a[data-roomname="'+roomName+'"] span.label-participants' ).text(participants);
}

function removeRoom(id) {
	$( '#list-rooms a[data-roomid="'+id+'"]' ).remove();
}

function cleanRooms() {
  $( '#list-rooms a[data-roomid]').remove();
}

$('#addRoom').on('click',function(e){
    var roomName = $('#roomName').val();
    $.ajax({
        url:'/room',
        type:'POST',
        data:{name:roomName},
        success:function(data){
            console.log(data);
        },
        error:function(xhr, status, text){
            var msg = JSON.parse(xhr.responseText);
            alert(msg.errors.join("\n"));
        }
    });
});

  // as soon as this file is loaded, connect automatically, 
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    socket.emit(bootschat.namespaces.joinHall);

    socket.on(bootschat.namespaces.roomUserJoined,function(data){
        console.log('roomJoined');
       updateParticipants(data.room,data.participants);
    });

    socket.on(bootschat.namespaces.roomUserLeft,function(data){
        console.log('roomLeft',data);
       updateParticipants(data.room,data.participants);
    });

    cleanRooms();
  	socket.request('/room',{},function(rooms){
  		$.each(rooms,function(i,el){
  			addRoom(el);
  		});
  	});

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      log('New comet message received :: ', message);
      //////////////////////////////////////////////////////
      if( message.model == 'room'){
      	switch(message.verb){
      		case 'create':
      			addRoom(message.data);
      			break;
      		case 'destroy':
      			removeRoom(message.id);
      			break;
      	}
      }

    });


    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to 
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
        'Socket is now connected and globally accessible as `socket`.\n' + 
        'e.g. to send a GET request to Sails, try \n' + 
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


  });


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }
  

})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);