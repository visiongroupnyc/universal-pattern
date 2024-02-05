export function generateRandomPassword() {
	const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
	const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const numbers = '0123456789';
	const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

	function getRandomCharacter(str) {
		return str[Math.floor(Math.random() * str.length)];
	}

	const password = [
		getRandomCharacter(lowerChars),
		getRandomCharacter(upperChars),
		getRandomCharacter(numbers),
		getRandomCharacter(symbols),
	];

	while (password.length < 8) {
		const randomSet = [lowerChars, upperChars, numbers, symbols][Math.floor(Math.random() * 4)];
		password.push(getRandomCharacter(randomSet));
	}

	password.sort(() => Math.random() - 0.5);

	return password.join('');
}

export default '1.0';
