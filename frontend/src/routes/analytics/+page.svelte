<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import Sidebar from '$lib/components/Sidebar.svelte';
	import AdForm from '$lib/components/AdForm.svelte';
	import AdList from '$lib/components/AdList.svelte';

	let currentView: 'new' | 'list' = 'new';
	let showSidebar: boolean = false;

	const handleNavigate = (tab: 'new' | 'list') => {
		currentView = tab;
		showSidebar = false;
	};

	const toggleSidebar = () => {
		showSidebar = !showSidebar;
	};

	const isMobile = () => window.innerWidth < 768;

	const handleScroll = () => {
		if (isMobile() && showSidebar) {
			showSidebar = false;
		}
	};

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('toggleSidebar', toggleSidebar);
	});

	onDestroy(() => {
		window.removeEventListener('scroll', handleScroll);
		window.removeEventListener('toggleSidebar', toggleSidebar);
	});
</script>

<!-- <Sidebar
	class={showSidebar
		? 'absolute top-14 left-2 block w-11/12 sm:top-20'
		: 'hidden h-fit w-full md:block'}
	navigate={handleNavigate}
	selectedView={currentView}
/> -->
{#if currentView === 'new'}
	<AdForm />
{:else if currentView === 'list'}
	<AdList />
{/if}
