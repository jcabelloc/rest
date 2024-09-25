const crypto = require('crypto');

const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const { validationResult } = require('express-validator');


const Usuario = require("../models/usuario");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);


exports.getIngresar = (req, res, next) => {
  let mensaje = req.flash('error');
  if (mensaje.length > 0) {
    mensaje = mensaje[0];
  } else {
    mensaje = null;
  }
  res.render('auth/ingresar', {
    path: '/ingresar',
    titulo: 'Ingresar',
    autenticado: false,
    mensajeError: mensaje,
    datosAnteriores: {
      email: '',
      password: ''
    },
    erroresValidacion: []
  });
};


exports.postIngresar = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/ingresar', {
      path: '/ingresar',
      titulo: 'Ingresar',
      mensajeError: errors.array()[0].msg,
      datosAnteriores: {
        email: email,
        password: password
      },
      erroresValidacion: errors.array()
    });
  }

  Usuario.findOne({ email: email })
    .then(usuario => {
      if (!usuario) {
        return res.status(422).render('auth/ingresar', {
          path: '/ingresar',
          titulo: 'Ingresar',
          mensajeError: 'Invalido email o password.',
          datosAnteriores: {
            email: email,
            password: password
          },
          erroresValidacion: []
        });
      }
      bcrypt
        .compare(password, usuario.password)
        .then(hayCoincidencia => {
          if (hayCoincidencia) {
            req.session.autenticado = true;
            req.session.usuario = usuario;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/ingresar', {
            path: '/ingresar',
            titulo: 'Ingresar',
            mensajeError: 'Invalido email o password.',
            datosAnteriores: {
              email: email,
              password: password
            },
            erroresValidacion: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/ingresar');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  };

exports.getRegistrarse = (req, res, next) => {
  let mensaje = req.flash('error');
  if (mensaje.length > 0) {
    mensaje = mensaje[0];
  } else {
    mensaje = null;
  }
  res.render('auth/registrarse', {
    path: '/registrarse',
    titulo: 'Registrarse',
    autenticado: false,
    mensajeError: mensaje,
    datosAnteriores: {
      email: '',
      password: '',
      passwordConfirmado: ''
    },
    erroresValidacion: []
  });
};

exports.postRegistrarse = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/registrarse', {
      path: '/registrarse',
      titulo: 'registrarse',
      mensajeError: errors.array()[0].msg,
      datosAnteriores: {
        email: email,
        password: password,
        passwordConfirmado: req.body.passwordConfirmado
      },
      erroresValidacion: errors.array()
    });
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const usuario = new Usuario({
        email: email,
        password: hashedPassword,
        carrito: { items: [] }
      });
      return usuario.save();
    })
    .then(result => {
      res.redirect('/ingresar');
      return transporter.sendMail({
        to: email,
        from: 'jcabelloc@itana.pe', // Corresponde al email verificado en Sendgrid
        subject: 'Registro Exitoso!!',
        html: '<h1>Se ha dado de alta satisfactoriamente!</h1>'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postSalir = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReinicio = (req, res, next) => {
  let mensaje = req.flash('error');
  if (mensaje.length > 0) {
    mensaje = mensaje[0];
  } else {
    mensaje = null;
  }
  res.render('auth/reinicio', {
    path: '/reinicio',
    titulo: 'Reinicio Password',
    mensajeError: mensaje
  });
};


exports.postReinicio = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reinicio');
    }
    const token = buffer.toString('hex');
    Usuario.findOne({ email: req.body.email })
      .then(usuario => {
        if (!usuario) {
          req.flash('error', 'No se encontro usuario con dicho email');
          return res.redirect('/reinicio');
        }
        usuario.tokenReinicio = token;
        usuario.expiracionTokenReinicio = Date.now() + 3600000; // + 1 hora
        return usuario.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'jcabelloc@itana.pe',
          subject: 'Reinicio de Password',
          html: `
            <p>Tu has solicitado un reinicio de password</p>
            <p>Click aqui <a href="http://localhost:3000/reinicio/${token}">link</a> para establecer una nuevo password.</p>
          `
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNuevoPassword = (req, res, next) => {
  const token = req.params.token;
  Usuario.findOne({ tokenReinicio: token, expiracionTokenReinicio: { $gt: Date.now() } })
    .then(usuario => {
      let mensaje = req.flash('error');
      if (mensaje.length > 0) {
        mensaje = mensaje[0];
      } else {
        mensaje = null;
      }
      res.render('auth/nuevo-password', {
        path: '/nuevo-password',
        titulo: 'Nuevo Password',
        mensajeError: mensaje,
        idUsuario: usuario._id.toString(),
        tokenPassword: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNuevoPassword = (req, res, next) => {
  const nuevoPassword = req.body.password;
  const idUsuario = req.body.idUsuario;
  const tokenPassword = req.body.tokenPassword;
  let usuarioParaActualizar;

  Usuario.findOne({
    tokenReinicio: tokenPassword,
    expiracionTokenReinicio: { $gt: Date.now() },
    _id: idUsuario
  })
    .then(usuario => {
      usuarioParaActualizar = usuario;
      return bcrypt.hash(nuevoPassword, 12);
    })
    .then(hashedPassword => {
      usuarioParaActualizar.password = hashedPassword;
      usuarioParaActualizar.tokenReinicio = undefined;
      usuarioParaActualizar.expiracionTokenReinicio = undefined;
      return usuarioParaActualizar.save();
    })
    .then(result => {
      res.redirect('/ingresar');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};