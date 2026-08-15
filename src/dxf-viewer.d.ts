declare module "dxf-viewer" {
  export class DxfViewer {
    constructor(container: HTMLElement, options?: Record<string, unknown>);
    Load(options: { url: string }): Promise<void>;
    Clear(): void;
  }
}
