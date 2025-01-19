<script lang="ts">
	import '../app.css';
	let { children } = $props();

	let showMenu = $state(false);

	function toggleSidebar() {
		showMenu = !showMenu;
	}
</script>

<div class="flex h-screen flex-col">
	<header class="bg-blue-500 text-white sticky top-0">
		<nav class="mx-auto flex items-center justify-between p-2" aria-label="Global">
			<div class="flex lg:flex-1">
				<button onclick={toggleSidebar} class="-m-1.5 p-1.5">
					<span class="sr-only">Your Company</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
						/>
					</svg>
				</button>
				<a href="/" aria-label="Home" class="-m-1.5 p-1.5 px-5">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
						/>
					</svg>
				</a>
			</div>
			<div class="hidden lg:flex lg:gap-x-12">
				<a href="/serverset" class="text-sm/6 font-semibold">Server Settings</a>
			</div>
			<div class="hidden lg:flex lg:flex-1 lg:justify-end">
				<a href="/" class="text-sm/6 font-semibold" aria-label="settings">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</svg>
				</a>
			</div>
		</nav>
	</header>
	<div class="flex grow flex-col md:flex-row">
		<nav
			class="flex flex-col bg-blue-500 text-white transition-all motion-reduce:transition-none {showMenu
				? 'w-full p-2 md:w-3/4 lg:w-1/3'
				: 'h-0 overflow-hidden md:h-auto md:w-0'}"
		>
			<ul>
				<li class="m-5 rounded bg-blue-400 p-2 px-5 text-lg">
					PluralKit
					<ul>
						<li>
							&nbsp;&nbsp;<a href="/serverset" class="text-sm/6 font-semibold"
								>Server-Specific Settings</a
							>
						</li>
					</ul>
				</li>
				<li class="m-5 rounded bg-blue-400 p-2 px-5 text-lg">
					System
					<ul>
						<li>&nbsp;&nbsp;<span class="text-sm/6 font-semibold">Nothing Yet</span></li>
					</ul>
				</li>
				<li class="m-5 rounded bg-blue-400 p-2 px-5 text-lg">
					Misc
					<ul>
						<li>&nbsp;&nbsp;<span class="text-sm/6 font-semibold">Nothing Yet</span></li>
					</ul>
				</li>
			</ul>
		</nav>
		<div class="w-full p-2 overflow-scroll">
			{@render children()}
		</div>
	</div>
</div>

<style lang="postcss">
	:global(body) {
		@apply bg-blue-200;
	}
</style>
