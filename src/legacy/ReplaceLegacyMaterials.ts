// Copyright 2021-2022 Icosa Gallery
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

import { 
    Object3D,
    Mesh,
    RawShaderMaterial,
    Vector4,
    Clock,
    DefaultLoadingManager
} from "three";

import { TiltShaderLoader } from "three-icosa";

export async function replaceBrushMaterials(brushPath: string, model: Object3D): Promise<void> {
    const tiltShaderLoader = new TiltShaderLoader(DefaultLoadingManager);
    tiltShaderLoader.setPath(brushPath);

    const clock = new Clock();
    model.traverse(async (object) => {
        if(object.type === "Mesh") {
            const mesh = <Mesh> object;
            var shader : RawShaderMaterial;
            const targetFilter = "brush_" + mesh.name.split('_')[1];

            switch(targetFilter) {
                case "brush_BlocksBasic":
                    mesh.geometry.name = "geometry_BlocksBasic";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                    shader = await tiltShaderLoader.loadAsync("BlocksBasic");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_BlocksBasic";
                    break;
                case "brush_BlocksGem":
                    mesh.geometry.name = "geometry_BlocksGem";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                    shader = await tiltShaderLoader.loadAsync("BlocksGem");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_BlocksGem";
                    break;
                case "brush_BlocksGlass":
                    mesh.geometry.name = "geometry_BlocksGlass";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                    shader = await tiltShaderLoader.loadAsync("BlocksGlass");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_BlocksGlass";
                    break;

                case "brush_Bubbles":
                    mesh.geometry.name = "geometry_Bubbles";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("Bubbles");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Bubbles";
                    break;

                case "brush_CelVinyl":
                    mesh.geometry.name = "geometry_CelVinyl";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("CelVinyl");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_CelVinyl";
                    break;

                case "brush_ChromaticWave":
                    mesh.geometry.name = "geometry_ChromaticWave";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("ChromaticWave");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_ChromaticWave";
                    break;

                case "brush_CoarseBristles":
                    mesh.geometry.name = "geometry_CoarseBristles";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("CoarseBristles");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_CoarseBristles";
                    break;

                case "brush_Comet":
                    mesh.geometry.name = "geometry_Comet";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Comet");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Comet";
                    break;

                case "brush_DiamondHull":
                    mesh.geometry.name = "geometry_DiamondHull";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("DiamondHull");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_DiamondHull";
                    break;

                case "brush_Disco":
                    mesh.geometry.name = "geometry_Disco";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Disco");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Disco";
                    break;

                case "brush_DotMarker":
                    mesh.geometry.name = "geometry_DotMarker";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("DotMarker");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_DotMarker";
                    break;

                case "brush_Dots":
                    mesh.geometry.name = "geometry_Dots";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("Dots");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Dots";
                    break;

                case "brush_DoubleTaperedFlat":
                    mesh.geometry.name = "geometry_DoubleTaperedFlat";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("DoubleTaperedFlat");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_DoubleTaperedFlat";
                    break;

                case "brush_DoubleTaperedMarker":
                    mesh.geometry.name = "geometry_DoubleTaperedMarker";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("DoubleTaperedMarker");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_DoubleTaperedMarker";
                    break;

                case "brush_DuctTape":
                    mesh.geometry.name = "geometry_DuctTape";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("DuctTape");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_DuctTape";
                    break;

                case "brush_Electricity":
                    mesh.geometry.name = "geometry_Electricity";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("Electricity");
                    mesh.material = shader;
                    mesh.material.name = "material_Electricity";
                    break;

                case "brush_Embers":
                    mesh.geometry.name = "geometry_Embers";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("Embers");
                    mesh.material = shader;
                    mesh.material.name = "material_Embers";
                    break;

                case "brush_EnvironmentDiffuse":
                    mesh.geometry.name = "geometry_EnvironmentDiffuse";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("EnvironmentDiffuse");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_EnvironmentDiffuse";
                    break;

                case "brush_EnvironmentDiffuseLightMap":
                    mesh.geometry.name = "geometry_EnvironmentDiffuseLightMap";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("EnvironmentDiffuseLightMap");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_EnvironmentDiffuseLightMap";
                    break;

                case "brush_Fire":
                    mesh.geometry.name = "geometry_Fire";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Fire");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Fire";
                    break;

                case "brush_Flat":
                    mesh.geometry.name = "geometry_Flat";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Flat");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Flat";
                    break;

                case "brush_FlatDeprecated":
                    mesh.geometry.name = "geometry_FlatDeprecated";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("FlatDeprecated");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_FlatDeprecated";
                    break;

                case "brush_Highlighter":
                    mesh.geometry.name = "geometry_Highlighter";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Highlighter");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Highlighter";
                    break;

                case "brush_Hypercolor":
                    mesh.geometry.name = "geometry_Hypercolor";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Hypercolor");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Hypercolor";
                    break;

                case "brush_HyperGrid":
                    mesh.geometry.name = "geometry_HyperGrid";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("HyperGrid");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_HyperGrid";
                    break;

                case "brush_Icing":
                    mesh.geometry.name = "geometry_Icing";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));

                    shader = await tiltShaderLoader.loadAsync("Icing");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Icing";
                    break;

                case "brush_Ink":
                    mesh.geometry.name = "geometry_Ink";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Ink");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Ink";
                    break;

                case "brush_Leaves":
                    mesh.geometry.name = "geometry_Leaves";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Leaves");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Leaves";
                    break;

                case "brush_Light":
                    mesh.geometry.name = "geometry_Light";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Light");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Light";
                    break;

                case "brush_LightWire":
                    mesh.geometry.name = "geometry_LightWire";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("LightWire");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_LightWire";
                    break;

                case "brush_Lofted":
                    mesh.geometry.name = "geometry_Lofted";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Lofted");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Lofted";
                    break;

                case "brush_Marker":
                    mesh.geometry.name = "geometry_Marker";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Marker");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Marker";
                    break;

                case "brush_MatteHull":
                    mesh.geometry.name = "geometry_MatteHull";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    shader = await tiltShaderLoader.loadAsync("MatteHull");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_MatteHull";
                    break;

                case "brush_NeonPulse":
                    mesh.geometry.name = "geometry_NeonPulse";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("NeonPulse");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_NeonPulse";
                    break;

                case "brush_OilPaint":
                    mesh.geometry.name = "geometry_OilPaint";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("OilPaint");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_OilPaint";
                    break;

                case "brush_Paper":
                    mesh.geometry.name = "geometry_Paper";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Paper");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Paper";
                    break;

                case "brush_PbrTemplate":
                    mesh.geometry.name = "geometry_PbrTemplate";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("PbrTemplate");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_PbrTemplate";
                    break;

                case "brush_PbrTransparentTemplate":
                    mesh.geometry.name = "geometry_PbrTransparentTemplate";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("PbrTransparentTemplate");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_PbrTransparentTemplate";
                    break;

                case "brush_Petal":
                    mesh.geometry.name = "geometry_Petal";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Petal");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Petal";
                    break;

                case "brush_Plasma":
                    mesh.geometry.name = "geometry_Plasma";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Plasma");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Plasma";
                    break;

                case "brush_Rainbow":
                    mesh.geometry.name = "geometry_Rainbow";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Rainbow");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Rainbow";
                    break;

                case "brush_ShinyHull":
                    mesh.geometry.name = "geometry_ShinyHull";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("ShinyHull");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_ShinyHull";
                    break;

                case "brush_Smoke":
                    mesh.geometry.name = "geometry_Smoke";
                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("Smoke");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Smoke";
                    break;

                case "brush_Snow":
                    mesh.geometry.name = "geometry_Snow";
                    
                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("Snow");
                    mesh.material = shader;
                    mesh.material.name = "material_Snow";
                    break;

                case "brush_SoftHighlighter":
                    mesh.geometry.name = "geometry_SoftHighlighter";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("SoftHighlighter");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_SoftHighlighter";
                    break;

                case "brush_Spikes":
                    mesh.geometry.name = "geometry_Spikes";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Spikes");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Spikes";
                    break;

                case "brush_Splatter":
                    mesh.geometry.name = "geometry_Splatter";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Splatter");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Splatter";
                    break;

                case "brush_Stars":
                    mesh.geometry.name = "geometry_Stars";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("uv2"));
                    shader = await tiltShaderLoader.loadAsync("Stars");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Stars";
                    break;

                case "brush_Streamers":
                    mesh.geometry.name = "geometry_Streamers";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Streamers");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Streamers";
                    break;

                case "brush_Taffy":
                    mesh.geometry.name = "geometry_Taffy";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("DiamondHull");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_DiamondHull";
                    break;

                case "brush_TaperedFlat":
                    mesh.geometry.name = "geometry_TaperedFlat";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("TaperedFlat");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_TaperedFlat";
                    break;

                case "brush_TaperedMarker":
                    mesh.geometry.name = "geometry_TaperedMarker";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("TaperedMarker");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_TaperedMarker";
                    break;

                case "brush_TaperedMarker_Flat":
                    mesh.geometry.name = "geometry_Flat";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Flat");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Flat";
                    break;

                case "brush_ThickPaint":
                    mesh.geometry.name = "geometry_ThickPaint";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("ThickPaint");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_ThickPaint";
                    break;

                case "brush_Toon":
                    mesh.geometry.name = "geometry_Toon";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    shader = await tiltShaderLoader.loadAsync("Toon");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Toon";
                    break;

                case "brush_UnlitHull":
                    mesh.geometry.name = "geometry_UnlitHull";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    shader = await tiltShaderLoader.loadAsync("UnlitHull");
                    mesh.material = shader;
                    mesh.material.name = "material_UnlitHull";
                    break;

                case "brush_VelvetInk":
                    mesh.geometry.name = "geometry_VelvetInk";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("VelvetInk");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_VelvetInk";
                    break;

                case "brush_Waveform":
                    mesh.geometry.name = "geometry_Waveform";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("Waveform");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_Waveform";
                    break;

                case "brush_WetPaint":
                    mesh.geometry.name = "geometry_WetPaint";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("WetPaint");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_WetPaint";
                    break;

                case "brush_WigglyGraphite":
                    mesh.geometry.name = "geometry_WigglyGraphite";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                    shader = await tiltShaderLoader.loadAsync("WigglyGraphite");
                    shader.uniformsNeedUpdate = true;
                    mesh.material = shader;
                    mesh.material.name = "material_WigglyGraphite";
                    break;

                case "brush_Wire":
                    mesh.geometry.name = "geometry_Wire";

                    mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                    mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                    mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                    shader = await tiltShaderLoader.loadAsync("Wire");
                    mesh.material = shader;
                    mesh.material.name = "material_Wire";
                    break;
            }

            mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
                if ((<RawShaderMaterial>material).uniforms["u_time"]) {
                    const elapsedTime = clock.getElapsedTime();
                    // _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
                    const time = new Vector4(elapsedTime/20, elapsedTime, elapsedTime*2, elapsedTime*3);
    
                    (<RawShaderMaterial>material).uniforms["u_time"].value = time;
                }
    
                if ((<RawShaderMaterial>material).uniforms["cameraPosition"]) {
                    (<RawShaderMaterial>material).uniforms["cameraPosition"].value = camera.position;
                }
            }
        }
    });
}