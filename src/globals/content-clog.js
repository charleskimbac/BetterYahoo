/* eslint-disable no-unused-vars */

/* v2025.3.16 from https://github.com/charleskimbac/js-common-files
  console.log alternative so we can easily filter in console with TAG_NAME.

  prints:
  [TAGNAME] purpose
  [TAGNAME] purpose - ...values
*/

const TAG_NAME = "BY";

function clog(purpose, ...values) {
  // Console values can contain DOM nodes and email dates; persist only the event
  // and known boolean settings, never arbitrary console values.
  void globalThis.BYDiagnostics.log(typeof purpose === 'string' ? purpose : 'settings', {
    settings: globalThis.BYDiagnostics.settings(values[0] || (typeof purpose === 'object' ? purpose : {}))
  });
  if (values.length == 0) {
    console.log(`[${TAG_NAME}]`, purpose); // prints: [TAGNAME] purpose
  } else {
    console.log(`[${TAG_NAME}]`, purpose, "-", ...values); // prints: [TAGNAME] purpose - valuesToPrint
  }
}
