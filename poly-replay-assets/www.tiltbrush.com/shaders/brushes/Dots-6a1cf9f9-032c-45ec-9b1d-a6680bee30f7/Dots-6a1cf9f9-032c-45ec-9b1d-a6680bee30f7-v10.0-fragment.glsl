// Copyright 2018 Google Inc.
precision mediump float;
varying vec4 v_color;
varying vec2 v_texcoord0;
uniform sampler2D u_MainTex;
uniform vec4 u_TintColor;
uniform float u_EmissionGain;
uniform float u_BaseGain;
void main() {
vec4 tex = texture2D(u_MainTex, v_texcoord0);
vec4 c = v_color * u_TintColor * u_BaseGain * tex;
c.rgb += c.rgb * c.a * u_EmissionGain;
gl_FragColor.rgb = c.rgb;
gl_FragColor.a = 1.0;
}
