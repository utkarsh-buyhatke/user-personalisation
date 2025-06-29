<script lang="ts">
	import { onMount } from 'svelte';

	interface Ad {
		id: string;
		title: string;
		description: string;
		imageUrl: string;
		targetUrl: string;
	}

	let ads: Ad[] = [];
	let loading: boolean = false;
	let error: string | null = null;

	onMount(() => {
		fetchAds();
	});

	const fetchAds = async () => {
		loading = true;
		error = null;
		try {
			// Simulate API call to fetch ads
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// For demonstration, return some dummy data
			ads = [
				{
					id: '1',
					title: 'Summer Sale!',
					description: 'Get up to 50% off on all summer collection items.',
					imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Ad1',
					targetUrl: 'https://example.com/summer-sale'
				},
				{
					id: '2',
					title: 'New Arrivals',
					description: 'Check out our latest products.',
					imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Ad2',
					targetUrl: 'https://example.com/new-arrivals'
				}
			];
		} catch {
			error = 'Failed to fetch ads.';
		} finally {
			loading = false;
		}
	};
</script>

<div class="w-full">
	<h2 class="mb-4 text-2xl font-bold text-gray-800">Previous</h2>

	{#if loading}
		<p>Loading ...</p>
	{:else if error}
		<div class="mb-4 rounded-md bg-red-100 p-3 text-red-700">{error}</div>
	{:else if ads.length === 0}
		<p>No products found. Create a new product to see it here.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each ads as ad (ad.id)}
				<div class="rounded-md bg-white p-4 shadow-md">
					<h3 class="mb-2 text-xl font-semibold text-gray-900">{ad.title}</h3>
					<p class="mb-2 text-gray-700">{ad.description}</p>
					<img src={ad.imageUrl} alt={ad.title} class="mb-2 h-32 w-full rounded-md object-cover" />
					<a
						href={ad.targetUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-indigo-600 hover:underline">View</a
					>
				</div>
			{/each}
		</div>
	{/if}
</div>
