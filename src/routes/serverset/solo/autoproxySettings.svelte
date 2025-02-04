<script lang="ts">
	import { AutoproxyEnum, baseURL } from '$lib';
	import Modal from '$lib/Modal.svelte';
	import { TokenValidation } from '$lib/token.svelte';
	const { token, serverId } = $props();
	let modalTitle = $state(''),
		modalBody = $state(''),
		modalData = $state('');

	let autoproxySettings = $state({
		autoproxyMode: AutoproxyEnum.None,
		autoproxyMember: ''
	});
	let autoproxySettingsInvalid = $derived(
		token.validate != TokenValidation.Valid ||
			serverId == '' ||
			autoproxySettings.autoproxyMode == AutoproxyEnum.None ||
			(autoproxySettings.autoproxyMode == AutoproxyEnum.Front &&
				autoproxySettings.autoproxyMember == '') ||
			((autoproxySettings.autoproxyMode == AutoproxyEnum.Front ||
				autoproxySettings.autoproxyMode == AutoproxyEnum.Latch) &&
				autoproxySettings.autoproxyMember.match(/^(?:(?:[A-Za-z][- ]*){5,6})?$/) == null)
	);
	let submitAutoproxy = async (e: Event) => {
		e.preventDefault();
		const res = await fetch(baseURL + `systems/@me/autoproxy?guild_id=${serverId}`, {
			method: 'PATCH',
			headers: {
				Authorization: token.value,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				autoproxy_mode: autoproxySettings.autoproxyMode,
				autoproxy_member:
					autoproxySettings.autoproxyMember == '' ||
					!(
						autoproxySettings.autoproxyMode == AutoproxyEnum.Latch ||
						autoproxySettings.autoproxyMode == AutoproxyEnum.Member
					)
						? undefined
						: autoproxySettings.autoproxyMember
			})
		});
		if (res.ok) {
			modalTitle = 'Success!';
			modalBody = 'Autoproxy Settings changed in server ' + serverId.toString();
			modalData = await res.json();
			shown = true;
		}
	};
	let shown = $state(false);
</script>

<form class="m-4 flex w-fit flex-col rounded bg-blue-100 p-6 pt-4" onsubmit={submitAutoproxy}>
	<h2 class="text-xl">Autoproxy Settings</h2>
	<label class="text-l text-gray-800" for="autoproxy">Autoproxy Mode:</label>
	<select
		class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		id="autoproxy"
		name="autoproxy"
		bind:value={autoproxySettings.autoproxyMode}
	>
		<option value={'none'}>Don't Change Setting</option>
		<option value={'off'}>Off</option>
		<option value={'front'}>Front</option>
		<option value={'latch'}>Latch</option>
		<option value={'member'}>Member</option>
	</select>
	<input
		type="text"
		class="peer order-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
		id="autoproxyMember"
		name="autoproxyMember"
		placeholder="Member ID"
		bind:value={autoproxySettings.autoproxyMember}
		disabled={autoproxySettings.autoproxyMode != AutoproxyEnum.Member &&
			autoproxySettings.autoproxyMode != AutoproxyEnum.Latch}
	/>
	<label
		class="text-l order-1 text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
		for="autoproxyMember">Autoproxy Member:</label
	>
	<div class="order-last grow"></div>
	<input
		class="order-last mt-2 w-full cursor-pointer rounded bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
		type="submit"
		value="Go!"
		disabled={autoproxySettingsInvalid}
	/>
</form>

<Modal title={modalTitle} body={modalBody} data={modalData} bind:shown />
