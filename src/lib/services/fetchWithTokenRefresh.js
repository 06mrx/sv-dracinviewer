// import { storageService } from './storageService';
// import { goto } from '$app/navigation';
// import { PUBLIC_API_URL } from '$env/static/public';

// /**
//  * A wrapper function for `fetch` that automatically handles expired tokens.
//  * If the initial request fails with a 401 status, it will attempt to
//  * request a new token and retry the original request.
//  * @param {string} url The request URL.
//  * @param {RequestInit} options Standard `fetch` options.
//  * @param {number} retryCount The number of retries (to prevent infinite loops).
//  * @returns {Promise<Response>} Resolves with the successful response.
//  * @throws {Error} If the request fails after retries or token refresh fails.
//  */
// export async function fetchWithTokenRefresh(url, options = {}, retryCount = 0) {
//     // Get the token from storage
//     const token = storageService.getToken();


//     // Add authorization header to the request
//     const headers = new Headers(options.headers);
//     if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//     }
//     options.headers = headers;

//     const response = await fetch(url, options);

//     // console.log(response)
//     // If successful, return the response immediately
//     // if (response.ok) {
//     //     return response;
//     // }

//     // Handle the expired token case
//     if (response.status === 401) {
//         // Read the JSON message to confirm it is an 'Unauthenticated' error
//         const errorData = await response.clone().json();
//         if (errorData.message === 'Unauthenticated' && retryCount < 1) {
//             console.log('Token is expired. Requesting a new token...');

//             // Create headers for the refresh token request, including the old token
//             const refreshHeaders = new Headers();
//             refreshHeaders.set('Content-Type', 'application/json');
//             refreshHeaders.set('Authorization', `Bearer ${token}`); // THIS IS THE NEW PART


//             const refreshTokenResponse = await fetch(`${PUBLIC_API_URL}/api/refresh-token`, {
//                 method: 'POST',
//                 headers: refreshHeaders,
//             });

//             if (refreshTokenResponse.ok) {
//                 const refreshTokenData = await refreshTokenResponse.json();
//                 const newToken = refreshTokenData.token;
//                 storageService.setToken(newToken); // Save the new token

//                 console.log('Token successfully refreshed. Retrying original request...');

//                 // Retry the original request with the new token
//                 const newOptions = { ...options };
//                 const newHeaders = new Headers(newOptions.headers);
//                 newHeaders.set('Authorization', `Bearer ${newToken}`);
//                 newOptions.headers = newHeaders;

//                 return fetchWithTokenRefresh(url, newOptions, retryCount + 1);
//             } else {
//                 // If refresh token fails, redirect the user to the login page
//                 console.error('Failed to refresh token. Redirecting to login page.');
//                 storageService.clearUserData();
//                 // Use `goto` to redirect, passing the current URL as a returnUrl
//                 const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
//                 goto(`/auth/login?returnUrl=${currentUrl}`);
//                 throw new Error('Failed to refresh token.');
//             }
//         }
//     }

//     return response;

//     // First attempt
//     // try {


//     //     // If it's not a 401 error or not 'Unauthenticated', throw the original error
//     //     throw new Error(`Request failed with statusx ${response.status}`);

//     // } catch (error) {
//     //     console.error('Error during fetch:', error);
//     //     if (retryCount >= 1) {
//     //         // If it's a retry and it still fails, log out the user
//     //         storageService.clearUserData();
//     //         // Use `goto` to redirect, passing the current URL as a returnUrl
//     //         const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
//     //         goto(`/auth/login?returnUrl=${currentUrl}`);
//     //     }
//     //     throw error;
//     // }
// }

import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';
import { storageService } from './storageService'; // Pastikan path ini benar

// Svelte store untuk mengelola status loading dan progres
export const progressStore = writable({
    isLoading: false,
    progress: 0
});

/**
 * A wrapper function for `fetch` that automatically handles expired tokens.
 * It also controls a global progress bar.
 * @param {string} url The request URL.
 * @param {RequestInit} options Standard `fetch` options.
 * @param {number} retryCount The number of retries (to prevent infinite loops).
 * @returns {Promise<Response>} Resolves with the successful response.
 * @throws {Error} If the request fails after retries or token refresh fails.
 */
export async function fetchWithTokenRefresh(url, options = {}, retryCount = 0) {
    // 1. Mulai progres bar sebelum permintaan dimulai
    progressStore.update(state => ({ ...state, isLoading: true, progress: 0 }));

    // Get the token from storage
    const token = storageService.getToken();

    // Add authorization header to the request
    const headers = new Headers(options.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    options.headers = headers;

    // Simulasikan progres bertahap untuk pengalaman pengguna yang lebih baik
    const totalSteps = 10;
    const progressInterval = setInterval(() => {
        progressStore.update(state => {
            if (state.progress < 90) {
                return { ...state, progress: state.progress + 10 };
            }
            clearInterval(progressInterval);
            return state;
        });
    }, 100);

    let response;
    try {
        response = await fetch(url, options);

        // Jika berhasil, perbarui progres ke 100%
        if (response.ok) {
            progressStore.update(state => ({ ...state, progress: 100 }));
            clearInterval(progressInterval);
            return response;
        }

        // Handle the expired token case
        if (response.status === 401) {
            const errorData = await response.clone().json();
            if (errorData.message === 'Unauthenticated' && retryCount < 1) {
                console.log('Token is expired. Requesting a new token...');

                const refreshHeaders = new Headers();
                refreshHeaders.set('Content-Type', 'application/json');
                refreshHeaders.set('Authorization', `Bearer ${token}`);

                const refreshTokenResponse = await fetch(`${PUBLIC_API_URL}/api/refresh-token`, {
                    method: 'POST',
                    headers: refreshHeaders,
                });

                if (refreshTokenResponse.ok) {
                    const refreshTokenData = await refreshTokenResponse.json();
                    const newToken = refreshTokenData.token;
                    storageService.setToken(newToken);

                    console.log('Token successfully refreshed. Retrying original request...');

                    const newOptions = { ...options };
                    const newHeaders = new Headers(newOptions.headers);
                    newHeaders.set('Authorization', `Bearer ${newToken}`);
                    newOptions.headers = newHeaders;

                    return fetchWithTokenRefresh(url, newOptions, retryCount + 1);
                } else {
                    console.error('Failed to refresh token. Redirecting to login page.');
                    storageService.clearUserData();
                    const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                    goto(`/auth/login?returnUrl=${currentUrl}`);
                    throw new Error('Failed to refresh token.');
                }
            }
        }

        // Jika respons tidak OK dan bukan 401, lemparkan kesalahan
        throw new Error(`Request failed with status ${response.status}`);
    } catch (error) {
        // Jika terjadi kesalahan, reset progres
        console.error('Error during fetch:', error);
        throw error;
    } finally {
        // 2. Sembunyikan progress bar setelah semua selesai
        // Menggunakan setTimeout untuk efek transisi yang lebih halus
        clearInterval(progressInterval);
        setTimeout(() => {
            progressStore.update(state => ({ ...state, isLoading: false, progress: 0 }));
        }, 500);
    }
}

export async function fetchWithProgress(url, options = {}) {
    // Mulai progres bar
    progressStore.update(state => ({ ...state, isLoading: true, progress: 0 }));

    // Simulasikan progres bertahap
    const progressInterval = setInterval(() => {
        progressStore.update(state => {
            if (state.progress < 90) {
                return { ...state, progress: state.progress + 10 };
            }
            return state;
        });
    }, 100);

    try {
        const response = await fetch(url, options);

        // Jika berhasil, perbarui progres ke 100%
        if (response.ok) {
            clearInterval(progressInterval);
            progressStore.update(state => ({ ...state, progress: 100 }));
            return response;
        }

        // Jika respons tidak OK, lemparkan kesalahan
        throw new Error(`Request failed with status ${response.status}`);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    } finally {
        // Sembunyikan progress bar setelah semua selesai
        clearInterval(progressInterval);
        setTimeout(() => {
            progressStore.update(state => ({ ...state, isLoading: false, progress: 0 }));
        }, 500);
    }
}
