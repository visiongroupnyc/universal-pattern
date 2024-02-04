const test = require('node:test');

module.exports = () => function delay(sec = 30) {
	test(`Delay for ${sec} seconds`, async (t) => {
		await t.test(`Wait for ${sec} seconds`, async () => {
			await new Promise((resolve) => setTimeout(resolve, sec * 1000));
		});
	});
};
