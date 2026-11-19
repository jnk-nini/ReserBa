// Text that a person typed (a resident's name, a guest name, an expense note)
// ends up in the Excel report. If it starts with = + - or @, a spreadsheet
// program can treat it as a formula, for example =HYPERLINK("http://bad.site").
// Putting an apostrophe in front keeps it as plain text. Tab and carriage
// return are included because some programs skip them and read what follows.
// Numbers are never changed, so negative amounts stay numbers.
const formulaStart = /^[=+\-@\t\r]/;

export function safeCellText<T extends string | number>(value: T): T | string {
  if (typeof value === "string" && formulaStart.test(value)) return `'${value}`;
  return value;
}
