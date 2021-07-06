require('dotenv')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
const path = require('path')
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT || 3001
const mongooseURL = 'mongodb+srv://britus:Newaccount1@clusterprincipal.an0h9.gcp.mongodb.net/lojs?retryWrites=true&w=majority'
const dashboard = require('./routes/index')
const api = require('./routes/api')
const mongoose = require('mongoose')

app
	// REQ BODY EXPRESS
	.use(cors())
	.use(cookieParser('df496ae9b59e2fac25aedcf1feddcb13'))
	.use(express.urlencoded({ extended: true }))
	.use(express.json())

	// TEMPLATE ENGINE
	.engine('handlebars', handlebars())
	.set('view engine', 'handlebars')

	// ROTAS
	.use(express.static(path.join(__dirname, 'public')))
	.use(express.static(path.join(__dirname, 'uploads')))
	.get('/', (req, res) => res.sendStatus(200))
	.use('/api', api)
	.use('/dashboard', dashboard)

	.listen(port, () => {
		// BANCO DE DADOS
		mongoose.Promise = global.Promise
		mongoose.connect(mongooseURL,
			{ useNewUrlParser: true, useUnifiedTopology: true }, () =>
				console.log('Conectado ao Banco de Dados')
			)
	})