export const symbols = ["AAPL", "AMZN", "MSFT", "GOOGL"];
export interface Order {
  // NOTE: price is actually a string from the socket.io event emitter but
  // as long as no addition (or in this case concatenation is done)
  // there shouldn't be any problems
  price: number;
  quantity: number;
  side: "ask" | "bid";
}

export class OrderMap {
  map: Map<number, number>;
  side: "ask" | "bid";

  constructor(
    side: "ask" | "bid",
    map: Map<number, number> | undefined = undefined,
  ) {
    this.map = map ? map : new Map<number, number>();
    this.side = side;
  }

  set(key: number, value: number) {
    if (value === 0) {
      this.map.delete(key);
    } else this.map.set(key, value);
  }

  toSortedArray(ascending: boolean = true) {
    // subtracting strings is actually just normal arithmetic
    const cmp = ascending
      ? (e1: Order, e2: Order) => e1.price - e2.price
      : (e1: Order, e2: Order) => e2.price - e1.price;
    const baseArr = Array.from(this.map.entries())
      .map(([key, value]) => {
        return { price: key, quantity: value, side: this.side };
      })
      .sort(cmp);
    console.log(baseArr);
    let sum = 0;
    if (ascending) {
      const result = baseArr.reduce((acc: Order[], value: Order) => {
        sum += value.quantity;
        acc.push({ ...value, quantity: sum });
        return acc;
      }, []);
      console.log(result);
      return result;
    } else {
      const result = baseArr.reduceRight((acc: Order[], value: Order) => {
        sum += value.quantity;
        acc.unshift({ ...value, quantity: sum });
        return acc;
      }, []);
      console.log(result);
      return result;
    }
  }
}

export interface LineData {
  askPrices: number[];
  bidPrices: number[];
  timestamps: Date[];
}
