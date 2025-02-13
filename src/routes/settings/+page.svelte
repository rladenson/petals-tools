<script lang="ts">
	import { createApiUrl } from '$lib/apiURL.svelte';
	import { setContext } from 'svelte';

	const apiUrl = createApiUrl();
	setContext('apiUrl', apiUrl);

	let urlSelect = $state(apiUrl.whichUrl);

	const changeUrl = (e: Event) => {
		apiUrl.value = (e.target as HTMLInputElement).value;
	};

	$effect(() => {
		if (apiUrl.customUrlValidity) {
			(document.getElementById('customURL') as HTMLObjectElement).setCustomValidity('');
		} else {
			(document.getElementById('customURL') as HTMLObjectElement).setCustomValidity(
				'Invalid URL, falling back to Live URL'
			);
		}
	});
</script>

<h1 class="text-2xl">Settings</h1>
{#if apiUrl.loading}
	Loading...
{:else}
	<select
		id="urlSelect"
		onchange={changeUrl}
		class="m-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		bind:value={urlSelect}
	>
		<option value="liveUrl">Live URL (Default)</option>
		<option value="betaUrl">Beta URL</option>
		<option value="custom">Custom URL</option>
	</select>
	{#if urlSelect == 'custom'}
		<input
			id="customURL"
			bind:value={apiUrl.customUrl}
			class="m-1 rounded-md border-gray-300 shadow-sm invalid:border-red-500 invalid:ring invalid:ring-red-500/50 focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
		/>
	{/if}
{/if}
