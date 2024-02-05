const _request = require('supertest');

const config = require('../config');

async function request(url, data = {
	method: 'get',
}) {
	return new Promise((resolve, reject) => {
		let r;
		const host = data.host || config.host;

		r = _request(host);
		r = r[data.method](url);
		r = r.timeout(data.timeout || 15000);

		if (data.body) {
			r = r.send(data.body);
		}

		if (data.query) {
			r = r.query(data.query);
		}

		if (data.Auth) {
			r = r.set('authorization', `Bearer ${data.Auth}`);
		}

		if (data['x-version']) {
			r = r.set('x-version', data['x-version']);
		}

		if (data['x-origin']) {
			r = r.set('x-origin', data['x-origin']);
		}

		r = r.set('Accept', 'application/json');
		if (data.expectStatus) {
			r = r.expect(data.expectStatus);
		}

		r.end((err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	});
}

const version = '1.1';

module.exports = {
	version,
	request,
};
