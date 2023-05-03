module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.admin === true  ){
            return next()
        }else{
            req.flash('error_msg','Você deve estar logado como administrador para entrar nesta página!')
            res.redirect('/')
        }
    }
}