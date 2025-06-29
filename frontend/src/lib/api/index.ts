import { getFetch, postFetch } from '$lib/utils';

const apiUrl = 'https://ext1.buyhatke.com';

export const getUsersPersonas = async (params: URLSearchParams) => {
    const response = await postFetch(`${apiUrl}/grocery-api/testPersona/fetchPersonas`, params);
    return response;
};
