/**
 * Created by umgsaa on 12/02/14.
 */
var ns = require('./../../shared/namespaces');
var clients = [];
var users = {};
module.exports.onConnect = function onConnect(session, socket){
    sails.log.info("Starting sockets.io Setup");
    if(!session.hasOwnProperty('nickname'))
    {
        session.nickname = Tools.generateRandomUsername();
        session.save();
    };
    users[socket.id] = session.nickname;
    clients.push(socket.id);
    sails.log.debug('users',users);
    var onNicknameChange = function onNickNameChange(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        session.nickname = data.nickname;
        session.save();
        var info = {
            uid: socket.id,
            nickname: session.nickname
        }
        socket.broadcast(ns.namespaces.nickChanged,info);
        onRosterUpdate(data);
    };
    var onHallJoined = function onHallJoined(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        socket.join(ns.namespaces.hallNs);
    };
    var onHallLeaved = function onHallLeaved(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
    };
    var onRoomJoin = function onRoomJoin(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        socket.join(data.room);

        data.participants = socket.manager.sockets.clients(data.room).length;
        data.nickname = session.nickname;

        socket.manager.sockets.in(ns.namespaces.hallNs).emit(ns.namespaces.roomUserJoined, data);
        socket.manager.sockets.in(data.room).emit(ns.namespaces.roomUserJoined, data);

        onRosterUpdate(data);
    };
    var onRoomLeft = function onRoomLeft(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);

        socket.leave(data.room);

        data.participants = socket.manager.sockets.clients(data.room).length;

        socket.manager.sockets.in(ns.namespaces.hallNs).emit(ns.namespaces.roomUserLeft, data);
        socket.manager.sockets.in(data.room).emit(ns.namespaces.roomUserLeft, data);

        onRosterUpdate(data);
    };
    var onRoomUserSays = function onRoomUserSays(data){
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        var info = {
            msg:data.msg,
            whom: socket.id,
            nickname: users[socket.id]
        }
        socket.manager.sockets.in(data.room).emit(ns.namespaces.roomUserSaid, info);
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
        var clients = socket.manager.sockets.clients(data.room);
        var roster = [];
        _.each(clients,function(client){
            roster.push({
                sid:client.id,
                username:users[client.id]
            });
        });
        var info = {
           roster: roster
        };

        socket.manager.sockets.in(data.room).emit(ns.namespaces.rosterUpdated,info);
    }

    sails.log.info('Setting socket events');
    socket.on(ns.namespaces.joinHall,onHallJoined);
    socket.on(ns.namespaces.nickChange,onNicknameChange);
    socket.on(ns.namespaces.roomUserJoin,onRoomJoin);
    socket.on(ns.namespaces.roomUserLeave,onRoomLeft);
    socket.on(ns.namespaces.roomUserSays,onRoomUserSays);
    socket.on(ns.namespaces.roomUserMute,onRoomUserMute);
    socket.on(ns.namespaces.roomUserFlag,onRoomUserFlag);
    socket.on(ns.namespaces.userTalkTo,onUserTalkTo);
    socket.on(ns.namespaces.rosterUpdate,onRosterUpdate);

    var io = sails.io;
    socket.on('disconnect',function disconnect(){
        var sid = socket.id;
        var usr = users[sid];
        clients.splice(clients.indexOf(sid),1);
        delete users[sid];
        sails.log.debug('clients',clients);
        sails.log.debug('user',usr);
        sails.log.debug('users',users);
        
        sails.log.info('called method',arguments.callee.name,' with data:',arguments);
        var rooms = socket.manager.roomClients[socket.id];
        _.each(rooms,function(i,room){
            var info = {
                user:usr,
                sid:sid
            };

            socket.manager.sockets.in(room).emit(ns.namespaces.roomLeft, info);
        });
    });

    sails.log.info('ENDOF Setting socket events');
};