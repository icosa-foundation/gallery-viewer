// Copyright 2018 Google Inc.
precision mediump float;
uniform sampler2D u_MainTex;
uniform vec4 u_time;
uniform float u_EmissionGain;
varying vec4 v_color;
varying vec2 v_texcoord0;
vec4 bloomColor(vec4 color, float gain) {
float cmin = length(color.rgb) * .05;
color.rgb = max(color.rgb, vec3(cmin, cmin, cmin));
color.r = pow(color.r, 2.2);
color.g = pow(color.g, 2.2);
color.b = pow(color.b, 2.2);
color.a = pow(color.a, 2.2);
color.rgb *= 2.0 * exp(gain * 10.0);
return color;
}
void main() {
float _Scroll1 = 20.0;
float _Scroll2 = 0.0;
vec4 _Time = u_time;
float _DisplacementIntensity = 0.1;
vec4 bloomed_v_color = bloomColor(v_color, u_EmissionGain);
float displacement = texture2D(u_MainTex, v_texcoord0.xy + vec2(-_Time.x * _Scroll1, 0.0) ).a;
vec4 tex = texture2D(u_MainTex, v_texcoord0.xy + vec2(-_Time.x * _Scroll2, 0) - displacement * _DisplacementIntensity);
gl_FragColor = bloomed_v_color * tex;
}
