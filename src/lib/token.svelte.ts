import { browser } from '$app/environment';

export function createToken() {
	let token: string | undefined = $state(
		browser ? (localStorage?.getItem('token') ?? undefined) : undefined
	);

	return {
		get value() {
			return token;
		},
		set value(t) {
			token = t;
			if (browser) localStorage?.setItem('token', t ?? '');
		},
		validate: () => {
			if (token == '') return TokenValidation.IsEmpty;
			else if (token == undefined) return TokenValidation.IsUndefined;
			else if (token.length < 64) return TokenValidation.TooShort;
			else if (token.length > 64) return TokenValidation.TooLong;
			else return TokenValidation.Valid;
		}
	};
}

export enum TokenValidation {
	Valid,
	IsEmpty,
	IsUndefined,
	TooShort,
	TooLong
}
