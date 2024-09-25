const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const pedidoSchema = new Schema({
  productos: [
    {
      producto: { type: Object, required: true },
      cantidad: { type: Number, required: true }
    }
  ],
  usuario: {
    email: {
      type: String,
      required: true
    },
    idUsuario: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Usuario'
    }
  }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
