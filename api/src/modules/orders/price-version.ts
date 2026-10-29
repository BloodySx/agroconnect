import { ConflictError } from '../../shared/errors';

type QuotedPriceVersion = {
  source: string;
  priceId: string;
  updatedAt: string;
};

type ResolvedPriceVersion = {
  priceSource: string;
  priceId: string;
  updatedAt: string | Date;
};

/**
 * Recusa pedido se o preço efetivo foi alterado desde a cotação.
 * O cliente nunca determina o preço cobrado: ele é resolvido no servidor.
 * Comparar instantes (não textos ISO) evita rejeitar fusos/precisões equivalentes.
 */
export function assertPriceVersionMatches(
  quoted: QuotedPriceVersion,
  current: ResolvedPriceVersion,
): void {
  const quotedAt = new Date(quoted.updatedAt).getTime();
  const currentAt = new Date(current.updatedAt).getTime();

  if (
    quoted.source !== current.priceSource ||
    quoted.priceId !== current.priceId ||
    !Number.isFinite(quotedAt) ||
    !Number.isFinite(currentAt) ||
    quotedAt !== currentAt
  ) {
    throw new ConflictError('Preço alterado durante a cotação. Revise os valores.');
  }
}
