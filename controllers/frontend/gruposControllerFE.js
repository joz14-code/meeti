const { where } = require('sequelize')
const Grupos = require('../../models/Grupos')
const Meeti = require('../../models/Meeti')
const moment = require('moment')

exports.mostrarGrupo = async (req, res, next) => {
    const consultas = []

    consultas.push( Grupos.findOne({
        where: { id: req.params.id}
    }))

    consultas.push(Meeti.findAll({
                                where: { grupoId : req.params.id},
                                order : [
                                    ['fecha', 'ASC']
                                ]
    }))

    const[grupo, meetis] = await Promise.all(consultas)

    //si no hay grupos
    if(!grupo) {
        res.redirect('/')
        return next()
    }

    //mostrar vista
    res.render('mostrar-grupo', {
        nombrePagina : `Información Grupo: ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    })

    //352 final//da error en la fecha y hora
}