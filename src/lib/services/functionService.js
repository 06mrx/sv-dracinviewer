import { goto } from "$app/navigation";


export const getFirstError = (fieldErrors) => {
    if (!fieldErrors) {
        return null;
    }
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length > 0) {
        return fieldErrors[errorKeys[0]];
    }
    return null;
}


export const setPaginationData = (pagination, result) => {
    pagination = {
        current_page: result.data.current_page,
        last_page: result.data.last_page,
        per_page: result.data.per_page,
        total: result.data.total
    };

    return pagination;
}

export function updateUrlParams(newSearchTerm, newItemsPerPage, newPage, resetPage = false, newSortOrder='ASC') {
    const url = new URL(window.location.href);
    url.searchParams.set('per_page', newItemsPerPage.toString());
    const targetPage = resetPage ? 1 : newPage;
    url.searchParams.set('page', targetPage.toString());
    url.searchParams.set('sort_order', newSortOrder.toString());

    if (newSearchTerm) {
        url.searchParams.set('search', newSearchTerm);
    } else {
        url.searchParams.delete('search');
    }

    const newUrlString = url.toString();
    if (newUrlString !== window.location.href) {
        goto(newUrlString, { replaceState: true, noScroll: true });
    }
}

export function goToPage(searchTerm, itemsPerPage, pageNumber) {
    console.log('gotopage')
    console.log(searchTerm)
    console.log(itemsPerPage)
    console.log(pageNumber)
    updateUrlParams(searchTerm, itemsPerPage, pageNumber, false);
}

export function nextPage(searchTerm, itemsPerPage, pagination) {
    goToPage(searchTerm, itemsPerPage, pagination.current_page - 1);
}


export function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

let timeout;
export function debounce(fun, seconds) {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			fun()
		}, seconds);
	}