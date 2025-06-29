export const postFetch = async <T, U = unknown>(
	url: string,
	params?: string | URLSearchParams,
	headers?: HeadersInit,
	signal?: AbortSignal,
	mode?: RequestMode
) => {
	try {
		const response = await fetch(url, {
			method: 'POST',
			body: params,
			headers: new Headers({
				'Content-Type': 'application/x-www-form-urlencoded',
				...headers
			}),
			credentials: 'include',
			signal,
			mode
		});

		if (!response.ok) {
			console.log('Happy Diwali! API phat gayi:', url);
			return {
				status: 0,
				msg: response?.statusText || 'Something went wrong.'
			};
		}

		const json = await response.json();

		return json;
	} catch (error) {
		console.log('Kuch to gadbad hai daya:', url, error);
		return {
			status: 0,
			msg: (error as Error).message || String(error) || 'Something went wrong.'
		};
	}
};

export const getFetch = async <T, U = unknown>(
	url: string,
	params?: string | URLSearchParams | object,
	signal?: AbortSignal,
	mode?: RequestMode
) => {
	try {
		const t1 = Date.now();
		const response = await fetch(`${url}${params ? `?${params}` : ''}`, {
			method: 'GET',
			credentials: 'include',
			signal,
			mode
		});

		const t2 = Date.now();
		const tdiff = t2 - t1;

		if (!response.ok) {
			console.log('Happy Diwali! API phat gayi:', url);
			return {
				status: 0,
				msg: response?.statusText || 'Something went wrong.'
			};
		}

		const json = await response.json();

		return json;
	} catch (error) {
		console.log('Kuch to gadbad hai daya:', url, error);
		return {
			status: 0,
			msg: (error as Error).message || String(error) || 'Something went wrong.'
		};
	}
};

export function getUrlParams(url: string): { [key: string]: string } {
	const searchParams = new URLSearchParams(url);
	const params: { [key: string]: string } = {};

	searchParams.forEach((value, key) => {
		params[key] = value;
	});

	return params;
}
