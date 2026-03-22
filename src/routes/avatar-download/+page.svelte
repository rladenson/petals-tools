<script lang="ts">
	import Modal, { type ModalData } from '$lib/Modal.svelte';
	import JSZip from 'jszip';
	import FileSaver from 'file-saver';

	type fileData = {
		formatDetected: boolean | undefined;
		format: string;
		rawContents: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		contents: any;
		hasSlashes: boolean;
	};
	let fileData = $state({} as fileData);
	let fileList: FileList | null | undefined = $state();
	let attachedFile = $derived(fileList?.item(0));

	type fileNamingOptions = {
		escapeSlashes: string;
		identifierSchema: string;
		firstInFileName: string;
	};
	let fileNamingOptions = $state({} as fileNamingOptions);

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

	const checkFileData = async () => {
		fileData = {} as fileData;

		if (attachedFile) {
			fileData.rawContents = await attachedFile?.text();
			fileData.contents = JSON.parse(fileData.rawContents);
			let formatsDetected = 0;
			if (fileData.contents.switches) {
				fileData.formatDetected = true;
				fileData.format = 'PluralKit';
				formatsDetected++;
				showPKWarnings();
			}
			if (fileData.contents.fronts) {
				fileData.formatDetected = true;
				fileData.format = 'Octocon';
				formatsDetected++;
				showOctoWarnings();
			}
			if (fileData.contents.tuppers) {
				fileData.formatDetected = true;
				fileData.format = 'Tupperbox';
				formatsDetected++;
				showTBoxWarnings();
			}
			if (fileData.contents.securityLogs) {
				fileData.formatDetected = true;
				fileData.format = 'Simply Plural';
				formatsDetected++;
				showSPWarnings();
			}
			if (formatsDetected > 1) {
				fileData.formatDetected = false;
				window.alert(
					'Could not determine format. Please report to Petal in the #third-party-discussion channel of the PluralKit server.'
				);
				return;
			}
			if (formatsDetected === 0) {
				fileData.formatDetected = false;
				return;
			}
			fileData.rawContents = await attachedFile?.text();
			fileData.contents = JSON.parse(fileData.rawContents);

			if (fileData.rawContents.match(/"name":"[^"]*?[\\/][^"]*"/)) {
				fileData.hasSlashes = true;
			} else {
				fileData.hasSlashes = false;
			}

			console.log(fileData.rawContents);
		} else {
			fileData.formatDetected = undefined;
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
			'\n\nNote this tool has unknown reliability with Tupperbox group avatars, it may miss some or only get tupper avatars.';
		modalData.showSubmitCancel = true;
		shown = true;
	};
	const showSPWarnings = () => {
		if (resetModal) resetModal();
		modalData.title = 'Simply Plural File Warnings';
		modalData.body =
			genericWarning +
			'\n\nNote this tool can only get avatars set using image URLs, it will not get images uploaded directly to Simply Plural or in-line images in fields.';
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
			return;
		}
		const list = new DataTransfer();
		for (const file of files) list.items.add(file!);
		fileList = list.files;
		checkFileData();
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

		const readableDict = new Map([
			['avatar_url', 'avatar'],
			['avatarUrl', 'avatar'],
			['banner', 'banner'],
			['webhook_avatar_url', 'proxy_avatar'],
			['icon', 'avatar']
		]);

		if (!attachedFile) return window.alert('No file attached');

		avatarDownload = null;
		loading = true;

		images = [];
		successful = [];
		failed = [];
		cors = [];

		if (fileData.format === 'PluralKit') {
			const systemImageFields = ['avatar_url', 'banner'];
			for (const field of systemImageFields)
				if (fileData.contents[field])
					try {
						const res = await fetch(fileData.contents[field]);
						if (!res.ok) throw new Error(`Response status: ${res.status}`);
						if (!res.headers.get('content-type')?.startsWith('image'))
							throw new Error(`Received a ${res.type} instead of an image`);
						images.push({
							name: `system-${readableDict.get(field)}.${res.headers.get('content-type')?.split('/')[1]}`,
							blob: await res.blob()
						});
						successful.push({
							imageType: field,
							name: fileData.contents.name,
							id: fileData.contents.id,
							url: fileData.contents[field],
							ownerType: 'system'
						});
					} catch (e) {
						if (e instanceof Error) {
							if (e.message.includes('NetworkError')) {
								cors.push({
									imageType: field,
									name: fileData.contents.name,
									id: fileData.contents.id,
									url: fileData.contents[field],
									ownerType: 'system'
								});
							} else {
								//window.alert(e.message);
								console.log(e.message);
								failed.push({
									imageType: field,
									name: fileData.contents.name,
									id: fileData.contents.id,
									url: fileData.contents[field],
									ownerType: 'system'
								});
							}
						}
					}

			const memberImageFields = ['avatar_url', 'banner', 'webhook_avatar_url'];
			const memberNamesUsed = new Map<string, number>();
			for (const member of fileData.contents.members) {
				// this block is making sure names aren't duplicated
				// it's in a while loop in case the name we try to use to resolve a conflict is itself a conflict
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
							let identifier = (member[fileNamingOptions.identifierSchema] ?? member.id) + '';
							switch (fileNamingOptions.escapeSlashes) {
								case 'encode':
									identifier = identifier.replaceAll(/\//g, '%2F').replaceAll(/\\/g, '%5C');
									break;
								case 'remove':
									identifier = identifier.replaceAll(/[/\\]/g, '');
									break;
								default:
									if (fileNamingOptions.firstInFileName !== 'identifier')
										identifier = identifier.replaceAll(/[/\\]+$/g, '');
									else identifier = identifier.replaceAll(/^[/\\]+/g, '');
									identifier = identifier.replaceAll(/(?<=[\\/])[\\/]+/g, '');
							}
							identifier = identifier.replaceAll(/\s+/g, '-');
							let fileName = '';
							switch (fileNamingOptions.firstInFileName) {
								case 'identifier':
									fileName = `${identifier}-${readableDict.get(field)}`;
									break;
								case 'folder':
									fileName = `${readableDict.get(field)}s/${identifier}`;
									break;
								default:
									fileName = `${readableDict.get(field)}-${identifier}`;
									break;
							}
							images.push({
								name: `members/${fileName}.${res.headers.get('content-type')?.split('/')[1]}`,
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
			for (const group of fileData.contents.groups) {
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
							let identifier = (group[fileNamingOptions.identifierSchema] ?? group.id) + '';
							switch (fileNamingOptions.escapeSlashes) {
								case 'encode':
									identifier = identifier.replaceAll(/\//g, '%2F').replaceAll(/\\/g, '%5C');
									break;
								case 'remove':
									identifier = identifier.replaceAll(/[/\\]/g, '');
									break;
								default:
									if (fileNamingOptions.firstInFileName !== 'identifier')
										identifier = identifier.replaceAll(/[/\\]+$/g, '');
									else identifier = identifier.replaceAll(/^[/\\]+/g, '');
									identifier = identifier.replaceAll(/(?<=[\\/])[\\/]+/g, '');
							}
							identifier = identifier.replaceAll(/\s+/g, '-');
							let fileName = '';
							switch (fileNamingOptions.firstInFileName) {
								case 'identifier':
									fileName = `${identifier}-${readableDict.get(field)}`;
									break;
								case 'folder':
									fileName = `${readableDict.get(field)}s/${identifier}`;
									break;
								default:
									fileName = `${readableDict.get(field)}-${identifier}`;
									break;
							}
							images.push({
								name: `groups/${fileName}.${res.headers.get('content-type')?.split('/')[1]}`,
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
		} else if (fileData.format === 'Octocon') {
			const userImageFields = ['avatar_url'];
			for (const field of userImageFields)
				if (fileData.contents[field])
					try {
						const res = await fetch(fileData.contents.user[field]);
						if (!res.ok) throw new Error(`Response status: ${res.status}`);
						if (!res.headers.get('content-type')?.startsWith('image'))
							throw new Error(`Received a ${res.type} instead of an image`);
						images.push({
							name: `user-${readableDict.get(field)}.${res.headers.get('content-type')?.split('/')[1]}`,
							blob: await res.blob()
						});
						successful.push({
							imageType: field,
							name: fileData.contents.user.name,
							id: fileData.contents.user.id,
							url: fileData.contents.user[field],
							ownerType: 'user'
						});
					} catch (e) {
						if (e instanceof Error) {
							if (e.message.includes('NetworkError')) {
								cors.push({
									imageType: field,
									name: fileData.contents.user.name,
									id: fileData.contents.user.id,
									url: fileData.contents.user[field],
									ownerType: 'user'
								});
							} else {
								//window.alert(e.message);
								console.log(e.message);
								failed.push({
									imageType: field,
									name: fileData.contents.user.name,
									id: fileData.contents.user.id,
									url: fileData.contents.user[field],
									ownerType: 'user'
								});
							}
						}
					}

			const alterImageFields = ['avatar_url'];
			const alterNamesUsed = new Map<string, number>();
			for (const alter of fileData.contents.alters) {
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
							console.log(fileNamingOptions.identifierSchema);
							let identifier = (alter[fileNamingOptions.identifierSchema] ?? alter.id) + '';
							switch (fileNamingOptions.escapeSlashes) {
								case 'encode':
									identifier = identifier.replaceAll(/\//g, '%2F').replaceAll(/\\/g, '%5C');
									break;
								case 'remove':
									identifier = identifier.replaceAll(/[/\\]/g, '');
									break;
								default:
									if (fileNamingOptions.firstInFileName !== 'identifier')
										identifier = identifier.replaceAll(/[/\\]+$/g, '');
									else identifier = identifier.replaceAll(/^[/\\]+/g, '');
									identifier = identifier.replaceAll(/(?<=[\\/])[\\/]+/g, '');
							}
							identifier = identifier.replaceAll(/\s+/g, '-');
							let fileName = '';
							switch (fileNamingOptions.firstInFileName) {
								case 'identifier':
									fileName = `${identifier}-${readableDict.get(field)}`;
									break;
								case 'folder':
									fileName = `${readableDict.get(field)}s/${identifier}`;
									break;
								default:
									fileName = `${readableDict.get(field)}-${identifier}`;
									break;
							}
							images.push({
								name: `alters/${fileName}.${res.headers.get('content-type')?.split('/')[1]}`,
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
		} else if (fileData.format === 'Tupperbox') {
			const readableDictOverride = new Map([
				['avatar_url', 'avatar_full'],
				['avatar', 'avatar'],
				['banner', 'banner']
			]);
			const userIDMatchArr = fileData.rawContents.match(
				/https:\/\/cdn.tupperbox.app\/avatars\/(\d+)/
			);
			let userID: string | null = null;
			if (userIDMatchArr != null) userID = userIDMatchArr[1];
			const tupperImageFields = ['avatar_url', 'avatar'];
			const tupperNamesUsed = new Map<string, number>();
			for (const tupper of fileData.contents.tuppers) {
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
							let url = tupper[field];
							if (field === 'avatar') {
								if (userID === null) continue;
								url = `https://cdn.tupperbox.app/pfp/${userID}/${url}.webp`;
							}
							const res = await fetch(url);
							if (!res.ok) throw new Error(`Response status: ${res.status}`);
							if (!res.headers.get('content-type')?.startsWith('image'))
								throw new Error(`Received a ${res.type} instead of an image`);
							let identifier = (tupper[fileNamingOptions.identifierSchema] ?? tupper.id) + '';
							switch (fileNamingOptions.escapeSlashes) {
								case 'encode':
									identifier = identifier.replaceAll(/\//g, '%2F').replaceAll(/\\/g, '%5C');
									break;
								case 'remove':
									identifier = identifier.replaceAll(/[/\\]/g, '');
									break;
								default:
									if (fileNamingOptions.firstInFileName !== 'identifier')
										identifier = identifier.replaceAll(/[/\\]+$/g, '');
									else identifier = identifier.replaceAll(/^[/\\]+/g, '');
									identifier = identifier.replaceAll(/(?<=[\\/])[\\/]+/g, '');
							}
							identifier = identifier.replaceAll(/\s+/g, '-');
							let fileName = '';
							switch (fileNamingOptions.firstInFileName) {
								case 'identifier':
									fileName = `${identifier}-${readableDictOverride.get(field)}`;
									break;
								case 'folder':
									fileName = `${readableDictOverride.get(field)}/${identifier}`;
									break;
								default:
									fileName = `${readableDictOverride.get(field)}-${identifier}`;
									break;
							}
							images.push({
								name: `tupper/${fileName}.${res.headers.get('content-type')?.split('/')[1]}`,
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
			const groupImageFields = ['avatar'];
			const groupNamesUsed = new Map<string, number>();
			if (userIDMatchArr !== null) {
				for (const group of fileData.contents.groups) {
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
								const res = await fetch(
									`https://cdn.tupperbox.app/group-pfp/${userID}/${group[field]}.webp`
								);
								if (!res.ok) throw new Error(`Response status: ${res.status}`);
								if (!res.headers.get('content-type')?.startsWith('image'))
									throw new Error(`Received a ${res.type} instead of an image`);
								let identifier = (group[fileNamingOptions.identifierSchema] ?? group.id) + '';
								switch (fileNamingOptions.escapeSlashes) {
									case 'encode':
										identifier = identifier.replaceAll(/\//g, '%2F').replaceAll(/\\/g, '%5C');
										break;
									case 'remove':
										identifier = identifier.replaceAll(/[/\\]/g, '');
										break;
									default:
										if (fileNamingOptions.firstInFileName !== 'identifier')
											identifier = identifier.replaceAll(/[/\\]+$/g, '');
										identifier = identifier.replaceAll(/(?<=[\\/])[\\/]+/g, '');
								}
								identifier = identifier.replaceAll(/\s+/g, '-');
								let fileName = '';
								switch (fileNamingOptions.firstInFileName) {
									case 'identifier':
										fileName = `${identifier}-${readableDict.get(field)}`;
										break;
									case 'folder':
										fileName = `${readableDict.get(field)}s/${identifier}`;
										break;
									default:
										fileName = `${readableDict.get(field)}-${identifier}`;
										break;
								}
								images.push({
									name: `group/${fileName}.${res.headers.get('content-type')?.split('/')[1]}`,
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
			}
		} else if (fileData.format === 'Simply Plural') {
			const memberImageFields = ['avatarUrl'];
			const memberNamesUsed = new Map<string, number>();
			for (const member of fileData.contents.members) {
				// this block is making sure names aren't duplicated
				// it's in a while loop in case the name we try to use to resolve a conflict is itself a conflict
				let changed = false;
				while (memberNamesUsed.get(member.name) !== undefined) {
					if (changed) member.name = member.name.slice(0, member.name.lastIndexOf('-'));
					memberNamesUsed.set(member.name, memberNamesUsed.get(member.name)! + 1);
					member.name = member.name + '-' + (memberNamesUsed.get(member.name)! - 1);
					changed = true;
				}
				memberNamesUsed.set(member.name, 1);

				for (const field of memberImageFields) {
					if (member[field] && member[field].length > 0)
						try {
							const res = await fetch(member[field]);
							if (!res.ok) throw new Error(`Response status: ${res.status}`);
							if (!res.headers.get('content-type')?.startsWith('image'))
								throw new Error(`Received a ${res.type} instead of an image`);
							let identifier = (member[fileNamingOptions.identifierSchema] ?? member.id) + '';
							switch (fileNamingOptions.escapeSlashes) {
								case 'encode':
									identifier = identifier.replaceAll(/\//g, '%2F').replaceAll(/\\/g, '%5C');
									break;
								case 'remove':
									identifier = identifier.replaceAll(/[/\\]/g, '');
									break;
								default:
									if (fileNamingOptions.firstInFileName !== 'identifier')
										identifier = identifier.replaceAll(/[/\\]+$/g, '');
									else identifier = identifier.replaceAll(/^[/\\]+/g, '');
									identifier = identifier.replaceAll(/(?<=[\\/])[\\/]+/g, '');
							}
							identifier = identifier.replaceAll(/\s+/g, '-');
							let fileName = '';
							switch (fileNamingOptions.firstInFileName) {
								case 'identifier':
									fileName = `${identifier}-${readableDict.get(field)}`;
									break;
								case 'folder':
									fileName = `${readableDict.get(field)}s/${identifier}`;
									break;
								default:
									fileName = `${readableDict.get(field)}-${identifier}`;
									break;
							}
							images.push({
								name: `members/${fileName}.${res.headers.get('content-type')?.split('/')[1]}`,
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
		}

		const zip = new JSZip();
		for (const image of images) {
			zip.file(image.name, image.blob);
		}

		zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
			loading = false;
			avatarDownload = content;
		});

		modalData.submitCancel = true;
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
	<h2 class="text-md w-11/12 md:w-3/5 mb-3">This tool downloads all avatars from a given export file to your computer. All data is processed locally and no information is stored after you close the tab.</h2>
	<br />
	{#if loading}
		<h2 class="text-3xl font-bold">Loading, keep this page open!</h2>
	{:else}
		<form onsubmit={processAvatars}>
			<div class="text-sm/6 font-medium">Attach your export file here</div>
			<div class="flex flex-row">
				<div class="flex-grow"></div>
				<label
					for="file-upload"
					class="relative cursor-pointer rounded-md text-indigo-500 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-400"
				>
					<div class="mb-2 flex flex-grow-0 rounded-lg border border-dashed border-black px-6 py-5">
						<div class="text-center">
							{#if attachedFile}
								<div class="pb-3 text-black">
									{attachedFile.name}
								</div>
							{/if}
							<div class="flex justify-center text-sm/6">
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
									onchange={checkFileData}
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
				{#if fileData.formatDetected === false}
					File not in a format this site recognizes.
				{:else if fileData.formatDetected === true}
					{#if fileData.format === 'PluralKit'}
						Format detected as a PluralKit export file.<br />
						Name files using a member's
					{:else if fileData.format === 'Octocon'}
						Format detected as an Octocon export file.<br />
						Name files using an alter's
					{:else if fileData.format === 'Tupperbox'}
						Format detected as an Tupperbox export file.<br />
						Name files using a tupper's
					{:else if fileData.format === 'Simply Plural'}
						Format detected as an Simply Plural export file.<br />
						Name files using a member's
					{/if}
					<select bind:value={fileNamingOptions.identifierSchema} class="rounded-sm">
						<option value="name">name</option>
						<option value="id">ID</option>
					</select><br />
					Show the
					<select bind:value={fileNamingOptions.firstInFileName} class="rounded-sm">
						<option value="identifier">identifier (name or ID)</option>
						<option value="type">type (avatar, banner, etc)</option>
						<option value="folder">use folders instead</option>
					</select>
					first in file names<br />
					{#if fileData.hasSlashes}
						Slashes in names: <select
							disabled={fileNamingOptions.identifierSchema === 'id'}
							bind:value={fileNamingOptions.escapeSlashes}
							class="rounded-sm disabled:opacity-70"
						>
							<option value="folder">treat as folder boundaries</option>
							<option value="encode">use URL encoding (will show as %2F or %5C)</option>
							<option value="remove">remove them</option>
						</select>
					{/if}
				{/if}
			</div>
			<button
				name="go"
				type="submit"
				class="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-blue-500/60"
				disabled={attachedFile == null ||
					fileData.formatDetected !== true ||
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
