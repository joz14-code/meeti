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

    //sale error al guardar el meeti-video 316 final
    

    console.log(meeti);
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
    consultas.push(Meeti.findByPk(req.params.meetiId));

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


