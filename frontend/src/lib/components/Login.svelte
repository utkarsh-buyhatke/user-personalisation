<script lang="ts">
	import { login, authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import logo from '$lib/images/logoFull.svg';

	let username = '';
	let password = '';

	let error: string | null = null;

	onMount(() => {
		// Redirect to home if already authenticated
		if ($authStore.isAuthenticated) {
			goto('/analytics');
		}
	});

	const handleSubmit = async () => {
		if (!username || !password) {
			error = 'Please fill in all fields';
			return;
		}

		const success = await login(username, password);
		if (success) {
			goto('/analytics');
		} else {
			error = 'Invalid credentials';
		}
	};
</script>

<div class="flex h-screen items-center justify-center bg-gray-100">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
		<div class="mb-4 flex items-center justify-center">
			<img src={logo} alt="logo" class="h-full w-40" />
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			{#if error}
				<div class="mb-4 rounded-lg bg-red-100 p-4 text-center text-red-800">{error}</div>
			{/if}

			<div>
				<label for="username" class="block text-sm font-medium text-slate-600">Username</label>
				<input
					bind:value={username}
					id="username"
					name="username"
					type="text"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-slate-600">Password</label>
				<input
					bind:value={password}
					type="password"
					id="password"
					placeholder="Enter password"
					disabled={$authStore.isLoading}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				disabled={$authStore.isLoading}
				class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4
            py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700
            focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50"
			>
				{$authStore.isLoading ? 'Loading...' : 'Login'}
			</button>
		</form>
	</div>
</div>
