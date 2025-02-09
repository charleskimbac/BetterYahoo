/* eslint-disable no-unused-vars */

/* 
  from https://github.com/charleskimbac/common-files

  console.log alternative so we can easily filter in console with the tagName

  this is run first in the manifest, so just call the function as needed, no imports needed
*/

const tagName = "RYM";
function clog(purpose, ...values) {
  if (values.length == 0) {
    console.log(`[${tagName}]`, purpose); // prints: [TAGNAME] doingThis
  } else {
    console.log(`[${tagName}]`, purpose, "-", ...values); // prints: [TAGNAME] doingThis - valuesToPrint
  }
}