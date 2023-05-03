const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require('../models/Category')
const Category = mongoose.model('categories')
require('../models/Posts')
const Post = mongoose.model('posts')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/categories', eAdmin, (req, res) => {
    Category.find().sort({date: 'desc'}).lean().then((categories) => {
        res.render('admin/categories', {categories: categories})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar categorias :(')
        res.redirect('/admin')
    })
})

router.get('/categories/add', eAdmin, (req, res) => {
    res.render('admin/addCategories')
})

router.post('/categories/add', eAdmin, (req, res) => {
    let name = req.body.name
    let slug = req.body.slug

    let errors = validateCategory(name, slug)

    if (errors.length > 0) {
        res.render("admin/addCategories", {errors})
    } else {
        const category = {name, slug}

        new Category(category).save().then(() => {
            console.log("Categoria salva com sucesso!")
            req.flash('success_msg', 'Categoria criada com sucesso')
            res.redirect('/admin/categories')
        }).catch((err) => {
            console.log('Erro ao salvar categoria: ' + err)
            req.flash('error_msg', 'Erro ao salvar categoria :( \n Tente novamente!')
            res.redirect('/admin')
        })
    }
})

router.get('/categories/edit/:id', eAdmin, (req, res) => {
    Category.findOne({_id: req.params.id}).lean().then((category) => {
        console.log(category)
        res.render('admin/editCategories', {category})
    }).catch((err) => {
        req.flash('error_msg', 'Essa categoria não existe!')
        res.redirect('/admin/categories')
    })
})
router.post('/categories/edit/', eAdmin, (req, res) => {
    let id = req.body.id
    let name = req.body.name
    let slug = req.body.slug

    console.log({name, slug, id})

    let errors = validateCategory(name, slug)

    if (errors.length > 0) {
        res.render("admin/addCategories", {errors})
    } else {
        Category.findOne({_id: id}).then((category) => {
            category.name = name
            category.slug = slug

            console.log(category)

            category.save().then(() => {
                console.log('Categoria editada com sucesso')
                req.flash('success_msg', 'Categoria editada com sucesso')
                res.redirect('/admin/categories')
            }).catch((err) => {
                console.log("Erro ao editar categoria: " + err)
                req.flash('error_msg', 'Erro ao editar categoria')
                res.redirect('/admin/categories')
            })

        }).catch((err) => {
            console.log("Erro ao editar categoria: " + err)
            req.flash('error_msg', 'Erro ao editar categoria')
            res.redirect('/admin/categories')
        })
    }
})

router.post('/categories/delete', eAdmin, (req, res) => {
    Category.deleteOne({_id: req.body.id}).then(() => {
        console.log('Categoria removida com sucesso')
        req.flash('success_msg', 'Categoria removida com sucesso')
        res.redirect('/admin/categories')
    }).catch((err) => {
        console.log("Erro ao remover categoria: " + err)
        req.flash('error_msg', 'Erro ao remover categoria')
        res.redirect('/admin/categories')
    })

})

router.get('/posts',  eAdmin,(req, res) => {
    Post.find().populate('category').sort({date: 'desc'}).lean().then((posts) => {
        res.render('admin/posts', {posts})
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Erro ao listar posts :(')
        res.redirect('/admin')
    })
})
router.get('/posts/add', eAdmin, (req, res) => {
    Category.find().sort({date: 'desc'}).lean().then((categories) => {
        res.render('admin/addPosts', {categories: categories})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulário :(')
        res.redirect('/admin/posts')
    })
})
router.post('/posts/add', eAdmin, (req, res) => {

    let post = getPost(req)

    let errors = validatePost(post)

    if (errors.length > 0){
        res.render('admin/addPosts', {errors})
    }else{
        new Post(post).save().then(() => {
            console.log('Post cadastrado com sucesso!')
            req.flash('success_msg','Post cadastrado com sucesso!')
        }).catch((err) => {
            console.log('Erro ao salvar categoria: ' + err)
            req.flash('error_msg', 'Erro ao salvar categoria :( \n Tente novamente!')
        })
        res.redirect('/admin/posts')
    }
})

router.get('/posts/edit/:id', eAdmin, (req, res) => {
    Category.find().sort({date: 'desc'}).lean().then((categories) => {
        Post.findOne({_id: req.params.id}).populate('category').lean().then((post) => {
            res.render('admin/editPosts', {post, categories})
        }).catch((err) => {
            req.flash('error_msg', 'Esse post não existe!')
            res.redirect('/admin/posts')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulário :(')
        res.redirect('/admin/posts')
    })
})
router.post('/posts/edit/', eAdmin, (req, res) => {
    let id = req.body.id
    let newPostData = getPost(req)
    let errors = validatePost(newPostData)

    if (errors.length > 0) {
        res.render("admin/posts", {errors})
    } else {
        Post.findOne({_id: id}).then((post) => {
            post.title = newPostData.title
            post.slug = newPostData.slug
            post.description = newPostData.description
            post.content = newPostData.content
            post.category = newPostData.category

            post.save().then(() => {
                console.log('Post editado com sucesso')
                req.flash('success_msg', 'Post editado com sucesso')
                res.redirect('/admin/posts')
            }).catch((err) => {
                console.log("Erro ao editar post: " + err)
                req.flash('error_msg', 'Erro ao editar post')
                res.redirect('/admin/posts')
            })

        }).catch((err) => {
            console.log("Erro ao editar post: " + err)
            req.flash('error_msg', 'Erro ao editar post')
            res.redirect('/admin/posts')
        })
    }
})
router.post('/posts/delete', eAdmin, (req, res) => {
    Post.deleteOne({_id: req.body.id}).then(() => {
        console.log('Post removida com sucesso')
        req.flash('success_msg', 'Post removida com sucesso')
        res.redirect('/admin/posts')
    }).catch((err) => {
        console.log("Erro ao remover post: " + err)
        req.flash('error_msg', 'Erro ao remover post')
        res.redirect('/admin/posts')
    })
})


const validateCategory = (name, slug) => {
    let errors = []

    if (name === '' || typeof name === undefined || name == null) {
        errors.push({text: "Nome inválido!"})
    }

    if (slug === '' || typeof slug === undefined || slug == null) {
        errors.push({text: "Slug inválido!"})
    }

    if (name.length === 1) {
        errors.push({text: "Nome de categoria muito pequeno!"})
    }

    return errors
}

const validatePost = (post) => {
    let errors = []

    if (post.category === '' || post.category === '0')
        errors.push({text: "Registre uma categoria antes de registrar um post!!"})

    return errors
}

const getPost = (req) => {
    let title = req.body.title
    let slug = req.body.slug
    let description = req.body.description
    let content = req.body.content
    let category = req.body.category

    return {
        title,
        slug,
        description,
        content,
        category
    }
}

module.exports = router