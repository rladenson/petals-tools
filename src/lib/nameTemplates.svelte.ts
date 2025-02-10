import { browser } from '$app/environment';

export type NameTemplate = {
	name: string | undefined;
	template: string;
};

export class NameTemplateList {
	private _templates: Array<NameTemplate> = $state([]);

	public constructor() {
		this._templates = browser ? JSON.parse(localStorage?.getItem('templates') ?? '[]') : [];
	}

	public save() {
		if (browser)
			localStorage.setItem(
				'templates',
				JSON.stringify(this._templates.filter(({ template }) => template != ''))
			);
	}

	public get templates(): Array<NameTemplate> {
		return this._templates;
	}
	public at(index: number) {
		return this._templates.at(index);
	}

	public overwrite(index: number, template: NameTemplate) {
		this._templates[index] = template;
		this.save();
	}
	public setName(index: number, value: string) {
		this._templates[index].name = value;
		this.save();
	}
	public setTemplate(index: number, value: string) {
		this._templates[index].template = value;
		this.save();
	}

	public addTemplate(name?: string, template?: string) {
		this._templates.push({ name: name, template: template ?? '' });
		this.save();
	}
	public removeTemplate(index: number) {
		this._templates.splice(index, 1);
		this.save();
	}
}
