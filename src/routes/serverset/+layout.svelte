<script>
	let { children } = $props();
</script>

<div class="flex flex-col items-center">
	<h1 class="text-2xl font-semibold">Change Server Settings</h1>
	<form class="mt-2 w-fit rounded bg-blue-300 p-6 pt-4">
		<label class="mb-0.5 block text-sm font-bold text-gray-700" for="token">Token</label>
		<input
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="token"
			type="text"
			placeholder="Token"
		/>
		<label class="mb-0.5 mt-2 block text-sm font-bold text-gray-700" for="serverid"
			>Server ID or Message Link</label
		>
		<input
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="serverid"
			type="text"
			placeholder="Server ID"
		/>
	</form>
	<nav class="flex m-4">
		<a href="/serverset/solo" class="m-2 rounded bg-blue-500 p-2 text-white">System and Member</a>
		<a href="/serverset/bulk" class="m-2 rounded bg-blue-500 p-2 text-white">Bulk Member</a>
		<a href="/serverset/templates" class="m-2 rounded bg-blue-500 p-2 text-white">Name Templates</a>
	</nav>

	{@render children()}
</div>
