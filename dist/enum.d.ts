type Arrays<T> = T extends undefined | null ? Array<any> : T extends Function ? Array<any> : T extends object ? Array<T> : T extends string ? Array<string> : T extends number ? Array<number> : T extends boolean ? Array<boolean> : T extends bigint ? Array<bigint> : T extends Date ? Array<Date> : T extends Buffer ? Array<Buffer> : T extends any[] ? Array<any> : T extends unknown ? Array<any> : never;
export declare const ColumnType: {
    String: StringConstructor;
    Number: NumberConstructor;
    Boolean: BooleanConstructor;
    BigInt: BigIntConstructor;
    Date: DateConstructor;
    Array: <type>(types?: type) => Arrays<type>;
    Object: ObjectConstructor;
    Buffer: BufferConstructor;
    Integer: BigIntConstructor;
};
export {};
