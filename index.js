const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const router = require('./routes');
const passport = require('./config/passport') 
const expressLayouts = require('express-ejs-layouts');

const db = require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');
db.sync().then(() => console.log('DB connected')).catch(error => console.log(error));

//Variables de desarrollo
require('dotenv').config({ path: 'variables.env' });

//Aplicación principal
const app = express();

//Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//habilitar ejs como template engine
app.use(expressLayouts)
app.set('view engine', 'ejs');

//Ubicación vistas
app.set('views', path.join(__dirname, './views'));

//archivos estáticos
app.use(express.static('public'));

//Habilitar cookie parser
app.use(cookieParser());

//Crear la sesión
app.use(session({
  secret: process.env.SECRETO,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false
}))

//inicializar passport
app.use(passport.initialize())
app.use(passport.session())

//Habilitar flash messages
app.use(flash());

//Middleware (usuario logueado, flash messages, etc)
app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  const fecha = new Date();
  res.locals.year = fecha.getFullYear();

  next();
})

//Routing
app.use('/', router());

//Agrega el puerto
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});





