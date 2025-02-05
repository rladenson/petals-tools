export function createServerId(): ServerId {
	let serverIdRaw = $state('');
	const serverId = $derived.by(() => {
		const match = serverIdRaw.match(
			/^(?:https?:\/\/(?:(?:ptb|canary)\.)?discord\.com\/channels\/)?(\d{17,19})(?:\/\d{17,19}){0,2}\/?$/
		);
		return match == null ? '' : match[1];
	});

	return {
		get id() {
			return serverId;
		},
		get raw() {
			return serverIdRaw;
		},
		set raw(id) {
			serverIdRaw = id;
		}
	};
}

export type ServerId = {
	readonly id: string;
	raw: string;
};
