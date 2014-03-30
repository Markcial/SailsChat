/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {



  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {},


    showRegister:function(req,res){
        return res.view('user/register');
    },
    doRegister:function(req,res){
        // pendiente, crear usuario
        var params = req.body;
        sails.log.debug(params);
        if( params['email-confirm']!=params['email']){
            return res.json({ error: 'Email mismatch' }, 400);
        };
        if(params['password-confirm']!=params['password']){
            return res.json({ error: 'Password mismatch' }, 400);
        };

        User.create({
          nickname: params['nickname'],
          email: params['email'],
          password: params['password']
        }).done(function(err, user) {

          // Error handling
          if (err) {
            return res.json({ error: 'Server error' }, 400);

          // The User was created successfully!
          }else {
            req.session.user = user;
            return res.json(user);
          }
        });
    },
    showLogin:function(req,res){
        return res.redirect('/register');
        //return res.view( 'user/login' );
    },
    doLogin: function(req, res) {
        var bcrypt = require('bcrypt');
        var nickname = req.param('nickname');
        var password = req.param('password');
        User.findOneByNickname(nickname).done(function(err, user){
            if (err) res.json({ error: 'Unhandled error' }, 500);
            if (user) {
                bcrypt.compare(req.body.password, user.password, function (err, match) {
                    if (err) res.json({ error: 'Server error' }, 500);
                    console.log(match);
                    if (match) {
                        // password match
                        req.session.user = user;
                        res.json(user);
                    }else{
                        if (req.session.user) req.session.user = null;
                        res.json({ error: 'Invalid password' }, 400);
                    }
                });
            }else{
                res.json({ error: 'User not found' }, 404);
            }
        });
    },
    doLogout:function(req,res){

    }
};
