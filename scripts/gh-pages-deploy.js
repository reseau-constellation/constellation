/* eslint-disable no-console */
console.log('ici')
const execa = require("execa");
const fs = require("fs");
(async () => {
  try {
    try {
      await execa("git", ["add", "--all", "--ignore-errors"]);
    } catch (e) {
      if (!(e.message.includes("nothing to commit, working tree clean"))) {
        console.log(e.message);
        process.exit(1);
      }
    }

    await execa("git", ["commit", "-a", "-m", "Avant de déployer"]);
    await execa("git", ["checkout", "--orphan", "gh-pages"]);
    // eslint-disable-next-line no-console
    console.log("On construit le projet...");
    await execa("yarn", ["build"]);
    // Understand if it's dist or build folder
    const folderName = fs.existsSync("dist") ? "dist" : "build";
    await execa("git", ["--work-tree", folderName, "add", "--all"]);
    await execa("git", ["--work-tree", folderName, "commit", "-m", "gh-pages"]);
    console.log("On l'envoie à gh-pages...");
    await execa("git", ["push", "origin", "HEAD:gh-pages", "--force"]);
    await execa("rm", ["-r", folderName]);
    await execa("git", ["checkout", "-f", "master"]);
    await execa("git", ["branch", "-D", "gh-pages"]);
    console.log("Déployé avec succès ; allez voir sur GitHub maintenant !");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    process.exit(1);
  }
})();
