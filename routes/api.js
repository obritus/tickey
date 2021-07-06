const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const multer = require('multer')
const path = require('path')
const jwt = require('jsonwebtoken')

const Usuario = require('../models/Usuario') //ESTRUTURA DOS USUÁRIOS NO DB
const Empreendimento = require('../models/Empreendimento') //ESTRUTURA DOS EMPREENDIMENTOS NO DB
const Cidade = require('../models/Cidade') //ESTRUTURA DAS CIDADES NO DB
const Bairro = require('../models/Bairro') //ESTRUTURA DOS BAIRROSS NO DB
const Image = require('../models/Image') //ESTRUTURA DAS IMAGENS NO DB
const Message = require('../models/Message') //ESTRUTURA DAS MENSAGENS NO DB
const Setting = require('../models/Setting') //ESTRUTURA DAS CONFIGURAÇÕES NO DB

const autorize = (req, res, next) => {
	const AuthHeader = req.headers.authorization
	if (!AuthHeader)
		return res.status(401).json({ auth: false, msg: 'Não autorizado.' })

	const Token = req.headers.authorization.split(' ')[1]
	jwt.verify(Token, 'df496ae9b59e2fac25aedcf1feddcb13',
		(err, decoded) => {
			if (err) return res.status(500)
				.json({ auth: false, msg: 'Falha na autorização' })

			req.user_id = decoded.user_id
			next()
		})
}

const upld = {
	dest: path.resolve(__dirname, '..', 'tmp', 'uploads'),
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, upld.dest)
		},
		filename: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if (err) cb(err)
				let extension = file.originalname.slice(-4)
				let filename = `${hash.toString('hex') + extension}`
				cb(null, filename)
			})
		}
	}),
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			'image/jpeg',
			'image/png'
		]
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true)
		} else {
			cb(new Error("Tipo de arquivo inválido"))
		}
	}
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

router
	.get('/', (req, res) => {
		res.sendStatus(200)
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/messages', (req, res) => {
		Message
			.find()
			.sort('createdAt')
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})
	.post('/messages', (req, res) => {
		new Message(req.body)
			.save()
			.then(() => res.sendStatus(200))
			.catch(err => res.json({ err }))
	})
	.get('/messages/:id', (req, res) => {
		Message
			.findOneAndUpdate({ _id: req.params.id }, { read: true })
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})
	.put('/messages/:id', (req, res) => {
		//MARCAR MENSAGEM COMO LIDA
		Message
			.updateOne({ _id: req.params.id }, { read: false })
			.then(() => res.sendStatus(200))
			.catch(err => res.json({ err }))
	})
	.delete('/messages/:id', (req, res) => {
		//EXCLUIR MENSAGEM
		Message
			.deleteOne({ _id: req.params.id })
			.then(() => res.sendStatus(200))
			.catch(err => res.json({ err }))
	})
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/empreendimentos', (req, res) => {
		const GetStatus = s => {
			const tipos = {
				'true': true,
				'false': false,
				'undefined': ''
			}
			return tipos[s]
		}

		const query = {
			cidade: {
				_id: req.query.cidade || ''
			},
			bairro: {
				_id: req.query.bairro || ''
			},
			categoria: req.query.categoria || '',
			type: req.query.type || '',
			quartos: req.query.quartos || '',
			status: GetStatus(req.query.status)
		}

		Object.keys(query).forEach(key => {
			if (query[key] === '') delete query[key]
			if (key === 'cidade' && query.cidade._id === '') delete query.cidade
			if (key === 'bairro' && query.bairro._id === '') delete query.bairro
		})

		const limit = (req.query.all) ? 0 : 15
		const GetPage = () =>
			(req.query.page) ? (parseInt(req.query.page) - 1) * limit : 0

		Empreendimento
			.find(Object.assign({ status: true }, query))
			.populate([
				{ path: "bairro", select: 'name' },
				{ path: "cidade", select: 'name' },
				{ path: "default_image", select: 'filename' }
			])
			.limit(limit)
			.skip(GetPage())
			.lean()
			.sort('createdAt')
			.then(async data => {
				const all_on = await Empreendimento
					.find({ status: true }).countDocuments()
				const all_off = await Empreendimento
					.find({ status: false }).countDocuments()

				const dados = { all_on, all_off, data }
				res.json(dados)				
			})
			.catch(err => res.json({ err }))
	})

	.get('/empreendimentos/:id', (req, res) => {
		Empreendimento
			.findOne({ _id: req.params.id })
			.populate([
				{ path: "bairro", select: 'name' },
				{ path: "cidade", select: 'name' },
				{ path: "default_image" }
			])
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})

	.post('/empreendimentos', (req, res) => {
		//REMOVER ITENS NULLOS DO REQ.BODY
		Object.keys(req.body).forEach(item => {
			if (req.body[item] === '') delete req.body[item]
		})

		req.body.status = true

		new Empreendimento(req.body).save()
			.then(data => res.json({
				_id: data._id,
				msg: 'Empreendimento adicionado com sucesso.'
			}))
			.catch(err => {
				console.error(err)
				res.json({err, msg: 'Ocorreu um erro ao tentar adicionar o empreendimento.'})
			})
	})

	.put('/empreendimentos/:id', (req, res) => {
		if(req.body.status) {
			req.body.status = (req.body.status) ? true : false
		}
		Empreendimento
			.updateOne({ _id: req.params.id }, req.body)
			.then(() => res.json({ msg: 'Alterações aplicadas.' }))
			.catch(err => {
				res.json({ 
					err, 
					msg: 'Ocorreu um erro ao tentar atualizar o empreendimento.'
				})
			})
	})

	.delete('/empreendimentos', (req, res) => {
		Empreendimento
			.deleteOne({ _id: req.body._id })
			.then(() => {
				Image.deleteMany({ empreendimento: req.body._id })
					.then(() => {
						const fs = require('fs')
						const path = require('path')
						const EmpreendimentoFolder =
							path.resolve(`public/images/empreendimentos/${req.body._id}`)

						fs.rmdir(EmpreendimentoFolder, { recursive: true }, (err) => {
							if (err) {
								console.error(err)
								return
							}
							res.json({
								"msg": "Empreendimento excluído com sucesso.",
								"_id": req.body._id
							})
						})
					})
			})
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/cidades', (req, res) => {
		Cidade
			.find().sort('name')
			.populate('bairros', 'name')
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})
	.post('/cidades', (req, res) => {
		new Cidade(req.body)
			.save()
			.then(data => res.json({ msg: "Bairro adicionado.", _id: data._id }))
			.catch(err => res.json({ err }))
	})
	.delete('/cidades/:id', (req, res) => {
		Cidade
			.findOneAndDelete({ _id: req.params.id })
			.then(data => Bairro.deleteMany({ cidade: data._id }))
			.then(() => res.json({ msg: "Cidade excluída." }))
			.catch(err => res.json({ err }))
	})
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/bairros', (req, res) => {
		Bairro
			.find()
			.sort('-createdAt')
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})
	// OBTER BAIRROS DA CIDADE _id
	.get('/bairros/:id', (req, res) => {
		Bairro
			.find({ cidade: req.params.id})
			.sort('name')
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})
	.post('/bairros', (req, res) => {
		new Bairro(req.body)
			.save()
			.then(data => res.json({ msg: "Bairro adicionado.", _id: data._id }))
			.catch(err => res.json({ err }))
	})
	.delete('/bairros/:id', (req, res) => {
		Bairro
			.findOneAndDelete({ _id: req.params.id })
			.then(data => res.json({ msg: "Bairro excluído.", data }))
			.catch(err => res.json({ err }))
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/images', (req, res) => {
		Image
			.find()
			.select({ createdAt: false, updatedAt: false })
			.populate('cidade', 'name')
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})

	.get('/images/:id', (req, res) => {
		Image
			.find({ empreendimento: req.params.id })
			.select({ createdAt: false, updatedAt: false })
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})

	.put('/images/:id', (req, res) => {
		Image
			.updateOne({ _id: req.params.id }, req.body)
			.then(() => res.sendStatus(202))
			.catch(err => res.json({ err }))
	})

	.post('/images', multer(upld).array('images', 15), async (req, res, next) => {
		const fs = require('fs')
		const sharp = require('sharp')
		
		const _id = req.body._id
		const uploaded = []
		const new_folder =
			path.resolve(`public/images/empreendimentos/${_id}`)

		// CRIA UMA NOVA PASTA PARA O EMPREENDIMENTO SE ELA NÃO EXISTIR
		if (!fs.existsSync(new_folder)) { fs.mkdirSync(new_folder) }

		for await(const file of req.files) {
			await sharp(path.resolve(__dirname, '..', 'tmp/uploads', file.filename))
				.resize(1366)
				.toFile(path.resolve(new_folder, file.filename))
					.then(info => {
						uploaded.push({
							filename: file.filename,
							empreendimento: _id,
							width: info.width,
							height: info.height
						})
					})
		}

		Image
			.insertMany(uploaded)
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})

	.delete('/images/:id', (req, res) => {
		const fs = require('fs')
		const path = require('path')
		Image.findOneAndDelete({ _id: req.params.id })
			.then(data => {
				const EmpreendimentoFolder =
					path.resolve(`public/images/empreendimentos/${data.empreendimento}/${data.filename}`)
				fs.unlink(EmpreendimentoFolder, (err) => {
					if (err) {
						console.error(err)
						return
					}
					res.json({ msg: "Imagem excluída." })
				})
			})
			.catch(err => res.json({ err }))
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/settings', (req, res) => {
		Setting
			.findOne()
			.populate([
				{
					path: "destaques",
					select: 'title type price cidade bairro',
					populate: [
						{ path: "default_image", select: 'filename' },
						{ path: "cidade", select: 'name' },
						{ path: "bairro", select: 'name' }
					]
				},
				{
					path: "default_banner",
					select: 'title type price',
					populate: { path: "default_image", select: 'filename' }
				}
			])
			.then(data => res.json(data))
			.catch(err => res.json({ err }))
	})
	.post('/settings', (req, res) => {
		new Setting(req.body)
			.save()
			.then(data => res.json({ msg: "Salvo.", data }))
			.catch(err => res.json({ err }))
	})
	.put('/settings', (req, res) => {
		Setting
			.updateOne({}, req.body)
			.then(data => res.json({ msg: "Alterações salvas.", data }))
			.catch(err => res.json({ err }))
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.post('/login', async (req, res) => {
		const login = req.body.login
		const password = req.body.password
		const keep = (req.body.keep) ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : 0

		const User = await Usuario.findOne({ login, password })
		if(User) {
			const token = jwt.sign(
				{ user_id: User._id },
				'df496ae9b59e2fac25aedcf1feddcb13',
				{ expiresIn: Math.round(new Date(new Date().setFullYear(new Date().getFullYear() + 1))) }
			)
			const options = {
				expires: keep,
			}
			res.cookie('token', token, options)
			res.json({auth: true, token})
		} else {
			res.json({auth: false, msg: 'Usuário ou senha incorreto(s).'})
		}
	})

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

	.get('/usuarios', autorize, async (req, res) => {
		try {
			const Users = await Usuario.find({})
			res.json(Users)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})

	.post('/usuarios', async (req, res) => {
		try {
			const Users = await Usuario(req.body)

			if (Users.save()) {
				res.json({add: true})
			} else {
				res.json({add: false})
			}
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})


module.exports = router