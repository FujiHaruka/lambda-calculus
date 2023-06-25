export type TokenizerContextInit = {
  code: string;
  position: number;
};

export class TokenizerContext {
  public readonly code: string;
  public readonly _position: number;

  constructor({ code, position }: TokenizerContextInit) {
    this.code = code;
    this._position = position;
  }

  get position(): number {
    return this._position;
  }
}
