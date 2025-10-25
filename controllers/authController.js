const passport = require('passport')

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash : true,
    badRequestMessage : 'Ingresa tu correo y tu contraseña'

})


//revisa si el usuario está autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    //si el usuario está autenticado, adelante 
    if(req.isAuthenticated() ) {
        return next()
    }

    //si no está autenticado
    return res.redirect('/iniciar-sesion')
}
