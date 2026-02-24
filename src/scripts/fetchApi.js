export async function fetchApi(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}