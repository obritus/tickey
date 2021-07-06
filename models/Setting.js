const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Setting = new Schema(
	{
		site_title: { type: String },
		default_banner: { type: Schema.Types.ObjectId, ref: "empreendimentos" },
		destaques: [{ type: Schema.Types.ObjectId, ref: "empreendimentos" }],
	},
	{ timestamps: true }
)

module.exports = mongoose.model('settings', Setting)