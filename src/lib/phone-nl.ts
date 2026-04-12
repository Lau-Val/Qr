/**
 * Normalize Dutch mobile input for storage/submit.
 * Trims, strips common separators, maps +31/0031/31… to 0-prefixed local form.
 */
export function normalizeDutchPhone(input: string): string {
  let s = input.trim().replace(/[\s().-]/g, "");
  if (s.startsWith("+31")) {
    s = "0" + s.slice(3);
  } else if (s.startsWith("0031")) {
    s = "0" + s.slice(4);
  } else if (/^31[6]/.test(s) && s.length >= 10) {
    s = "0" + s.slice(2);
  } else if (/^6\d{8}$/.test(s)) {
    s = `0${s}`;
  }
  return s;
}

/** Basic NL mobile: 06 + 8 digits after normalization */
export function isValidDutchMobile(normalized: string): boolean {
  return /^06\d{8}$/.test(normalized);
}
