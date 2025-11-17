const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')
const gruposController = require('../controllers/gruposController')
const meetiController = require('../controllers/meetiController')

module.exports = function() {
    router.get('/', homeController.home);

    //Crear y confirmar cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', [        
        body('confirmar')        
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        })
    ],  
    usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta)

    //Iniciar Sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion)
    router.post('/iniciar-sesion', authController.autenticarUsuario)

    //panel de administración 
    router.get('/administracion', 
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    )

    //Nuevos grupos
    router.get('/nuevo-grupo', 
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    )

    router.post('/nuevo-grupo', 
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        [
            body('categoriaId')
            .notEmpty()
            .withMessage('Selecciona una Categoría'),
            
            body('nombre')
            .trim()
            .escape(),            

            body('url')
            .optional()
            .trim()
            .escape()
        ],
        gruposController.crearGrupo
    )

    //Editar grupo
    router.get('/editar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    )    

    router.post('/editar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.editarGrupo,
    )

    //Editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    )

    router.post('/imagen-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    )

    //Eliminar grupo
    router.get('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    )

    router.post('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    )

    //Nuevos Meeti
    router.get('/nuevo-meeti', 
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    )

    //Nuevos Meeti
    router.post('/nuevo-meeti', 
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeeti
    )

    //Editar Meeti
    router.get('/editar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti
    )

    router.post('/editar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.editarMeeti
    )

    //Eliminar Meeti
    router.get('/eliminar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    )

    router.post('/eliminar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti
    )

    //Editar información de perfil
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    )

    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    )

    //modifica la contraseña
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    )    

    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    ) 

    //imagen perfil
    router.get('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.formImagenPerfil,        
    )
   
    router.post('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.imagenPerfil,        
    )

    //video 331 desde el principio

    return router;
}