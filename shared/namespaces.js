(function(exports){

    // your code goes here

   exports.namespaces = {
       hallNs: 'hall',
       joinHall: 'hall:join',
       joinedHall: 'hall:joined',
       nickChange: 'user:nickname:change',
       nickChanged: 'user:nickname:changed',
       roomUserJoin: 'room:user:join',
       roomUserJoined: 'room:user:joined',
       roomUserLeave: 'user:leave:room',
       roomUserLeft: 'user:left:room',
       roomUserSays: 'user:room:says',
       roomUSerSaid: 'user:room:said',
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