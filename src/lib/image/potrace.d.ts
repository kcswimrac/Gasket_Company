declare module "potrace" {
  interface PotraceOptions {
    turnPolicy?: string;
    turdSize?: number;
    alphaMax?: number;
    optCurve?: boolean;
    optTolerance?: number;
    threshold?: number;
    blackOnWhite?: boolean;
    color?: string;
    background?: string;
  }

  class Potrace {
    constructor(options?: PotraceOptions);
    loadImage(
      source: string | Buffer,
      callback: (err: Error | null) => void
    ): void;
    getPathTag(): string;
    getSVG(): string;
    getSymbol(id: string): string;
    setParameters(params: PotraceOptions): void;
  }

  function trace(
    source: string | Buffer,
    options: PotraceOptions,
    callback: (err: Error | null, svg: string) => void
  ): void;

  function trace(
    source: string | Buffer,
    callback: (err: Error | null, svg: string) => void
  ): void;

  function posterize(
    source: string | Buffer,
    options: Record<string, unknown>,
    callback: (err: Error | null, svg: string) => void
  ): void;

  class Posterizer {
    constructor(options?: Record<string, unknown>);
    loadImage(
      source: string | Buffer,
      callback: (err: Error | null) => void
    ): void;
    getSVG(): string;
  }
}
