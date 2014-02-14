module.exports = function getParticipants(req, res, next){
    var io = sails.io;
    Room.find().done(function(err, rooms){
        _.each(rooms,function(room){
           room.participants = io.sockets.clients(room.slug).length
       });
       if(err){
        return next(err);
       }else{
        return res.json(rooms);
       }
    });
}