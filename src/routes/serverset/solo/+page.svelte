<script lang="ts">
	import AutoproxySettings from './autoproxySettings.svelte';
	import MemberSettings from './memberSettings.svelte';
	import SystemSettings from './systemSettings.svelte';
	let { data } = $props();

</script>

<div class="flex flex-wrap justify-center">
	
	<SystemSettings token={data.token} serverId={data.serverId.id} />
	<AutoproxySettings token={data.token} serverId={data.serverId.id} />
	<MemberSettings token={data.token} serverId={data.serverId.id} />
	
</div>
