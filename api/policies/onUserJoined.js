/**
 * Created by umgsaa on 11/02/14.
 */
module.exports = function onUserJoined(req, res, next){
    var socket = req.socket;
    console.log(socket.id);
    var slug = req.param('slug');
    Room.findOneBySlug(slug).done(function(err, room){
        console.log(room);
       if (err) {
        res.send(400);
      } else {
        next();
      }
    });
};