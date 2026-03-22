<script module>
	export type ModalData = {
		title: string;
		body: string;
		data: string | undefined;
		dataLabel: string;
		statusCode: number;
		useAltBody: unknown;
		showSubmitCancel: boolean;
		submitCancel: boolean | undefined;
	};
</script>

<script lang="ts">
	import { getContext } from 'svelte';

	let {
		data = $bindable({} as ModalData),
		shown = $bindable(false),
		altModalBody = $bindable(),
		resetModal = $bindable()
	} = $props();

	const modalShown: { value: boolean } = getContext('modalShown');

	$effect(() => {
		if (shown === true) showModal();
	});

	resetModal = () => {
		data = {} as ModalData;
	};

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

	const submitCancel = (e: Event) => {
		if (e.target instanceof Element) {
			if (e.target.id === 'submit') {
				data.submitCancel = true;
			} else if (e.target.id === 'cancel') {
				data.submitCancel = false;
			} else {
				data.submitCancel = undefined;
			}
		}
		hideModal();
	};
</script>

<svelte:window on:keydown={onKeyDown} />

{#if shown}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="close absolute bottom-0 z-10 flex h-full w-full items-center justify-center bg-black/20"
		onclick={hideModal}
	>
		<div
			class="max-w-2/3 flex h-fit w-fit flex-col rounded {data.statusCode == 1
				? 'bg-green-100'
				: data.statusCode == 2
					? 'bg-red-100'
					: 'bg-white'} p-5"
		>
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
			<h1 class="text-2xl">{data.title}</h1>
			<div class="text-l">
				{#if data.useAltBody}{@render altModalBody(data.useAltBody)}
				{:else}
					{#each data.body.split(/\n/) as bodyLine}
						<p class="m-3">{bodyLine}</p>
					{/each}
				{/if}
			</div>
			{#if data.data}
				<div
					class="mt-3 table border-collapse border {data.statusCode == 1
						? 'border-green-300'
						: data.statusCode == 2
							? 'border-red-300'
							: 'border-stone-300'}"
				>
					<div class="table-header-group">
						<div class="table-row">
							<button
								onclick={() => (hideData = !hideData)}
								aria-label="Toggle Data Shown"
								class="table-cell w-full border {data.statusCode == 1
									? 'border-green-300'
									: data.statusCode == 2
										? 'border-red-300'
										: 'border-stone-300'} text-left"
							>
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
										viewBox="0 0 24 24"
										fill="currentColor"
										class="inline size-6"
									>
										<path
											fill-rule="evenodd"
											d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
											clip-rule="evenodd"
										/>
									</svg>
								{/if}
								{data.dataLabel ?? 'Data'}
							</button>
						</div>
					</div>
					{#if !hideData}
						<div class="table-row-group">
							<div class="table-row">
								<div
									class="table-cell border {data.statusCode == 1
										? 'border-green-300'
										: data.statusCode == 2
											? 'border-red-300'
											: 'border-stone-300'} min-w-full"
								>
									{JSON.stringify(data.data).replaceAll(
										/(?<=("|null|true|false|\d+)[,:])(?=")/g,
										' '
									)}
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
			<div id="buttons" class="mt-3">
				<button
					id="cancel"
					class="m-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
					onclick={submitCancel}>Cancel</button
				><button
					id="submit"
					class="m-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
					onclick={submitCancel}>Continue</button
				>
			</div>
		</div>
	</div>
{/if}
