export interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

export function createLogger(verbose: boolean): Logger {
  return {
    info(msg: string): void {
      if (verbose) {
        console.log(msg);
      }
    },
    warn(msg: string): void {
      console.warn(msg);
    },
    error(msg: string): void {
      console.error(msg);
    }
  };
}
