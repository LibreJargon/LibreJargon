const arxiv = require('arxiv-api');






async function suggestionsArxiv(data, size) {
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

return papers.map((p) => {
  return {
    link: p.id,
    title: p.title
  }
})
}



suggestionsArxiv(["game", "combinatoric"], 5).then((paper) => console.log(paper))
