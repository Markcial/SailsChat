/**
 * Created by umgsaa on 12/02/14.
 */
module.exports.User = function User(session, socket, options){
    var sockets = {},
        rooms = {},
        nickname;

    if(!session.hasOwnProperty('user')){
        nickname = Tools.generateRandomUsername();
        session.user = nickname;
        session.save();
    }else{
        nickname = session.user;
    }
    if(jschat.sockets.hasOwnProperty(nickname)){
        sockets = jschat.sockets[nickname];
    }
    sockets[socket.id] = socket;
    jschat.sockets[nickname] = sockets

	sails.log.debug(jschat.sockets);

	this.setNickname = function(nickname){
		nickname = nickname;
	};

    this.addRoom = function(room){
        rooms[room.slug] = room;
    }

    this.getSocketId = function(){
        return socket.id;
    }

    this.removeRoom = function(room){
        delete rooms[room.slug];
    }

	this.getNickname = function(){
		return nickname;
	};

    this.lastSocketInRoom = function(room){
        var ttl = socket.manager.sockets.clients(room.slug);
        return ttl.length <= 1;
    }

	this.sayHi = function(){
		sails.log.info('hi');
	};
}
module.exports.Room = function Room( slug, socket ){
    var users = {};
    var socket = socket;
    slug = slug;

    if(jschat.rooms.hasOwnProperty( slug ) ){
        users = jschat.rooms[slug].getRoster();
    }else{
        jschat.rooms[slug] = this;
    }

    this.join = function(user){
        socket.join(slug);

        if(!this.hasUser(user))
        {
            this.addUser(user);
            user.addRoom(this);

            var data = {
                room: slug
            }

            sails.log.debug('Emit event : ', jschat.ns.roomUserJoined, ' to all sockets in room : ', jschat.ns.hallNs, ', args : ', data);
            socket.manager.sockets.in(jschat.ns.hallNs).emit(jschat.ns.roomUserJoined, data);
            sails.log.debug('Emit event : ', jschat.ns.roomUserJoined, 'to all sockets in room : ', data.room, ', args : ', data);
            socket.manager.sockets.in(slug).emit(jschat.ns.roomUserJoined, data);
        }
    }

    this.leave = function(user){
        socket.leave(slug);

        if(user.lastSocketInRoom(this))
        {
            this.removeUser(user);
            user.removeRoom(this);

            var data = {
                room: slug
            }

            sails.log.debug('Emit event : ', jschat.ns.roomUserLeft, ' to all sockets in room : ', jschat.ns.hallNs ,', args : ', data);
            socket.manager.sockets.in(jschat.ns.hallNs).emit(jschat.ns.roomUserLeft, data);
            sails.log.debug('Emit event : ', jschat.ns.roomUserLeft, ' to all sockets in room : ', data.room ,', args : ', data);
            socket.manager.sockets.in(data.room).emit(jschat.ns.roomUserLeft, data);
        }
    }

    this.hasUser = function(user){
        return users.hasOwnProperty(user.getNickname());
    }

    this.addUser = function(user){
        users[user.getNickname()] = user;
    }

    this.removeUser = function(user){
        delete users[user.getNickname()];
    }

    this.getRoster = function(){
        return users;
    }
}
GLOBAL.jschat = {
    ns:require('./../../shared/namespaces').namespaces,
    rooms:{},
    sockets:{}
}
module.exports.onConnect = function onConnect(session, socket){
    sails.log.info("Starting sockets.io Setup");
    var user = new Chat.User(session,socket);

    sails.log(user.getNickname());
    //users[user.getNickname()].push(socket.id);

    var onNicknameChange = function onNickNameChange(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        user.setNickname(data.nickname);
        var info = {
            sids: users[user.getNickname()],
            nickname: session.nickname
        }
        sails.log.debug('Broadcast event : ', jschat.ns.nickChanged, ', args : ', info);
        socket.broadcast(jschat.ns.nickChanged,info);
        onRosterUpdate(data);
    };
    var onHallJoined = function onHallJoined(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        // if its already on the hall, we don't need to emit the event

        sails.log.debug('Socket joining room : ', jschat.ns.hallNs);
        socket.join(jschat.ns.hallNs);
    };
    var onHallLeaved = function onHallLeaved(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
    };
    var onRoomUserJoin = function onRoomUserJoin(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);

        var room  = new Chat.Room(data.room, socket);
        room.join(user);

        data.participants = Object.keys(room.getRoster()).length;
        data.nickname = user.getNickname();
        // if user not in users list emit event
        onRosterUpdate(data);
    };
    var onRoomUserLeave = function onRoomUserLeave(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);

        var room  = new Chat.Room(data.room, socket);
        room.leave(user);

        data.participants = Object.keys(room.getRoster()).length;

        onRosterUpdate(data);
    };
    var onRoomUserSays = function onRoomUserSays(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        var info = {
            msg:data.msg,
            whom: socket.id,
            nickname: session.nickname
        }
        sails.log.debug('Emit event : ', jschat.ns.roomUserSaid, ' to all sokcets in room : ', data.room ,', args : ', info);
        socket.manager.sockets.in(data.room).emit(jschat.ns.roomUserSaid, info);
    };
    var onRoomUserMute = function onRoomUserMute(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
    };
    var onRoomUserFlag = function onRoomUserFlag(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
    };
    var onUserTalkTo = function onUserTalkTo(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
    };

    var onRosterUpdate = function onRosterUpdate(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        //var clients = socket.manager.sockets.clients(data.room);
        var room  = new Chat.Room(data.room);

        var roster = {}
        var users = room.getRoster();
        _.each(users,function(i,usr){
            roster[usr] = {
                'socketid':users[usr].getSocketId(),
                'nickname': users[usr].getNickname()
            }
        })
        var info = {
           roster:roster
        };

        sails.log.debug('Emit event : ', jschat.ns.rosterUpdated, ' to all sockets in room : ', data.room ,', args : ', info);
        socket.manager.sockets.in(data.room).emit(jschat.ns.rosterUpdated,info);
    }

    sails.log.info('Setting socket events');
    socket.on(jschat.ns.joinHall,onHallJoined);
    socket.on(jschat.ns.nickChange,onNicknameChange);
    socket.on(jschat.ns.roomUserJoin,onRoomUserJoin);
    socket.on(jschat.ns.roomUserLeave,onRoomUserLeave);
    socket.on(jschat.ns.roomUserSays,onRoomUserSays);
    socket.on(jschat.ns.roomUserMute,onRoomUserMute);
    socket.on(jschat.ns.roomUserFlag,onRoomUserFlag);
    socket.on(jschat.ns.userTalkTo,onUserTalkTo);
    socket.on(jschat.ns.rosterUpdate,onRosterUpdate);

    var io = sails.io;
    socket.on('disconnect',function disconnect(){
        var sid = socket.id;

        delete jschat.sockets[user.getNickname()][sid];

        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        var rooms = socket.manager.roomClients[socket.id];
        _.each(rooms,function(i,room){
            var info = {
                nickname:user.getNickname(),
                sid:sid,
                room:room.substr(1)
            };
            if(room)onRoomUserLeave(info);
            //sails.log.debug('Emit event : ', ns.roomUserLeft, ' to all sokcets in room : ', room ,', args : ', info);
            //socket.manager.sockets.in(room).emit(ns.roomUserLeft, info);
        });
    });

    sails.log.info('ENDOF Setting socket events');
};