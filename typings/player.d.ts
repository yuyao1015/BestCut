type Id = { id: string; url?: string };
type Canvas = { canvas: HTMLCanvasElement; url?: string };
export type MP4PlayerOption = XOR<Id, Canvas> & { paused?: boolean };
