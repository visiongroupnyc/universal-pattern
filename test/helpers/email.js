export function generateRandomEmail(domain) {
	const randomId = Math.random().toString(36).substring(2, 8); // Genera una cadena aleatoria
	return `${randomId}@${domain}`;
}

export default {
	generateRandomEmail,
};
