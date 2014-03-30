/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var bcrypt = require('bcrypt');
module.exports = {

  attributes: {
      name: {
          type: 'string',
          maxLength: 250,
          required: false
      },
      surname: {
          type: 'string',
          maxLength: 250,
          required: false
      },
      email: {
          type: 'email',
          unique: true,
          maxLength: 250,
          required: true
      },
      password: {
          type: 'string',
          maxLength: 250,
          defaultsTo:'123456'
      },
      nickname: {
          type: 'string',
          unique: true,
          maxLength: 250,
          required: true
      },
      birthday: {
          type:'date',
          required:false
      },
      toJSON: function() {
          var obj = this.toObject();
          delete obj.password;
          return obj;
      }
  },
  beforeValidation:function(values, next){
    if(!values.hasOwnProperty('nickname'))
    {
        var email_pieces = values.email.split('@');
        values.nickname = email_pieces[0];
    };
      console.log(values.password);
      next();
  },
    beforeCreate:function(values,next){
      bcrypt.hash(values.password, 10, function(err, hash) {
      if(err) return next(err);
      values.password = hash;
      next();
    });
  }
};
