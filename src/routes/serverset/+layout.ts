import { createToken } from "$lib/token.svelte";

export const load = () => {
	return {
		token: createToken()
	};
};