const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Bairro = new Schema(
	{
		name: { type: String, required: true },
		cidade: { type: Schema.Types.ObjectId, required: true, ref: "cidades" }
	},
	{ timestamps: true }
)

module.exports = mongoose.model('bairros', Bairro)