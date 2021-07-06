const jwt = require('jsonwebtoken')

const autorize = (req, res, next) => {
	const token = req.headers.authorization.split(' ')[1]
	if (!token) return res.status(401)
		.json({ auth: false, msg: 'Não autorizado.' })

	jwt.verify(token, 'NewAccount1', (err, decoded) => {
		if (err) return res.status(500)
			.json({ auth: false, msg: 'Falha na autorização' })

		req.userId = decoded.id
		next()
	})
}

module.exports = autorize