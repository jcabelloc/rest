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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors)
    const error = new Error('No paso la validación de datos');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No ha adjuntado una imagen');
    error.statusCode = 422;
    throw error;
  }

  const nombre = req.body.nombre;
  const imagen = req.file;
  const precio = req.body.precio;
  const descripcion = req.body.descripcion;
  const urlImagen = imagen.path;

  const producto = new Producto({
    //_id: new mongoose.Types.ObjectId('66e8eacce0e1b3b7ebf2bed0'),
    nombre: nombre,
    precio: precio,
    descripcion: descripcion,
    urlImagen: urlImagen,
    idUsuario: req.idUsuario
  });
  producto
    .save()
    .then(result => {
      res.status(201).json({
        mensaje: 'Producto creado satisfactoriamente!',
        prod: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
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
  const idProducto = req.params.idProducto;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('No paso la validación de datos para actualizar el producto');
    error.statusCode = 422;
    throw error;
  }

  const nombre = req.body.nombre;
  const precio = req.body.precio;
  const imagen = req.file;
  const descripcion = req.body.descripcion;


  Producto.findById(idProducto)
    .then(producto => {
      if (!producto) {
        const error = new Error('No se pudo encontrar el producto');
        error.statusCode = 404;
        throw error;
      }
      if (producto.idUsuario.toString() !== req.idUsuario.toString()) {
        const error = new Error('No Autorizado');
        error.statusCode = 403;
        throw error;
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
      res.status(200).json({ mensaje: 'Producto actualizado con exito', prod: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProductos = (req, res, next) => {
  Producto
    .find({ idUsuario: req.idUsuario })
    //.select('nombre precio -_id')
    .then(productos => {
      res
        .status(200)
        .json({
          prods: productos,
          mensaje: 'Se obtuvieron los productos con exito',
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
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
      return Producto.deleteOne({ _id: idProducto, idUsuario: req.usuario._id });
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
      return Producto.deleteOne({ _id: idProducto, idUsuario: req.usuario._id });
    })
    .then(() => {
      console.log('PRODUCTO ELIMINADO');
      res.status(200).json({ message: 'Exitoso' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Eliminacion del producto fallo' });
    });
};