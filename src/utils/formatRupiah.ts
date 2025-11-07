export const formatRupiah = (angka: number | string): string => {
  if (!angka && angka !== 0) return "-";

  // pastikan angka dalam bentuk number
  const number = typeof angka === "string" ? parseFloat(angka) : angka;

  return (
    "Rp " +
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number)
  );
};
