<script lang="ts">
	import { getContext } from 'svelte';
	import AutoproxySettings from './autoproxySettings.svelte';
	import MemberSettings from './memberSettings.svelte';
	import SystemSettings from './systemSettings.svelte';
	import type { NameTemplateList } from '$lib/nameTemplates.svelte';

	let templates: NameTemplateList = getContext('templates');
</script>

<div class="flex flex-wrap justify-center">
	<SystemSettings />
	<AutoproxySettings />
	<MemberSettings />
</div>
