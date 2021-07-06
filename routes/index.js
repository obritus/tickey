const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const multer = require('multer')
const path = require('path')
const jwt = require('jsonwebtoken')

const Empreendimento = require('../models/Empreendimento') //EMPREENDIMENTOS MODEL
const Setting = require('../models/Setting') //CONFIGURAÇÕES MODEL
const Usuario = require('../models/Usuario') //USUÁRIOS MODEL
const Cidade = require('../models/Cidade') //CIDADES MODEL
const Bairro = require('../models/Bairro') //BAIRROS MODEL
const Message = require('../models/Message') //MENSAGENS MODEL
const Image = require('../models/Image') //IMAGENS MODEL

const autorize = async (req, res, next) => {
	if (req.cookies.token) {
		const Token = req.cookies.token
		
		jwt.verify(Token, 'df496ae9b59e2fac25aedcf1feddcb13',
			(err, decoded) => {
				if (err) return res.redirect('/dashboard/login')
				req.user_id = decoded.user_id
				return next()
			})
	} else {
		return res.redirect('/dashboard/login')
	}
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const multerConfigs = {
	dest: path.resolve(__dirname, '..', 'tmp', 'uploads'),
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, multerConfigs.dest)
		},
		filename: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if(err) cb(err)
				let extension = file.originalname.slice(-4)
				let filename = `${hash.toString('hex') + extension}`
				cb(null, filename)
			})
		}
	}),
	limits: {
		fileSize: 2 * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			'image/jpeg',
			'image/png'
		]
		if(allowedMimes.includes(file.mimetype)) {
			cb(null, true)
		} else {
			cb(new Error("Tipo de arquivo inválido"))
		}
	}
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const read_messages = Message.find({ read: false }).countDocuments()

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = router
	.get('/', autorize, async (req, res) => {
		let empreendimentos = Empreendimento.find().countDocuments()
		let publicados = Empreendimento.find({ status: true }).countDocuments()
		let imagens = Image.find().countDocuments()
		let messages = Message.find().countDocuments()
		let cidades = Cidade.find().countDocuments()
		let bairros = Bairro.find().countDocuments()

		res.render('index', {
			title: 'Página Inícial',
			empreendimentos_number: await empreendimentos,
			emp_publicados_number: await publicados,
			images_number: await imagens,
			messages_number: await messages,
			messages_read_number: await read_messages,
			cidades_number: await cidades,
			bairros_number: await bairros,
			home: true
		})
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/empreendimentos', autorize, async (req, res) =>
		res.render('empreendimentos', {
			title: `Empreendimentos`,
			messages_read_number: await read_messages,
			empreendimentos: true
		})
	)

// -----------------------------------------------------------------------------

	.get('/empreendimentos/edit/:id', autorize, async (req, res) =>
		res.render('empreendimentos/edit', {
			_id: req.params.id,
			title: `Editar empreendimento ${req.params.id}`,
			edit: true,
			messages_read_number: await read_messages,
			empreendimentos: true
		})
	)

// -----------------------------------------------------------------------------

	.get('/empreendimentos/create', autorize, async (req, res) => {
		res.render('empreendimentos/create', {
			_id: req.params.id,
			title: 'Adicionar novo empreendimento',
			create: true,
			messages_read_number: await read_messages,
			empreendimentos: true
		})
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/cidades', autorize, async (req, res) => {
		const cidade = Cidade.find().lean().sort('name')
		return res.render('cidades', {
			title: `Cidades`,
			cidade: await cidade,
			messages_read_number: await read_messages,
			cidades: true,
			active: 'cidades'
		})
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/usuarios', autorize, async (req, res) => {
		const usuario = Usuario.find().lean().sort('name')
		const data = {
			usuario: await usuario,
			title: `Usuários`,
			messages_read_number: await read_messages,
			usuarios: true
		}
		return res.render('usuarios', data)
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/messages', autorize, async (req, res) => {
		const message = Message.find().lean().sort('createdAt')
		const data = {
			message: await message,
			title: `Mensagens`,
			messages_read_number: await read_messages,
			messages: true
		}
		return res.render('messages', data)
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/settings', autorize, async (req, res) => {
		const ObterSettings = Setting.findOne().lean()
			.populate([
				{
					path: 'destaques',
					populate: { path: "default_image", select: 'filename' }
				},
				{
					path: 'default_banner',
					populate: { path: "default_image", select: 'filename' }
				}
			])
		const Emps = Empreendimento.find({ status: true }).lean().sort('name')
		try {
			res.render('settings', {
				settings_page: true,
				title: `Configurações`,
				configs: await ObterSettings,
				emps: await Emps
			})
		} catch (error) {
			res.render('404')
		}
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/login', (req, res) =>
		res.render('login', { title: 'Entrar', login: true }))