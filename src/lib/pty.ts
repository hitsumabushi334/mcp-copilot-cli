export type PtyLike = {
  write: (s: string) => void;
  onData: (cb: (s: string) => void) => void;
  onExit: (cb: (e: { exitCode?: number }) => void) => void;
  kill: () => void;
};

export function ptySpawn(command: string, args: string[], options: any): PtyLike {
  // Lazy require to keep optional dependency behavior
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ptyMod = require('node-pty');
  const spawnImpl = ptyMod.spawn || ptyMod.default?.spawn || ptyMod;
  return spawnImpl(command, args, options);
}

