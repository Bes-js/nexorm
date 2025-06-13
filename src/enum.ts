
type Arrays<T> = T extends undefined | null ? Array<any> : 
    T extends Function ? Array<any> :
    T extends object ? Array<T> :
    T extends string ? Array<string> :
    T extends number ? Array<number> :
    T extends boolean ? Array<boolean> :
    T extends bigint ? Array<bigint> :
    T extends Date ? Array<Date> :
    T extends Buffer ? Array<Buffer> :
    T extends any[] ? Array<any> :
    T extends unknown ? Array<any> :
    never;

export const ColumnType = {
    String: String,
    Number: Number,
    Boolean: Boolean,
    BigInt: BigInt,
    Date: Date,
    Array: <type>(types?: type): Arrays<type> => types ? Array(types) as any : Array.prototype as any,
    Object: Object,
    Buffer: Buffer,
    Integer: BigInt,
};