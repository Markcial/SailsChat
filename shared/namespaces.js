(function(exports){

    // your code goes here

   exports.namespaces = {
       connect: 'connect',
       disconnect: 'disconnect',
       hallNs: 'hall',
       joinHall: 'hall:join',
       joinedHall: 'hall:joined',
       hallRoomCreate: 'hall:room:create',
       hallRoomCreateError: 'hall:room:create:error',
       hallRoomCreated: 'hall:room:created',
       nickChange: 'user:nickname:change',
       nickChangeError: 'user:nickname:change:error',
       nickChanged: 'user:nickname:changed',
       roomUserJoin: 'room:user:join',
       roomUserJoined: 'room:user:joined',
       roomUserLeave: 'user:leave:room',
       roomUserLeft: 'user:left:room',
       roomUserSays: 'user:room:says',
       roomUserSaid: 'user:room:said',
       roomUserMute: 'user:room:mute',
       roomUserMuted: 'user:room:muted',
       roomUserFlag: 'user:room:flag',
       roomUserFlagged: 'user:room:flagged',
       userTalkTo: 'user:talk:to',
       userTalkedTo: 'user:talked:to',
       rosterUpdate:'room:roster:update',
       rosterUpdated:'room:roster:updated'
    };

})(typeof exports === 'undefined'? this['bootschat']={}: exports);