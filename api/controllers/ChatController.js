/**
 * Created by umgsaa on 5/02/14.
 */


module.exports = {



  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {},
  doRegister: function(req, res) {
    var session = req.session;
  },
  showRegister: function(req, res) {
    return res.view('chat/register');
  },
  showRoom: function(req, res) {
    var slug = req.param('slug');
    Room.findOneBySlug(slug).done(function (err, room) {
      if (err) {
        res.view('400');
      } else {
        res.view('chat/room',{room:room});
      }
    });
  },
  getRoomParticipants: function(req, res){
    var slug = req.param('slug');
    var io = sails.io;
    var socket = io.socket;
    console.log(socket.manager.sockets.in(data.room));
    console.log(slug);
  },
  addRoom: function(req, res){

  },
  showHall:function(req, res) {
    Room.find().done(function (err, rooms) {
      if (err) {
        res.view('400');
      } else {
        res.view('chat/hall',{rooms:rooms});
      }
    });
  }
};