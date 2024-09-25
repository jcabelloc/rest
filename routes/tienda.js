const path = require('path');

const express = require('express');

const tiendaController = require('../controllers/tienda');
const isAuth = require('../middleware/is-auth');


const router = express.Router();

// GET requiere una coincidencia exacta en la ruta
router.get('/', tiendaController.getIndex);

router.get('/productos', tiendaController.getProductos);

router.get('/productos/:idProducto', tiendaController.getProducto);


router.get('/carrito', isAuth, tiendaController.getCarrito);

router.post('/carrito', isAuth, tiendaController.postCarrito);

router.post('/eliminar-producto-carrito', isAuth, tiendaController.postEliminarProductoCarrito);


router.get('/pedidos', isAuth, tiendaController.getPedidos);

router.post('/crear-pedido', isAuth, tiendaController.postPedido);

router.get('/pedidos/:idPedido', isAuth, tiendaController.getComprobante);


module.exports = router;