const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');

exports.mostrarMeeti = async (req, res) => {

    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })
    //Si no existe el meeti
    if(!meeti) {
        res.redirect('/');
    }

    //pasar el resultado a la vista
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        moment
    });


}

//confirmar o cancelar asistencia al meeti
exports.confirmarAsistencia = async (req, res) => {
    console.log(req.body);
    
    const { accion } = req.body;

    if(accion === 'confirmar') {
        //agregar el usuario
        Meeti.update(
            {'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)},
            {'where' : { 'slug': req.params.slug } }
        );

        //mensaje
        res.send('Has confirmado tu asistencia al meeti.');

    }else{
        //eliminar asistencia
        Meeti.update(
            {'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)},
            {'where' : { 'slug': req.params.slug } }
        );

        //mensaje
        res.send('Has cancelado tu asistencia al meeti.');

    }    
}    