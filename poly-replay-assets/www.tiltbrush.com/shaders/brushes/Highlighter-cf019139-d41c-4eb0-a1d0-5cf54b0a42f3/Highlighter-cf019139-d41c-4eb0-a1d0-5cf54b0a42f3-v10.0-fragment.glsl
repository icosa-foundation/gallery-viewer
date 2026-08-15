// Copyright 2018 Google Inc.
precision mediump float;
varying vec4 v_color;
varying vec3 v_position;
varying vec2 v_texcoord0;
uniform sampler2D u_MainTex;
uniform float u_Cutoff;
void main() {
float brush_mask = texture2D(u_MainTex, v_texcoord0).w;
brush_mask *= v_color.a;
if (brush_mask > u_Cutoff) {
gl_FragColor.rgb = v_color.rgb;
gl_FragColor.a = 1.0;
} else {
discard;
}
}
