/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  eleventyConfig.setServerOptions({
    port: 6800,
  });

  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "html", "md"],
  };
}
