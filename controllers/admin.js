const mongoose = require('mongoose');

const fileHelper = require('../utils/file');


const { validationResult } = require('express-validator');

const Producto = require('../models/producto');

exports.getCrearProducto = (req, res, next) => {
  res.render('admin/editar-producto', { 
    titulo: 'Crear Producto',
    path: '/admin/editar-producto',
    modoEdicion: false,
    tieneError: false,
    mensajeError: null,
    erroresValidacion: []
  });
};

exports.postCrearProducto = (req, res, next) => {
  const nombre = req.body.nombre;
  //const urlImagen = req.body.urlImagen;
  const imagen = req.file;
  const precio = req.body.precio;
  const descripcion = req.body.descripcion;
  if (!imagen) {
    return res.status(422).render('admin/editar-producto', {
      titulo: 'Crear Producto',
      path: '/admin/crear-producto',
      modoEdicion: false,
      tieneError: true,
      mensajeError: 'No hay imagen adjunta',
      erroresValidacion: [],
      producto: {
        nombre: nombre,
        precio: precio,
        descripcion: descripcion
      }
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render('admin/editar-producto', {
      titulo: 'Crear Producto',
      path: '/admin/crear-producto',
      modoEdicion: false,
      tieneError: true,
      mensajeError: errors.array()[0].msg,
      erroresValidacion: errors.array(),
      producto: {
        nombre: nombre,
        precio: precio,
        descripcion: descripcion
      }
    });
  }

  const urlImagen = imagen.path;

  const producto = new Producto({
    //_id: new mongoose.Types.ObjectId('66e8eacce0e1b3b7ebf2bed0'),
    nombre: nombre,
    precio: precio,
    descripcion: descripcion,
    urlImagen: urlImagen,
    idUsuario: req.usuario._id
  });
  producto
    .save()
    .then(result => {
      // console.log(result);
      console.log('Producto Creado');
      res.redirect('/admin/productos');
    })
    .catch(err => {
      //console.log(err);
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditarProducto = (req, res, next) => {
  const modoEdicion = req.query.editar;
  if (!modoEdicion) {
    return res.redirect('/');
  }
  const idProducto = req.params.idProducto;
  // throw new Error('Error de prueba');
  Producto.findById(idProducto)
    .then(producto => {
      if (!producto) {
        return res.redirect('/');
      }
      res.render('admin/editar-producto', {
        titulo: 'Editar Producto',
        path: '/admin/edit-producto',
        modoEdicion: modoEdicion,
        producto: producto,
        tieneError: false,
        mensajeError: null,
        erroresValidacion: [],
      });
    })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};


exports.postEditarProducto = (req, res, next) => {
  const idProducto = req.body.idProducto;
  const nombre = req.body.nombre;
  const precio = req.body.precio;
  const imagen = req.file;
  const descripcion = req.body.descripcion;


  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/editar-producto', {
      titulo: 'Editar Producto',
      path: '/admin/editar-producto',
      modoEdicion: true,
      tieneError: true,
      mensajeError: errors.array()[0].msg,
      erroresValidacion: errors.array(),
      producto: {
        nombre: nombre,
        precio: precio,
        descripcion: descripcion,
        _id: idProducto
      }
    });
  }

  Producto.findById(idProducto)
    .then(producto => {
      if (producto.idUsuario.toString() !== req.usuario._id.toString()) {
        return res.redirect('/');
      }
      producto.nombre = nombre;
      producto.precio = precio;
      producto.descripcion = descripcion;
      if (imagen) {
        fileHelper.deleteFile(producto.urlImagen);
        producto.urlImagen = imagen.path;
      }
      return producto.save();
    })
    .then(result => {
      console.log('PRODUCTO GUARDADO!');
      res.redirect('/admin/productos');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; 

exports.getProductos = (req, res, next) => {
  Producto
    //.find()
    .find({ idUsuario: req.usuario._id })
    //.select('nombre precio -_id')
    .then(productos => {
      console.log(productos)
      res.render('admin/productos', {
        prods: productos,
        titulo: 'Admin Productos',
        path: '/admin/productos',
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  };


exports.postEliminarProducto = (req, res, next) => {
  const idProducto = req.body.idProducto;
  Producto.findById(idProducto)
    .then(producto => {
      if (!producto) {
        return next(new Error('Producto no encontrado'));
      }
      fileHelper.deleteFile(producto.urlImagen);
      return   Producto.deleteOne({ _id: idProducto, idUsuario: req.usuario._id });
    })
    .then(() => {
      console.log('PRODUCTO ELIMINADO');
      res.redirect('/admin/productos');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

};

exports.deleteProducto = (req, res, next) => {
  const idProducto = req.params.idProducto;
  Producto.findById(idProducto)
    .then(producto => {
      if (!producto) {
        return next(new Error('Producto no encontrado'));
      }
      fileHelper.deleteFile(producto.urlImagen);
      return   Producto.deleteOne({ _id: idProducto, idUsuario: req.usuario._id });
    })
    .then(() => {
      console.log('PRODUCTO ELIMINADO');
      res.status(200).json({ message: 'Exitoso' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Eliminacion del producto fallo' });
    });
};