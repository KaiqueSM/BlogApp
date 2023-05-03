// Importando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require("mongoose")
    const path = require('path')
    const app = express()
    const admin = require('./routes/admin')
    const user = require('./routes/user')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Posts')
    const Post = mongoose.model('posts')
    require('./models/Category')
    const Category = mongoose.model('categories')
    const passport = require('passport')
    require('./config/auth')(passport)
// Config

    // Session
    app.use(session({
        secret: 'curso_node',
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    // Middleware
    app.use((req, res, next)=> {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
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

    app.get('/categories', (req, res) => {
        Category.find().sort({date: 'desc'}).lean().then((categories) => {
            res.render('category/index', {categories})
        }).catch((err) => {
            console.log('Erro ao carregar categorias :(')
            res.redirect('/')
        })
    })
    app.get('/categories/:slug', (req, res) => {
        Category.findOne({slug: req.params.slug}).lean().then((category) => {
            if (category){
                Post.find({category: category._id}).lean().then((posts) => {
                    res.render('category/posts', {category, posts})
                }).catch((err) => {
                    console.log('Erro ao carregar a paginda da categoria :(')
                    req.flash('Erro ao carregar a paginda da categoria :(')
                    res.redirect('/')
                })
            }else{
                req.flash('Essa categoria não existe')
                res.redirect('/categories')
            }
        }).catch((err) => {
            console.log('Erro ao carregar a paginda da categoria :(')
            req.flash('Erro ao carregar a paginda da categoria :(')
            res.redirect('/')
        })
    })

    app.use('/admin', admin)
    app.use('/user', user)
// Outros
// Rodando server
    const PORT = process.env.PORT || 8001
    app.listen(PORT, () => {
        console.log(`Server runing in port: ${PORT}`)
    })