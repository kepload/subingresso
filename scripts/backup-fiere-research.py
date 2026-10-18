"""Snapshot local fair research and verify every copied file (no deletion/upload).

Run from any directory: python scripts/backup-fiere-research.py
Original third-party documents stay outside the public repository and website.
"""

from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[1]
DOCUMENTS = Path.home() / "Documents"


def digest(file):
    checksum = hashlib.sha256()
    with file.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            checksum.update(block)
    return checksum.hexdigest()


def research_name(name):
    name = name.casefold()
    return ("fiere" in name or name.startswith(("ricerca-bollini-", "ricerca-costi-pisogne-", "verifica-filtri-articoli-")))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--resume", type=Path, help="Complete an interrupted snapshot without a completed manifest")
    args = parser.parse_args()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup_root = (DOCUMENTS / "backup-subingresso").resolve()
    destination = backup_root / ("ricerche-fiere-" + stamp)
    if args.resume:
        destination = args.resume.resolve(strict=True)
        if destination.parent != backup_root or not destination.name.startswith("ricerche-fiere-") or (destination / "manifest.json").exists():
            raise ValueError("Resume requires an unfinished research snapshot in backup-subingresso")
    else:
        destination.mkdir(parents=True, exist_ok=False)
    files, folders, errors, records = {}, [], [], []

    def collect(source, relative):
        if source.is_symlink() or source.is_junction():
            raise ValueError("Linked research paths require explicit review: " + str(source))
        if source.is_file():
            files[source] = relative
        elif source.is_dir():
            for child in sorted(source.iterdir()):
                collect(child, relative / child.name)
        else:
            raise FileNotFoundError(str(source))

    # Full research folders, including originals, failed fetches, notes and QA.
    for source in sorted(DOCUMENTS.iterdir()):
        if research_name(source.name) or source.name == "articoli-subingresso":
            collect(source, Path("Documents") / source.name)
            folders.append(source.name)
        # Isolated research checkouts: retain their fair data without Git/secrets.
        elif source.is_dir() and re.match(r"subingresso-(cremona|mantova|pavia|regioni)-", source.name):
            for data in sorted((source / "data").glob("*")):
                if "fiere" in data.name.casefold():
                    collect(data, Path("Documents") / source.name / "data" / data.name)

    # Fair-guide sources from earlier sessions must survive temporary cleanup.
    for source in sorted(Path(tempfile.gettempdir()).glob("subingresso-blog-fiere-*")):
        collect(source, Path("temporary-research") / source.name)
        folders.append(str(source))

    # Authoritative catalogues/audits, generator, UI and reproduction scripts.
    for folder in ("data", "scripts"):
        for source in sorted((ROOT / folder).iterdir()):
            if "fiere" in source.name.casefold() and source.is_file():
                collect(source, Path("repository") / folder / source.name)
    for name in ("AGENTS.md", "CLAUDE.md", "istruzioni.md", "Subingresso.it informazioni.md", "fiere.html", "js/pages/fiere.js", "css/fiere.css", "api/fiera.js"):
        collect(ROOT / name, Path("repository") / name)

    print(f"Copying and verifying {len(files)} files from {len(folders)} research entries.", flush=True)
    def copy_verified(source, relative):
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        before = source.stat()
        checksum = digest(source)
        if not target.is_file() or target.stat().st_size != before.st_size or digest(target) != checksum:
            shutil.copy2(source, target)
        after = source.stat()
        if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
            raise RuntimeError("Source changed during backup")
        if target.stat().st_size != before.st_size or digest(target) != checksum:
            raise RuntimeError("Backup integrity mismatch")
        return {"source": str(source), "copy": relative.as_posix(), "bytes": before.st_size, "sha256": checksum}

    with ThreadPoolExecutor(max_workers=8) as pool:
        tasks = {pool.submit(copy_verified, source, relative): source for source, relative in sorted(files.items())}
        for index, task in enumerate(as_completed(tasks), 1):
            try:
                records.append(task.result())
            except Exception as error:
                errors.append({"source": str(tasks[task]), "error": str(error)})
            if index % 2000 == 0:
                print(f"Verified {len(records)}/{len(files)} files.", flush=True)
    records.sort(key=lambda item: item["copy"])

    report = {
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "repositoryCommit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
        "destination": str(destination),
        "scope": "Existing local research materials; no reconstruction of documents never saved. No deletion, remote upload or recurring job.",
        "researchEntries": folders,
        "expectedFiles": len(files),
        "verifiedFiles": len(records),
        "bytes": sum(item["bytes"] for item in records),
        "errors": errors,
        "files": records,
    }
    manifest = destination / "manifest.json"
    manifest.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (destination / "manifest.sha256").write_text(digest(manifest) + "  manifest.json\n", encoding="ascii")
    print(json.dumps({key: report[key] for key in ("destination", "expectedFiles", "verifiedFiles", "bytes", "errors")}, ensure_ascii=False), flush=True)
    if errors or len(records) != len(files):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
