<script lang="ts">
	import { AutoproxyEnum } from "$lib";
	import { TokenValidation } from "$lib/token.svelte";
    const { token } = $props();

	let autoproxySettings = $state({
		autoproxyMode: AutoproxyEnum.None,
		autoproxyMember: ''
	});
	let autoproxySettingsInvalid = $derived(
		token.validate != TokenValidation.Valid ||
			(autoproxySettings.autoproxyMode == AutoproxyEnum.None &&
				autoproxySettings.autoproxyMember == '')
	);
	let submitAutoproxy = (e: Event) => {
		e.preventDefault();
	};
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