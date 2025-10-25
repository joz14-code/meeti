const Usuarios = require('../models/Usuarios');
const { validationResult } = require('express-validator');
const enviarEmail = require('../handlers/emails')

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    
    const usuario = req.body;

    // Validar errores de express-validator
    const erroresValidacion = validationResult(req);

    if (!erroresValidacion.isEmpty()) {
        const erroresArray = erroresValidacion.array().map(err => err.msg);
        req.flash('error', erroresArray);
        return res.redirect('/crear-cuenta');
    }

    try {

        await Usuarios.create(usuario)

        //url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`

        //Enviar email de confirmacion
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject : 'Confirma tu cuenta de meeti',
            archivo : 'confirmar-cuenta'
        })
        
        req.flash('exito', 'Hemos enviado un correo electrónico, confirma tu cuenta!')
        res.redirect('/iniciar-sesion')
        
        
    } catch (error) {              
        
        // Manejo para errores de validación sequelize (error.errors)       
        const erroresSequelize = error.errors.map(err => err.message);
                              
        if (error.name === 'SequelizeUniqueConstraintError') {
            req.flash('error', ['Usuario ya registrado']);
            return res.redirect('/crear-cuenta');
        }
        
        req.flash('error', erroresSequelize)
        res.redirect('/crear-cuenta') 
        
        //Mirar si se puede poner los errores de express validator en el catch

    }   
    
}

//Confirma la suscripción del usuario
exports.confirmarCuenta = async (req, res, next) => {
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({where : { email: req.params.correo }})

    //si no existe, redireccionar
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta')
        res.redirect('/crear-cuenta')
        return next();
    }

    //si existe, confirmar suscripción y redireccionar
    usuario.activo = 1;
    await usuario.save();
    
    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión')
    res.redirect('/iniciar-sesion')
}


exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion' , {
        nombrePagina : 'Iniciar Sesión'
    })
}