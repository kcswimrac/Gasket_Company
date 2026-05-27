declare module "occt-import-js" {
  interface OcctMesh {
    index?: { array: number[] };
    attributes?: {
      position?: { array: number[] };
      normal?: { array: number[] };
    };
  }

  interface OcctResult {
    meshes: OcctMesh[];
  }

  interface OcctInstance {
    ReadStepFile(data: Uint8Array, params: null): OcctResult;
  }

  export default function (): Promise<OcctInstance>;
}
