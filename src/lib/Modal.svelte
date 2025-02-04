<script lang="ts">
	import { getContext } from 'svelte';

	let { title, body, data = null, shown = $bindable(false) } = $props();

	const modalShown: { value: boolean } = getContext('modalShown');

	$effect(() => {
		if (shown === true) showModal();
	});

	const hideModal = (e?: Event) => {
		if (e?.target instanceof Element) {
			if (e.target.classList.contains('close')) {
				shown = false;
				modalShown.value = false;
			}
		} else {
			shown = false;
			modalShown.value = false;
		}
	};
	const showModal = () => {
		shown = true;
		modalShown.value = true;
	};
	let hideData = $state(true);

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key == 'Escape' && shown) hideModal();
	};
</script>

<svelte:window on:keydown={onKeyDown} />

{#if shown}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="close absolute bottom-0 flex h-full w-full items-center justify-center bg-black/20"
		onclick={hideModal}
	>
		<div class="flex h-fit w-fit max-w-96 flex-col rounded bg-white p-5">
			<button class="close self-end" aria-label="Close Modal" onclick={hideModal}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="close size-6"
					><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg
				>
			</button>
			<h1 class="text-2xl">{title}</h1>
			<div class="text-l">{body}</div>
			{#if data}
				<div class="mt-3 table border-collapse border">
					<div class="table-header-group">
						<div class="table-row">
							<div class="table-cell border">
								<button onclick={() => (hideData = !hideData)} aria-label="Toggle Data Shown">
									{#if hideData}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											class="inline size-6"
										>
											<path
												fill-rule="evenodd"
												d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
												clip-rule="evenodd"
											/>
										</svg>
									{:else}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 -6 24 24"
											fill="currentColor"
											class="size-6"
										>
											<path
												fill-rule="evenodd"
												d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
												clip-rule="evenodd"
											/>
										</svg>
									{/if}
								</button>
								Data
							</div>
						</div>
					</div>
				</div>
				<div class="table-row-group {hideData ? 'h-0 overflow-clip' : ''}">
					<div class="table-row">
						<div class="table-cell border">
							{JSON.stringify(data).replaceAll(/(?<=(\"|null)[,:])(?=\")/g, ' ')}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
