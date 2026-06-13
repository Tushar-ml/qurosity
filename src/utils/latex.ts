/**
 * Pass LaTeX to MDX components with backslashes preserved.
 * MDX eats `\f`, `\t`, etc. in attribute strings — use JS expressions instead:
 * @example expression={"\\Delta S \\geq k_B \\ln 2"}
 */
export function latex(value: string): string {
  return value;
}
