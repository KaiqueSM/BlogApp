const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Users')
const {render} = require("express/lib/application");
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')

router.get('/register', (req, res) => {
    res.render('user/register')
})
router.post('/register', (req, res) => {

    let name = req.body.name
    let email = req.body.email
    let password = req.body.password
    let password2 = req.body.password2

    if (password2 !== password){
        req.flash('error_msg', 'Senhas distintas!')
        res.redirect('/user/register')
    }else{
        User.findOne({email}).lean().then((userData) => {
            if (userData){
                req.flash('error_msg', 'Este email já foi cadastrado!')
                res.redirect('/user/register')
            }else{
                let user = {name, email, password}

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(user.password, salt, (erro, hash) => {
                        if (erro){
                            req.flash('error_msg', 'Desculpe, infelizmente não foi possível criar seu usuário, tente novamente mais tarde!')
                            console.log('Erro ao encriptografar senha: '+erro)
                            res.redirect('/')
                        }else{
                            user.password = hash

                            new User(user).save().then(() => {
                                req.flash('success_msg', 'Usuário criado! Bem vindo ao nosso sistema!')
                                res.redirect('/')
                            }).catch((err) => {
                                req.flash('error_msg', 'Desculpe, infelizmente não foi possível criar seu usuário, tente novamente mais tarde!')
                                console.log('Erro ao criar usuario: '+err)
                                res.redirect('/')
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Desculpe, infelizmente não foi possível criar seu usuário, tente novamente mais tarde!')
            console.log('Erro ao criar usuario: '+err)
            res.redirect('/')
        })
    }
})


module.exports = router