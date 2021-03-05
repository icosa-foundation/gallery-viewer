export declare class Convert {
    static toPoly(json: string): JSONPoly;
    static polyToJson(value: JSONPoly): string;
}
export interface JSONPoly {
    name: string;
    displayName: string;
    authorName: string;
    createTime: Date;
    updateTime: Date;
    formats: JSONPolyFormat[];
    thumbnail: JSONPolyResource;
    license: string;
    visibility: string;
    presentationParams: JSONPolyPresentationParams;
    remixInfo: JSONPolyRemixInfo;
}
export interface JSONPolyFormat {
    root: JSONPolyResource;
    formatComplexity: JSONPolyFormatComplexity;
    formatType: string;
    resources?: JSONPolyResource[];
}
export interface JSONPolyFormatComplexity {
    triangleCount?: string;
}
export interface JSONPolyResource {
    relativePath: string;
    url: string;
    contentType: string;
}
export interface JSONPolyPresentationParams {
    orientingRotation: JSONPolyOrientingRotation;
    colorSpace: string;
    backgroundColor: string;
}
export interface JSONPolyOrientingRotation {
    w: number;
}
export interface JSONPolyRemixInfo {
    sourceAsset: string[];
}
