export const getBlockAtTimestamp = (crypto: string): string => `
  query Block($timestamp: timestamp!) @${crypto} {
    block(limit: 1, order_by: { height: desc }, where: { timestamp: { _lte: $timestamp } }) {
      timestamp
      height
    }
  }
`
