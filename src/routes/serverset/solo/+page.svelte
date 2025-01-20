<div class="flex flex-wrap">
	<form class="m-4 w-fit rounded bg-blue-100 p-6 pt-4">
		<h2 class="text-xl">System Settings</h2>
		<label class="text-l text-gray-800" for="proxyEnabled">Proxying Enabled:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="proxyEnabled"
			name="proxyEnabled"
		>
			<option>Don't Change Setting</option>
			<option>Turn On</option>
			<option>Turn Off</option>
		</select>
		<label class="text-l text-gray-800" for="tagEnabled">Tag Enabled:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="tagEnabled"
			name="tagEnabled"
		>
			<option>Don't Change Setting</option>
			<option>Turn On</option>
			<option>Turn Off</option>
		</select>
		<label class="text-l text-gray-800" for="servertag">Servertag:</label>
		<input
			type="text"
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="servertag"
			name="servertag"
			placeholder="Servertag"
		/>
		<div class="flex gap-2">
			<label class="text-l text-gray-800" for="servertagClear">Clear Servertag:</label>
			<input
				type="checkbox"
				class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
				id="servertagClear"
				name="servertagClear"
			/>
		</div>
	</form>

	<form class="m-4 w-fit rounded bg-blue-100 p-6 pt-4">
		<h2 class="text-xl">Autoproxy Settings</h2>
		<label class="text-l text-gray-800" for="autoproxy">Autoproxy Mode:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="autoproxy"
			name="autoproxy"
		>
			<option>Don't Change Setting</option>
			<option>Off</option>
			<option>Front</option>
			<option>Latch</option>
			<option>Member</option>
		</select>
		<label class="text-l text-gray-800" for="autoproxyMember">Autoproxy Member:</label>
		<input
			type="text"
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="autoproxyMember"
			name="autoproxyMember"
			placeholder="Member ID"
		/>
	</form>

	<form class="m-4 w-fit rounded bg-blue-100 p-6 pt-4">
		<h2 class="text-xl">Member Settings</h2>
		<label class="text-l text-gray-800" for="member">Member:</label>
		<input
			type="text"
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="member"
			name="member"
			placeholder="Member ID"
		/>
		<label class="text-l text-gray-800" for="servernameSelect">Server Name:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="servernameSelect"
			name="servernameSelect"
		>
			<option>Don't Change Setting</option>
			<option>Set</option>
			<option>Clear</option>
		</select>
		<label class="text-l text-gray-800" for="servername">Server Name:</label>
		<input
			type="text"
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="servername"
			name="servername"
			placeholder="Server Name"
		/>
		<label class="text-l text-gray-800" for="serveravatarSelect">Server Avatar:</label>
		<select
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="serveravatarSelect"
			name="serveravatarSelect"
		>
			<option>Don't Change Setting</option>
			<option>Set</option>
			<option>Clear</option>
		</select>
		<label class="text-l text-gray-800" for="serveravatar">Server Avatar:</label>
		<input
			type="text"
			class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
			id="serveravatar"
			name="serveravatar"
			placeholder="Image Link"
		/>
	</form>
</div>
