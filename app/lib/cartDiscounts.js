export function cartDiscountLines(cart) {
  const allocations = cart?.discountAllocations ?? [];
  return allocations
    .filter((row) => Number(row?.discountedAmount?.amount) > 0)
    .map((row) => ({
      label: row.code || row.title || 'Discount',
      amount: row.discountedAmount,
    }));
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
