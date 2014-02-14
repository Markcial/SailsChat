function Chat(io)
{
    var _chat = this;

    var socket = io.connect();

    var onLoadCompleteCb = function(ch){};
    var onMessageReceivedCb = function(dt){};
    var onRoomUserJoinedCb = function(dt){};
    var onRoomUserLeftCb = function(dt){};
    var onRosterUpdatedCb = function(dt){};
    var onRoomUserMutedCb = function(dt){};

    this.onRoomUserJoined = function(cb){
        onRoomUserJoinedCb = cb;
    };
    this.onRoomUserLeft = function(cb){
        onRoomUserLeftCb = cb;
    };
    this.onLoadComplete = function(cb){
        onLoadCompleteCb = cb;
    };
    this.onMessageReceived = function(cb){
        onMessageReceivedCb = cb;
    };
    this.onRosterUpdated = function(cb){
        onRosterUpdatedCb = cb;
    };
    this.onRoomUserMuted = function(cb){
        onRoomUserMutedCb = cb;
    }

    /*this.getRoomUsers = function(room) {
        socket.get('/room/'+room+'/participants',function(resp){
            console.log(resp);
        });
    };*/
    this.joinRoom = function(room){
        socket.emit(bootschat.namespaces.roomUserJoin,{room:room});
    };
    this.leaveRoom = function(room){
        socket.emit(bootschat.namespaces.roomUserLeave,{room:room});
    };
    this.shout = function(msg){
        socket.emit('shout',{msg:msg});
    };
    this.talkToRoom = function(room,to,msg){
        socket.emit(bootschat.namespaces.roomUserSays, {room:room,to:to,msg:msg});
    };
    this.muteUser = function(room, who) {

    };
    this.flagUser = function(room, who) {

    };


    var setChatEvents = function(){
        socket.on(bootschat.namespaces.roomUserJoined, onRoomUserJoinedCb );
        socket.on(bootschat.namespaces.roomUserLeft, onRoomUserLeftCb );
        socket.on(bootschat.namespaces.roomUserSaid, onMessageReceivedCb );
        socket.on(bootschat.namespaces.rosterUpdated, onRosterUpdatedCb );
        socket.on(bootschat.namespaces.roomUserMuted,onRoomUserMutedCb);
    };
    socket.on('connect',function socketConnected() {
        setChatEvents();
        onLoadCompleteCb(_chat);
    });
};
(function(io){
    var room = $('div.chat-window[data-room-slug]').data('room-slug');
    var chat = new Chat(io);
    chat.onLoadComplete(function(chat){
        chat.joinRoom(room);
        //chat.getRoomUsers(room);
       //chat.getRoster();
       /*$( window ).unload(function(){
            chat.leaveRoom(room);
       });*/
    });
    chat.onRosterUpdated(function(data){
        var users = data.roster;
        var $userList = $('#users-list');
        $userList.html("");
        $.each(users,function(i,usr){
            console.log(usr);
            var $usrTpl = $($('#user-template').text());
            $usrTpl.data('sid',usr.sid);
            $usrTpl.find('.username').text(usr.username);
            $userList.append($usrTpl);
        });
    });
    chat.onMessageReceived(function(data){
        var p = '<p>'+data.nickname+' said:' + data.msg + '</p>';
        $('.chat-log').append(p);
    });
    chat.onRoomUserLeft(function(data){
        var p = '<p>'+data.uid+' Abandono la sala.</p>';
        $('.chat-log').append(p);
    })
    chat.onRoomUserJoined(function(data){
        console.log(data);
        var p = '<p>'+data.nickname+' Ha entrado en la sala.</p>';
        $('.chat-log').append(p);
    });
    $('#message').on('keyup',function(e){
        if (e.keyCode == 13) {
            $('#talk').trigger('click');
        }
    });
    $('#talk').on('click',function(e){
       var text = $('#message').val();
       chat.talkToRoom(text,room);
       $('#message').val(" ");
       return false;
    });

    $('#users-list').on('click','a[data-action]',function(e){
        var $t = $(this);
        var action = $t.data('action');
        var sid = $t.parent('.user').data('sid');
        var username = $t.parent('.user').data('username');
        switch(action){
            case 'talk-to':
            var li = $('<li><a id="'+username+'">'+username+'</a></li>')
            $('#conversations').append(li);
            $('.chat-log[data-which="main"]').hide();
            $('.chat-log-container').append('<div class="chat-log"></div>');
            break;
            case 'mute':

            break;
            case 'flag':

            break;
            default:

            break;
        }
        return true;
    });
})(window.io)