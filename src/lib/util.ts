export const symbols = ["AAPL", "AMZN", "MSFT", "GOOGL"];
export interface Order {
  secnum: number;
  price: number;
  quantity: number;
  side: "ask" | "bid";
}

export interface BarData {
  price: number;
  quantity: number;
  side: string;
}

export interface LineData {
  askPrices: number[];
  bidPrices: number[];
  timestamps: Date[];
}

export interface AveragePricePerTimeStamp {
  price: number;
  interval: Date;
  side: "ask" | "bid";
}

export interface AveragePricePerStimeStampInit {
  asks: AveragePricePerTimeStamp[];
  bids: AveragePricePerTimeStamp[];
}
