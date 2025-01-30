<script lang="ts">
	import { OnOffNone, AutoproxyEnum } from '$lib';

	let systemSettings = $state({
		proxyingEnabled: OnOffNone.None,
		tagEnabled: OnOffNone.None,
		serverTag: '',
		serverTagSelect: OnOffNone.None
	});
	let systemSettingsInvalid = $derived(
		systemSettings.proxyingEnabled == OnOffNone.None &&
			systemSettings.tagEnabled == OnOffNone.None &&
			systemSettings.serverTag == ''
	);
	let submitSystem = (e: Event) => {
		e.preventDefault();
	};

	let autoproxySettings = $state({
		autoproxyMode: AutoproxyEnum.None,
		autoproxyMember: ''
	});
	let autoproxySettingsInvalid = $derived(
		autoproxySettings.autoproxyMode == AutoproxyEnum.None && autoproxySettings.autoproxyMember == ''
	);
	let submitAutoproxy = (e: Event) => {
		e.preventDefault();
	};

	let memberSettings = $state({
		memberId: '',
		serverNameSelect: OnOffNone.None,
		serverName: '',
		serverAvatarSelect: OnOffNone.None,
		serverAvatar: ''
	});
	let memberSettingsInvalid = $derived(
		memberSettings.memberId.match(/^(?:[A-Za-z][- ]*){5,6}$/) == null ||
			(memberSettings.serverNameSelect == OnOffNone.None &&
				memberSettings.serverAvatarSelect == OnOffNone.None) ||
			(memberSettings.serverNameSelect == OnOffNone.On && memberSettings.serverName == '') ||
			(memberSettings.serverAvatarSelect == OnOffNone.On && memberSettings.serverAvatar == '')
	);
	let submitMember = (e: Event) => {
		e.preventDefault();
	};
	$effect(() => {
		console.log();
	});
</script>

<div class="flex flex-wrap justify-center">
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

	<form class="m-4 flex w-fit flex-col rounded bg-blue-100 p-6 pt-4" onsubmit={submitAutoproxy}>
		<h2 class="text-xl">Autoproxy Settings</h2>
		<label class="text-l text-gray-800" for="autoproxy">Autoproxy Mode:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="autoproxy"
			name="autoproxy"
			bind:value={autoproxySettings.autoproxyMode}
		>
			<option value={0}>Don't Change Setting</option>
			<option value={1}>Off</option>
			<option value={2}>Front</option>
			<option value={3}>Latch</option>
			<option value={4}>Member</option>
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
		<label class="text-l order-3 text-gray-800" for="serverAvatarSelect"
			>Server Avatar Action:</label
		>
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
</div>
