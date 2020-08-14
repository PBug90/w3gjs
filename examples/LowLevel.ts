import W3GReplay from "../index";

const parser = new W3GReplay();

(async () => {
  const result = await parser.parse();
  console.log(result);
})();
