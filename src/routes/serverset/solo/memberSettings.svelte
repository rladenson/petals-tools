<script lang="ts">
	import { baseURL, OnOffNone } from '$lib';
	import { TokenValidation } from '$lib/token.svelte';
	const { token, serverId } = $props();

	let memberSettings = $state({
		memberId: '',
		serverNameSelect: OnOffNone.None,
		serverName: '',
		serverAvatarSelect: OnOffNone.None,
		serverAvatar: ''
	});
	let memberSettingsInvalid = $derived(
		token.validate != TokenValidation.Valid ||
			serverId == '' ||
			memberSettings.memberId.match(/^(?:[A-Za-z][- ]*){5,6}$/) == null ||
			(memberSettings.serverNameSelect == OnOffNone.None &&
				memberSettings.serverAvatarSelect == OnOffNone.None) ||
			(memberSettings.serverNameSelect == OnOffNone.On && memberSettings.serverName == '') ||
			(memberSettings.serverAvatarSelect == OnOffNone.On && memberSettings.serverAvatar == '')
	);
	let submitMember = async (e: Event) => {
		e.preventDefault();
		const res = await fetch(baseURL + `members/${memberSettings.memberId}/guilds/${serverId}`, {
			method: 'PATCH',
			headers: {
				Authorization: token.value,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				display_name:
					memberSettings.serverNameSelect == OnOffNone.Off
						? null
						: memberSettings.serverNameSelect == OnOffNone.On
							? memberSettings.serverName
							: undefined,
				avatar_url:
					memberSettings.serverAvatarSelect == OnOffNone.Off
						? null
						: memberSettings.serverAvatarSelect == OnOffNone.On
							? memberSettings.serverAvatar
							: undefined
			})
		});
		if (res.ok) console.log(await res.json());
	};
</script>

<form class="m-4 flex w-fit flex-col rounded bg-blue-100 p-6 pt-4" onsubmit={submitMember}>
	<h2 class="text-xl">Member Settings</h2>
	<label class="text-l text-gray-800" for="member">Member:</label>
	<input
		type="text"
		class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		id="member"
		name="member"
		placeholder="Member ID"
		bind:value={memberSettings.memberId}
	/>
	<label class="text-l text-gray-800" for="serverNameSelect">Server Name Action:</label>
	<select
		class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		id="serverNameSelect"
		name="serverNameSelect"
		bind:value={memberSettings.serverNameSelect}
	>
		<option value={0}>Don't Change Setting</option>
		<option value={1}>Set</option>
		<option value={2}>Clear</option>
	</select>
	<input
		type="text"
		class="peer order-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
		id="serverName"
		name="serverName"
		placeholder="Server Name"
		bind:value={memberSettings.serverName}
		disabled={memberSettings.serverNameSelect != OnOffNone.On}
	/>
	<label
		class="text-l order-1 text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
		for="serverName">Server Name:</label
	>
	<label class="text-l order-3 text-gray-800" for="serverAvatarSelect">Server Avatar Action:</label>
	<select
		class="order-3 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		id="serverAvatarSelect"
		name="serverAvatarSelect"
		bind:value={memberSettings.serverAvatarSelect}
	>
		<option value={0}>Don't Change Setting</option>
		<option value={1}>Set</option>
		<option value={2}>Clear</option>
	</select>
	<input
		type="text"
		class="peer order-5 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
		id="serverAvatar"
		name="serverAvatar"
		placeholder="Image Link"
		bind:value={memberSettings.serverAvatar}
		disabled={memberSettings.serverAvatarSelect != OnOffNone.On}
	/>
	<label
		class="text-l order-4 text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
		for="serverAvatar">Server Avatar:</label
	>
	<div class="order-last grow"></div>
	<input
		class="order-last mt-2 w-full cursor-pointer rounded bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
		type="submit"
		value="Go!"
		disabled={memberSettingsInvalid}
	/>
</form>
