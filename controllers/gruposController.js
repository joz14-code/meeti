const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {

    limits: {
        fileSize: 200000 //200KB
    },
    storage : fileStorage = multer.diskStorage({
        destination : (req, file, next) => {
            next(null, __dirname+'../../public/uploads/grupos')
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

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina : 'Crea un nuevo grupo',
        categorias
    })
}

exports.crearGrupo = async (req, res) => {
    const grupo = req.body  

    // Validar errores de express-validator
    const erroresValidacion = validationResult(req);

    //almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id

    //leer imagen
    if(req.file){
        grupo.imagen = req.file.filename
    }    
        
    try {

        //almacenar en la bd
        await Grupos.create(grupo)
        req.flash('exito', `Se ha creado el Grupo: ${grupo.nombre} , correctamente` )
        res.redirect('/administracion')        
    } catch (error) {
        
        //Manejo de errores de express validator        
        const erroresArray = erroresValidacion.array().map(err => err.msg);
       
        // Manejo para errores de validación sequelize (error.errors)       
        const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', [...erroresSequelize, ...erroresArray])
        res.redirect('/nuevo-grupo')
          
    }
}

exports.formEditarGrupo = async (req, res) => {
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina : `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })

}

//guarda los cambios en la bd
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    //si no existe el grupo o no es el dueño
    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien, leer los valores  
    const { nombre, descripcion, categoriaId, url } = req.body;

    //asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //guardar en la bd
    await grupo.save();

    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');    
}

//Muestra el formulario para editar la imagen del grupo
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    res.render('imagen-grupo', {
        nombrePagina : `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    })
}

//Modifica la imagen en la bd y elimina la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    //si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

  /*   //verificar que el archivo sea nuevo
    if(req.file){
        console.log(req.file.filename)
    }

    //revisar que exista una imagen previa
    if(grupo.imagen){
        console.log(grupo.imagen)
    } */

    //si hay imagen anterior y nueva, eliminar la anterior
    if(req.file && grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        
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
        grupo.imagen = req.file.filename;
    }

    //guardar en la bd
    await grupo.save();
    req.flash('exito', 'Imagen actualizada correctamente');
    res.redirect('/administracion');
}

//Muestra el formulario para eliminar el grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    //si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    //todo bien, mostrar el formulario
    res.render('eliminar-grupo', {
        nombrePagina : `Eliminar Grupo: ${grupo.nombre}`,
        grupo
    })
}

//eliminar grupo e imagen
exports.eliminarGrupo = async (req, res, next) => {

    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    //si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    if(grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        
        //Eliminar la imagen anterior
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        });
    }

    //Eliminar el grupo
    await Grupos.destroy({ where : { id : req.params.grupoId } });

    //redireccionar
    req.flash('exito', 'Grupo eliminado correctamente');
    res.redirect('/administracion');
}


