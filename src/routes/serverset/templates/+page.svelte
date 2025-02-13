<script lang="ts">
	import type { NameTemplateList } from '$lib/nameTemplates.svelte';
	import { getContext } from 'svelte';

	const templates: NameTemplateList = getContext('templates');
</script>

<h2 class="text-2xl">Templates</h2>
<div class="m-2">(Note: These are specific to this site)</div>
{#if templates.loading}
	<span class="p-10 italic">Loading...</span>
{:else if templates.templates.length > 0}
	<div class="m-5 mt-3 rounded-lg border-4 border-indigo-300">
		{#each templates.templates as template, i}
			<div
				class="grid grid-cols-1 items-center sm:grid-cols-2 bg-indigo-{((i + 1) % 2) +
					2}00 p-2 {i == 0 ? 'rounded-t' : i == templates.templates.length - 1 ? 'rounded-b' : ''}"
			>
				<label for="template-{i + 1}-name" class="font-semibold">Template {i + 1} Name:</label>
				<input
					bind:value={template.name}
					id="template-{i + 1}-name"
					onchange={() => templates.save()}
				/>
				<label for="template-{i + 1}-template" class="font-semibold">Template {i + 1}:</label>
				<input
					bind:value={template.template}
					id="template-{i + 1}-template"
					onchange={() => templates.save()}
				/>
				<button
					class="-col-start-1 row-start-1 row-end-5 -mr-2 flex place-self-stretch p-2 sm:row-end-3"
					aria-label="Delete Template {i + 1}"
					onclick={() => templates.removeTemplate(i)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6 place-self-center"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}

<button
	onclick={() => {
		templates.addTemplate();
	}}
	class="rounded bg-blue-500 p-2 text-white"
>
	Add Template
</button>
