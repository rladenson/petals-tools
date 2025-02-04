<script lang="ts">
	import { baseURL, OnOffNone } from '$lib';
	import Modal from '$lib/Modal.svelte';
	import { TokenValidation } from '$lib/token.svelte';
	const { token, serverId } = $props();
	let modalTitle = $state(''),
		modalBody = $state(''),
		modalData = $state('');

	let systemSettings = $state({
		proxyingEnabled: OnOffNone.None,
		tagEnabled: OnOffNone.None,
		serverTag: '',
		serverTagSelect: OnOffNone.None
	});
	let systemSettingsInvalid = $derived(
		token.validate != TokenValidation.Valid ||
			serverId == '' ||
			(systemSettings.proxyingEnabled == OnOffNone.None &&
				systemSettings.tagEnabled == OnOffNone.None &&
				systemSettings.serverTagSelect == OnOffNone.None) ||
			(systemSettings.serverTagSelect == OnOffNone.On && systemSettings.serverTag == '')
	);
	let submitSystem = async (e: Event) => {
		e.preventDefault();
		const res = await fetch(baseURL + `systems/@me/guilds/${serverId}`, {
			method: 'PATCH',
			headers: {
				Authorization: token.value,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				tag:
					systemSettings.serverTagSelect == OnOffNone.Off
						? null
						: systemSettings.serverTagSelect == OnOffNone.On
							? systemSettings.serverTag
							: undefined,
				tag_enabled:
					systemSettings.tagEnabled == OnOffNone.Off
						? false
						: systemSettings.tagEnabled == OnOffNone.On
							? true
							: undefined,
				proxying_enabled:
					systemSettings.proxyingEnabled == OnOffNone.Off
						? false
						: systemSettings.proxyingEnabled == OnOffNone.On
							? true
							: undefined
			})
		});
		if (res.ok) {
			modalTitle = 'Success!';
			modalBody = 'System Settings changed in server ' + serverId.toString();
			modalData = await res.json();
			shown = true;
		}
	};
	let shown = $state(false);
</script>

<form class="m-4 flex w-fit flex-col rounded bg-blue-100 p-6 pt-4" onsubmit={submitSystem}>
	<h2 class="text-xl">System Settings</h2>
	<label class="text-l text-gray-800" for="proxyEnabled">Proxying Enabled:</label>
	<select
		class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		id="proxyEnabled"
		name="proxyEnabled"
		bind:value={systemSettings.proxyingEnabled}
	>
		<option value={0}>Don't Change Setting</option>
		<option value={1}>Turn On</option>
		<option value={2}>Turn Off</option>
	</select>
	<label class="text-l text-gray-800" for="tagEnabled">Tag Enabled:</label>
	<select
		class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		id="tagEnabled"
		name="tagEnabled"
		bind:value={systemSettings.tagEnabled}
	>
		<option value={0}>Don't Change Setting</option>
		<option value={1}>Turn On</option>
		<option value={2}>Turn Off</option>
	</select>
	<label class="text-l text-gray-800" for="serverTagSelect">Server Tag Action:</label>
	<select
		class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		id="serverTagSelect"
		name="serverTagSelect"
		bind:value={systemSettings.serverTagSelect}
	>
		<option value={0}>Don't Change Setting</option>
		<option value={1}>Set</option>
		<option value={2}>Clear</option>
	</select>
	<input
		type="text"
		class="peer order-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
		id="serverTag"
		name="serverTag"
		placeholder="serverTag"
		bind:value={systemSettings.serverTag}
		disabled={systemSettings.serverTagSelect != OnOffNone.On}
	/>
	<label
		class="text-l order-1 text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
		for="serverTag">Server Tag:</label
	>
	<div class="order-last grow"></div>
	<input
		class="order-last mt-2 w-full cursor-pointer rounded bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
		type="submit"
		value="Go!"
		disabled={systemSettingsInvalid}
	/>
</form>

<Modal title={modalTitle} body={modalBody} data={modalData} bind:shown />
