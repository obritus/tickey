const FuncaoTeste = argument => {
	if(argument != null) {
		console.log(argument.texto1)
		console.log(argument.texto2)
		console.log(argument.texto3)	
	}
	else {
		return "Conjunto Vazio"
	}
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const slugfy = (str) => {
	str = str.replace(/^\s+|\s+$/g, '')
	str = str.toLowerCase()

	var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:"
	var to = "aaaaeeeeiiiioooouuuunc------"

	for (var i=0, l=from.length ; i<l ; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
	}

	str = str.replace(/[^a-z0-9 -]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')

	return str
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const obterData = args => {
	data = new Date(args)

	const meses = [
		'janeiro',
		'fevereiro',
		'março',
		'abril',
		'maio',
		'junho',
		'julho',
		'agosto',
		'setembro',
		'outubro',
		'novembro',
		'dezembro'
	]

	const dias = [
		'segunda-feira',
		'terça-feira',
		'quarta-feira',
		'quita-feira',
		'sexta-feira',
		'sábado',
		'domingo',
	]

	zero = (arg) => {
		return ((arg < 10) ? '0' + arg : arg)
	}

	const diaNome = dias[data.getDay()]
	const dia = data.getDate()
	const mes = meses[data.getMonth()]
	const ano = data.getFullYear()
	const horas = zero(data.getHours()) + 'h' + zero(data.getMinutes())

	return `${diaNome}, ${dia} de ${mes} de ${ano}, às ${horas}.`
}

module.exports = {obterData, FuncaoTeste, slugfy}