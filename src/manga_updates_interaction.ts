const SERIES_INFO_API = "https://api.mangaupdates.com/v1/series"
const SERIES_SEARCH_API = "https://api.mangaupdates.com/v1/series/search"


const searchSeries = async (query: string) => {
    const res = await fetch(SERIES_SEARCH_API, {
        method: "POST",
        body: JSON.stringify({ search: query }),
        headers: { "Content-Type": "application/json" }
    });

    return await res.json();
}

const getSeriesInfo = async (seriesId: number) => {
    const res = await fetch(`${SERIES_INFO_API}/${seriesId}`);

    return await res.json()
}
