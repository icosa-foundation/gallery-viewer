// Copyright 2018 Google Inc.
precision mediump float;
uniform float u_Speed;
uniform float u_EmissionGain;
uniform sampler2D u_MainTex;
uniform sampler2D u_AlphaMask;
uniform vec4 u_AlphaMask_TexelSize;
uniform vec4 u_time;
varying vec4 v_color;
varying vec2 v_texcoord0;
void main() {
float time = u_time.y * -u_Speed;
vec2 scrollUV = v_texcoord0;
vec2 scrollUV2 = v_texcoord0;
vec2 scrollUV3 = v_texcoord0;
scrollUV.y += time;
scrollUV.x += time;
scrollUV2.x += time * 1.5;
scrollUV3.x += time * 0.5;
float r = texture2D(u_MainTex, scrollUV).r;
float g = texture2D(u_MainTex, scrollUV2).g;
float b = texture2D(u_MainTex, scrollUV3).b;
float gradient_lookup_value = (r + g + b) / 3.0;
gradient_lookup_value *= (1.0 - v_texcoord0.x);
gradient_lookup_value = (pow(gradient_lookup_value, 2.0) + 0.125) * 3.0;
float falloff = max((0.2 - v_texcoord0.x) * 5.0, 0.0);
float gutter = u_AlphaMask_TexelSize.x * .5;
float u = clamp(gradient_lookup_value + falloff, 0.0 + gutter, 1.0 - gutter);
vec4 tex = texture2D(u_AlphaMask, vec2(u, 0.0));
gl_FragColor.rgb = (tex * v_color).rgb;
gl_FragColor.a = 1.0;
}
