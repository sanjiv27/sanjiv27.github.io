"""Build a swimming loop from Git Koi artwork using a rearward body wave."""

from math import pi, sin
from pathlib import Path
from hashlib import sha256

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/koi/koi.png"
OUTPUT = ROOT / "public/koi/koi-swim.gif"
SHEET = ROOT / "public/koi/koi-swim-sheet.png"
STILL = ROOT / "public/koi/koi-still.png"
VERSION = ROOT / "src/generated/koi-version.ts"
SIZE = 320
FRAME_COUNT = 24


def face_right(frame):
    """Frame Git Koi's right-facing still without depending on its colors."""
    bounds = frame.getchannel("A").getbbox()
    if not bounds:
        raise ValueError("Git Koi frame is empty")
    frame = frame.crop(bounds)
    if max(frame.size) > SIZE - 40:
        scale = (SIZE - 40) / max(frame.size)
        frame = frame.resize(
            (round(frame.width * scale), round(frame.height * scale)),
            Image.Resampling.NEAREST,
        )
    alpha = frame.getchannel("A")
    head_ys = [
        y
        for x in range(max(0, frame.width - 20), frame.width)
        for y in range(frame.height)
        if alpha.getpixel((x, y)) > 0
    ]
    canvas = Image.new("RGBA", (SIZE, SIZE))
    canvas.alpha_composite(
        frame, (296 - frame.width, 160 - round(sum(head_ys) / len(head_ys)))
    )
    return canvas


def center_y(alpha, x):
    ys = [
        y
        for column in range(max(0, round(x) - 8), min(SIZE, round(x) + 9))
        for y in range(SIZE)
        if alpha.getpixel((column, y)) > 0
    ]
    if not ys:
        raise ValueError("Cannot find fish at sampled spine position")
    return sum(ys) / len(ys)


def make_pose(artwork, phase=None):
    alpha = artwork.getchannel("A")
    left, _, right, _ = alpha.getbbox()
    width = right - left
    tail_x = left + width * 0.1
    body_x = left + width * 0.6
    head_x = right - width * 0.05
    tail_bias = center_y(alpha, tail_x) - center_y(alpha, body_x)
    result = Image.new("RGBA", (SIZE, SIZE))

    for x in range(SIZE):
        # At the tail u=1. Amplitude grows quadratically, and the phase lag
        # makes each body section follow the one in front of it.
        u = max(0.0, min(1.12, (head_x - x) / (head_x - tail_x)))
        rear = max(0.0, min(1.0, (body_x - x) / (body_x - tail_x)))
        rear = rear * rear * (3 - 2 * rear)
        displacement = -tail_bias * rear
        if phase is not None:
            displacement += 44 * u * u * sin(phase - 2 * pi * 0.8 * u)
        result.paste(artwork.crop((x, 0, x + 1, SIZE)), (x, round(displacement)))
    return result


def main():
    with Image.open(SOURCE) as source:
        artwork = face_right(source.convert("RGBA"))
    frames = [make_pose(artwork, 2 * pi * index / FRAME_COUNT) for index in range(FRAME_COUNT)]
    sheet = Image.new("RGBA", (SIZE * 6, SIZE * 4))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((index % 6) * SIZE, (index // 6) * SIZE))
    sheet.save(SHEET, optimize=True)
    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=40,
        loop=0,
        disposal=2,
        transparency=0,
        optimize=False,
    )
    make_pose(artwork).save(STILL)
    VERSION.parent.mkdir(parents=True, exist_ok=True)
    VERSION.write_text(
        f'export const KOI_VERSION = "{sha256(SOURCE.read_bytes()).hexdigest()[:12]}";\n'
    )
    print(f"Wrote {OUTPUT} ({len(frames)} frames)")


if __name__ == "__main__":
    main()
