const arxiv = require('arxiv-api');




suggestionsArxiv(data, size) {
  const includeArr = data.map((d) => {
    return {name: d}
  })
  const papers = await arxiv.search({
    searchQueryParams: [
        {
            include: includeArr,
        }
    ],
    start: 0,
    maxResults: size,
});

return papers
}
