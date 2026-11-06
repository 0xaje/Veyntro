const YOCTO_PER_NEAR = 10n ** 24n;

export function amountToYocto(amountStr: string): string {
  const trimmed = amountStr.trim();
  if (trimmed.length > 80 || !/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Enter a valid NEAR amount.");
  }
  const [whole, fraction = ""] = trimmed.split(".");
  if (fraction.length > 24) {
    throw new Error("NEAR amounts can have up to 24 digits after the decimal point.");
  }
  return (BigInt(whole) * YOCTO_PER_NEAR + BigInt(fraction.padEnd(24, "0"))).toString();
}
