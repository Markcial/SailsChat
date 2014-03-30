
module.exports = {
  attributes: {
    users:{
        type:'array'
    },
  	name: {
      type: 'string',
      maxLength: 250,
      required: true,
      unique:true
    },
    slug: {
      type: 'alphanumericdashed',
      maxLength: 250,
      required: true,
      unique:true
    }
  },
   beforeValidation:function(values, next){
    if(!values.hasOwnProperty('slug'))
    {
        var nm = values.name;
        values.slug = nm.toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
    };
    next();
  },
  connect:function(socket){
      var uid = socket.id;
      this.roster.push(uid);
  },
  disconnect:function(socket){
     var uid = socket.id;
     var index = this.roster.indexOf(uid);
     this.roster.splice(index, 1);
  },
  talk:function(socket,roomid,message){

  }
}