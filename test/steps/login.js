const test = require('node:test');
const assert = require('node:assert');

const { request } = require('../helpers/request');

module.exports = (context) => function login() {
	const email = process.env.EMAIL || (context?.data?.email || 'mail@example.com');
	const password = process.env.PASSWORD || (context?.data?.password || 'SET_PASSWORD');

	test('Login', async (t) => {
		await t.test('Login: invalid login', async () => {
			await request('/users/login', {
				method: 'post',
				expectStatus: 401,
				body: {
					email: 'invalid@mail.com',
					password: 'asdasdasd',
				},
			});
		});

		await t.test('Login: valid login', async () => {
			const response = await request('/users/login', {
				method: 'post',
				expectStatus: 200,
				body: {
					email,
					password,
				},
			});

			assert.ok(response.body.hasOwnProperty('jwt'), 'prop jwt is not exists');
			context.token = response.body.jwt;
		});
	});
};
