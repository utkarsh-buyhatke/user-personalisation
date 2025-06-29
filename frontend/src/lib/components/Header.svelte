<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, logout } from '$lib/stores/auth';

	import logo from '$lib/images/logoFull.svg';
	import searchIcon from '$lib/images/search.svg';
	import personIcon from '$lib/images/person.svg';
	// import hamburgerIcon from '$lib/images/hamburger.svg';


	const handleLogout = () => {
		logout();
		goto('/');
	};
</script>

<header class="fixed top-0 right-0 left-0 z-50 border-b border-slate-200 bg-white">
	<div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
		<div class="flex h-12 items-center justify-between sm:h-16">
			<div class="flex items-center gap-2">
				<!-- <button class="md:hidden" on:click={handleToggleSidebar} aria-label="Toggle sidebar">
					<img src={hamburgerIcon} alt="hamburger icon" class="h-6 w-6" />
				</button> -->
				<a href="/analytics" class="flex items-center"
					><img src={logo} alt="Logo" class="h-6 w-auto sm:h-8" /></a
				>
			</div>
			<div class="mx-8 hidden max-w-md flex-1 md:flex">
				<div
					class="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-50/50 focus-within:ring-2 focus-within:ring-indigo-600"
				>
					<img src={searchIcon} alt="search icon" class="ml-3 h-6 w-6 opacity-50" />
					<input
						type="text"
						placeholder="Search..."
						class="h-full flex-1 border-none bg-transparent px-3 focus:ring-0 focus:outline-none"
					/>
				</div>
			</div>
			<div class="flex items-center">
				<div class="relative flex gap-2 sm:gap-4">
					<button class="flex items-center rounded-lg py-1.5 hover:bg-slate-50 md:gap-2"
						><span class="relative flex shrink-0"
							><div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
								<img src={personIcon} alt="person Icon" class="h-4 w-4 text-indigo-600" />
							</div>
							<span
								class="absolute right-0 bottom-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white"
							></span></span
						><span class="hidden flex-col items-start md:flex"
							><span class="text-sm font-medium text-slate-600">{$authStore.username}</span><span
								class="text-xs text-gray-500 dark:text-gray-400">Administrator</span
							></span
						></button
					>
					<button
						class="my-auto flex w-full justify-center rounded-md border border-transparent bg-orange-500
							px-2 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:ring-2 focus:outline-none
							sm:px-4 sm:py-2.5"
						on:click={handleLogout}>Logout</button
					>
				</div>
			</div>
		</div>
	</div>
</header>
