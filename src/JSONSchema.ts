// Copyright 2021 Icosa Gallery
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export class Convert {
    public static toPoly(json: string): JSONPoly {
        return JSON.parse(json);
    }

    public static polyToJson(value: JSONPoly): string {
        return JSON.stringify(value);
    }
}

export interface JSONPoly {
    name:               string;
    displayName:        string;
    authorName:         string;
    createTime:         Date;
    updateTime:         Date;
    formats:            JSONPolyFormat[];
    thumbnail:          JSONPolyResource;
    license:            string;
    visibility:         string;
    presentationParams: JSONPolyPresentationParams;
    remixInfo:          JSONPolyRemixInfo;
}

export interface JSONPolyFormat {
    root:             JSONPolyResource;
    formatComplexity: JSONPolyFormatComplexity;
    formatType:       string;
    resources?:       JSONPolyResource[];
}

export interface JSONPolyFormatComplexity {
    triangleCount?: string;
}

export interface JSONPolyResource {
    relativePath: string;
    url:          string;
    contentType:  string;
}

export interface JSONPolyPresentationParams {
    orientingRotation: JSONPolyOrientingRotation;
    colorSpace:        string;
    backgroundColor:   string;
}

export interface JSONPolyOrientingRotation {
    w: number;
}

export interface JSONPolyRemixInfo {
    sourceAsset: string[];
}