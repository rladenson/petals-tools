import { createServerId } from "$lib/guildId.svelte";
import { createToken } from "$lib/token.svelte";

export const load = () => {
	return {
		token: createToken(),
        serverId: createServerId()
	};
};