const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Empreendimento = new Schema(
	{
		title: { type: String, required: true },
		categoria: { type: Number, required: true },
		type: { type: Number, required: true },
		price: { type: Number, required: true },
		status: { type: Boolean, required: true },
		cidade: { type: Schema.Types.ObjectId, required: true, ref: "cidades" },
		bairro: { type: Schema.Types.ObjectId, required: true, ref: "bairros" },
			quartos: { type: Number },
			suites: { type: Number },
			banheiros: { type: Number },
			vagas_garagem: { type: Number },
		google_maps: { type: String },
		details: { type: String },
		default_image: { type: Schema.Types.ObjectId, ref: "images" },
		tags: { type: Array }
	},
	{ timestamps: true }
)

module.exports = mongoose.model('empreendimentos', Empreendimento)

/*

------ TIPOS ------

String
Number
Date
Buffer
Boolean
Mixed
ObjectId
Array
Decimal128
Map

*/ 