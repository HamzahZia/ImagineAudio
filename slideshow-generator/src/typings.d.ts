/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

export function load(callback: (YT: any) => void): void;