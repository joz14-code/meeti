const Usuarios = require('../models/Usuarios');
const { validationResult } = require('express-validator');
const enviarEmail = require('../handlers/emails')
const { body } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const shortid = require('shortid');
const { console } = require('inspector');

const configuracionMulter = {

    limits: {
        fileSize: 200000 //200KB
    },
    storage : fileStorage = multer.diskStorage({
        destination : (req, file, next) => {
            next(null, __dirname+'../../public/uploads/perfiles')
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),
   
    fileFilter(req, file, next) {        
        if (file.mimetype.startsWith('image/')) {
            //el formato es valido
            next(null, true);
        } else {
            //El formato no es valido
            next(new Error('Formato no válido'), false);
            
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

//sube imagen en el servidor
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 200KB');
                } else {
                    req.flash('error', error.message);
                }
            }else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            const backURL = req.get('referer');
            res.redirect(backURL); 
            return;
            
        }else {
            next();
        }
    })
    
}

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

exports.formEditarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    })

}


//almacenaa en la bd los cambios del perfil
exports.editarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    body('nombre').trim().escape()
    body('email').trim().escape()
    
    //leer datos del form
    const {nombre, descripcion, email} = req.body

    //asignar los valores 
    usuario.nombre = nombre
    usuario.descripcion = descripcion
    usuario.email = email

    //guardar en la bd
    await usuario.save()
    req.flash('exito', 'Cambios guardados correctamente')
    res.redirect('/administracion')

}

//muestra el formulario para cambiar el password
exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password',{
        nombrePagina: 'Cambiar Contraseña'
    })
}

//revisa si la contraseña anterior es correcta y lo modifica por uno nuevo
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    //verificar que la contraseña anterior sea correcto
    if(!usuario.validarPassword(req.body.anterior)){
        req.flash('error', 'La contraseña actual es incorrecta')
        res.redirect('/administracion')
        return next()
    }

    //console.log('todo bien')
    //si la contraseña es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo)
    console.log(hash)

    //asignar la contraseña al usuario
    usuario.password = hash

    //guardar en la bd
    await usuario.save()

    //redireccionar
    req.logout(function(err) {
        if (err) { return next(err); } 
        req.flash('exito', 'Contrasña Actualizada Correctamente, vuelve a Iniciar Sesión')
        res.redirect('/iniciar-sesion')       
    });
    //video 332 desde el principio(imagen perfil), es el mismo de la imagen para los grupos
 
}

exports.formImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    res.render('imagen-perfil', {
        nombrePagina : `Sube Imagen Perfil: ${usuario.nombre}`,
        usuario
    })
}

//guarda la imagen nueva, elimina la anterior (si aplica)
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    //si hay imagen anterior y nueva, eliminar la anterior
    if(req.file && usuario.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
        
        //Eliminar la imagen anterior
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        });
    }

    //Si hay una imagen nueva, la guardamos
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    //guardar en la bd
    await usuario.save();
    req.flash('exito', 'Imagen Guardada correctamente');
    res.redirect('/administracion');
}
