const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		message: { type: String, required: true },
		read: { type: Boolean, required: true }
	},
	{ timestamps: true }
)

module.exports = mongoose.model('message', Message)