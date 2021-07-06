const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		login: { type: String, required: true },
		password: { type: String, required: true, select: false },
		status: { type: Boolean, required: true },
		admin: { type: Boolean, required: true }
	},
	{ timestamps: true }
)

module.exports = mongoose.model('usuarios', Usuario)