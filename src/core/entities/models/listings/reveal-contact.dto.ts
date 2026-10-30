/** Response of `POST /listings-visitor/:id/reveal-contact`. */
export interface RevealContactDto {
  listingId: number;
  /** The number set on the listing itself. */
  contactNumber: string | null;
  /** @deprecated The backend no longer returns phone, read contactNumber only. */
  phone?: string | null;
  sellerName?: string | null;
}
