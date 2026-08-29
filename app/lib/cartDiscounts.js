export function cartDiscountLines(cart) {
  const allocations = cart?.discountAllocations ?? [];
  return allocations
    .filter((row) => Number(row?.discountedAmount?.amount) > 0)
    .map((row) => ({
      label: row.code || row.title || 'Discount',
      amount: row.discountedAmount,
    }));
}

export function summedDiscountMoney(lines) {
  if (lines.length === 0) return null;
  const cents = lines.reduce(
    (sum, row) => sum + Math.round(Number(row.amount?.amount) * 100),
    0,
  );
  if (cents <= 0) return null;
  return {
    amount: (cents / 100).toFixed(2),
    currencyCode: lines[0].amount.currencyCode,
  };
}

export function appliedDiscountCodes(cart) {
  return (
    cart?.discountCodes
      ?.filter((row) => row.applicable)
      ?.map((row) => row.code) ?? []
  );
}

export function rejectedDiscountCodes(cart) {
  return (
    cart?.discountCodes
      ?.filter((row) => !row.applicable)
      ?.map((row) => row.code) ?? []
  );
}
