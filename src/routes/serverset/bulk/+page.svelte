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
			sort('id');
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
		while (members.some((mem) => !mem.loaded)) {
			const member = members.filter((mem) => !mem.loaded)[0];

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
			sort(sorted);
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
	let sorted = $state('');

	let sort = (sortType: string) => {
		sorted = sortType;
		switch (sortType) {
			case 'id':
				members.sort((a, b) => (a.id > b.id ? 1 : -1));
				break;
			case 'name':
				members.sort((a, b) => (a.name == b.name ? 0 : a.name > b.name ? 1 : -1));
				break;
			case 'name-r':
				members.sort((a, b) => (a.name == b.name ? 0 : a.name > b.name ? -1 : 1));
				break;
			case 'sicon':
				members.sort((a, b) => {
					if (
						(a.server_avatar_url == null || a.server_avatar_url == undefined) &&
						(b.server_avatar_url == null || b.server_avatar_url == undefined)
					)
						return 0;
					if (a.server_avatar_url == null || a.server_avatar_url == undefined) return 1;
					if (b.server_avatar_url == null || b.server_avatar_url == undefined) return -1;
					return a.server_avatar_url == b.server_avatar_url
						? 0
						: a.server_avatar_url > b.server_avatar_url
							? 1
							: -1;
				});
				break;
			case 'sicon-r':
				members.sort((a, b) => {
					if (
						(a.server_avatar_url == null || a.server_avatar_url == undefined) &&
						(b.server_avatar_url == null || b.server_avatar_url == undefined)
					)
						return 0;
					if (a.server_avatar_url == null || a.server_avatar_url == undefined) return 1;
					if (b.server_avatar_url == null || b.server_avatar_url == undefined) return -1;
					return a.server_avatar_url == b.server_avatar_url
						? 0
						: a.server_avatar_url > b.server_avatar_url
							? -1
							: 1;
				});
				break;
			case 'sicon-none':
				members.sort((a, b) => {
					if (a.server_avatar_url === b.server_avatar_url) return 0;

					if (a.server_avatar_url === null) return -1;
					if (b.server_avatar_url === null) return 1;

					if (a.server_avatar_url === undefined) return 1;
					if (b.server_avatar_url === undefined) return -1;

					return a.server_avatar_url > b.server_avatar_url ? -1 : 1;
				});
				break;
			case 'sicon-unloaded':
				members.sort((a, b) => {
					if (a.server_avatar_url === b.server_avatar_url) return 0;

					if (a.server_avatar_url === undefined) return -1;
					if (b.server_avatar_url === undefined) return 1;

					if (a.server_avatar_url === null) return 1;
					if (b.server_avatar_url === null) return -1;

					return a.server_avatar_url > b.server_avatar_url ? -1 : 1;
				});
				break;
			case 'sname':
				members.sort((a, b) => {
					if (
						(a.server_display_name == null || a.server_display_name == undefined) &&
						(b.server_display_name == null || b.server_display_name == undefined)
					)
						return 0;
					if (a.server_display_name == null || a.server_display_name == undefined) return 1;
					if (b.server_display_name == null || b.server_display_name == undefined) return -1;
					return a.server_display_name == b.server_display_name
						? 0
						: a.server_display_name > b.server_display_name
							? 1
							: -1;
				});
				break;
			case 'sname-r':
				members.sort((a, b) => {
					if (
						(a.server_display_name == null || a.server_display_name == undefined) &&
						(b.server_display_name == null || b.server_display_name == undefined)
					)
						return 0;
					if (a.server_display_name == null || a.server_display_name == undefined) return 1;
					if (b.server_display_name == null || b.server_display_name == undefined) return -1;
					return a.server_display_name == b.server_display_name
						? 0
						: a.server_display_name > b.server_display_name
							? -1
							: 1;
				});
				break;
			case 'sname-none':
				members.sort((a, b) => {
					if (a.server_display_name === b.server_display_name) return 0;

					if (a.server_display_name === null) return -1;
					if (b.server_display_name === null) return 1;

					if (a.server_display_name === undefined) return 1;
					if (b.server_display_name === undefined) return -1;

					return a.server_display_name > b.server_display_name ? -1 : 1;
				});
				break;
			case 'sname-unloaded':
				members.sort((a, b) => {
					if (a.server_display_name === b.server_display_name) return 0;

					if (a.server_display_name === undefined) return -1;
					if (b.server_display_name === undefined) return 1;

					if (a.server_display_name === null) return 1;
					if (b.server_display_name === null) return -1;

					return a.server_display_name > b.server_display_name ? -1 : 1;
				});
				break;
			case 'skp':
				members.sort((a, b) => {
					if (
						(a.server_keepproxy == null || a.server_keepproxy == undefined) &&
						(b.server_keepproxy == null || b.server_keepproxy == undefined)
					)
						return 0;
					if (a.server_keepproxy == null || a.server_keepproxy == undefined) return 1;
					if (b.server_keepproxy == null || b.server_keepproxy == undefined) return -1;
					return a.server_keepproxy == b.server_keepproxy
						? 0
						: a.server_keepproxy > b.server_keepproxy
							? 1
							: -1;
				});
				break;
			case 'skp-r':
				members.sort((a, b) => {
					if (
						(a.server_keepproxy == null || a.server_keepproxy == undefined) &&
						(b.server_keepproxy == null || b.server_keepproxy == undefined)
					)
						return 0;
					if (a.server_keepproxy == null || a.server_keepproxy == undefined) return 1;
					if (b.server_keepproxy == null || b.server_keepproxy == undefined) return -1;
					return a.server_keepproxy == b.server_keepproxy
						? 0
						: a.server_keepproxy > b.server_keepproxy
							? -1
							: 1;
				});
				break;
			case 'skp-none':
				members.sort((a, b) => {
					if (a.server_keepproxy === b.server_keepproxy) return 0;

					if (a.server_keepproxy === null) return -1;
					if (b.server_keepproxy === null) return 1;

					if (a.server_keepproxy === undefined) return 1;
					if (b.server_keepproxy === undefined) return -1;

					return a.server_keepproxy > b.server_keepproxy ? -1 : 1;
				});
				break;
			case 'skp-unloaded':
				members.sort((a, b) => {
					if (a.server_keepproxy === b.server_keepproxy) return 0;

					if (a.server_keepproxy === undefined) return -1;
					if (b.server_keepproxy === undefined) return 1;

					if (a.server_keepproxy === null) return 1;
					if (b.server_keepproxy === null) return -1;

					return a.server_keepproxy > b.server_keepproxy ? -1 : 1;
				});
				break;
			default:
				sort('id');
				break;
		}
	};
</script>

{#if members.some((member: PKMember) => member.loaded)}
	<div>
		{@render pageButtons()}
		<table class="table-auto">
			<thead>
				<tr class="border-b-2 border-blue-200 bg-indigo-500/30">
					<th class="p-2">
						Name
						<button
							onclick={() => {
								switch (sorted) {
									case 'name':
										sort('name-r');
										break;
									case 'name-r':
										sort('id');
										break;
									default:
										sort('name');
										break;
								}
							}}
							aria-label="Sort by Name"
						>
							{#if sorted == 'name'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'name-r'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M11.47 4.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L12 6.31 8.78 9.53a.75.75 0 0 1-1.06-1.06l3.75-3.75Zm-3.75 9.75a.75.75 0 0 1 1.06 0L12 17.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					</th>
					<th class="p-2">
						Server Avatar
						<button
							onclick={() => {
								switch (sorted) {
									case 'sicon':
										sort('sicon-r');
										break;
									case 'sicon-r':
										sort('sicon-none');
										break;
									case 'sicon-none':
										sort('sicon-unloaded');
										break;
									case 'sicon-unloaded':
										sort('id');
										break;
									default:
										sort('sicon');
										break;
								}
							}}
							aria-label="Sort by Server Avatar"
						>
							{#if sorted == 'sicon'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'sicon-r'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'sicon-none'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'sicon-unloaded'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M11.47 4.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L12 6.31 8.78 9.53a.75.75 0 0 1-1.06-1.06l3.75-3.75Zm-3.75 9.75a.75.75 0 0 1 1.06 0L12 17.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					</th>
					<th class="p-2">
						Server Name
						<button
							onclick={() => {
								switch (sorted) {
									case 'sname':
										sort('sname-r');
										break;
									case 'sname-r':
										sort('sname-none');
										break;
									case 'sname-none':
										sort('sname-unloaded');
										break;
									case 'sname-unloaded':
										sort('id');
										break;
									default:
										sort('sname');
										break;
								}
							}}
							aria-label="Sort by Server Name"
						>
							{#if sorted == 'sname'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'sname-r'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'sname-none'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'sname-unloaded'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M11.47 4.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L12 6.31 8.78 9.53a.75.75 0 0 1-1.06-1.06l3.75-3.75Zm-3.75 9.75a.75.75 0 0 1 1.06 0L12 17.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					</th>
					<th class="p-2">
						SKP
						<button
							onclick={() => {
								switch (sorted) {
									case 'skp':
										sort('skp-r');
										break;
									case 'skp-r':
										sort('skp-none');
										break;
									case 'skp-none':
										sort('skp-unloaded');
										break;
									case 'skp-unloaded':
										sort('id');
										break;
									default:
										sort('skp');
										break;
								}
							}}
							aria-label="Sort by Server Keep Proxy"
						>
							{#if sorted == 'skp'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'skp-r'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'skp-none'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if sorted == 'skp-unloaded'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="inline size-6"
								>
									<path
										fill-rule="evenodd"
										d="M11.47 4.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L12 6.31 8.78 9.53a.75.75 0 0 1-1.06-1.06l3.75-3.75Zm-3.75 9.75a.75.75 0 0 1 1.06 0L12 17.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each members as member, i (member.id)}
					{#if numPerPage == -1 || (i <= pageNum * numPerPage - 1 && i > (pageNum - 1) * numPerPage - 1)}
						<tr>
							<td class="bg-indigo-500/10 p-2">{member.name}</td>
							<td class="bg-indigo-500/20 p-2">
								{#if member.server_avatar_url === undefined}
									<i>Loading...</i>
								{:else if member.server_avatar_url === null}
									<i>None Set</i>
								{:else}
									<a href={member.server_avatar_url} class="underline">
										{member.server_avatar_url.match(/\w+?(?=\.\w+\/)/)} (link)
									</a>
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
			<button onclick={() => (rawPageNum = 1)} aria-label="First Page">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="inline size-6"
				>
					<path
						fill-rule="evenodd"
						d="M4.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L6.31 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L4.72 9.47Zm9.25-4.25L9.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L11.31 10l3.72-3.72a.75.75 0 0 0-1.06-1.06Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			<button onclick={() => (rawPageNum = Math.max(pageNum - 1, 1))} aria-label="Previous Page">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="inline size-6"
				>
					<path
						fill-rule="evenodd"
						d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			<input
				bind:value={rawPageNum}
				max={maxPage}
				min={1}
				class="mt-1 block w-10 rounded-md border-gray-300 p-1 text-center shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			/>
			<button onclick={() => (rawPageNum = Math.min(pageNum + 1, maxPage))} aria-label="Next Page">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="inline size-6"
				>
					<path
						fill-rule="evenodd"
						d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			<button onclick={() => (rawPageNum = maxPage)} aria-label="Last Page">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="inline size-6"
				>
					<path
						fill-rule="evenodd"
						d="M15.28 9.47a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L13.69 10 9.97 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25ZM6.03 5.22l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L8.69 10 4.97 6.28a.75.75 0 0 1 1.06-1.06Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>
	</div>
{/snippet}
