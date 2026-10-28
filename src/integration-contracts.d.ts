/** Design-only contracts. No connected implementation is supplied. */
export type Language = 'de' | 'en' | 'zh';
export type IntegrationState = 'not-connected' | 'sandbox' | 'connected';
export interface ReviewEvidence { documentId: string; documentRevision: string; reviewedBy: string; reviewedAt: string; }
export interface WriteContext { idempotencyKey: string; expectedVersion: number; humanConfirmationId: string; }
export interface ProcurementAdapter {
  readonly state: IntegrationState;
  getPurchaseOrder(number: string): Promise<unknown>;
  createRequisition(draft: unknown, context: WriteContext): Promise<{externalId: string; version: number}>;
  createPurchaseOrder(draft: unknown, context: WriteContext): Promise<{externalId: string; version: number}>;
  recordConfirmation(draft: unknown, evidence: ReviewEvidence, context: WriteContext): Promise<unknown>;
  getGoodsReceipts(poNumber: string): Promise<unknown[]>;
  submitInvoiceForReview(draft: unknown, context: WriteContext): Promise<{reviewId: string}>;
}
// Deliberately no payment API and no browser-held credentials.
