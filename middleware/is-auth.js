module.exports = (req, res, next) => {
    if (!req.session.autenticado) {
        return res.redirect('/ingresar');
    }
    next();
}