<script lang="ts">
	import { createToken, TokenValidation } from '$lib/token.svelte';
	let { children } = $props();

	const token = createToken();
	let tokenError = $state('');
	$effect(() => {
		switch (token.validate()) {
			case TokenValidation.Valid:
			case TokenValidation.IsUndefined:
				tokenError = '';
				break;
			case TokenValidation.IsEmpty:
				tokenError = 'Token must be present';
				break;
			case TokenValidation.TooShort:
			case TokenValidation.TooLong:
				tokenError = 'Token must be 64 characters';
				break;
		}
		let tokenInput: HTMLObjectElement = document.getElementById('token') as HTMLObjectElement;
		tokenInput.setCustomValidity(tokenError);
	});

	let serveridRaw = $state('');
	let serverid = '';
	let serveridError = $state('');
	$effect(() => {
		let match = serveridRaw.match(
			/(?:https?:\/\/(?:(?:ptb|canary)\.)?discord\.com\/channels\/)?(\d{17,19})/
		);
		if (match) {
			serverid = match[1];
			serveridError = '';
		} else {
			serverid = '';
			serveridError = "This doesn't seem to be a valid server ID or message link";
		}
		let serveridInput: HTMLObjectElement = document.getElementById('serverid') as HTMLObjectElement;
		serveridInput.setCustomValidity(serveridError);
	});
</script>

<div class="flex flex-col items-center">
	<h1 class="text-2xl font-semibold">Change Server Settings</h1>
	<form class="mt-2 w-auto rounded bg-blue-300 p-6 pt-4" style="width: 25em; max-width: 90vw">
		<label class="mb-0.5 block text-sm font-bold text-gray-700" for="token">Token</label>
		<input
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm invalid:border-red-500
			invalid:ring invalid:ring-red-500 invalid:ring-opacity-50 focus:border-indigo-500 focus:ring
			focus:ring-indigo-400 focus:ring-opacity-50"
			id="token"
			type="password"
			placeholder="Token"
			bind:value={token.value}
		/>
		<span class="mt-2 text-sm text-rose-700" id="tokenError">{tokenError}</span>
		<label class="mb-0.5 mt-2 block text-sm font-bold text-gray-700" for="serverid">
			Server ID or Message Link
		</label>
		<input
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm invalid:border-red-500
			invalid:ring invalid:ring-red-500 invalid:ring-opacity-50 focus:border-indigo-500
			focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="serverid"
			type="text"
			placeholder="Server ID"
			bind:value={serveridRaw}
		/>
		<span class="mt-2 text-sm text-rose-700" id="serveridError">{serveridError}</span>
	</form>
	<nav class="m-4 flex">
		<a href="/serverset/solo" class="m-2 rounded bg-blue-500 p-2 text-white">System and Member</a>
		<a href="/serverset/bulk" class="m-2 rounded bg-blue-500 p-2 text-white">Bulk Member</a>
		<a href="/serverset/templates" class="m-2 rounded bg-blue-500 p-2 text-white">Name Templates</a>
	</nav>

	{@render children()}
</div>
