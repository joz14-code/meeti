const Sequelize = require('sequelize');
const db = require('../config/db');
const {v4: uuid} = require('uuid');//genera id unico
const slugify = require('slugify');//genera url//slug no funciona, toca instalar slugify
const shortid = require('shortid');//genera url

const Usuarios = require('../models/Usuarios');
const Grupos = require('../models/Grupos');

const Meeti = db.define(
    'meeti', {

        id : {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuid()
            
        },

        titulo : {
            type:Sequelize.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un Titulo al Meeti'
                }
            }

        },

        slug : {
            type: Sequelize.STRING,
        },
        
        invitado : Sequelize.STRING,

        cupo : {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        descripcion : {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Descripcion al Meeti'
                }
            }
        },

        fecha : {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Fecha para el Meeti'
                }
            }
        },

        hora : {
            type: Sequelize.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Hora para el Meeti'
                }
            }
        },

        direccion : {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Dirección para el Meeti'
                }
            }
        },

        ciudad : {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una Ciudad para el Meeti'
                }
            }
        },

        estado : {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un Estado para el Meeti'
                }
            }
        },

        pais : {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un Pais para el Meeti'
                }
            }
        },
        
        ubicacion : {
            type: Sequelize.GEOMETRY('POINT'),       

        },

        interesados : {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue: []

        }
    }, {
        hooks: {
           async beforeCreate(meeti) {
                const url = slugify(meeti.titulo).toLowerCase();
                meeti.slug = `${url}-${shortid.generate()}`;
            }
        }
    }
);

Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupos);

module.exports = Meeti;

