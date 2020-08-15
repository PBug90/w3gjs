/*
    This snippet passses a file system path to the high level parser
    and logs the parser result.
*/
import W3GReplay from "w3gjs";
const parser = new W3GReplay();
parser
  .parse("./replay.w3g")
  .then((result) => {
    console.log(result);
  })
  .catch(console.error);
