// Copyright 2018 Google Inc.
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec4 u_ambient_light_color;
uniform vec4 u_SceneLight_0_color;
uniform vec4 u_SceneLight_1_color;
uniform float u_Shininess;
uniform float u_RimIntensity;
uniform float u_RimPower;
uniform vec4 u_Color;
uniform float u_Frequency;
uniform float u_Jitter;
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec3 v_local_position;
varying vec3 v_light_dir_0;
varying vec3 v_light_dir_1;
varying vec2 v_texcoord0;
const float PI = 3.141592654;
const float INV_PI = 0.318309886;
const vec3 GAMMA_DIELECTRIC_SPEC = vec3(0.220916301, 0.220916301, 0.220916301);
const float GAMMA_ONE_MINUS_DIELECTRIC = (1.0 - 0.220916301);
float Pow5(float x) {
return x * x * x * x * x;
}
float DisneyDiffuseTerm(float NdotV, float NdotL, float LdotH,
float perceptualRoughness) {
float fd90 = 0.5 + 2.0 * LdotH * LdotH * perceptualRoughness;
float lightScatter = 1.0 + (fd90 - 1.0) * Pow5(1.0 - NdotL);
float viewScatter = 1.0 + (fd90 - 1.0) * Pow5(1.0 - NdotV);
return lightScatter * viewScatter;
}
float SmithJointVisibilityTerm(float NdotL, float NdotV, float roughness) {
float lambdaV = NdotL * mix(NdotV, 1.0, roughness);
float lambdaL = NdotV * mix(NdotL, 1.0, roughness);
return 0.5 / (lambdaV + lambdaL + 1e-5);
}
float GgxDistributionTerm(float NdotH, float roughness) {
float a2 = roughness * roughness;
float d = (NdotH * a2 - NdotH) * NdotH + 1.0;
return INV_PI * a2 / (d * d + 1e-7);
}
vec3 FresnelTerm (vec3 F0, float cosA) {
float t = Pow5(1.0 - cosA);
return F0 + (vec3(1.0) - F0) * t;
}
vec3 SurfaceShaderInternal(
vec3 normal,
vec3 lightDir,
vec3 eyeDir,
vec3 lightColor,
vec3 diffuseColor,
vec3 specularColor,
float perceptualRoughness) {
float NdotL = clamp(dot(normal, lightDir), 0.0, 1.0);
float NdotV = abs(dot(normal, eyeDir));
vec3 halfVector = normalize(lightDir + eyeDir);
float NdotH = clamp(dot(normal, halfVector), 0.0, 1.0);
float LdotH = clamp(dot(lightDir, halfVector), 0.0, 1.0);
float diffuseTerm = NdotL *
DisneyDiffuseTerm(NdotV, NdotL, LdotH, perceptualRoughness);
if (length(specularColor) < 1e-5) {
return diffuseColor * (lightColor * diffuseTerm);
}
float roughness = perceptualRoughness * perceptualRoughness;
float V = GgxDistributionTerm(NdotH, roughness);
float D = SmithJointVisibilityTerm(NdotL, NdotV, roughness);
float specularTerm = V * D * PI;
specularTerm = sqrt(max(1e-4, specularTerm));
specularTerm *= NdotL;
vec3 fresnelColor = FresnelTerm(specularColor, LdotH);
return lightColor *
(diffuseTerm * diffuseColor + specularTerm * fresnelColor);
}
vec3 SurfaceShaderSpecularGloss(
vec3 normal,
vec3 lightDir,
vec3 eyeDir,
vec3 lightColor,
vec3 albedoColor,
vec3 specularColor,
float gloss) {
float oneMinusSpecularIntensity =
1.0 - clamp(max(max(specularColor.r, specularColor.g), specularColor.b), 0., 1.);
vec3 diffuseColor = albedoColor * oneMinusSpecularIntensity;
float perceptualRoughness = 1.0 - gloss;
return SurfaceShaderInternal(
normal, lightDir, eyeDir, lightColor, diffuseColor, specularColor, perceptualRoughness);
}
vec3 SurfaceShaderMetallicRoughness(
vec3 normal,
vec3 lightDir,
vec3 eyeDir,
vec3 lightColor,
vec3 albedoColor,
float metallic,
float perceptualRoughness) {
vec3 specularColor = mix(GAMMA_DIELECTRIC_SPEC, albedoColor, metallic);
float oneMinusReflectivity = GAMMA_ONE_MINUS_DIELECTRIC - metallic * GAMMA_ONE_MINUS_DIELECTRIC;
vec3 diffuseColor = albedoColor * oneMinusReflectivity;
return SurfaceShaderInternal(
normal, lightDir, eyeDir, lightColor, diffuseColor, specularColor, perceptualRoughness);
}
vec3 ShShaderWithSpec(
vec3 normal,
vec3 lightDir,
vec3 lightColor,
vec3 diffuseColor,
vec3 specularColor) {
float specularGrayscale = dot(specularColor, vec3(0.3, 0.59, 0.11));
float NdotL = clamp(dot(normal, lightDir), 0.0, 1.0);
float shIntensityMultiplier = 1. - specularGrayscale;
shIntensityMultiplier *= shIntensityMultiplier;
return diffuseColor * lightColor * NdotL * shIntensityMultiplier;
}
vec3 ShShader(
vec3 normal,
vec3 lightDir,
vec3 lightColor,
vec3 diffuseColor) {
return ShShaderWithSpec(normal, lightDir, lightColor, diffuseColor, vec3(0.,0.,0.));
}
vec3 LambertShader(
vec3 normal,
vec3 lightDir,
vec3 lightColor,
vec3 diffuseColor) {
float NdotL = clamp(dot(normal, lightDir), 0.0, 1.0);
return diffuseColor * lightColor * NdotL;
}
#define K 0.142857142857
#define Ko 0.428571428571
#define OCTAVES 1
vec3 fmod(vec3 x, float y) { return x - y * floor(x/y); }
vec2 fmod(vec2 x, float y) { return x - y * floor(x/y); }
vec3 Permutation(vec3 x)
{
return mod((34.0 * x + 1.0) * x, 289.0);
}
vec2 inoise(vec3 P, float jitter)
{
vec3 Pi = mod(floor(P), 289.0);
vec3 Pf = fract(P);
vec3 oi = vec3(-1.0, 0.0, 1.0);
vec3 of = vec3(-0.5, 0.5, 1.5);
vec3 px = Permutation(Pi.x + oi);
vec3 py = Permutation(Pi.y + oi);
vec3 p, ox, oy, oz, dx, dy, dz;
vec2 F = vec2(1e6,1e6);
for(int i = 0; i < 3; i++) {
for(int j = 0; j < 3; j++) {
p = Permutation(px[i] + py[j] + Pi.z + oi);
ox = fract(p*K) - Ko;
oy = mod(floor(p*K),7.0)*K - Ko;
p = Permutation(p);
oz = fract(p*K) - Ko;
dx = Pf.x - of[i] + jitter*ox;
dy = Pf.y - of[j] + jitter*oy;
dz = Pf.z - of + jitter*oz;
vec3 d = dx * dx + dy * dy + dz * dz;
for(int n = 0; n < 3; n++) {
if(d[n] < F[0]) {
F[1] = F[0];
F[0] = d[n];
} else if(d[n] < F[1]) {
F[1] = d[n];
}
}
}
}
return F;
}
vec2 fBm_F0(vec3 p, int octaves)
{
float freq = u_Frequency * 4.;
float amp = 0.5;
vec2 F = inoise(p * freq, u_Jitter) * amp;
return F;
}
vec3 computeGemReflection() {
vec3 normal = normalize(v_normal);
vec2 F = fBm_F0(v_local_position, OCTAVES);
float gem = (F.y - F.x);
float perturbIntensity = 50.;
normal.y += dFdy(gem) * perturbIntensity;
normal.x += dFdx(gem) * perturbIntensity;
normal = normalize(normal);
vec3 lightDir0 = normalize(v_light_dir_0);
vec3 lightDir1 = normalize(v_light_dir_1);
vec3 eyeDir = -normalize(v_position);
vec3 diffuseColor = vec3(0.,0.,0.);
vec3 refl = eyeDir - 2. * dot(eyeDir, normal) * normal + gem;
vec3 colorRamp = vec3(1.,.3,0)*sin(refl.x * 30.) + vec3(0.,1.,.5)*cos(refl.y * 37.77) + vec3(0.,0.,1.)*sin(refl.z*43.33);
vec3 specularColor = u_Color.rgb + colorRamp * .5;
float smoothness = u_Shininess;
vec3 lightOut0 = SurfaceShaderSpecularGloss(normal, lightDir0, eyeDir, u_SceneLight_0_color.rgb,
diffuseColor, specularColor, smoothness);
float viewAngle = clamp(dot(eyeDir, normal),0.,1.);
float rim = pow(1. - viewAngle, u_RimPower);
vec3 rimColor = vec3(rim,rim,rim) * u_RimIntensity;
return (lightOut0 + rimColor);
}
void main() {
gl_FragColor.rgb = computeGemReflection();
gl_FragColor.a = 1.0;
}
