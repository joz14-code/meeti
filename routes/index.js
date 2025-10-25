const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')
const gruposController = require('../controllers/gruposController')

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

    return router;
}