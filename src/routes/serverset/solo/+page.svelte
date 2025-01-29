<script lang="ts">
	import { OnOffNone, AutoproxyEnum } from '$lib';

	let systemSettings = $state({
		proxyingEnabled: OnOffNone.None,
		tagEnabled: OnOffNone.None,
		servertag: '',
		servertagSelect: OnOffNone.None
	});
	let systemSettingsInvalid = $derived(
		systemSettings.proxyingEnabled == OnOffNone.None &&
			systemSettings.tagEnabled == OnOffNone.None &&
			systemSettings.servertag == ''
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
		servernameSelect: OnOffNone.None,
		servername: '',
		serveravatarSelect: OnOffNone.None,
		serveravatar: ''
	});
	let memberSettingsInvalid = $derived(
		memberSettings.memberId.match(/^(?:[A-Za-z][- ]*){5,6}$/) == null ||
			(memberSettings.servernameSelect == OnOffNone.None &&
				memberSettings.serveravatarSelect == OnOffNone.None) ||
			(memberSettings.servernameSelect == OnOffNone.On && memberSettings.servername == '') ||
			(memberSettings.serveravatarSelect == OnOffNone.On && memberSettings.serveravatar == '')
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
		<label class="text-l text-gray-800" for="servertagSelect">Server Tag Action:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="servertagSelect"
			name="servertagSelect"
			bind:value={systemSettings.servertagSelect}
		>
			<option value={0}>Don't Change Setting</option>
			<option value={1}>Set</option>
			<option value={2}>Clear</option>
		</select>
		<input
			type="text"
			class="peer order-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
			id="servertag"
			name="servertag"
			placeholder="Servertag"
			bind:value={systemSettings.servertag}
			disabled={systemSettings.servertagSelect != OnOffNone.On}
		/>
		<label
			class="text-l order-1 text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
			for="servertag">Server Tag:</label
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
		<label class="text-l text-gray-800" for="servernameSelect">Server Name Action:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="servernameSelect"
			name="servernameSelect"
			bind:value={memberSettings.servernameSelect}
		>
			<option value={0}>Don't Change Setting</option>
			<option value={1}>Set</option>
			<option value={2}>Clear</option>
		</select>
		<input
			type="text"
			class="peer order-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
			id="servername"
			name="servername"
			placeholder="Server Name"
			bind:value={memberSettings.servername}
			disabled={memberSettings.servernameSelect != OnOffNone.On}
		/>
		<label
			class="text-l order-1 text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
			for="servername">Server Name:</label
		>
		<label class="text-l order-3 text-gray-800" for="serveravatarSelect"
			>Server Avatar Action:</label
		>
		<select
			class="order-3 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="serveravatarSelect"
			name="serveravatarSelect"
			bind:value={memberSettings.serveravatarSelect}
		>
			<option value={0}>Don't Change Setting</option>
			<option value={1}>Set</option>
			<option value={2}>Clear</option>
		</select>
		<input
			type="text"
			class="peer order-5 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
			id="serveravatar"
			name="serveravatar"
			placeholder="Image Link"
			bind:value={memberSettings.serveravatar}
			disabled={memberSettings.serveravatarSelect != OnOffNone.On}
		/>
		<label
			class="text-l order-4 text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
			for="serveravatar">Server Avatar:</label
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
