const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');


const router = express.Router();


router.get('/crear-producto', isAuth, adminController.getCrearProducto);

router.get('/productos', isAuth, adminController.getProductos);

router.post(
    '/crear-producto',
    [
        body('nombre')
          .isString()
          .isLength({ min: 3 })
          .trim(),
        body('precio').isFloat(),
        body('descripcion')
          .isLength({ min: 5, max: 400 })
          .trim()
      ],
    isAuth,
    adminController.postCrearProducto);

router.get('/editar-producto/:idProducto', isAuth, adminController.getEditarProducto);

router.post(
    '/editar-producto',
    [
        body('nombre')
          .isString()
          .isLength({ min: 3 })
          .trim(),
        body('precio').isFloat(),
        body('descripcion')
          .isLength({ min: 5, max: 400 })
          .trim()
      ],
      isAuth,
      adminController.postEditarProducto);

router.post('/eliminar-producto', isAuth, adminController.postEliminarProducto);

router.delete('/producto/:idProducto', isAuth, adminController.deleteProducto);



module.exports = router;
