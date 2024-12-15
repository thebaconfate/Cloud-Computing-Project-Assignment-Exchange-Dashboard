export const symbols = ["AAPL", "AMZN", "MSFT", "GOOGL"];
export interface Order {
  // NOTE: price is actually a string from the socket.io event emitter but
  // as long as no addition (or in this case concatenation is done)
  // there shouldn't be any problems
  price: number;
  quantity: number;
  side?: "ask" | "bid" | string;
}

export interface LineData {
  askPrices: number[];
  bidPrices: number[];
  timestamps: Date[];
}
