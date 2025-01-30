<script lang="ts">
	import AutoproxySettings from './autoproxySettings.svelte';
	import MemberSettings from './memberSettings.svelte';
	import SystemSettings from './systemSettings.svelte';
	let { data } = $props();

	const token = data.token;

</script>

<div class="flex flex-wrap justify-center">
	
	<SystemSettings token={token} />
	<AutoproxySettings token={token} />
	<MemberSettings token={token} />
	
</div>
