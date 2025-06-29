<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	let { children } = $props();

	const handleToggleSidebar = () => {
		// Dispatch a custom event that will be handled by the page
		window.dispatchEvent(new CustomEvent('toggleSidebar'));
	};
</script>

<div class="container">
	<div class="flex-1">
		<Header on:toggleSidebar={handleToggleSidebar} />
		<main class="mt-20 sm:mt-32 flex flex-col gap-6 rounded-md bg-white md:flex-row">
			{@render children()}
		</main>
	</div>
</div> 