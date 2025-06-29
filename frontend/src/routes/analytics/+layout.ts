import { authStore } from '$lib/stores/auth';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
	let isAuthenticated = false;
	authStore.subscribe((state) => {
		isAuthenticated = state.isAuthenticated;
	})();

	if (!isAuthenticated) {
		throw redirect(302, '/');
	}

	return {};
};
