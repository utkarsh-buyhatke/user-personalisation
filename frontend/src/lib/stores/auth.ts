import { writable } from 'svelte/store';
import Cookies from 'js-cookie';

interface AuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	username?: string;
}

const COOKIE_NAME = 'auth_state';
const COOKIE_EXPIRES = 1;
const COOKIE_VERSION = 2;

// Check cookies for existing auth state
const getInitialState = (): AuthState => {
	if (typeof window !== 'undefined') {
		const savedAuth = Cookies.get(COOKIE_NAME);
		if (savedAuth) {
			try {
				const parsedAuth = JSON.parse(savedAuth);
				if (parsedAuth.version === COOKIE_VERSION) {
					return parsedAuth;
				} else {
					// Invalidate cookie if version mismatch
					Cookies.remove(COOKIE_NAME);
				}
			} catch {
				// If cookie is invalid, remove it
				Cookies.remove(COOKIE_NAME);
			}
		}
	}
	return {
		isAuthenticated: false,
		isLoading: false,
		error: null
	};
};

const createAuthStore = () => {
	const store = writable<AuthState>(getInitialState());

	return {
		...store,
		set: (value: AuthState) => {
			if (typeof window !== 'undefined') {
				if (value.isAuthenticated) {
					Cookies.set(COOKIE_NAME, JSON.stringify({ ...value, version: COOKIE_VERSION }), {
						expires: COOKIE_EXPIRES,
						sameSite: 'strict',
						secure: window.location.protocol === 'https:'
					});
				} else {
					Cookies.remove(COOKIE_NAME);
				}
			}
			store.set(value);
		},
		update: (updater: (state: AuthState) => AuthState) => {
			store.update((state) => {
				const newState = updater(state);
				if (typeof window !== 'undefined') {
					if (newState.isAuthenticated) {
						Cookies.set(COOKIE_NAME, JSON.stringify({ ...newState, version: COOKIE_VERSION }), {
							expires: COOKIE_EXPIRES,
							sameSite: 'strict',
							secure: window.location.protocol === 'https:'
						});
					} else {
						Cookies.remove(COOKIE_NAME);
					}
				}
				return newState;
			});
		}
	};
};

export const authStore = createAuthStore();

export const login = async (username: string, password: string) => {
	authStore.update((state) => ({ ...state, isLoading: true, error: null }));

	try {
		// In a real application, this would be an API call
		// For demo purposes, we'll use a simple check
		if (username === 'admin' && password === 'hackathon123') {
			authStore.update((state) => ({
				...state,
				isAuthenticated: true,
				isLoading: false,
				username
			}));
			return true;
		} else {
			throw new Error('Invalid credentials');
		}
	} catch (error) {
		authStore.update((state) => ({
			...state,
			error: error instanceof Error ? error.message : 'An error occurred',
			isLoading: false
		}));
		return false;
	}
};

export const logout = () => {
	if (typeof window !== 'undefined') {
		Cookies.remove(COOKIE_NAME);
	}
	authStore.set({
		isAuthenticated: false,
		isLoading: false,
		error: null
	});
};
