# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "numpy>=2.1",
#   "pillow>=11",
#   "requests>=2.32",
#   "torch>=2.8",
#   "transformers>=4.57,<6",
# ]
# ///

"""Segment Poly thumbnail backgrounds with SAM and report regional photometry."""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

import numpy as np
import requests
import torch
from PIL import Image
from transformers import SamModel, SamProcessor


API_ROOT = "https://api.icosa.gallery/v1/assets"
MODEL_ID = "Zigeng/SlimSAM-uniform-77"


def mean_luminance(rgb: np.ndarray, mask: np.ndarray) -> float:
    pixels = rgb[mask]
    if not pixels.size:
        return float("nan")
    luminance = (
        0.2126 * pixels[:, 0]
        + 0.7152 * pixels[:, 1]
        + 0.0722 * pixels[:, 2]
    )
    return float(luminance.mean())


def border_coverage(mask: np.ndarray, width: int = 4) -> float:
    border = np.zeros_like(mask, dtype=bool)
    border[:width] = True
    border[-width:] = True
    border[:, :width] = True
    border[:, -width:] = True
    return float(mask[border].mean())


def retain_border_connected(mask: np.ndarray) -> np.ndarray:
    height, width = mask.shape
    connected = np.zeros_like(mask, dtype=bool)
    pending: deque[tuple[int, int]] = deque()
    for x in range(width):
        if mask[0, x]:
            pending.append((0, x))
        if mask[height - 1, x]:
            pending.append((height - 1, x))
    for y in range(height):
        if mask[y, 0]:
            pending.append((y, 0))
        if mask[y, width - 1]:
            pending.append((y, width - 1))

    while pending:
        y, x = pending.popleft()
        if connected[y, x] or not mask[y, x]:
            continue
        connected[y, x] = True
        if y:
            pending.append((y - 1, x))
        if y + 1 < height:
            pending.append((y + 1, x))
        if x:
            pending.append((y, x - 1))
        if x + 1 < width:
            pending.append((y, x + 1))
    return connected


def select_background_mask(
    masks: np.ndarray, iou_scores: np.ndarray
) -> tuple[int, list[dict[str, float]]]:
    candidates = []
    for index, raw_mask in enumerate(masks):
        mask = retain_border_connected(raw_mask)
        area_fraction = float(mask.mean())
        coverage = border_coverage(mask)
        score = float(iou_scores[index]) + 1.5 * coverage
        if area_fraction < 0.25:
            score -= (0.25 - area_fraction) * 4
        if area_fraction > 0.95:
            score -= 2
        candidates.append(
            {
                "index": index,
                "samIouScore": float(iou_scores[index]),
                "areaFraction": area_fraction,
                "borderCoverage": coverage,
                "selectionScore": score,
            }
        )
    selected = max(range(len(candidates)), key=lambda index: candidates[index]["selectionScore"])
    return selected, candidates


def save_diagnostic(
    image: Image.Image, background_mask: np.ndarray, destination: Path
) -> None:
    rgb = np.asarray(image, dtype=np.uint8)
    overlay = rgb.astype(np.float32)
    foreground_mask = ~background_mask
    overlay[background_mask] = overlay[background_mask] * 0.65 + np.array([30, 210, 80]) * 0.35
    overlay[foreground_mask] = overlay[foreground_mask] * 0.65 + np.array([235, 45, 55]) * 0.35

    cutout = np.zeros_like(rgb)
    cutout[foreground_mask] = rgb[foreground_mask]
    diagnostic = np.concatenate([rgb, overlay.astype(np.uint8), cutout], axis=1)
    Image.fromarray(diagnostic).save(destination)


def load_asset(asset_id: str) -> tuple[dict, Image.Image]:
    response = requests.get(f"{API_ROOT}/{asset_id}", timeout=30)
    response.raise_for_status()
    asset = response.json()
    image_response = requests.get(asset["thumbnail"]["url"], timeout=30)
    image_response.raise_for_status()
    image_path = Path.cwd() / ".poly-thumbnail-download"
    image_path.write_bytes(image_response.content)
    try:
        image = Image.open(image_path).convert("RGB")
        image.load()
    finally:
        image_path.unlink(missing_ok=True)
    return asset, image


def segment_asset(
    asset_id: str,
    model: SamModel,
    processor: SamProcessor,
    device: torch.device,
    output_directory: Path,
) -> dict:
    asset, image = load_asset(asset_id)
    width, height = image.size
    inset_x = max(4, round(width * 0.015))
    inset_y = max(4, round(height * 0.015))
    points = [
        [inset_x, inset_y],
        [width // 2, inset_y],
        [width - inset_x - 1, inset_y],
        [inset_x, height // 2],
        [width - inset_x - 1, height // 2],
        [inset_x, height - inset_y - 1],
        [width // 2, height - inset_y - 1],
        [width - inset_x - 1, height - inset_y - 1],
    ]
    inputs = processor(
        images=image,
        input_points=[points],
        input_labels=[[1] * len(points)],
        return_tensors="pt",
    ).to(device)
    with torch.inference_mode():
        outputs = model(**inputs, multimask_output=True)
    processed = processor.image_processor.post_process_masks(
        outputs.pred_masks.cpu(),
        inputs["original_sizes"].cpu(),
        inputs["reshaped_input_sizes"].cpu(),
    )[0]
    masks = processed[0].numpy().astype(bool)
    iou_scores = outputs.iou_scores[0, 0].detach().cpu().numpy()
    selected_index, candidates = select_background_mask(masks, iou_scores)
    background_mask = retain_border_connected(masks[selected_index])
    foreground_mask = ~background_mask
    rgb = np.asarray(image, dtype=np.float32)

    output_directory.mkdir(parents=True, exist_ok=True)
    diagnostic_name = f"{asset_id}.png"
    mask_name = f"{asset_id}-background-mask.png"
    save_diagnostic(image, background_mask, output_directory / diagnostic_name)
    Image.fromarray(background_mask.astype(np.uint8) * 255).save(
        output_directory / mask_name
    )

    return {
        "assetId": asset_id,
        "displayName": asset["displayName"],
        "thumbnailUrl": asset["thumbnail"]["url"],
        "width": width,
        "height": height,
        "selectedCandidate": selected_index,
        "candidates": candidates,
        "modelPixelFraction": float(foreground_mask.mean()),
        "modelMeanLuminance": mean_luminance(rgb, foreground_mask),
        "backgroundMeanLuminance": mean_luminance(rgb, background_mask),
        "diagnostic": diagnostic_name,
        "backgroundMask": mask_name,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("asset_ids", nargs="+")
    parser.add_argument(
        "--output-directory",
        type=Path,
        default=Path("dist/poly-segmentation"),
    )
    parser.add_argument(
        "--json-output",
        type=Path,
        default=Path("dist/poly-thumbnail-segmentation.json"),
    )
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    dtype = torch.float16 if device.type == "cuda" else torch.float32
    processor = SamProcessor.from_pretrained(MODEL_ID)
    model = SamModel.from_pretrained(MODEL_ID, torch_dtype=dtype).to(device).eval()

    results = []
    for asset_id in args.asset_ids:
        print(f"segmenting {asset_id}", flush=True)
        results.append(segment_asset(asset_id, model, processor, device, args.output_directory))

    report = {"model": MODEL_ID, "device": str(device), "assets": results}
    args.json_output.parent.mkdir(parents=True, exist_ok=True)
    args.json_output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(args.json_output)


if __name__ == "__main__":
    main()
