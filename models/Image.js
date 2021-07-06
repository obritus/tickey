const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Image = new Schema(
	{
		title: { type: String },
		filename: { type: String, required: true },
		width: { type: Number, required: true},
		height: { type: Number, required: true},
		empreendimento: { type: Schema.Types.ObjectId, ref: "empreendimentos", required: true }
	},
	{ timestamps: true }
)

module.exports = mongoose.model('images', Image)

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