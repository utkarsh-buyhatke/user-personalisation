<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	interface Categories {
		l1: string;
		l2: string;
		l3: string;
	}

	interface SubmittedData {
		productName: string;
		imageUrls: string[];
		genericName: string;
		brandName: string;
		categories: Categories;
		gender: string;
		cityTier: string;
		response: any;
	}

	interface PageState {
		submittedData: SubmittedData;
	}

	const submittedData = (page.state as PageState).submittedData;

	const handleBack = () => {
		goto('/analytics');
	};

	interface ProductInfo {
		prod: string;
		price: number;
		brand: string;
		color: string;
		gender: string;
		genericName: string;
		category: number;
		subCategory: number;
		subSubCategory: number;
		pincode?: number;
		timestamp?: number;
	}

	interface SearchTerm {
		pos: number;
		brand: string;
		query: string;
		category: number;
		timestamp: number;
		genericName: string;
		subCategory: number;
		subSubCategory: number;
	}

	interface UserSource {
		user_id: number;
		city: Record<string, number>;
		gender: string;
		brandAffinity: Record<string, number>;
		categoryAffinity: Record<string, number>;
		genericAffinity: Record<string, number>;
	}

	interface UserData {
		_id: string;
		_score: number;
		_source: UserSource;
		listOfProdsVisited: ProductInfo[];
		listOfProdsPurchased: ProductInfo[];
		searchTerms: SearchTerm[];
	}

	// Add these new variables for user data handling
	let userData: UserData[] = submittedData.response || [];
	let searchQuery = '';
	let selectedFilter = 'all';

	// Filter function for users
	$: filteredUsers = userData.filter((user: UserData) => {
		const matchesSearch = searchQuery.toLowerCase().trim() === '' || 
			JSON.stringify(user).toLowerCase().includes(searchQuery.toLowerCase());

		if (selectedFilter === 'all') return matchesSearch;
		if (selectedFilter === 'searchTerms') return matchesSearch && user.searchTerms?.length > 0;
		if (selectedFilter === 'brandAffinity') return matchesSearch && Object.keys(user._source.brandAffinity || {}).length > 0;
		if (selectedFilter === 'categoryAffinity') return matchesSearch && Object.keys(user._source.categoryAffinity || {}).length > 0;
		return matchesSearch;
	});

	// Helper function to format affinity object
	const formatAffinity = (affinity: Record<string, number>) => {
		const entries = Object.entries(affinity || {});
		return entries.map(([key, value]) => ({
			name: key,
			score: (value * 100).toFixed(1),
			tooltip: `${key}: ${(value * 100).toFixed(1)}% affinity`
		}));
	};

	// Helper function to format product info
	const formatProduct = (prod: ProductInfo) => {
		const tooltip = `Product: ${prod.prod}\nPrice: ₹${prod.price || 'N/A'}\nBrand: ${prod.brand}\nColor: ${prod.color || 'N/A'}\nDate: ${prod.timestamp ? formatTimestamp(prod.timestamp) : 'N/A'}`;
		return { 
			name: prod.prod,
			price: prod.price,
			brand: prod.brand,
			color: prod.color,
			date: prod.timestamp ? formatTimestamp(prod.timestamp) : 'N/A',
			tooltip
		};
	};

	// Helper function to format timestamp
	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString();
	};

	// Helper function to format search term
	const formatSearchTerm = (term: SearchTerm) => {
		return {
			query: term.query,
			brand: term.brand,
			date: formatTimestamp(term.timestamp),
			tooltip: `Query: ${term.query}\nBrand: ${term.brand}\nDate: ${formatTimestamp(term.timestamp)}`
		};
	};
</script>

<div class="w-full container mx-auto p-6">
	<div class="bg-white rounded-lg shadow-lg p-6">
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-2xl font-bold text-slate-800">Product Information</h1>
			<button
				onclick={handleBack}
				class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				Back to Dashboard
			</button>
		</div>

		<div class="space-y-6">
			<div class="bg-slate-50 border border-slate-200 rounded-md p-4">
				<h2 class="text-lg font-semibold text-slate-800 mb-2">Product Details</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="text-sm font-medium text-slate-600">Product Name</p>
						<p class="mt-1">{submittedData.productName || 'N/A'}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600">Generic Name</p>
						<p class="mt-1">{submittedData.genericName}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600">Brand Name</p>
						<p class="mt-1">{submittedData.brandName}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600">Gender</p>
						<p class="mt-1">{submittedData.gender}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600">City Tier</p>
						<p class="mt-1">{submittedData.cityTier}</p>
					</div>
				</div>
			</div>

			<div class="bg-slate-50 border border-slate-200 rounded-md p-4">
				<h2 class="text-lg font-semibold text-slate-800 mb-2">Categories</h2>
				<div class="overflow-hidden rounded-md border border-slate-200">
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-slate-200">
							<thead class="bg-slate-50">
								<tr>
									<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Level</th>
									<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-slate-200">
								{#if submittedData.categories.l1}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">L1</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{submittedData.categories.l1}</td>
									</tr>
								{/if}
								{#if submittedData.categories.l2}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">L2</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{submittedData.categories.l2}</td>
									</tr>
								{/if}
								{#if submittedData.categories.l3}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">L3</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{submittedData.categories.l3}</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{#if submittedData.imageUrls.length > 1}
				<div class="bg-slate-50 border border-slate-200 rounded-md p-4">
					<h2 class="text-lg font-semibold text-slate-800 mb-2">Product Images</h2>
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{#each submittedData.imageUrls as imageUrl}
							{#if imageUrl}
								<div class="aspect-square rounded-md overflow-hidden">
									<img src={imageUrl} alt="Product" class="w-24 h-24 object-cover" />
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<!-- <div class="bg-slate-50 border border-slate-200 rounded-md p-4">
				<h2 class="text-lg font-semibold text-slate-800 mb-2">API Response</h2>
				<pre class="whitespace-pre-wrap text-sm">{JSON.stringify(submittedData.response, null, 2)}</pre>
			</div> -->
		</div>
	</div>

	<!-- User Data Section -->
	<div class="bg-white rounded-lg shadow-lg p-6 mt-6">
		<h2 class="text-2xl font-bold text-slate-800 mb-4">User Profiles ({filteredUsers.length})</h2>
		
		<!-- Search and Filter Controls -->
		<!-- <div class="flex flex-col md:flex-row gap-4 mb-6">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search users..."
				class="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
			/>
			<select
				bind:value={selectedFilter}
				class="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
			>
				<option value="all">All Users</option>
				<option value="searchTerms">With Search Terms</option>
				<option value="brandAffinity">With Brand Affinity</option>
				<option value="categoryAffinity">With Category Affinity</option>
			</select>
		</div> -->

		<!-- Users Table -->
		<div class="overflow-hidden rounded-md border border-slate-200">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-slate-200">
					<thead class="bg-slate-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User ID</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">City Tier</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gender</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Brand Affinity</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Generic Affinity</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recent Searches</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recently Visited</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recently Purchased</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-slate-200">
						{#each filteredUsers as user}
							<tr class="hover:bg-slate-50/70 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user._id}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
									{(user._score * 100).toFixed(2)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
									{Object.keys(user._source.city || {}).join(', ')}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
									{user._source.gender}
								</td>
								<td class="px-6 py-4 text-sm text-slate-600">
									<div class="max-h-32 overflow-y-auto space-y-2">
										{#each formatAffinity(user._source.brandAffinity).slice(0, 3) as affinity}
											<div 
												class="p-2 rounded bg-white/80 hover:bg-blue-50/80 transition-colors shadow-sm"
												title={affinity.tooltip}
											>
												<div class="font-medium">{affinity.name}</div>
												<div class="text-xs text-slate-500">{affinity.score}%</div>
											</div>
										{/each}
									</div>
								</td>
								<td class="px-6 py-4 text-sm text-slate-600">
									<div class="max-h-32 overflow-y-auto space-y-2">
										{#each formatAffinity(user._source.genericAffinity).slice(0, 3) as affinity}
											<div 
												class="p-2 rounded bg-white/80 hover:bg-blue-50/80 transition-colors shadow-sm"
												title={affinity.tooltip}
											>
												<div class="font-medium">{affinity.name}</div>
												<div class="text-xs text-slate-500">{affinity.score}%</div>
											</div>
										{/each}
									</div>
								</td>
								<td class="px-6 py-4 text-sm text-slate-600">
									<div class="max-h-32 overflow-y-auto space-y-2">
										{#each user.searchTerms?.slice(0, 3) || [] as term}
											<div 
												class="p-2 rounded bg-white/80 hover:bg-blue-50/80 transition-colors shadow-sm"
												title={formatSearchTerm(term).tooltip}
											>
												<div class="font-medium">{term.query}</div>
											</div>
										{/each}
									</div>
								</td>
								<td class="px-6 py-4 text-sm text-slate-600">
									<div class="max-h-32 overflow-y-auto space-y-2">
										{#each user.listOfProdsVisited?.slice(0, 2) || [] as prod}
											<div 
												class="p-2 rounded bg-white/80 hover:bg-blue-50/80 transition-colors shadow-sm"
												title={formatProduct(prod).tooltip}
											>
												<div class="font-medium">{prod.prod}</div>
												<div class="text-xs text-slate-500">₹{prod.price || 'N/A'}</div>
											</div>
										{/each}
									</div>
								</td>
								<td class="px-6 py-4 text-sm text-slate-600">
									<div class="max-h-32 overflow-y-auto space-y-2">
										{#each user.listOfProdsPurchased?.slice(0, 2) || [] as prod}
											<div 
												class="p-2 rounded bg-white/80 hover:bg-blue-50/80 transition-colors shadow-sm"
												title={formatProduct(prod).tooltip}
											>
												<div class="font-medium">{prod.prod}</div>
												<div class="text-xs text-slate-500">₹{prod.price || 'N/A'}</div>
											</div>
										{/each}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div> 