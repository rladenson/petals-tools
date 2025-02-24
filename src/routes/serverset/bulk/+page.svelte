<script lang="ts">
	import type { apiUrlObj } from '$lib/apiURL.svelte';
	import type { ServerId } from '$lib/guildId.svelte';
	import Modal, { type ModalData } from '$lib/Modal.svelte';
	import type { PKMember } from '$lib/pkTypes.svelte';
	import { sleep } from '$lib/sleep.svelte';
	import { TokenValidation, type Token } from '$lib/token.svelte';
	import { getContext } from 'svelte';
	const token: Token = getContext('token');
	const serverId: ServerId = getContext('serverId');
	const apiURL: apiUrlObj = getContext('apiUrl');

	let members: PKMember[] = $state([]);
	const loadMembers = async (e: Event) => {
		e.preventDefault();
		loading = true;
		const res = await fetch(apiURL.value + `systems/@me/members`, {
			headers: {
				Authorization: token.value
			} as unknown as Headers
		});
		const body = await res.json();
		if (res.ok) {
			members = body.map((mem: PKMember) => {
				return { ...mem, loaded: false };
			});
			loadServerSettings();
		} else {
			modalData.title = 'Something Went Wrong';
			modalData.body =
				'Please try again later. If this error persists, please contact petalss_tm on Discord.';
			modalData.data = body;
			modalData.statusCode = 2;
			shown = true;
		}
	};

	const loadServerSettings = async () => {
		for (let i = 0; i < 10 /*TODO*/; i++) {
			const member = members[i];

			const res = await fetch(apiURL.value + `members/${member.id}/guilds/${serverId.id}`, {
				headers: {
					Authorization: token.value
				} as unknown as Headers
			});
			const body = await res.json();
			if (res.ok) {
				member.server_avatar_url = body.avatar_url;
				member.server_display_name = body.display_name;
				member.server_keepproxy = body.keep_proxy;
			} else {
				member.server_avatar_url = null;
				member.server_display_name = null;
			}
			member.loaded = true;
			await sleep(200);
		}
		loading = false;
	};

	let loading = $state(false);
	const canLoad = $derived(
		token.validate == TokenValidation.Valid && serverId.id != '' && !loading
	);

	let modalData = $state({} as ModalData);
	let shown = $state(false);

	let numPerPage = $state(10);
	let maxPage = $derived(Math.ceil(members.length / numPerPage));
	let rawPageNum = $state(1);
	let pageNum = $derived(
		Number.isNaN(Math.min(maxPage, Math.max(1, rawPageNum)))
			? 1
			: Math.min(maxPage, Math.max(1, rawPageNum))
	);
</script>

{#if members.some((member: PKMember) => member.loaded)}
	<div>
		{@render pageButtons()}
		<table class="table-auto">
			<thead>
				<tr class="border-b-2 border-blue-200 bg-indigo-500/30">
					<th class="p-2"></th>
					<th class="p-2">Name</th>
					<th class="p-2">Server Avatar</th>
					<th class="p-2">Server Name</th>
					<th class="p-2">SKP</th>
				</tr>
			</thead>
			<tbody>
				{#each members as member, i}
					{#if numPerPage == -1 || (i <= pageNum * numPerPage - 1 && i > (pageNum - 1) * numPerPage - 1)}
						<tr>
							<td class="bg-indigo-500/20 p-2">{i + 1}</td>
							<td class="bg-indigo-500/10 p-2">{member.name}</td>
							<td class="bg-indigo-500/20 p-2">
								{#if member.server_avatar_url === undefined}
									<i>Loading...</i>
								{:else if member.server_avatar_url === null}
									<i>None Set</i>
								{:else}
									{member.server_avatar_url}
								{/if}
							</td>
							<td class="bg-indigo-500/10 p-2">
								{#if member.server_display_name === undefined}
									<i>Loading...</i>
								{:else if member.server_display_name === null}
									<i>None Set</i>
								{:else}
									{member.server_display_name}
								{/if}
							</td>
							<td class="bg-indigo-500/20 p-2">
								{member.server_keepproxy == true
									? '✔️'
									: member.server_keepproxy == false
										? '❌'
										: ''}
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
		{@render pageButtons()}
	</div>
{:else if loading}
	Loading...
{:else}
	<button
		onclick={loadMembers}
		disabled={!canLoad}
		class="mt-5 cursor-pointer rounded bg-indigo-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
	>
		Load Members
	</button>
{/if}

<Modal data={modalData} bind:shown />

{#snippet pageButtons()}
	<div class="m-1 flex w-full items-center justify-around gap-2">
		<div class="flex items-center gap-1">
			<span class="text-center text-xs">
				Items<br />Per Page:
			</span>
			<select
				bind:value={numPerPage}
				class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			>
				<option value={5}>5</option>
				<option value={10}>10</option>
				<option value={25}>25</option>
				<option value={-1}>Max</option>
			</select>
		</div>
		<span class="text-center text-xs">
			Showing Items<br />
			{#if numPerPage == -1}
				1-{members.length}
			{:else}
				{(pageNum - 1) * numPerPage + 1}-{pageNum * numPerPage <= members.length
					? pageNum * numPerPage
					: members.length}
			{/if}
			of {members.length}
		</span>
		<div class="flex gap-1">
			<button onclick={() => (rawPageNum = 1)}>
				<span class="-mr-1">&lt;</span>&lt;
			</button>
			<button onclick={() => (rawPageNum = Math.max(pageNum - 1, 1))}>&lt;</button>
			<input
				bind:value={rawPageNum}
				max={maxPage}
				min={1}
				class="mt-1 block w-10 rounded-md border-gray-300 p-1 text-center shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			/>
			<button onclick={() => (rawPageNum = Math.min(pageNum + 1, maxPage))}> &gt; </button>
			<button onclick={() => (rawPageNum = maxPage)}>
				<span class="-mr-1">&gt;</span>&gt;
			</button>
		</div>
	</div>
{/snippet}
