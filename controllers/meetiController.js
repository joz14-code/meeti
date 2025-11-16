const { parse } = require('dotenv');
const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const { body } = require('express-validator');

//Muestra el formulario para crear un nuevo meeti
exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } });
    
    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
}

//Crea un nuevo meeti
exports.crearMeeti = async (req, res) => {
    const meeti = req.body;
    
    //asignar el usuario
    meeti.usuarioId = req.user.id;

    //almacena la ubicacion con un point
    const point = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]
    }
    meeti.ubicacion = point;

    //cupo opcional
    if(req.body.cupo === '') {
        meeti.cupo = 0;
    }

    //almacena en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash('exito', `Meeti: ${meeti.titulo} , creado correctamente`);
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        //extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }    
    //console.log(meeti);
}

//sanitizar meeti
exports.sanitizarMeeti = (req, res, next) => {
    
    body('titulo').trim().escape(),
    body('invitado').trim().escape(),
    body('cupo').escape(),
    body('fecha').escape(),
    body('hora').escape(),
    body('direccion').trim().escape(),
    body('ciudad').trim().escape(),
    body('estado').trim().escape(),
    body('pais').trim().escape(),
    body('lat').trim().escape(),
    body('lng').trim().escape(),
    body('grupoId').trim().escape(),

    next()
}

//Muestra el formulario para editar un meeti
exports.formEditarMeeti = async (req, res, next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id } }));
    consultas.push(Meeti.findByPk(req.params.id));

    //return Promise
    const [grupos, meeti] = await Promise.all(consultas);

    if(!meeti || !grupos) {
        req.flash('error', 'Operación no válida');
        return res.redirect('/administracion');
        return next()
    }
    
    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    });
}

//almacena los cambios en la bd
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where : {id: req.params.id, usuarioId: req.user.id } });

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next()
    }

    //asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    //NOTA: req.body no tiene la opcion de .save por eso se asignan uno por uno los valores

    //asignar point (ubicacion)
    const point = {
        type: 'Point',
        coordinates: [parseFloat(lat), parseFloat(lng)]
    }
   
    meeti.ubicacion = point

    //console.log(meeti);    
    
    //almacena en la base de datos
    try {
        await meeti.save();
        req.flash('exito', `Meeti: ${meeti.titulo} , Cambios guardados correctamente`);
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        //extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect(`/editar-meeti/${meeti.id}`);
    }
}

//Muestra el formulario para eliminar el meeti
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where : {id: req.params.id, usuarioId: req.user.id } });

    //si no existe el grupo o no es el dueño
    if(!meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien, mostrar el formulario
    res.render('eliminar-meeti', {
        nombrePagina : `Eliminar Meeti: ${meeti.titulo}`,
        meeti
    })
}

//Elimina el meeti de la bd
exports.eliminarMeeti = async (req, res, next) => {
    await Meeti.destroy({ 
        where : { 
            id : req.params.id 
        } 
    });

    //redireccionar
    req.flash('exito', 'Meeti eliminado correctamente');
    res.redirect('/administracion');
}



