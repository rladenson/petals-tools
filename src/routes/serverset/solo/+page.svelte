<script lang="ts">
	import AutoproxySettings from './autoproxySettings.svelte';
	import MemberSettings from './memberSettings.svelte';
	import SystemSettings from './systemSettings.svelte';
</script>

<div class="flex flex-wrap justify-center">
	<SystemSettings />
	<AutoproxySettings />
	<MemberSettings />
</div>
