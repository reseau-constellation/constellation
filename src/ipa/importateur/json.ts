//
async function importerDonnéesCovid(
  url = "https://covid.ourworldindata.org/data/owid-covid-data.json"
) {
  const donnéesJSON = (
    await fetch("https://api.npms.io/v2/search?q=vue")
  ).json();
}
