<script lang="ts">
	let shown = $state(true);
	let { title, body } = $props();
</script>

{#if shown}
	<div class="absolute bottom-0 flex h-full w-full items-center justify-center bg-black/20">
		<div class="flex h-fit w-fit flex-col rounded bg-white p-5">
			<button class="self-end" aria-label="Close Modal" onclick={() => (shown = false)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
					><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg
				>
			</button>
			<h1 class="text-2xl">{title}</h1>
			<div class="text-l">{body}</div>
		</div>
	</div>
{/if}

<style>
	:global(*) {
		overflow: hidden;
	}
</style>
