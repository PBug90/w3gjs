const readZeroTermString = (
  input: Buffer,
  startAt = 0,
  encoding: BufferEncoding
): { value: string; posDifference: number } => {
  let pos = startAt;
  while (input.readInt8(pos) !== 0) {
    pos++;
  }
  return {
    value: input.slice(startAt, pos).toString(encoding),
    posDifference: pos - startAt + 1,
  };
};

const readStringOfLength = (
  input: Buffer,
  length: number,
  startAt = 0,
  encoding: BufferEncoding = "utf-8"
): string => {
  return input.slice(startAt, startAt + length).toString(encoding);
};
export default class StatefulBufferParser {
  buffer: Buffer;
  offset = 0;

  public initialize(buffer: Buffer): void {
    this.buffer = buffer;
    this.offset = 0;
  }

  public readStringOfLength(length: number, encoding: BufferEncoding): string {
    const result = readStringOfLength(
      this.buffer,
      length,
      this.offset,
      encoding
    );
    this.offset += length;
    return result;
  }

  public setOffset(offset: number): void {
    this.offset = offset;
  }

  public getOffset(): number {
    return this.offset;
  }

  public skip(byteCount: number): void {
    this.offset += byteCount;
  }

  public readZeroTermString(encoding: BufferEncoding): string {
    const result = readZeroTermString(this.buffer, this.offset, encoding);
    this.offset += result.posDifference;
    return result.value;
  }

  public readUInt32LE(): number {
    const val = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return val;
  }

  public readUInt16LE(): number {
    const val = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return val;
  }

  public readUInt8(): number {
    const val = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return val;
  }

  public readFloatLE(): number {
    const val = this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return val;
  }
}
