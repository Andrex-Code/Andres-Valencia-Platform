import shutil
from pathlib import Path

import app


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "deploy" / "panaderia-la-chiquita"


def export_bakery(slug="panaderia-belalcazar"):
    business, _ = app.find_business(slug)
    if not business:
        raise SystemExit(f"No se encontro el negocio: {slug}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    html = app.render_bakery_page_v2(business, edit_mode=False, can_edit=False, standalone=True)
    (OUTPUT_DIR / "index.html").write_text(html, encoding="utf-8")

    uploads_target = OUTPUT_DIR / "uploads"
    if uploads_target.exists():
        shutil.rmtree(uploads_target)

    if app.UPLOADS_DIR.exists():
        shutil.copytree(app.UPLOADS_DIR, uploads_target)

    print(f"Sitio exportado en: {OUTPUT_DIR}")


if __name__ == "__main__":
    export_bakery()
