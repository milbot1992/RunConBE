exports.handleMongoErrors = (err, req, res, next) => {
	if (err && err._message && err._message.includes('Group validation failed')) {
		return res.status(400).send({ message: "Bad request" });
	}
	if (err && err._message && err._message.includes('User validation failed')) {
		return res.status(400).send({ message: "Bad request" });
	}
	if (err && err._message && err._message.includes('Run validation failed')) {
		return res.status(400).send({ message: "Bad request" });
	}
	if (err && err.errors && err.errors.group_id && err.errors.group_id.path === 'group_id' && err.errors.group_id.reason && err.errors.group_id.reason.code === 'ERR_ASSERTION') {
		return res.status(400).send({ message: "Bad request" });
	}
	if (err && err.name === 'CastError' && err.kind === 'Number') {
		return res.status(400).send({ message: "Bad Request" });
	}
	next(err);
};

exports.handleErrors = (err, req, res, next) => {
	if (err.status) {
		res.status(err.status).send({ message: err.message });
	} else {
		next(err);
	}
};