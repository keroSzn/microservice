import os
import re
from dataclasses import dataclass


_FILENAME_SAFE = re.compile(r"[^a-zA-Z0-9._-]+")


def safe_filename(name: str) -> str:
    name = name.strip().replace(" ", "_")
    name = _FILENAME_SAFE.sub("", name)
    return name or "file"


@dataclass(frozen=True)
class Range:
    start: int
    end: int  # inclusive


def parse_http_range(range_header: str | None, file_size: int) -> Range | None:
    if not range_header:
        return None
    if not range_header.startswith("bytes="):
        return None
    value = range_header[len("bytes=") :].strip()
    if "," in value:
        return None

    start_s, end_s = (value.split("-", 1) + [""])[:2]
    start_s = start_s.strip()
    end_s = end_s.strip()

    if start_s == "" and end_s == "":
        return None

    if start_s == "":
        # suffix range: last N bytes
        length = int(end_s)
        if length <= 0:
            return None
        if length > file_size:
            length = file_size
        return Range(file_size - length, file_size - 1)

    start = int(start_s)
    if start >= file_size or start < 0:
        return None

    if end_s == "":
        end = file_size - 1
    else:
        end = int(end_s)
        if end < start:
            return None
        if end >= file_size:
            end = file_size - 1
    return Range(start, end)


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

