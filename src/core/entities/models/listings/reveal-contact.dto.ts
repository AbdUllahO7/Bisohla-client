/** Response of `POST /listings-visitor/:id/reveal-contact`. */
export interface RevealContactDto {
  listingId: number;
  /** The number set on the listing itself. */
  contactNumber: string | null;
  /** The owner account's phone — the fallback when the listing has none. */
  phone: string | null;
  sellerName: string | null;
}
