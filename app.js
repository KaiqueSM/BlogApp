// Importando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require("mongoose")
    const path = require('path')
    const app = express()
    const admin = require('./routes/admin')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Posts')
    const Post = mongoose.model('posts')
// Config

    // Session
    app.use(session({
        secret: 'curso_node',
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())

    // Middleware
    app.use((req, res, next)=> {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })

    // Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    // Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

    // Mongoose
    mongoose.connect('mongodb://localhost/blogapp').then(() => {
        console.log("Mongo conectado!")
    }).catch((error) => {
        console.log(`Erro na conexão com o mongodb: ${error}`)
    })
    // Public
    app.use(express.static(path.join(__dirname, "public")))

    app.use((req, res, next) => {
        console.log("Middleware")
        next()
    })

// Rotas

    app.get('/', (req, res) => {

        Post.find().populate('category').sort({date: 'desc'}).lean().then((posts) => {
            res.render('index', {posts})
        }).catch((err) => {
            console.log('Erro ao carregar página inicial :(')
            res.render('index')
        })
    })

    app.get('/post/:slug', (req, res) => {
        Post.findOne({slug: req.params.slug}).lean().then((post) => {
            if (post){
                res.render('post/index', {post})
            }else{
                req.flash('error_msg', 'Este post não existe!')
                res.redirect('/')
            }
        }).catch((err) => {
            console.log('Erro ao carregar post :(')
            res.redirect('/')
        })
    })

    app.get('/posts', (req, res) => {
        res.send('Lista de posts')
    })

    app.use('/admin', admin)
// Outros
// Rodando server
    const PORT = 8001
    app.listen(PORT, () => {
        console.log(`Server runing in port: ${PORT}`)
    })