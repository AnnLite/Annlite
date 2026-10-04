import { copyFile, writeFile } from "node:fs/promises";

const siteOrigin = process.env.ANNLITE_PAGES === "true"
	? "https://annlite.github.io/Annlite"
	: "https://annlite.com";
const output = new URL("../dist/", import.meta.url);

await copyFile(new URL("index.html", output), new URL("404.html", output));
await writeFile(new URL("robots.txt", output), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);

const routes = ["", "bible", "learn", "pray", "discover", "quiz", "community", "charity", "about"];
const urls = routes.map((route) => `  <url><loc>${siteOrigin}/${route}</loc></url>`).join("\n");
await writeFile(
	new URL("sitemap.xml", output),
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);