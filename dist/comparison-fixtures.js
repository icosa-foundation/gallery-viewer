export const fixtureGroups = [
    {
        label: "Transform controls",
        fixtures: [
            { id: "f4-0", label: "env-scale-test0", url: "./formats/gltf2/env-scale-test0.glb", loader: "gltf" },
            { id: "f4-1", label: "env-scale-test1", url: "./formats/gltf2/env-scale-test1.glb", loader: "gltf" },
            { id: "f4-2", label: "env-scale-test2", url: "./formats/gltf2/env-scale-test2.glb", loader: "gltf" }
        ]
    },
    {
        label: "Non–Open Brush",
        fixtures: [
            { id: "non-pot", label: "Pot", url: "./formats/gltf2/Pot.gltf", loader: "gltf" },
            { id: "non-desk", label: "Desk", url: "./formats/gltf2/desk/Desk.gltf", loader: "gltf" },
            { id: "non-xwing", label: "X-wing", url: "./formats/gltf2/xwing/model.gltf", loader: "gltf" },
            { id: "non-monster", label: "Monster Kit", url: "./formats/gltf2/monster-updated-gltf/model.gltf", loader: "gltf" },
            { id: "non-robot", label: "Robot Kit", url: "./formats/gltf2/robot_kit/model_(GLTFupdated).gltf", loader: "gltf" }
        ]
    },
    {
        label: "Live Icosa API — migrated Poly assets",
        fixtures: [
            ["01lqee-dZAr", "Apartment building — Google"],
            ["5rf3YuZfJAW", "Pond — Google"],
            ["dLHpzNdygsg", "Astronaut — Google"],
            ["ap9I6sv347V", "Gun — Google (1,284 tris)"],
            ["eke7qcu_FR2", "Cheeseburger — Google"],
            ["aLbeOSoOpXN", "Gun — Google (712 tris)"],
            ["1HpVP5w2x1D", "Cup of coffee — Google"],
            ["0X5xcxjszwI", "Knife — Google"],
            ["6ZPbRl78eRZ", "HTC Vive Headset — Marco Romero"],
            ["6dM1J6f6pm9", "Cat — Google"],
            ["dK08uQ8-Zm9", "Arctic Fox (Sitting) — Anonymous"],
            ["6pwiq7hSrHr", "Tree — Google"],
            ["75WQH5E29tF", "Paper airplane — Google"],
            ["2EHvZLax4Y3", "Computer — Google"],
            ["bHyQe5jzdiQ", "Farm house — Google"],
            ["0nEWYSdUqRq", "Earth — Robert Mirabelle"],
            ["0t2ZYRBsqX-", "Lighthouse — Google"],
            ["7rUkCX-AIR2", "Gas Station — Alex “SAFFY” Safayan"],
            ["fojR5i3h_nh", "Flying saucer — Google"],
            ["68OOL4zL6Co", "Elm tree — Google"],
            ["3QzBkeu0ljR", "蹦仔a海底世界 — 黃蹦蹦 (generator unspecified)"],
            ["68unrtIOrFi", "Adobe Max Mega Kit — 3Donimus (Blocks glTF1)"],
            ["fJ4uqrWr0Je", "Ronin — Joshua (Tilt Brush)"]
        ].map(([assetId, label]) => ({ id: `api-${assetId}`, assetId, label }))
    },
    {
        label: "Live Icosa API — non–Open Brush authored-light control",
        fixtures: [{ id: "api-7Q_Ab2HLll1", assetId: "7Q_Ab2HLll1", label: "Couch | Wde — Emma Bittman" }]
    },
    {
        label: "Legacy glTF1 Open Brush / Tilt Brush",
        fixtures: [
            { id: "legacy-dress", label: "Dress", url: "./formats/gltf1/dress/sketch.gltf", loader: "gltf1", polyModelUrl: "/dist/formats/gltf2/dress/dress.gltf" },
            { id: "legacy-dragon", label: "Dragon", url: "./formats/gltf1/dragon/tmp6a3c0c6.gltf", loader: "gltf1", polyModelUrl: "/dist/formats/gltf1/dragon/tmp6a3c0c6.gltf" },
            { id: "legacy-jellyfish", label: "Jellyfish", url: "./formats/gltf1/jellyfish/sketch.gltf", loader: "gltf1", polyModelUrl: "/dist/formats/gltf2/jellyfish/sketch_(GLTFupdated).gltf" },
            { id: "legacy-nighthawks", label: "Nighthawks", url: "./formats/gltf1/nighthawks/sketch.gltf", loader: "gltf1", polyModelUrl: "/dist/formats/gltf2/nighthawks/sketch.gltf" },
            { id: "legacy-montana", label: "Montana", url: "./formats/gltf1/montana/sketch.gltf", loader: "gltf1", polyAssetId: "c5Vlb7zYZ7-" },
            { id: "legacy-trees", label: "Trees", url: "./formats/gltf1/trees/sketch.gltf", loader: "gltf1", polyAssetId: "c342VSnnxgC" },
            { id: "legacy-upsidedown", label: "Upside Down", url: "./formats/gltf1/upsidedown/tmp1352bc07.gltf", loader: "gltf1", polyAssetId: "ervEzbIlddY" },
            { id: "legacy-watermelon", label: "Watermelon", url: "./formats/gltf1/watermelon/sketch.gltf", loader: "gltf1", polyModelUrl: "/dist/formats/gltf1/watermelon/sketch.gltf" }
        ]
    },
    {
        label: "Legacy glTF2 Open Brush / Tilt Brush",
        fixtures: [
            { id: "legacy2-fishtank", label: "Fishtank", url: "./formats/gltf2/fishtank/fishtank.gltf", loader: "gltf", polyModelUrl: "/dist/formats/gltf2/fishtank/fishtank.gltf" },
            { id: "legacy2-homeoffice", label: "Home Office", url: "./formats/gltf2/homeoffice/sketch_(GLTFupdated).gltf", loader: "gltf", polyModelUrl: "/dist/formats/gltf2/homeoffice/sketch_(GLTFupdated).gltf" },
            { id: "legacy2-starrynight", label: "Starry Night", url: "./formats/gltf2/starrynight/starrynight.gltf", loader: "gltf", polyModelUrl: "/dist/formats/gltf2/starrynight/starrynight.gltf" },
            { id: "legacy2-contact", label: "CONTACT 2", url: "./formats/gltf2/CONTACT_2/CONTACT_2.glb", loader: "gltf", polyModelUrl: "/dist/formats/gltf2/CONTACT_2/CONTACT_2.glb" }
        ]
    },
    {
        label: "UnityGLTF / newer exporters",
        fixtures: [
            { id: "recent-lighting", label: "Lighting Test", url: "./formats/new_uploads/lighting_test.glb", loader: "gltf" },
            { id: "recent-preset", label: "Environment Preset", url: "./formats/newglb/envtest/Untitled__15.glb", loader: "gltf" },
            { id: "recent-red-shadow", label: "Red Shadow", url: "./formats/new_uploads/red_shadow.glb", loader: "gltf" },
            { id: "recent-fubar", label: "Fubar", url: "./formats/new_uploads/fubar.glb", loader: "gltf" },
            { id: "recent-bubbles", label: "Bubbles", url: "./formats/new_uploads/TEST_Bubbles.glb", loader: "gltf" },
            { id: "recent-mount", label: "MOUNT-03", url: "./formats/newglb/MOUNT-03.glb", loader: "gltf" },
            { id: "recent-cafe", label: "Brush Cafe", url: "./formats/cafe/brush_cafe_experimental (0).glb", loader: "gltf" },
            { id: "recent-irina", label: "Irina Lighting Bug", url: "./formats/new_uploads/irina_lighting_bug.glb", loader: "gltf" },
            { id: "recent-all-brushes", label: "All Brushes", url: "./formats/newglb/all_brushes/all_brushes.glb", loader: "gltf" },
            { id: "recent-blocks", label: "Blocks Test", url: "./formats/newglb/blockstest/blockstest.gltf", loader: "gltf" }
        ]
    },
    {
        label: "Live Icosa API — additional Blocks tuning assets",
        fixtures: [
            ["2binsxeOBve", "Rio de Janeiro — Alan Zimmerman"],
            ["fbDxapxkwY9", "Truck — sugamo"],
            ["8gVr4pedhp9", "Monster Kit 1.0 — Damon Pidhajecky"],
            ["de1C80IeXEi", "Blocks Humanoid — 3Donimus"],
            ["atB26Z6BPd0", "Blocks Lab Equipment — Don Carson"],
            ["2UniJaHLw7T", "Robot - Blocks for Oculus — JoSaCo FPV"],
            ["03BtsBP-Flj", "Katamari Damacy — Darwin Yamamoto"],
            ["04VaTEm6eOR", "Piano Rough Draft — Andrew Smart"],
            ["05VXLT8kN4k", "Microscope — Colonel Cthulu"],
            ["0AMOApNFJQ9", "Dainty ladybug — Angela Chang"],
            ["0BF88U3BKb0", "Ruins — Dads And Dragons"],
            ["0chwm1mLpRC", "Headphones — Alex “SAFFY” Safayan"],
            ["0e5uIxMLPY9", "Arcade Machine — Mika Suikkanen"],
            ["0Ipa29gN-iV", "Power plant, level 2 — Kenny Deriemaeker"],
            ["0ivy-FxYrz9", "Train on Track — Linus Ekenstam"],
            ["0qc8uV0yycU", "Basic Tree — Darren Williams"],
            ["0v-9a2zD1hB", "Simple Mimic — Kyle Hickman"],
            ["11Mwd6H3QpH", "Raygun — Gabriel Valdivia"],
            ["1ElmRTfiZKV", "Old TV — Nebel"],
            ["1LjHOTWn4mc", "Wedding Cake — Don Carson"],
            ["1qo2vlHOgUF", "Lemonade — zeoxo"],
            ["1uXmHq-ELhz", "Small plane — Eik Røgeberg"],
            ["2AeF-fuFHNu", "Little Private Beach — Carson Lam"],
            ["2ksg-hSb6Vz", "Sink + Mirrors — Grian Talamonti"],
            ["26x_0PKFg-l", "MS Gundam RX-78-2 — Tipatat Chennavasin"],
            ["cQFoSfuK7Tf", "Mechsuit — Pepper Media"],
            ["4RpdzBs2C8E", "Kraken vs Robots — Anders Fray"]
        ].map(([assetId, label]) => ({ id: `api-${assetId}`, assetId, label }))
    },
    {
        id: "api-core",
        label: "Live Icosa API — selected legacy production assets",
        fixtures: [
            ["bBeuR5Rk78i", "There Is No Secret (Union)"],
            ["3UL8Bz_Id6I", "Solve et Coagula"],
            ["dIDpf7IS_5S", "Trainscape"],
            ["1ir5OdM1M05", "Anatomy Figure WIP"],
            ["ervEzbIlddY", "The Upside Down"],
            ["fv_TG9nYHtT", "Victorious Lucian Splash"],
            ["4KU8RhUyHlu", "Ice Flower"],
            ["2Rb9zxgkDEM", "Fish Tank"],
            ["7Rr7j8S0q6C", "BTTF DeLorean"],
            ["e-Zqenw7Dui", "Starry Night"],
            ["5OP5JSQZZn-", "Galactic Cat"],
            ["bNTxRoQdjZ_", "The Midnight Market"],
            ["1xcevVGIXMf", "Sci-Fi Research Facility"],
            ["c342VSnnxgC", "Trees"],
            ["9L2Lt-sxzdp", "Robot Kit"]
        ].map(([assetId, label]) => ({ id: `api-${assetId}`, assetId, label }))
    }
];

export const fixedFixtures = new Map(
    fixtureGroups.flatMap(group => group.fixtures.map(fixture => [fixture.id, fixture]))
);

export function assetIdForFixture(fixtureId) {
    if (fixtureId.startsWith("api-")) return fixtureId.slice(4);
    return fixedFixtures.get(fixtureId)?.polyAssetId || null;
}

export function polyModelForFixture(fixtureId) {
    const fixture = fixedFixtures.get(fixtureId);
    if (fixture?.polyModelUrl) return fixture.polyModelUrl;
    if (fixture?.url && !fixture.assetId) return new URL(fixture.url, location.href).pathname;
    return null;
}

export async function resolveFixture(fixtureId) {
    const fixed = fixedFixtures.get(fixtureId);
    if (fixed?.url) return fixed;

    const assetId = assetIdForFixture(fixtureId);
    if (!assetId) return null;
    const response = await fetch(`https://api.icosa.gallery/v1/assets/${assetId}`);
    if (!response.ok) throw new Error(`Failed to fetch Icosa asset ${assetId}: ${response.status}`);
    const asset = await response.json();
    const preferredFormat = asset.formats?.find(format => format.isPreferredForGalleryViewer);
    if (!preferredFormat?.root?.url) {
        throw new Error(`Icosa asset ${assetId} has no preferred Gallery viewer resource`);
    }
    const presentationParams = asset.presentationParams || {};
    const formatType = preferredFormat.formatType.toLowerCase();
    const loader = formatType === "gltf1" || formatType === "gltf"
        ? "gltf1"
        : formatType === "gltf2" || formatType === "glb"
            ? "gltf"
            : formatType;
    const mtlResource = preferredFormat.resources?.find(resource =>
        resource.relativePath?.toLowerCase().endsWith(".mtl")
    );
    return {
        id: fixtureId,
        label: asset.displayName,
        url: preferredFormat.root.url,
        loader,
        mtlUrl: mtlResource?.url,
        overrides: {
            defaultBackgroundColor: presentationParams.backgroundColor || "#000000",
            camera: { ...(presentationParams.camera || {}), ...(asset.camera || {}) },
            geometryData: presentationParams.geometry_data || presentationParams.GOOGLE_geometry_data || {},
            colorSpace: presentationParams.colorSpace || "LINEAR"
        },
        polyPresentationParams: presentationParams,
        assetId,
        asset,
        displayName: asset.displayName,
        formatType: preferredFormat.formatType
    };
}

function appendFixedOptions(select) {
    select.replaceChildren();
    for (const group of fixtureGroups) {
        const optgroup = document.createElement("optgroup");
        if (group.id) optgroup.id = group.id;
        optgroup.label = group.label;
        for (const fixture of group.fixtures) {
            if ([...select.options].some(option => option.value === fixture.id)) continue;
            optgroup.appendChild(new Option(fixture.label, fixture.id));
        }
        select.appendChild(optgroup);
    }
    const apiMore = document.createElement("optgroup");
    apiMore.id = "api-more";
    apiMore.label = "Live Icosa API — loading more legacy assets…";
    select.appendChild(apiMore);
}

async function appendLiveApiOptions(select) {
    const response = await fetch("https://api.icosa.gallery/v1/assets?format=GLTF1&orderBy=BEST&pageSize=100");
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const result = await response.json();
    const existingValues = new Set([...select.options].map(option => option.value));
    const excludedAssetIds = new Set(["6SvG7gtQ9xr"]);
    const apiMore = select.querySelector("#api-more");
    let added = 0;

    for (const asset of result.assets || []) {
        const value = `api-${asset.assetId}`;
        const preferredFormat = asset.formats?.find(format => format.isPreferredForGalleryViewer);
        if (!asset.isIcosaGalleryCompatible || !preferredFormat?.root?.url ||
            excludedAssetIds.has(asset.assetId) || existingValues.has(value)) continue;
        const triangles = Number.isFinite(asset.triangleCount)
            ? ` — ${asset.triangleCount.toLocaleString()} tris`
            : "";
        apiMore.appendChild(new Option(
            `${asset.displayName} — ${asset.authorName || "Unknown author"}${triangles}`,
            value
        ));
        existingValues.add(value);
        added++;
    }
    apiMore.label = `Live Icosa API — ${added} additional popular legacy assets`;
}

export async function populateFixtureSelect(select, initialValue, defaultValue = "f4-0") {
    appendFixedOptions(select);
    try {
        await appendLiveApiOptions(select);
    } catch (error) {
        select.querySelector("#api-more").label = `Live Icosa API — catalog error: ${error.message}`;
    }
    const availableValues = new Set([...select.options].map(option => option.value));
    select.value = availableValues.has(initialValue) ? initialValue : defaultValue;
    return select.value;
}

export async function populateApiAssetSelect(select, initialAssetId, defaultAssetId) {
    select.replaceChildren();
    const existingAssetIds = new Set();
    for (const group of fixtureGroups) {
        const apiFixtures = group.fixtures.filter(fixture => assetIdForFixture(fixture.id));
        if (!apiFixtures.length) continue;
        const optgroup = document.createElement("optgroup");
        optgroup.label = group.label;
        for (const fixture of apiFixtures) {
            const assetId = assetIdForFixture(fixture.id);
            if (existingAssetIds.has(assetId)) continue;
            optgroup.appendChild(new Option(fixture.label, assetId));
            existingAssetIds.add(assetId);
        }
        if (optgroup.children.length) select.appendChild(optgroup);
    }

    const apiMore = document.createElement("optgroup");
    apiMore.label = "Live Icosa API — additional popular legacy assets";
    select.appendChild(apiMore);
    try {
        const response = await fetch("https://api.icosa.gallery/v1/assets?format=GLTF1&orderBy=BEST&pageSize=100");
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const result = await response.json();
        for (const asset of result.assets || []) {
            const preferredFormat = asset.formats?.find(format => format.isPreferredForGalleryViewer);
            if (!asset.isIcosaGalleryCompatible || !preferredFormat?.root?.url ||
                asset.assetId === "6SvG7gtQ9xr" || existingAssetIds.has(asset.assetId)) continue;
            const triangles = Number.isFinite(asset.triangleCount)
                ? ` — ${asset.triangleCount.toLocaleString()} tris`
                : "";
            apiMore.appendChild(new Option(
                `${asset.displayName} — ${asset.authorName || "Unknown author"}${triangles}`,
                asset.assetId
            ));
            existingAssetIds.add(asset.assetId);
        }
    } catch (error) {
        apiMore.label = `Live Icosa API — catalog error: ${error.message}`;
    }

    if (!existingAssetIds.has(initialAssetId)) {
        try {
            const response = await fetch(`https://api.icosa.gallery/v1/assets/${initialAssetId}`);
            if (response.ok) {
                const asset = await response.json();
                const currentGroup = document.createElement("optgroup");
                currentGroup.label = "Current asset";
                currentGroup.appendChild(new Option(asset.displayName || initialAssetId, initialAssetId));
                select.prepend(currentGroup);
                existingAssetIds.add(initialAssetId);
            }
        } catch {
            // Fall through to the page's default asset.
        }
    }
    select.value = existingAssetIds.has(initialAssetId) ? initialAssetId : defaultAssetId;
    return select.value;
}
