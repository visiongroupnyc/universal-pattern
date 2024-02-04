const {
	describe,
} = require('node:test');

const steps = require('../steps');

module.exports = (context) => function FlowLogin() {
	describe('Login flow', () => {
		steps(context).login(context);
	});
};
