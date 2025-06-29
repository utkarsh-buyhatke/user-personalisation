<script lang="ts">
	import { fly } from 'svelte/transition';

	let { class: customClass = '', navigate = () => {}, selectedView = 'list' } = $props();

	const navigateTo = (view: 'new' | 'list') => {
		navigate(view);
	};
</script>

<aside
	class="rounded-md bg-white p-2 shadow-md {customClass} md:w-64"
	in:fly={{ duration: 300, x: -300 }}
>
	<nav>
		<ul class="space-y-2">
			<li>
				<button
					class="block w-full rounded-md p-4 text-left font-medium  hover:bg-indigo-50 {selectedView ===
					'new'
						? 'bg-indigo-50 text-indigo-600'
						: 'text-slate-600  bg-white'}"
					onclick={() => navigateTo('new')}>Add New Product</button
				>
			</li>
			<li>
				<button
					class="block w-full rounded-md p-4 text-left font-medium  hover:bg-indigo-50  {selectedView ===
					'list'
						? 'bg-indigo-50 text-indigo-600'
						: 'text-slate-600  bg-white'}"
					onclick={() => navigateTo('list')}>View Previous </button
				>
			</li>
		</ul>
	</nav>
</aside>
