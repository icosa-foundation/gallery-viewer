import { RepeatWrapping, TextureLoader, Vector3, Vector4 } from 'three';

import blocksBasicVert from './brushes/BlocksBasic-0e87b49c-6546-3a34-3a44-8a556d7d6c3e/BlocksBasic-0e87b49c-6546-3a34-3a44-8a556d7d6c3e-v10.0-vertex.glsl';
import blocksBasicFrag from './brushes/BlocksBasic-0e87b49c-6546-3a34-3a44-8a556d7d6c3e/BlocksBasic-0e87b49c-6546-3a34-3a44-8a556d7d6c3e-v10.0-fragment.glsl';

import blocksGemVert from './brushes/BlocksGem-232998f8-d357-47a2-993a-53415df9be10/BlocksGem-232998f8-d357-47a2-993a-53415df9be10-v10.0-vertex.glsl';
import blocksGemFrag from './brushes/BlocksGem-232998f8-d357-47a2-993a-53415df9be10/BlocksGem-232998f8-d357-47a2-993a-53415df9be10-v10.0-fragment.glsl';

import blocksGlassVert from './brushes/BlocksGlass-3d813d82-5839-4450-8ddc-8e889ecd96c7/BlocksGlass-3d813d82-5839-4450-8ddc-8e889ecd96c7-v10.0-vertex.glsl';
import blocksGlassFrag from './brushes/BlocksGlass-3d813d82-5839-4450-8ddc-8e889ecd96c7/BlocksGlass-3d813d82-5839-4450-8ddc-8e889ecd96c7-v10.0-fragment.glsl';

import bubblesVert from './brushes/Bubbles-89d104cd-d012-426b-b5b3-bbaee63ac43c/Bubbles-89d104cd-d012-426b-b5b3-bbaee63ac43c-v10.0-vertex.glsl';
import bubblesFrag from './brushes/Bubbles-89d104cd-d012-426b-b5b3-bbaee63ac43c/Bubbles-89d104cd-d012-426b-b5b3-bbaee63ac43c-v10.0-fragment.glsl';

import celVinylVert from './brushes/CelVinyl-700f3aa8-9a7c-2384-8b8a-ea028905dd8c/CelVinyl-700f3aa8-9a7c-2384-8b8a-ea028905dd8c-v10.0-vertex.glsl';
import celVinylFrag from './brushes/CelVinyl-700f3aa8-9a7c-2384-8b8a-ea028905dd8c/CelVinyl-700f3aa8-9a7c-2384-8b8a-ea028905dd8c-v10.0-fragment.glsl';

import chromaticWaveVert from './brushes/ChromaticWave-0f0ff7b2-a677-45eb-a7d6-0cd7206f4816/ChromaticWave-0f0ff7b2-a677-45eb-a7d6-0cd7206f4816-v10.0-vertex.glsl';
import chromaticWaveFrag from './brushes/ChromaticWave-0f0ff7b2-a677-45eb-a7d6-0cd7206f4816/ChromaticWave-0f0ff7b2-a677-45eb-a7d6-0cd7206f4816-v10.0-fragment.glsl';

import coarseBristlesVert from './brushes/CoarseBristles-1161af82-50cf-47db-9706-0c3576d43c43/CoarseBristles-1161af82-50cf-47db-9706-0c3576d43c43-v10.0-vertex.glsl';
import coarseBristlesFrag from './brushes/CoarseBristles-1161af82-50cf-47db-9706-0c3576d43c43/CoarseBristles-1161af82-50cf-47db-9706-0c3576d43c43-v10.0-fragment.glsl';

import cometVert from './brushes/Comet-1caa6d7d-f015-3f54-3a4b-8b5354d39f81/Comet-1caa6d7d-f015-3f54-3a4b-8b5354d39f81-v10.0-vertex.glsl';
import cometFrag from './brushes/Comet-1caa6d7d-f015-3f54-3a4b-8b5354d39f81/Comet-1caa6d7d-f015-3f54-3a4b-8b5354d39f81-v10.0-fragment.glsl';

import diamondHullVert from './brushes/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901-v10.0-vertex.glsl';
import diamondHullFrag from './brushes/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901-v10.0-fragment.glsl';

import discoVert from './brushes/Disco-4391aaaa-df73-4396-9e33-31e4e4930b27/Disco-4391aaaa-df73-4396-9e33-31e4e4930b27-v10.0-vertex.glsl';
import discoFrag from './brushes/Disco-4391aaaa-df73-4396-9e33-31e4e4930b27/Disco-4391aaaa-df73-4396-9e33-31e4e4930b27-v10.0-fragment.glsl';

import dotMarkerVert from './brushes/DotMarker-d1d991f2-e7a0-4cf1-b328-f57e915e6260/DotMarker-d1d991f2-e7a0-4cf1-b328-f57e915e6260-v10.0-vertex.glsl';
import dotMarkerFrag from './brushes/DotMarker-d1d991f2-e7a0-4cf1-b328-f57e915e6260/DotMarker-d1d991f2-e7a0-4cf1-b328-f57e915e6260-v10.0-fragment.glsl';

import dotsVert from './brushes/Dots-6a1cf9f9-032c-45ec-9b1d-a6680bee30f7/Dots-6a1cf9f9-032c-45ec-9b1d-a6680bee30f7-v10.0-vertex.glsl';
import dotsFrag from './brushes/Dots-6a1cf9f9-032c-45ec-9b1d-a6680bee30f7/Dots-6a1cf9f9-032c-45ec-9b1d-a6680bee30f7-v10.0-fragment.glsl';

import doubleTaperedFlatVert from './brushes/DoubleTaperedFlat-0d3889f3-3ede-470c-8af4-f44813306126/DoubleTaperedFlat-0d3889f3-3ede-470c-8af4-f44813306126-v10.0-vertex.glsl';
import doubleTaperedFlatFrag from './brushes/DoubleTaperedFlat-0d3889f3-3ede-470c-8af4-f44813306126/DoubleTaperedFlat-0d3889f3-3ede-470c-8af4-f44813306126-v10.0-fragment.glsl';

import doubleTaperedMarkerVert from './brushes/DoubleTaperedMarker-0d3889f3-3ede-470c-8af4-de4813306126/DoubleTaperedMarker-0d3889f3-3ede-470c-8af4-de4813306126-v10.0-vertex.glsl';
import doubleTaperedMarkerFrag from './brushes/DoubleTaperedMarker-0d3889f3-3ede-470c-8af4-de4813306126/DoubleTaperedMarker-0d3889f3-3ede-470c-8af4-de4813306126-v10.0-fragment.glsl';

import ductTapeVert from './brushes/DuctTape-d0262945-853c-4481-9cbd-88586bed93cb/DuctTape-d0262945-853c-4481-9cbd-88586bed93cb-v10.0-vertex.glsl';
import ductTapeFrag from './brushes/DuctTape-d0262945-853c-4481-9cbd-88586bed93cb/DuctTape-d0262945-853c-4481-9cbd-88586bed93cb-v10.0-fragment.glsl';

import electricityVert from './brushes/Electricity-f6e85de3-6dcc-4e7f-87fd-cee8c3d25d51/Electricity-f6e85de3-6dcc-4e7f-87fd-cee8c3d25d51-v10.0-vertex.glsl';
import electricityFrag from './brushes/Electricity-f6e85de3-6dcc-4e7f-87fd-cee8c3d25d51/Electricity-f6e85de3-6dcc-4e7f-87fd-cee8c3d25d51-v10.0-fragment.glsl';

import embersVert from './brushes/Embers-02ffb866-7fb2-4d15-b761-1012cefb1360/Embers-02ffb866-7fb2-4d15-b761-1012cefb1360-v10.0-vertex.glsl';
import embersFrag from './brushes/Embers-02ffb866-7fb2-4d15-b761-1012cefb1360/Embers-02ffb866-7fb2-4d15-b761-1012cefb1360-v10.0-fragment.glsl';

import environmentDiffuseVert from './brushes/EnvironmentDiffuse-0ad58bbd-42bc-484e-ad9a-b61036ff4ce7/EnvironmentDiffuse-0ad58bbd-42bc-484e-ad9a-b61036ff4ce7-v1.0-vertex.glsl';
import environmentDiffuseFrag from './brushes/EnvironmentDiffuse-0ad58bbd-42bc-484e-ad9a-b61036ff4ce7/EnvironmentDiffuse-0ad58bbd-42bc-484e-ad9a-b61036ff4ce7-v1.0-fragment.glsl';

import environmentDiffuseLightMapVert from './brushes/EnvironmentDiffuseLightMap-d01d9d6c-9a61-4aba-8146-5891fafb013b/EnvironmentDiffuseLightMap-d01d9d6c-9a61-4aba-8146-5891fafb013b-v1.0-vertex.glsl';
import environmentDiffuseLightMapFrag from './brushes/EnvironmentDiffuseLightMap-d01d9d6c-9a61-4aba-8146-5891fafb013b/EnvironmentDiffuseLightMap-d01d9d6c-9a61-4aba-8146-5891fafb013b-v1.0-fragment.glsl';

import fireVert from './brushes/Fire-cb92b597-94ca-4255-b017-0e3f42f12f9e/Fire-cb92b597-94ca-4255-b017-0e3f42f12f9e-v10.0-vertex.glsl';
import fireFrag from './brushes/Fire-cb92b597-94ca-4255-b017-0e3f42f12f9e/Fire-cb92b597-94ca-4255-b017-0e3f42f12f9e-v10.0-fragment.glsl';

import flatVert from './brushes/Flat-2d35bcf0-e4d8-452c-97b1-3311be063130/Flat-2d35bcf0-e4d8-452c-97b1-3311be063130-v10.0-vertex.glsl';
import flatFrag from './brushes/Flat-2d35bcf0-e4d8-452c-97b1-3311be063130/Flat-2d35bcf0-e4d8-452c-97b1-3311be063130-v10.0-fragment.glsl';

import highlighterVert from './brushes/Highlighter-cf019139-d41c-4eb0-a1d0-5cf54b0a42f3/Highlighter-cf019139-d41c-4eb0-a1d0-5cf54b0a42f3-v10.0-vertex.glsl';
import highlighterFrag from './brushes/Highlighter-cf019139-d41c-4eb0-a1d0-5cf54b0a42f3/Highlighter-cf019139-d41c-4eb0-a1d0-5cf54b0a42f3-v10.0-fragment.glsl';

import hypercolorVert from './brushes/Hypercolor-dce872c2-7b49-4684-b59b-c45387949c5c/Hypercolor-dce872c2-7b49-4684-b59b-c45387949c5c-v10.0-vertex.glsl';
import hypercolorFrag from './brushes/Hypercolor-dce872c2-7b49-4684-b59b-c45387949c5c/Hypercolor-dce872c2-7b49-4684-b59b-c45387949c5c-v10.0-fragment.glsl';

import hyperGridVert from './brushes/HyperGrid-6a1cf9f9-032c-45ec-9b6e-a6680bee32e9/HyperGrid-6a1cf9f9-032c-45ec-9b6e-a6680bee32e9-v10.0-vertex.glsl';
import hyperGridFrag from './brushes/HyperGrid-6a1cf9f9-032c-45ec-9b6e-a6680bee32e9/HyperGrid-6a1cf9f9-032c-45ec-9b6e-a6680bee32e9-v10.0-fragment.glsl';

import icingVert from './brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-vertex.glsl';
import icingFrag from './brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-fragment.glsl';

import inkVert from './brushes/Ink-f5c336cf-5108-4b40-ade9-c687504385ab/Ink-f5c336cf-5108-4b40-ade9-c687504385ab-v10.0-vertex.glsl';
import inkFrag from './brushes/Ink-f5c336cf-5108-4b40-ade9-c687504385ab/Ink-f5c336cf-5108-4b40-ade9-c687504385ab-v10.0-fragment.glsl';

import leavesVert from './brushes/Leaves-ea19de07-d0c0-4484-9198-18489a3c1487/Leaves-ea19de07-d0c0-4484-9198-18489a3c1487-v10.0-vertex.glsl';
import leavesFrag from './brushes/Leaves-ea19de07-d0c0-4484-9198-18489a3c1487/Leaves-ea19de07-d0c0-4484-9198-18489a3c1487-v10.0-fragment.glsl';

import lightVert from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-vertex.glsl';
import lightFrag from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-fragment.glsl';

import lightWireVert from './brushes/LightWire-4391aaaa-df81-4396-9e33-31e4e4930b27/LightWire-4391aaaa-df81-4396-9e33-31e4e4930b27-v10.0-vertex.glsl';
import lightWireFrag from './brushes/LightWire-4391aaaa-df81-4396-9e33-31e4e4930b27/LightWire-4391aaaa-df81-4396-9e33-31e4e4930b27-v10.0-fragment.glsl';

import loftedVert from './brushes/Lofted-d381e0f5-3def-4a0d-8853-31e9200bcbda/Lofted-d381e0f5-3def-4a0d-8853-31e9200bcbda-v10.0-vertex.glsl';
import loftedFrag from './brushes/Lofted-d381e0f5-3def-4a0d-8853-31e9200bcbda/Lofted-d381e0f5-3def-4a0d-8853-31e9200bcbda-v10.0-fragment.glsl';

import markerVert from './brushes/Marker-429ed64a-4e97-4466-84d3-145a861ef684/Marker-429ed64a-4e97-4466-84d3-145a861ef684-v10.0-vertex.glsl';
import markerFrag from './brushes/Marker-429ed64a-4e97-4466-84d3-145a861ef684/Marker-429ed64a-4e97-4466-84d3-145a861ef684-v10.0-fragment.glsl';

import matteHullVert from './brushes/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa-v10.0-vertex.glsl';
import matteHullFrag from './brushes/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa-v10.0-fragment.glsl';

import neonPulseVert from './brushes/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6-v10.0-vertex.glsl';
import neonPulseFrag from './brushes/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6-v10.0-fragment.glsl';

import oilPaintVert from './brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-vertex.glsl';
import oilPaintFrag from './brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-fragment.glsl';

import paperVert from './brushes/Paper-f1114e2e-eb8d-4fde-915a-6e653b54e9f5/Paper-f1114e2e-eb8d-4fde-915a-6e653b54e9f5-v10.0-vertex.glsl';
import paperFrag from './brushes/Paper-f1114e2e-eb8d-4fde-915a-6e653b54e9f5/Paper-f1114e2e-eb8d-4fde-915a-6e653b54e9f5-v10.0-fragment.glsl';

import pbrTemplateVert from './brushes/PbrTemplate-f86a096c-2f4f-4f9d-ae19-81b99f2944e0/PbrTemplate-f86a096c-2f4f-4f9d-ae19-81b99f2944e0-v1.0-vertex.glsl';
import pbrTemplateFrag from './brushes/PbrTemplate-f86a096c-2f4f-4f9d-ae19-81b99f2944e0/PbrTemplate-f86a096c-2f4f-4f9d-ae19-81b99f2944e0-v1.0-fragment.glsl';

import pbrTransparentTemplateVert from './brushes/PbrTransparentTemplate-19826f62-42ac-4a9e-8b77-4231fbd0cfbf/PbrTransparentTemplate-19826f62-42ac-4a9e-8b77-4231fbd0cfbf-v1.0-vertex.glsl';
import pbrTransparentTemplateFrag from './brushes/PbrTransparentTemplate-19826f62-42ac-4a9e-8b77-4231fbd0cfbf/PbrTransparentTemplate-19826f62-42ac-4a9e-8b77-4231fbd0cfbf-v1.0-fragment.glsl';

import petalVert from './brushes/Petal-e0abbc80-0f80-e854-4970-8924a0863dcc/Petal-e0abbc80-0f80-e854-4970-8924a0863dcc-v10.0-vertex.glsl';
import petalFrag from './brushes/Petal-e0abbc80-0f80-e854-4970-8924a0863dcc/Petal-e0abbc80-0f80-e854-4970-8924a0863dcc-v10.0-fragment.glsl';

import plasmaVert from './brushes/Plasma-c33714d1-b2f9-412e-bd50-1884c9d46336/Plasma-c33714d1-b2f9-412e-bd50-1884c9d46336-v10.0-vertex.glsl';
import plasmaFrag from './brushes/Plasma-c33714d1-b2f9-412e-bd50-1884c9d46336/Plasma-c33714d1-b2f9-412e-bd50-1884c9d46336-v10.0-fragment.glsl';

import rainbowVert from './brushes/Rainbow-ad1ad437-76e2-450d-a23a-e17f8310b960/Rainbow-ad1ad437-76e2-450d-a23a-e17f8310b960-v10.0-vertex.glsl';
import rainbowFrag from './brushes/Rainbow-ad1ad437-76e2-450d-a23a-e17f8310b960/Rainbow-ad1ad437-76e2-450d-a23a-e17f8310b960-v10.0-fragment.glsl';

import shinyHullVert from './brushes/ShinyHull-faaa4d44-fcfb-4177-96be-753ac0421ba3/ShinyHull-faaa4d44-fcfb-4177-96be-753ac0421ba3-v10.0-vertex.glsl';
import shinyHullFrag from './brushes/ShinyHull-faaa4d44-fcfb-4177-96be-753ac0421ba3/ShinyHull-faaa4d44-fcfb-4177-96be-753ac0421ba3-v10.0-fragment.glsl';

import smokeVert from './brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-vertex.glsl';
import smokeFrag from './brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-fragment.glsl';

import snowVert from './brushes/Snow-d902ed8b-d0d1-476c-a8de-878a79e3a34c/Snow-d902ed8b-d0d1-476c-a8de-878a79e3a34c-v10.0-vertex.glsl';
import snowFrag from './brushes/Snow-d902ed8b-d0d1-476c-a8de-878a79e3a34c/Snow-d902ed8b-d0d1-476c-a8de-878a79e3a34c-v10.0-fragment.glsl';

import softHighlighterVert from './brushes/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b-v10.0-vertex.glsl';
import softHighlighterFrag from './brushes/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b-v10.0-fragment.glsl';

import spikesVert from './brushes/Spikes-cf7f0059-7aeb-53a4-2b67-c83d863a9ffa/Spikes-cf7f0059-7aeb-53a4-2b67-c83d863a9ffa-v10.0-vertex.glsl';
import spikesFrag from './brushes/Spikes-cf7f0059-7aeb-53a4-2b67-c83d863a9ffa/Spikes-cf7f0059-7aeb-53a4-2b67-c83d863a9ffa-v10.0-fragment.glsl';

import splatterVert from './brushes/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e-v10.0-vertex.glsl';
import splatterFrag from './brushes/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e-v10.0-fragment.glsl';

import starsVert from './brushes/Stars-0eb4db27-3f82-408d-b5a1-19ebd7d5b711/Stars-0eb4db27-3f82-408d-b5a1-19ebd7d5b711-v10.0-vertex.glsl';
import starsFrag from './brushes/Stars-0eb4db27-3f82-408d-b5a1-19ebd7d5b711/Stars-0eb4db27-3f82-408d-b5a1-19ebd7d5b711-v10.0-fragment.glsl';

import streamersVert from './brushes/Streamers-44bb800a-fbc3-4592-8426-94ecb05ddec3/Streamers-44bb800a-fbc3-4592-8426-94ecb05ddec3-v10.0-vertex.glsl';
import streamersFrag from './brushes/Streamers-44bb800a-fbc3-4592-8426-94ecb05ddec3/Streamers-44bb800a-fbc3-4592-8426-94ecb05ddec3-v10.0-fragment.glsl';

import taffyVert from './brushes/Taffy-0077f88c-d93a-42f3-b59b-b31c50cdb414/Taffy-0077f88c-d93a-42f3-b59b-b31c50cdb414-v10.0-vertex.glsl';
import taffyFrag from './brushes/Taffy-0077f88c-d93a-42f3-b59b-b31c50cdb414/Taffy-0077f88c-d93a-42f3-b59b-b31c50cdb414-v10.0-fragment.glsl';

import taperedFlatVert from './brushes/TaperedFlat-b468c1fb-f254-41ed-8ec9-57030bc5660c/TaperedFlat-b468c1fb-f254-41ed-8ec9-57030bc5660c-v10.0-vertex.glsl';
import taperedFlatFrag from './brushes/TaperedFlat-b468c1fb-f254-41ed-8ec9-57030bc5660c/TaperedFlat-b468c1fb-f254-41ed-8ec9-57030bc5660c-v10.0-fragment.glsl';

import taperedMarkerVert from './brushes/TaperedMarker-d90c6ad8-af0f-4b54-b422-e0f92abe1b3c/TaperedMarker-d90c6ad8-af0f-4b54-b422-e0f92abe1b3c-v10.0-vertex.glsl';
import taperedMarkerFrag from './brushes/TaperedMarker-d90c6ad8-af0f-4b54-b422-e0f92abe1b3c/TaperedMarker-d90c6ad8-af0f-4b54-b422-e0f92abe1b3c-v10.0-fragment.glsl';

import taperedMarker_FlatVert from './brushes/TaperedMarker_Flat-1a26b8c0-8a07-4f8a-9fac-d2ef36e0cad0/TaperedMarker_Flat-1a26b8c0-8a07-4f8a-9fac-d2ef36e0cad0-v10.0-vertex.glsl';
import taperedMarker_FlatFrag from './brushes/TaperedMarker_Flat-1a26b8c0-8a07-4f8a-9fac-d2ef36e0cad0/TaperedMarker_Flat-1a26b8c0-8a07-4f8a-9fac-d2ef36e0cad0-v10.0-fragment.glsl';

import thickPaintVert from './brushes/ThickPaint-75b32cf0-fdd6-4d89-a64b-e2a00b247b0f/ThickPaint-75b32cf0-fdd6-4d89-a64b-e2a00b247b0f-v10.0-vertex.glsl';
import thickPaintFrag from './brushes/ThickPaint-75b32cf0-fdd6-4d89-a64b-e2a00b247b0f/ThickPaint-75b32cf0-fdd6-4d89-a64b-e2a00b247b0f-v10.0-fragment.glsl';

import toonVert from './brushes/Toon-4391385a-df73-4396-9e33-31e4e4930b27/Toon-4391385a-df73-4396-9e33-31e4e4930b27-v10.0-vertex.glsl';
import toonFrag from './brushes/Toon-4391385a-df73-4396-9e33-31e4e4930b27/Toon-4391385a-df73-4396-9e33-31e4e4930b27-v10.0-fragment.glsl';

import unlitHullVert from './brushes/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d-v10.0-vertex.glsl';
import unlitHullFrag from './brushes/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d-v10.0-fragment.glsl';

import velvetInkVert from './brushes/VelvetInk-d229d335-c334-495a-a801-660ac8a87360/VelvetInk-d229d335-c334-495a-a801-660ac8a87360-v10.0-vertex.glsl';
import velvetInkFrag from './brushes/VelvetInk-d229d335-c334-495a-a801-660ac8a87360/VelvetInk-d229d335-c334-495a-a801-660ac8a87360-v10.0-fragment.glsl';

import waveformVert from './brushes/Waveform-10201aa3-ebc2-42d8-84b7-2e63f6eeb8ab/Waveform-10201aa3-ebc2-42d8-84b7-2e63f6eeb8ab-v10.0-vertex.glsl';
import waveformFrag from './brushes/Waveform-10201aa3-ebc2-42d8-84b7-2e63f6eeb8ab/Waveform-10201aa3-ebc2-42d8-84b7-2e63f6eeb8ab-v10.0-fragment.glsl';

import wetPaintVert from './brushes/WetPaint-b67c0e81-ce6d-40a8-aeb0-ef036b081aa3/WetPaint-b67c0e81-ce6d-40a8-aeb0-ef036b081aa3-v10.0-vertex.glsl';
import wetPaintFrag from './brushes/WetPaint-b67c0e81-ce6d-40a8-aeb0-ef036b081aa3/WetPaint-b67c0e81-ce6d-40a8-aeb0-ef036b081aa3-v10.0-fragment.glsl';

import wigglyGraphiteVert from './brushes/WigglyGraphite-5347acf0-a8e2-47b6-8346-30c70719d763/WigglyGraphite-5347acf0-a8e2-47b6-8346-30c70719d763-v10.0-vertex.glsl';
import wigglyGraphiteFrag from './brushes/WigglyGraphite-5347acf0-a8e2-47b6-8346-30c70719d763/WigglyGraphite-5347acf0-a8e2-47b6-8346-30c70719d763-v10.0-fragment.glsl';

import wireVert from './brushes/Wire-4391385a-cf83-4396-9e33-31e4e4930b27/Wire-4391385a-cf83-4396-9e33-31e4e4930b27-v10.0-vertex.glsl';
import wireFrag from './brushes/Wire-4391385a-cf83-4396-9e33-31e4e4930b27/Wire-4391385a-cf83-4396-9e33-31e4e4930b27-v10.0-fragment.glsl';


const TiltBrushShaders = {
    "BlocksBasic" : {
    },
    "BlocksGem" : {
    },
    "BlocksGlass" : {
    },
    "Bubbles" : {
    },
    "CelVinyl" : {
    },
    "ChromaticWave" : {
    },
    "CoarseBristles" : {
    },
    "Comet" : {
    },
	"DiamondHull" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_time: { value: new Vector4() },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			cameraPosition: { value: new Vector3() },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901-v10.0-MainTex.png',
			function (texture) {
				texture.name = "DiamondHull_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
		},
		vertexShader: diamondHullVert,
		fragmentShader: diamondHullFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "Disco" : {
    },
    "DotMarker" : {
    },
    "Dots" : {
    },
    "DoubleTaperedFlat" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
	},
    "DoubleTaperedMarker" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "DuctTape" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Electricity" : {
    },
    "Embers" : {
    },
    "EnvironmentDiffuse" : {
    },
    "EnvironmentDiffuseLightMap" : {
    },
    "Fire" : {
    },
    "Flat" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "FlatDeprecated" : {
    },
    "Highlighter" : {
    },
    "Hypercolor" : {
    },
    "HyperGrid" : {
    },
	"Icing" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Ink" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Leaves" : {
    },
	"Light" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-MainTex.png',
			function (texture) {
				texture.name = "Light_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: lightVert,
		fragmentShader: lightFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "LightWire" : {
    },
    "Lofted" : {
    },
    "Marker" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"MatteHull" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: matteHullVert,
		fragmentShader: matteHullFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
	"NeonPulse" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_time: { value: new Vector4() },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: neonPulseVert,
		fragmentShader: neonPulseFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
	"OilPaint": {
		uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0020, 0.0020, 512, 512) },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-MainTex.png',
				function (texture) {
					texture.name = "OilPaint_MainTex";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				})
			},
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-BumpMap.png',
				function (texture) {
					texture.name = "OilPaint_BumpMap";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				})
			}
		},
		vertexShader: oilPaintVert,
		fragmentShader: oilPaintFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0
	},
    "Paper" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "PbrTemplate" : {
    },
    "PbrTransparentTemplate" : {
    },
    "Petal" : {
    },
    "Plasma" : {
    },
	"Rainbow" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_time: { value: new Vector4() },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: rainbowVert,
		fragmentShader: rainbowFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "ShinyHull" : {
    },
	"Smoke": {
		uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_TintColor: { value: new Vector4(1, 1, 1, 1) },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-MainTex.png',
				function (texture) {
					texture.name = "Smoke_MainTex";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				})
			}
		},
		vertexShader: smokeVert,
		fragmentShader: smokeFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
	},
    "Snow" : {
    },
	"SoftHighlighter" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b-v10.0-MainTex.png',
			function (texture) {
				texture.name = "SoftHighliter_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 },
		},
		vertexShader: softHighlighterVert,
		fragmentShader: softHighlighterFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "Spikes" : {
    },
	"Splatter" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e-v10.0-MainTex.png',
			function (texture) {
				texture.name = "Splatter_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 },
		},
		vertexShader: splatterVert,
		fragmentShader: splatterFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0
    },
    "Stars" : {
    },
    "Streamers" : {
    },
    "Taffy" : {
    },
    "TaperedFlat" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "TaperedMarker" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "TaperedMarker_Flat" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "ThickPaint" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Toon" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: toonVert,
		fragmentShader: toonFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
	"UnlitHull" : {
        uniforms: {
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: unlitHullVert,
		fragmentShader: unlitHullFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
    "VelvetInk" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Waveform" : {
    },
    "WetPaint" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "WigglyGraphite" : {
    },
	"Wire" : {
        uniforms: {
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: wireVert,
		fragmentShader: wireFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
}

export { TiltBrushShaders };