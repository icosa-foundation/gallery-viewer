// Copyright 2018 Google Inc.
#define TB_ALPHA_CUTOFF 0.067
#define TB_HAS_ALPHA_CUTOFF 1
precision mediump float;
varying vec4 v_color;
varying vec2 v_texcoord0;
varying vec3 v_position;
#if TB_HAS_ALPHA_CUTOFF
uniform sampler2D u_MainTex;
#endif
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
vec3 computeLighting() {
return v_color.rgb;
}
void main() {
#if TB_HAS_ALPHA_CUTOFF
const float alpha_threshold = TB_ALPHA_CUTOFF;
float brush_mask = texture2D(u_MainTex, v_texcoord0).w;
if (brush_mask > alpha_threshold) {
gl_FragColor.rgb = ApplyFog(computeLighting());
gl_FragColor.a = 1.0;
} else {
discard;
}
#else
gl_FragColor.rgb = ApplyFog(computeLighting());
gl_FragColor.a = 1.0;
#endif
}
