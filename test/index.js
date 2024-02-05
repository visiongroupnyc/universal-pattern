const {
	describe,
} = require('node:test');

const { argv } = require('node:process');
const Context = require('./helpers/context');

const steps = require('./steps');
const flows = require('./flows');

let flowName = null;
let stepName = null;
const context = Context();

argv.forEach((val, index) => {
	if (val === '--flow') {
		flowName = argv[index + 1];
	}
	if (val === '--step') {
		stepName = argv[index + 1];
	}
});

if (flowName === null) {
	flowName = process.env.FLOW_NAME;
}

if (stepName === null) {
	stepName = process.env.STEP_NAME;
}

console.info('flowname : ', flowName);
console.info('stepName : ', stepName);

if (!stepName && !flowName) {
	console.info('StepName or FlowName is required');
	process.exit(1);
}

if (stepName && !flowName) {
	describe(`Testing step ${stepName}`, () => {
		steps(context)[stepName]();
	});
}

if (flowName) {
	describe(`Testing flow ${flowName}`, async () => {
		flows(context)[flowName]();
	});
}
