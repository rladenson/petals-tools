<script lang="ts">
	import { OnOffNone } from '$lib';
	import type { apiUrlObj } from '$lib/apiURL.svelte';
	import type { ServerId } from '$lib/guildId.svelte';
	import Modal, { type ModalData } from '$lib/Modal.svelte';
	import type { NameTemplateList } from '$lib/nameTemplates.svelte';
	import { TokenValidation, type Token } from '$lib/token.svelte';
	import { getContext } from 'svelte';
	const token: Token = getContext('token');
	const serverId: ServerId = getContext('serverId');
	const templates: NameTemplateList = getContext('templates');
	const apiURL: apiUrlObj = getContext('apiUrl');

	let modalData = $state({} as ModalData);

	let memberSettings = $state({
		memberId: '',
		serverNameSelect: OnOffNone.None,
		serverName: '',
		serverAvatarSelect: OnOffNone.None,
		serverAvatar: ''
	});
	let memberSettingsInvalid = $derived(
		token.validate != TokenValidation.Valid ||
			serverId.id == '' ||
			memberSettings.memberId.match(/^(?:[A-Za-z][- ]*){5,6}$/) == null ||
			(memberSettings.serverNameSelect == OnOffNone.None &&
				memberSettings.serverAvatarSelect == OnOffNone.None) ||
			(memberSettings.serverNameSelect == OnOffNone.On && memberSettings.serverName == '') ||
			(memberSettings.serverAvatarSelect == OnOffNone.On && memberSettings.serverAvatar == '')
	);
	$effect(() => {
		if (
			memberSettings.memberId != '' &&
			memberSettings.memberId.match(/^(?:[A-Za-z][- ]*){5,6}$/) == null
		) {
			(document.getElementById('member') as HTMLObjectElement).setCustomValidity(
				'Invalid Member ID'
			);
		} else {
			(document.getElementById('member') as HTMLObjectElement).setCustomValidity('');
		}
	});
	let submitMember = async (e: Event) => {
		e.preventDefault();
		const res = await fetch(
			apiURL.value + `members/${memberSettings.memberId.trim()}/guilds/${serverId.id}`,
			{
				method: 'PATCH',
				headers: {
					Authorization: token.value,
					'Content-Type': 'application/json'
				} as unknown as Headers,
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
			}
		);
		const body = await res.json();
		if (res.ok) {
			modalData.title = 'Success!';
			modalData.body = `Member Settings for member ${memberSettings.memberId} changed in server ${serverId.id.toString()}`;
			modalData.data = body;
			modalData.statusCode = 1;
			shown = true;
		} else if (res.status == 404 && body.code == 20010) {
			modalData.title = 'Error: No Info Set';
			modalData.body =
				'Cannot set server info. In order to set server info this member must either have prior server info set in designated server or must have had their member card pulled up in designated server.';
			modalData.data = undefined;
			modalData.statusCode = 2;
			shown = true;
		} else if (res.status == 400 && body.code == 40001) {
			modalData.title = 'Error in Data';
			modalData.body = 'Please fix error or contact petalss_tm on Discord for help.';
			modalData.data = body.errors;
			modalData.statusCode = 2;
			shown = true;
		} else if (res.status == 401) {
			modalData.title = 'Error';
			modalData.body = 'Please check your token.';
			modalData.data = undefined;
			modalData.statusCode = 2;
			shown = true;
		} else {
			modalData.title = 'Something Went Wrong';
			modalData.body =
				'Please try again later. If this error persists, please contact petalss_tm on Discord.';
			modalData.data = body;
			modalData.statusCode = 2;
			shown = true;
		}
	};
	let shown = $state(false);

	let nameTemplateLoader = $state(-1);
	const loadNameTemplate = () => {
		memberSettings.serverName = templates.templates[nameTemplateLoader].template;
		nameTemplateLoader = -1;
	};
</script>

<form class="m-4 flex w-fit flex-col rounded bg-blue-100 p-6 pt-4" onsubmit={submitMember}>
	<h2 class="text-xl">Member Settings</h2>
	<label class="text-l text-gray-800" for="member">Member:</label>
	<input
		type="text"
		class="mt-1 block rounded-md border-gray-300 shadow-sm invalid:border-red-500 invalid:ring invalid:ring-red-500/50 focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
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
	<select
		aria-label="Select Name Template to Load"
		class="order-3 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:text-gray-500 disabled:opacity-60"
		onchange={loadNameTemplate}
		bind:value={nameTemplateLoader}
		disabled={memberSettings.serverNameSelect != OnOffNone.On}
	>
		<option value={-1}>Load Name Template</option>
		{#each templates.templates as { name }, i}
			<option value={i}>
				{typeof name == 'string' && name.trim().length > 0 ? name : `Template ${i + 1}`}
			</option>
		{/each}
	</select>
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

<Modal data={modalData} bind:shown />
