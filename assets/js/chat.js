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
    this.talkToRoom = function(room,msg){
        socket.emit(bootschat.namespaces.roomUserSays, {room:room,msg:msg});
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
            $usrTpl.data('sid',usr.getSocketId());
            $usrTpl.data('nickname',usr.getNickname());
            $usrTpl.find('.nickname').text(usr.getNickname());
            $userList.append($usrTpl);
        });
    });
    chat.onMessageReceived(function(data){
        var p = '<p>'+data.nickname+' said:' + data.msg + '</p>';
        $('.chat-log').append(p);
    });
    chat.onRoomUserLeft(function(data){
        var p = '<p>'+data.nickname+' Abandono la sala.</p>';
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
       chat.talkToRoom(room,text);
       $('#message').val(" ");
       return false;
    });

    $('#users-list').on('click','a[data-action]',function(e){
        var $t = $(this);
        var action = $t.data('action');
        var sid = $t.closest('.user').data('sid');
        var nickname = $t.closest('.user').data('nickname');
        switch(action){
            case 'talk-to':
            var $chatLog = $('.chat-log-container');
            //if( $chatLog.find( 'div#'+nickname ).length > 0 )return;
            var li = $('<li><a href="#'+nickname+'">'+nickname+'<button class="close" type="button">&times;</button></a></li>')
            $('#conversations').append(li);
            $('.chat-log-container').append('<div class="chat-log tab-pane fade" id="'+nickname+'"></div>');
            $('#conversations li a[href=#'+nickname+']').click();
            ui.tabdrop.layout();
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