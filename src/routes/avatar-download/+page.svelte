<script lang="ts">
	import Modal, { type ModalData } from '$lib/Modal.svelte';
	import JSZip from 'jszip';
	import FileSaver from 'file-saver';

	let fileList: FileList | null | undefined = $state();
	let attachedFile = $derived(fileList?.item(0));
	let formatDetected = $state('none');
	$effect(() => {
		checkForKnownFormat(attachedFile);
	});

	let fileNameSchema = $state('name');

	let modalData = $state({} as ModalData);
	let shown = $state(false);
	let altModalBody = $state();

	let loading = $state(false);

	let avatarDownload: Blob | null | undefined = $state();
	let successful = $state([] as successFail[]);
	let failed = $state([] as successFail[]);
	let cors = $state([] as successFail[]);

	let resetModal: (() => void) | undefined = $state();

	type successFail = {
		imageType: string;
		ownerType: string;
		name: string | null;
		id: string;
		url: string;
	};

	const checkForKnownFormat = async (attachedFile: File | null | undefined) => {
		if (attachedFile) {
			const fileContents = JSON.parse(await attachedFile?.text());
			let formatsDetected = 0;
			if (fileContents.switches) {
				formatDetected = 'PluralKit';
				formatsDetected++;
				showPKWarnings();
			}
			if (fileContents.fronts) {
				formatDetected = 'Octocon';
				formatsDetected++;
				showOctoWarnings();
			}
			if (fileContents.tuppers) {
				formatDetected = 'Tupperbox';
				formatsDetected++;
				showTBoxWarnings();
			}
			if (formatsDetected > 1) {
				formatDetected = 'multiple';
				window.alert(
					'Could not determine format. Please report to Petal in the #third-party-discussion channel of the PluralKit server.'
				);
			}
			if (formatsDetected === 0) {
				formatDetected = 'failed';
			}
			console.log(fileContents);
		} else {
			formatDetected = 'none';
		}
	};

	const genericWarning =
		'This site will get all avatars it can, however it cannot get avatars from every image host. When it runs you will be shown ' +
		'a list of which images it successfully received and which it did not. Also note it is possible for this to run into issues if you have too many ' +
		'images, please let me (Petalss_tm) know on discord in the #third-party-discussion channel of the PluralKit server if this happens to you.';

	const showPKWarnings = () => {
		if (resetModal) resetModal();
		modalData.title = 'PluralKit File Warnings';
		modalData.body = genericWarning;
		modalData.showSubmitCancel = true;
		shown = true;
	};
	const showOctoWarnings = () => {
		if (resetModal) resetModal();
		modalData.title = 'Octocon File Warnings';
		modalData.body = genericWarning;
		modalData.showSubmitCancel = true;
		shown = true;
	};
	const showTBoxWarnings = () => {
		if (resetModal) resetModal();
		modalData.title = 'Tupperbox File Warnings';
		modalData.body =
			genericWarning +
			'\n\nNote this tool is not currently able to get avatars from Tupperbox groups, it will only get member avatars.';
		modalData.showSubmitCancel = true;
		shown = true;
	};

	type image = {
		name: string;
		blob: unknown;
	};
	let images = $state([] as image[]);

	const attachFileViaDrop = (e: DragEvent) => {
		e.preventDefault();
		const files = [...e.dataTransfer!.items]
			.filter((item) => item.kind == 'file' && item.type == 'application/json')
			.map((item) => item.getAsFile());
		if (files.length == 0) return;
		if (files.length > 1) {
			if (resetModal) resetModal();
			modalData.title = 'Error: Too Many Files';
			modalData.body = 'This tool can only accept one file at a time.';
			modalData.statusCode = 2;
			shown = true;
		}
		const list = new DataTransfer();
		for (const file of files) list.items.add(file!);
		fileList = list.files;
	};
	const changeDropFunction = (e: DragEvent) => {
		const fileItems = [...e.dataTransfer!.items].filter((item) => item.kind === 'file');
		if (fileItems.length > 0) {
			e.preventDefault();
			if (!fileItems.some((item) => item.type !== 'application/json')) {
				e.dataTransfer!.dropEffect = 'copy';
			} else {
				e.dataTransfer!.dropEffect = 'none';
			}
		}
	};

	const processAvatars = async (e: SubmitEvent) => {
		e.preventDefault();

		if (!attachedFile) return window.alert('No file attached');

		const fileContents = JSON.parse(await attachedFile?.text());
		avatarDownload = null;
		loading = true;

		images = [];
		successful = [];
		failed = [];
		cors = [];

		if (formatDetected === 'PluralKit') {
			const systemImageFields = ['avatar_url', 'banner'];
			for (const field of systemImageFields)
				if (fileContents[field])
					try {
						const res = await fetch(fileContents[field]);
						if (!res.ok) throw new Error(`Response status: ${res.status}`);
						if (!res.headers.get('content-type')?.startsWith('image'))
							throw new Error(`Received a ${res.type} instead of an image`);
						images.push({
							name: `system-${field}.${res.headers.get('content-type')?.split('/')[1]}`,
							blob: await res.blob()
						});
						successful.push({
							imageType: field,
							name: fileContents.name,
							id: fileContents.id,
							url: fileContents[field],
							ownerType: 'system'
						});
					} catch (e) {
						if (e instanceof Error) {
							if (e.message.includes('NetworkError')) {
								cors.push({
									imageType: field,
									name: fileContents.name,
									id: fileContents.id,
									url: fileContents[field],
									ownerType: 'system'
								});
							} else {
								//window.alert(e.message);
								console.log(e.message);
								failed.push({
									imageType: field,
									name: fileContents.name,
									id: fileContents.id,
									url: fileContents[field],
									ownerType: 'system'
								});
							}
						}
					}

			const memberImageFields = ['avatar_url', 'banner', 'webhook_avatar_url'];
			const memberNamesUsed = new Map<string, number>();
			for (const member of fileContents.members) {
				// this block is making sure names aren't duplicated
				// it's in a while in case the name we try to use to resolve a conflict is itself a conflict
				let changed = false;
				while (memberNamesUsed.get(member.name) !== undefined) {
					if (changed) member.name = member.name.slice(0, member.name.lastIndexOf('-'));
					memberNamesUsed.set(member.name, memberNamesUsed.get(member.name)! + 1);
					member.name = member.name + '-' + (memberNamesUsed.get(member.name)! - 1);
					changed = true;
				}
				memberNamesUsed.set(member.name, 1);

				for (const field of memberImageFields) {
					if (member[field])
						try {
							const res = await fetch(member[field]);
							if (!res.ok) throw new Error(`Response status: ${res.status}`);
							if (!res.headers.get('content-type')?.startsWith('image'))
								throw new Error(`Received a ${res.type} instead of an image`);
							images.push({
								name: `members/${((member[fileNameSchema] ?? member.id) as string).replaceAll(/\s+/g, '-')}-${field}.${res.headers.get('content-type')?.split('/')[1]}`,
								blob: await res.blob()
							});
							successful.push({
								imageType: field,
								name: member.name,
								id: member.id,
								url: member[field],
								ownerType: 'member'
							});
						} catch (e) {
							if (e instanceof Error) {
								if (e.message.includes('NetworkError')) {
									cors.push({
										imageType: field,
										name: member.name,
										id: member.id,
										url: member[field],
										ownerType: 'member'
									});
								} else {
									//window.alert(e.message);
									console.log(e.message);
									failed.push({
										imageType: field,
										name: member.name,
										id: member.id,
										url: member[field],
										ownerType: 'member'
									});
								}
							}
						}
				}
			}

			const groupImageFields = ['icon', 'banner'];
			const groupNamesUsed = new Map<string, number>();
			for (const group of fileContents.groups) {
				// this block is making sure names aren't duplicated
				// it's in a while in case the name we try to use to resolve a conflict is itself a conflict
				let changed = false;
				while (groupNamesUsed.get(group.name) !== undefined) {
					if (changed) group.name = group.name.slice(0, group.name.lastIndexOf('-'));
					groupNamesUsed.set(group.name, groupNamesUsed.get(group.name)! + 1);
					group.name = group.name + '-' + (groupNamesUsed.get(group.name)! - 1);
					changed = true;
				}
				groupNamesUsed.set(group.name, 1);

				for (const field of groupImageFields) {
					if (group[field])
						try {
							const res = await fetch(group[field]);
							if (!res.ok) throw new Error(`Response status: ${res.status}`);
							if (!res.headers.get('content-type')?.startsWith('image'))
								throw new Error(`Received a ${res.type} instead of an image`);
							images.push({
								name: `groups/${((group[fileNameSchema] ?? group.id) as string).replaceAll(/\s+/g, '-')}-${field}.${res.headers.get('content-type')?.split('/')[1]}`,
								blob: await res.blob()
							});
							successful.push({
								imageType: field,
								name: group.name,
								id: group.id,
								url: group[field],
								ownerType: 'group'
							});
						} catch (e) {
							if (e instanceof Error) {
								if (e.message.includes('NetworkError')) {
									cors.push({
										imageType: field,
										name: group.name,
										id: group.id,
										url: group[field],
										ownerType: 'group'
									});
								} else {
									//window.alert(e.message);
									console.log(e.message);
									failed.push({
										imageType: field,
										name: group.name,
										id: group.id,
										url: group[field],
										ownerType: 'group'
									});
								}
							}
						}
				}
			}
		} else if (formatDetected === 'Octocon') {
			const userImageFields = ['avatar_url'];
			for (const field of userImageFields)
				if (fileContents[field])
					try {
						const res = await fetch(fileContents.user[field]);
						if (!res.ok) throw new Error(`Response status: ${res.status}`);
						if (!res.headers.get('content-type')?.startsWith('image'))
							throw new Error(`Received a ${res.type} instead of an image`);
						images.push({
							name: `user-${field}.${res.headers.get('content-type')?.split('/')[1]}`,
							blob: await res.blob()
						});
						successful.push({
							imageType: field,
							name: fileContents.user.name,
							id: fileContents.user.id,
							url: fileContents.user[field],
							ownerType: 'user'
						});
					} catch (e) {
						if (e instanceof Error) {
							if (e.message.includes('NetworkError')) {
								cors.push({
									imageType: field,
									name: fileContents.user.name,
									id: fileContents.user.id,
									url: fileContents.user[field],
									ownerType: 'user'
								});
							} else {
								//window.alert(e.message);
								console.log(e.message);
								failed.push({
									imageType: field,
									name: fileContents.user.name,
									id: fileContents.user.id,
									url: fileContents.user[field],
									ownerType: 'user'
								});
							}
						}
					}

			const alterImageFields = ['avatar_url'];
			const alterNamesUsed = new Map<string, number>();
			for (const alter of fileContents.alters) {
				// this block is making sure names aren't duplicated
				// it's in a while in case the name we try to use to resolve a conflict is itself a conflict
				let changed = false;
				while (alterNamesUsed.get(alter.name) !== undefined) {
					if (changed) alter.name = alter.name.slice(0, alter.name.lastIndexOf('-'));
					alterNamesUsed.set(alter.name, alterNamesUsed.get(alter.name)! + 1);
					alter.name = alter.name + '-' + (alterNamesUsed.get(alter.name)! - 1);
					changed = true;
				}
				alterNamesUsed.set(alter.name, 1);

				for (const field of alterImageFields) {
					if (alter[field])
						try {
							const res = await fetch(alter[field]);
							if (!res.ok) throw new Error(`Response status: ${res.status}`);
							if (!res.headers.get('content-type')?.startsWith('image'))
								throw new Error(`Received a ${res.type} instead of an image`);
							console.log(fileNameSchema);
							images.push({
								name: `alters/${(((alter[fileNameSchema] ?? alter.id) as string) + '').replaceAll(/\s+/g, '-')}-${field}.${res.headers.get('content-type')?.split('/')[1]}`,
								blob: await res.blob()
							});
							successful.push({
								imageType: field,
								name: alter.name,
								id: alter.id,
								url: alter[field],
								ownerType: 'alter'
							});
						} catch (e) {
							if (e instanceof Error) {
								if (e.message.includes('NetworkError')) {
									cors.push({
										imageType: field,
										name: alter.name,
										id: alter.id,
										url: alter[field],
										ownerType: 'alter'
									});
								} else {
									//window.alert(e.message);
									console.log(e.message);
									failed.push({
										imageType: field,
										name: alter.name,
										id: alter.id,
										url: alter[field],
										ownerType: 'alter'
									});
								}
							}
						}
				}
			}
		} else if (formatDetected === 'Tupperbox') {
			const tupperImageFields = ['avatar_url'];
			const tupperNamesUsed = new Map<string, number>();
			for (const tupper of fileContents.tuppers) {
				// this block is making sure names aren't duplicated
				// it's in a while in case the name we try to use to resolve a conflict is itself a conflict
				let changed = false;
				while (tupperNamesUsed.get(tupper.name) !== undefined) {
					if (changed) tupper.name = tupper.name.slice(0, tupper.name.lastIndexOf('-'));
					tupperNamesUsed.set(tupper.name, tupperNamesUsed.get(tupper.name)! + 1);
					tupper.name = tupper.name + '-' + (tupperNamesUsed.get(tupper.name)! - 1);
					changed = true;
				}
				tupperNamesUsed.set(tupper.name, 1);

				for (const field of tupperImageFields) {
					if (tupper[field])
						try {
							const res = await fetch(tupper[field]);
							if (!res.ok) throw new Error(`Response status: ${res.status}`);
							if (!res.headers.get('content-type')?.startsWith('image'))
								throw new Error(`Received a ${res.type} instead of an image`);
							images.push({
								name: `tupper/${((tupper[fileNameSchema] ?? tupper.id) as string).replaceAll(/\s+/g, '-')}-${field}.${res.headers.get('content-type')?.split('/')[1]}`,
								blob: await res.blob()
							});
							successful.push({
								imageType: field,
								name: tupper.name,
								id: tupper.id,
								url: tupper[field],
								ownerType: 'tupper'
							});
						} catch (e) {
							if (e instanceof Error) {
								if (e.message.includes('NetworkError')) {
									cors.push({
										imageType: field,
										name: tupper.name,
										id: tupper.id,
										url: tupper[field],
										ownerType: 'tupper'
									});
								} else {
									//window.alert(e.message);
									console.log(e.message);
									failed.push({
										imageType: field,
										name: tupper.name,
										id: tupper.id,
										url: tupper[field],
										ownerType: 'tupper'
									});
								}
							}
						}
				}
			}
		}

		const zip = new JSZip();
		for (const image of images) {
			zip.file(image.name, image.blob);
		}

		zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
			loading = false;
			avatarDownload = content;
		});
	};

	const download = () => {
		if (avatarDownload) FileSaver.saveAs(avatarDownload, 'avatars.zip');
	};

	const showFailedModal = (e: MouseEvent) => {
		const target = JSON.parse((e.target as HTMLElement).dataset['line'] ?? '') as successFail;
		if (resetModal) resetModal();
		modalData.title = 'Error: Could Not Download';
		modalData.body = `Could not download ${target.imageType} of ${target.ownerType} ${target.name} (${target.id}) at the
	following URL:\n${target.url}`;
		modalData.useAltBody = target;
		altModalBody = failedModalBody;
		modalData.statusCode = 0;
		shown = true;
	};

	const corsModal = () => {
		if (resetModal) resetModal();
		modalData.title = 'CORS Error';
		modalData.body = `The network request failed. This is likely due to the server your image is on not 
		allowing requests from scripts (what this tool is). Possible alternatives that may work are 
		https://github.com/greys-tools/pktools and https://irys.cc/pk/tiny/dlscript/`;
		modalData.useAltBody = true;
		altModalBody = corsModalBody;
		modalData.statusCode = 0;
		shown = true;
	};
</script>

{#snippet failedModalBody(target: successFail)}
	Could not download {target.imageType} of {target.ownerType}
	{target.name} ({target.id}) at the following URL:<br />
	<a href={target.url} class="underline">{target.url}</a>
{/snippet}

{#snippet corsModalBody()}
	The network request failed. This is likely due to the server your image is on not allowing
	requests from scripts (what this tool is). Possible alternatives that may work are
	<a href="https://github.com/greys-tools/pktools" class="underline"
		>https://github.com/greys-tools/pktools</a
	>
	and
	<a href="https://irys.cc/pk/tiny/dlscript/" class="underline">https://irys.cc/pk/tiny/dlscript/</a
	>
	<br /><br />
	More information can be found
	<a
		href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSMissingAllowOrigin"
		class="underline">here</a
	>.
{/snippet}

<svelte:window on:drop={attachFileViaDrop} on:dragover={changeDropFunction} />

<div
	class="mb-3 h-full w-full text-center {loading
		? 'cursor-progress'
		: ''} flex flex-col items-center"
>
	<h1 class="text-2xl font-semibold">Download Avatars</h1>
	<br />
	{#if loading}
		<h2 class="text-3xl font-bold">Loading, keep this page open!</h2>
	{:else}
		<form onsubmit={processAvatars}>
			<label for="cover-photo" class="text-sm/6 font-medium">Attach your export file here</label>
			<div class="flex flex-row">
				<div class="flex-grow"></div>
				<label
					for="file-upload"
					class="relative cursor-pointer rounded-md text-indigo-500 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-400"
				>
					<div class="my-2 flex flex-grow-0 rounded-lg border border-dashed border-black px-6 py-5">
						<div class="text-center">
							{#if attachedFile}
								<div class="pb-3 text-black">
									{attachedFile.name}
								</div>
							{/if}
							<div class="flex text-sm/6">
								<span class="font-semibold"
									>Upload a {#if attachedFile}different&nbsp;{/if}file</span
								>
								<input
									id="file-upload"
									type="file"
									name="file-upload"
									class="sr-only"
									accept="application/json"
									bind:files={fileList}
								/>
								<p class="pl-1 text-gray-400">or drag and drop</p>
							</div>
							<p class="text-xs/5 text-gray-400">JSON only</p>
						</div>
					</div>
				</label>
				<div class="flex-grow"></div>
			</div>
			<div class="m-1">
				{#if formatDetected === 'PluralKit'}
					Format detected as a PluralKit export file.<br />
					Name files using a member's
					<select bind:value={fileNameSchema}>
						<option value="name">name</option>
						<option value="id">ID</option>
					</select>
				{:else if formatDetected === 'Octocon'}
					Format detected as an Octocon export file.<br />
					Name files using an alter's
					<select bind:value={fileNameSchema}>
						<option value="name">name</option>
						<option value="id">ID</option>
					</select>
				{:else if formatDetected === 'Tupperbox'}
					Format detected as an Tupperbox export file.<br />
					Name files using a tupper's
					<select bind:value={fileNameSchema}>
						<option value="name">name</option>
						<option value="id">ID</option>
					</select>
				{:else if formatDetected === 'failed'}
					File not in a format this site recognizes.
				{/if}
			</div>
			<button
				name="go"
				type="submit"
				class="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-blue-500/60"
				disabled={attachedFile == null ||
					['none', 'multiple', 'failed'].indexOf(formatDetected) != -1 ||
					modalData.submitCancel !== true}>Process Avatars</button
			>
		</form>
		{#if avatarDownload}
			<button
				class="m-5 w-fit rounded-md bg-blue-600 px-3 py-2 text-xl font-semibold text-white drop-shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-blue-500/60"
				name="download"
				onclick={download}
				disabled={successful.length === 0}
				>Download Avatars<br /><span class="text-xs font-normal">
					{#if successful.length > 0}Will download anything marked as "Successful"
					{:else}Nothing successfully processed to download
					{/if}
				</span></button
			>
		{/if}
	{/if}
	{#if successful.length > 0 || failed.length > 0 || cors.length > 0}
		<table class="table-auto">
			<thead>
				<tr>
					{#if successful.length > 0}<th>Successful</th>{/if}
					{#if failed.length > 0}<th>Failed (click for link)</th>{/if}
					{#if cors.length > 0}<th class="cursor-pointer" onclick={corsModal}
							>CORS (Source declined this request, <br />click for more info)</th
						>{/if}
				</tr>
			</thead>
			<tbody>
				<tr>
					{#if successful.length > 0}
						<td class="align-top">
							{#each successful as success}
								<div>{success.ownerType} {success.name} ({success.id})'s {success.imageType}</div>
							{/each}
						</td>
					{/if}
					{#if failed.length > 0}
						<td class="align-top">
							{#each failed as fail}
								<div>
									<button data-line={JSON.stringify(fail)} onclick={showFailedModal}>
										{fail.ownerType}
										{fail.name} ({fail.id})'s {fail.imageType}
									</button>
								</div>
							{/each}
						</td>
					{/if}
					{#if cors.length > 0}
						<td class="align-top">
							{#each cors as cor}
								<div>
									<button data-line={JSON.stringify(cor)} onclick={showFailedModal}>
										{cor.ownerType}
										{cor.name} ({cor.id})'s {cor.imageType}
									</button>
								</div>
							{/each}
						</td>
					{/if}
				</tr>
			</tbody>
		</table>
	{/if}
</div>

<Modal bind:data={modalData} bind:shown bind:altModalBody bind:resetModal />
