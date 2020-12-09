// Copyright 2018 Google Inc.
precision mediump float;
varying vec4 v_color;
varying vec3 v_position;
varying vec2 v_texcoord0;
uniform sampler2D u_MainTex;
uniform float u_Cutoff;
uniform vec3 u_fogColor;
uniform float u_fogDensity;
varying float f_fog_coord;
vec3 ApplyFog(vec3 color) {
float density = (u_fogDensity / .693147) * 10.;
float fogFactor = f_fog_coord * density;
fogFactor = exp2(-fogFactor);
fogFactor = clamp( fogFactor, 0.0, 1.0 );
return mix(u_fogColor, color.xyz, fogFactor);
}
void main() {
gl_FragColor.rgb = ApplyFog(v_color.rgb);
gl_FragColor.a = 1.0;
}
