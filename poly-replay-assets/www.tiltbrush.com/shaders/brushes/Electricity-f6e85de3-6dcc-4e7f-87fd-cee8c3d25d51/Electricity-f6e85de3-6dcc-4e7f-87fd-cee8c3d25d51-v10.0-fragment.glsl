// Copyright 2018 Google Inc.
precision mediump float;
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
vec4 color = bloomColor(v_color, u_EmissionGain);
float procedural = ( abs(v_texcoord0.y - 0.5) < .2 ) ? 2. : 0.;
vec4 c = color + color * procedural;
gl_FragColor = c * c.a;
}
