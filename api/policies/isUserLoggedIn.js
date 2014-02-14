module.exports = function isUserLoggedIn(req, res, next){
    var session = req.session;
    //session.user = {nickname:'mark'};
    //session.save();
    if(! session.hasOwnProperty( 'user' ) )
    {
        //return res.redirect( '/register' );
    }
    next();
};