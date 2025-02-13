import { browser } from '$app/environment';

export function createApiUrl(): apiUrlObj {
	let whichUrl: string | undefined = $state(
		browser ? (localStorage.getItem('apiUrl') ?? 'liveUrl') : undefined
	);
	let customUrl: string | undefined = $state(
		browser ? (localStorage.getItem('customApiUrl') ?? '') : undefined
	);
	const loading = $derived(whichUrl === undefined || customUrl === undefined);

	return {
		get value() {
			let urlToReturn = $state(liveUrl);
			switch (whichUrl) {
				case 'liveUrl':
					urlToReturn = liveUrl;
					break;
				case 'betaUrl':
					urlToReturn = betaUrl;
					break;
				case 'custom':
					if (typeof customUrl == 'string') {
						if (!customUrl.endsWith('/')) urlToReturn = customUrl + '/';
						else urlToReturn = customUrl;
						if (!customUrl || !customUrl.match(/^https?:\/\/\w+\.\w+/)) urlToReturn = liveUrl;
					}
					break;
			}
			return urlToReturn;
		},
		set value(t: string | undefined) {
			whichUrl = t;
			console.log(t);
			if (browser) localStorage.setItem('apiUrl', t ?? '');
		},
		get loading() {
			return loading;
		},
		get whichUrl() {
			return whichUrl;
		},
		get customUrl() {
			return customUrl;
		},
		set customUrl(url: string | undefined) {
			customUrl = url;
			if (browser) localStorage.setItem('customApiUrl', url ?? '');
		},
		get customUrlValidity() {
			return typeof customUrl == 'string' && customUrl.match(/^https?:\/\/\w+\.\w+/) != null;
		}
	};
}

export type apiUrlObj = {
	value: string | undefined;
	readonly loading: boolean;
	readonly whichUrl: string | undefined;
	customUrl: string | undefined;
	readonly customUrlValidity: boolean;
};

export const liveUrl = 'https://api.pluralkit.me/v2/';
export const betaUrl = 'https://api.beta.pluralkit.me/v2/';
