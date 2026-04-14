import json
import secrets
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse
import base64
import mimetypes

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "businesses.json"
STATIC_DIR = BASE_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
HOST = "127.0.0.1"
PORT = 8765
SESSION_COOKIE = "av_session"
SESSION_TTL_SECONDS = 60 * 60 * 12
UPLOAD_MAX_BYTES = 6 * 1024 * 1024
ALLOWED_UPLOAD_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
SESSIONS = {}


def as_bool(value, default=False):
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return bool(value)
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "yes", "si", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    return default


def is_hex_color(value):
    if not isinstance(value, str):
        return False
    value = value.strip()
    if len(value) != 7 or not value.startswith("#"):
        return False
    return all(char in "0123456789abcdefABCDEF" for char in value[1:])


def safe_hex_color(value, default):
    return value.strip() if is_hex_color(value) else default


def default_product_image(item):
    category = str(item.get("category", "")).lower()
    name = str(item.get("name", "")).lower()

    if "pastel" in name or "hojaldre" in name or "postre" in category or "pasteler" in category:
        return "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=900&q=80&auto=format&fit=crop"
    if "croissant" in name or "manteca" in name:
        return "https://images.unsplash.com/photo-1555507036-ab794f575c4d?w=900&q=80&auto=format&fit=crop"
    if "integral" in name or "especial" in category:
        return "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=900&q=80&auto=format&fit=crop"
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80&auto=format&fit=crop"


def default_panaderia_items():
    return [
        {
            "name": "Pan alinado",
            "description": "Crujiente por fuera y suave por dentro, ideal para el desayuno.",
            "price": "2.500",
            "category": "Pan tradicional",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Pan campesino",
            "description": "Miga suave, corteza dorada y sabor casero para compartir.",
            "price": "3.200",
            "category": "Pan tradicional",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Mogolla integral",
            "description": "Ideal para desayuno y onces, con textura suave y sabor balanceado.",
            "price": "2.000",
            "category": "Panes especiales",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Pan de queso",
            "description": "Recien horneado, suave por dentro y con mucho sabor.",
            "price": "2.800",
            "category": "Panes especiales",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Pastel de guayaba",
            "description": "Hojaldre relleno, horneado del dia, perfecto para acompanar un cafe.",
            "price": "3.500",
            "category": "Hojaldres y pasteleria",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Croissant de mantequilla",
            "description": "Laminado, liviano y dorado, con textura hojaldrada.",
            "price": "4.500",
            "category": "Hojaldres y pasteleria",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1555507036-ab794f575c4d?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Torta de vainilla por porcion",
            "description": "Porcion suave y esponjosa para celebraciones o antojos del dia.",
            "price": "6.500",
            "category": "Tortas y postres",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Torta de chocolate por porcion",
            "description": "Bizcocho humedo con cubierta cremosa y sabor intenso.",
            "price": "7.000",
            "category": "Tortas y postres",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Cafe americano",
            "description": "Cafe recien preparado para acompanar panes, hojaldres y postres.",
            "price": "2.500",
            "category": "Bebidas",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop",
        },
        {
            "name": "Chocolate caliente",
            "description": "Bebida caliente tradicional para una tarde de pan y onces.",
            "price": "3.500",
            "category": "Bebidas",
            "status": "active",
            "image": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=900&q=80&auto=format&fit=crop",
        },
    ]


def bakery_visual_defaults(business):
    city = business.get("city", "Colombia")
    return {
        "brand_tagline": "Panaderia artesanal",
        "announcement_badge": "Horneado del dia",
        "announcement_text": "Haz tu pedido por WhatsApp y recoge en tienda sin enredos.",
        "announcement_cta_label": "Ver catalogo",
        "utility_badges": [
            city,
            "Pan y pasteleria del dia",
            "Pedidos por WhatsApp",
        ],
        "hero_badge": "Panaderia local en Colombia",
        "hero_image": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1600&q=80&auto=format&fit=crop",
        "hero_secondary_image": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=1200&q=80&auto=format&fit=crop",
        "story_image": "https://images.unsplash.com/photo-1555507036-ab794f575c4d?w=1200&q=80&auto=format&fit=crop",
        "nav_label_home": "Inicio",
        "nav_label_featured": "Destacados",
        "nav_label_cakes": "Tortas",
        "nav_label_story": "Nosotros",
        "nav_label_catalog": "Catalogo",
        "nav_label_contact": "Contacto",
        "nav_label_faq": "FAQ",
        "nav_cta_label": "Pedir por WhatsApp",
        "hero_primary_cta_label": "Hacer pedido",
        "hero_secondary_cta_label": "Como llegar",
        "hero_note_cta_label": "Consultar por WhatsApp",
        "hero_caption_title": "Productos que antojan desde el primer vistazo",
        "hero_caption_text": "Una vitrina digital clara para mostrar panes, tortas, horarios y pedidos sin enredos.",
        "hero_note_label": "Encargos y pedidos",
        "hero_note_title": "Todo listo para vender mejor por celular",
        "hero_note_text": "Muestra productos, resuelve dudas rapido y lleva a la gente directo a WhatsApp.",
        "hero_highlights": ["Desayuno", "Onces", "Tortas", "Encargos"],
        "meta_label_address": "Direccion",
        "meta_label_hours": "Horario",
        "meta_label_orders": "Pedidos",
        "featured_kicker": "Lo que mas se mueve",
        "featured_title": "Lo mas pedido en la vitrina",
        "featured_subtitle": "Una seleccion pensada para provocar antojo y ayudar a que el cliente encuentre rapido lo mejor del dia.",
        "cakes_kicker": "Tortas y celebraciones",
        "cakes_title": "Tortas y encargos especiales",
        "cakes_subtitle": "Espacio ideal para mostrar tortas de celebracion, encargos personalizados y trabajos destacados.",
        "story_kicker": "Conoce la panaderia",
        "story_title": "Una panaderia cercana, bien presentada y facil de contactar",
        "story_points": [
            "Fotos y precios visibles para que el cliente decida rapido.",
            "Categorias claras para buscar mejor desde el celular.",
            "Pedido directo por WhatsApp sin pasos innecesarios.",
        ],
        "catalog_kicker": "Catalogo completo",
        "catalog_title": "Catalogo de productos",
        "catalog_subtitle": "Busca por nombre, filtra por categoria y encuentra mas rapido lo que quieres pedir.",
        "catalog_placeholder": "Buscar pan, torta, hojaldre o bebida...",
        "catalog_clear_label": "Limpiar busqueda",
        "catalog_empty_message": "No encontramos productos con esa busqueda. Prueba otra palabra o cambia de categoria.",
        "catalog_sort_label": "Ordenar",
        "catalog_results_label": "productos visibles hoy",
        "contact_kicker": "Contacto directo",
        "contact_title": "Informacion para pedir o visitarnos",
        "contact_text": "Atendemos pedidos por WhatsApp, consultas sobre disponibilidad y encargos especiales.",
        "contact_primary_cta_label": "Escribir por WhatsApp",
        "contact_secondary_cta_label": "Abrir mapa",
        "faq_kicker": "Dudas frecuentes",
        "faq_title": "Preguntas frecuentes",
        "footer_note": "Pagina comercial para visibilidad local y pedidos directos.",
        "seo_title": business.get("name", "Panaderia local"),
        "seo_description": business.get("short_description", "Panaderia local con pedidos por WhatsApp."),
        "show_announcement": True,
        "show_featured": True,
        "show_cakes": True,
        "show_story": True,
        "show_catalog": True,
        "show_contact": True,
        "show_faq": True,
        "show_category_shortcuts": True,
        "show_catalog_filters": True,
        "show_catalog_search": True,
        "show_category_boards": True,
        "show_whatsapp_float": True,
        "featured_limit": 4,
        "theme_preset": "artesanal",
        "theme_background": "#f5ede2",
        "theme_surface": "#fffaf3",
        "theme_surface_strong": "#fffdf9",
        "theme_text": "#2b1c14",
        "theme_muted": "#6d594b",
        "theme_line": "#e3cfbc",
        "theme_soft": "#f2e5d4",
        "theme_accent": "#b86736",
        "theme_accent_dark": "#964d22",
    }


def load_data():
    # "utf-8-sig" evita fallos cuando el archivo trae BOM de Windows.
    with DATA_FILE.open("r", encoding="utf-8-sig") as f:
        data = json.load(f)

    if "admin" not in data:
        data["admin"] = {"owner_password": "andres2026"}

    for business in data.get("businesses", []):
        if "client_password" not in business:
            business["client_password"] = "cliente123"
        if business.get("slug") == "panaderia-belalcazar" and business.get("sample_seed_version", 0) < 2:
            business["items"] = default_panaderia_items()
            business["sample_seed_version"] = 2
        business.setdefault("address", business.get("city", ""))
        business.setdefault("open_hours", "Lunes a Sabado 6:00 a.m. - 8:00 p.m.")
        business.setdefault("order_note", "Pedidos por WhatsApp")
        business.setdefault("short_description", "Panaderia artesanal para todos los dias.")
        business.setdefault(
            "about_text",
            "Somos una panaderia de barrio enfocada en frescura, buen sabor y atencion cercana para nuestras familias y vecinos.",
        )
        business.setdefault("map_query", f"{business.get('name', '')}, {business.get('city', '')}")
        business.setdefault(
            "cake_gallery",
            [
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&q=80&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&q=80&auto=format&fit=crop",
            ],
        )
        business.setdefault(
            "faq",
            [
                {"q": "¿Reciben pedidos por WhatsApp?", "a": "Si, te confirmamos disponibilidad y tiempo de entrega."},
                {"q": "¿Manejan productos por encargo?", "a": "Si, especialmente para eventos y pedidos especiales."},
                {"q": "¿Qué medios de pago aceptan?", "a": "Efectivo, transferencia y medios disponibles en el punto."},
            ],
        )
        is_bakery = "panader" in str(business.get("category", "")).lower()
        if is_bakery:
            for key, value in bakery_visual_defaults(business).items():
                business.setdefault(key, value)
        for item in business.get("items", []):
            item.setdefault("category", business.get("items_label", "Productos"))
            item.setdefault("status", "active")
            item.setdefault("image", default_product_image(item))
            item.setdefault("badge", "")
            item.setdefault("search_terms", "")
            item.setdefault("featured", False)

        if is_bakery and business.get("items"):
            if not any(as_bool(item.get("featured")) for item in business.get("items", [])):
                for index, item in enumerate(business.get("items", [])):
                    if index < 4 and item.get("status", "active") == "active":
                        item["featured"] = True

    return data


def save_data(data):
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def safe_json_for_html(value):
    return json.dumps(value, ensure_ascii=False).replace("</", "<\\/")


def find_business(slug):
    data = load_data()
    for b in data.get("businesses", []):
        if b.get("slug") == slug:
            return b, data
    return None, data


def session_can_edit_business(session, slug):
    if not session:
        return False
    if session.get("role") == "owner":
        return True
    return session.get("role") == "client" and session.get("slug") == slug


def ensure_uploads_dir():
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def upload_file_from_data_url(slug, filename, data_url):
    if not isinstance(filename, str) or not isinstance(data_url, str):
        raise ValueError("Datos de imagen invalidos")

    header, _, payload = data_url.partition(",")
    if not header.startswith("data:") or ";base64" not in header or not payload:
        raise ValueError("Formato de imagen no valido")

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise ValueError("Tipo de archivo no permitido")

    try:
        raw = base64.b64decode(payload, validate=True)
    except Exception as exc:
        raise ValueError("No se pudo leer la imagen") from exc

    if len(raw) > UPLOAD_MAX_BYTES:
        raise ValueError("La imagen supera el limite permitido")

    ensure_uploads_dir()
    safe_slug = "".join(ch if ch.isalnum() or ch in "-_" else "-" for ch in slug)[:60] or "site"
    file_name = f"{safe_slug}-{secrets.token_hex(8)}{ext}"
    target = UPLOADS_DIR / file_name
    target.write_bytes(raw)
    return f"/uploads/{file_name}"


def is_valid_image_reference(value):
    return value.startswith("http://") or value.startswith("https://") or value.startswith("/uploads/")


def html_layout(title, body):
    return f"""<!DOCTYPE html>
<html lang=\"es\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{title}</title>
  <style>
    :root {{
      --bg: #f4f6f8;
      --card: #ffffff;
      --ink: #16202a;
      --muted: #5d6b79;
      --line: #dce3ea;
      --brand: #0b7a75;
      --brand-dark: #0a5c58;
      --radius: 14px;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: Segoe UI, Arial, sans-serif; background: var(--bg); color: var(--ink); line-height: 1.5; }}
    .wrap {{ width: min(1100px, 92%); margin: 34px auto; }}
    .top {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }}
    .btn {{ text-decoration: none; background: var(--brand); color: #fff; padding: 10px 14px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; }}
    .btn:hover {{ background: var(--brand-dark); }}
    .btn.ghost {{ background: #fff; color: var(--ink); border: 1px solid var(--line); }}
    .card {{ background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px; box-shadow: 0 10px 24px rgba(22,32,42,.07); }}
    h1 {{ font-size: clamp(1.8rem, 3.5vw, 2.6rem); line-height: 1.1; margin-bottom: 8px; }}
    h2 {{ font-size: 1.3rem; margin-bottom: 12px; }}
    h3 {{ font-size: 1rem; margin-bottom: 8px; }}
    p {{ color: var(--muted); }}
    .grid {{ display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }}
    .item {{ border: 1px solid var(--line); border-radius: 12px; padding: 12px; background: #fcfdff; }}
    .item h3 {{ font-size: 1rem; margin-bottom: 4px; }}
    .price {{ color: #0f5132; font-weight: 700; margin-top: 8px; }}
    .row {{ display: flex; gap: 12px; flex-wrap: wrap; }}
    .field {{ display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }}
    .field label {{ font-size: .84rem; color: #425466; font-weight: 600; }}
    input, textarea, select {{ width: 100%; border: 1px solid var(--line); border-radius: 10px; padding: 10px 11px; font-size: .92rem; }}
    textarea {{ min-height: 80px; resize: vertical; }}
    .muted {{ font-size: .9rem; color: var(--muted); }}
    .footer {{ margin-top: 14px; font-size: .85rem; color: var(--muted); }}
    .alert {{ margin-bottom: 10px; color: #8a2f2f; font-size: .9rem; }}
  </style>
</head>
<body>
  <main class=\"wrap\">{body}</main>
</body>
</html>"""


def create_session(role, slug=None):
    token = secrets.token_urlsafe(24)
    SESSIONS[token] = {
        "role": role,
        "slug": slug,
        "expires": time.time() + SESSION_TTL_SECONDS,
    }
    return token


def cleanup_sessions():
    now = time.time()
    expired = [token for token, info in SESSIONS.items() if info.get("expires", 0) < now]
    for token in expired:
        del SESSIONS[token]


def parse_cookie(header_value):
    result = {}
    if not header_value:
        return result

    parts = header_value.split(";")
    for part in parts:
        if "=" not in part:
            continue
        k, v = part.strip().split("=", 1)
        result[k] = v
    return result


def home_html():
    data = load_data()
    cards = []
    for b in data.get("businesses", []):
        cards.append(
            f"""
            <article class=\"card\">
              <h2>{b['name']}</h2>
              <p>{b['category']} - {b['city']}</p>
              <div class=\"row\" style=\"margin-top:12px\">
                <a class=\"btn\" href=\"/site/{b['slug']}\">Ver pagina</a>
                <a class=\"btn ghost\" href=\"/client-login?slug={b['slug']}\">Editar como cliente</a>
              </div>
            </article>
            """
        )

    body = f"""
    <section class=\"top\">
      <div>
        <h1>Sistema Andres Valencia</h1>
        <p class=\"muted\">Paginas editables para tus clientes sin depender de plataformas externas.</p>
      </div>
      <div class=\"row\">
        <a class=\"btn ghost\" href=\"/client-login\">Acceso cliente</a>
        <a class=\"btn\" href=\"/login\">Acceso administrador</a>
      </div>
    </section>
    <section class=\"grid\">{''.join(cards)}</section>
    <p class=\"footer\">MVP propio - Cada cliente puede editar solo su negocio.</p>
    """
    return html_layout("Sistema Andres Valencia", body)


def site_html(slug, edit_mode=False, can_edit=False):
    business, _ = find_business(slug)
    if not business:
        return None

    if "panader" in str(business.get("category", "")).lower():
        return bakery_site_html(business, edit_mode=edit_mode, can_edit=can_edit)

    items = []
    for item in business.get("items", []):
        items.append(
            f"""
            <article class=\"item\">
              <h3>{item.get('name','')}</h3>
              <p>{item.get('description','')}</p>
              <p class=\"price\">$ {item.get('price','')}</p>
            </article>
            """
        )

    whatsapp_msg = f"Hola, vi la pagina de {business['name']} y quiero mas informacion."
    whatsapp_link = f"https://wa.me/{business['whatsapp']}?text={whatsapp_msg.replace(' ', '%20')}"

    body = f"""
    <div class=\"top\">
      <a class=\"btn ghost\" href=\"/\">Volver al sistema</a>
        <a class=\"btn ghost\" href=\"/site/{business['slug']}?edit=1\">Editor visual</a>
    </div>

    <section class=\"card\" style=\"margin-bottom:14px\">
      <h1>{business['hero_title']}</h1>
      <p>{business['hero_subtitle']}</p>
      <p class=\"muted\" style=\"margin-top:10px\"><strong>{business['name']}</strong> - {business['city']}</p>
      <a class=\"btn\" style=\"display:inline-block;margin-top:12px\" href=\"{whatsapp_link}\" target=\"_blank\" rel=\"noopener noreferrer\">Contactar por WhatsApp</a>
    </section>

    <section class=\"card\">
      <h2>{business['items_label']}</h2>
      <div class=\"grid\">{''.join(items)}</div>
    </section>
    """
    return html_layout(business["name"], body)


def render_bakery_page_v2(business, edit_mode=False, can_edit=False, standalone=False):
    defaults = bakery_visual_defaults(business)
    active_items = []
    for item_index, item in enumerate(business.get("items", [])):
        if item.get("status", "active") == "active":
            enriched_item = dict(item)
            enriched_item["_index"] = item_index
            active_items.append(enriched_item)

    whatsapp_msg = f"Hola, quiero hacer un pedido en {business['name']}."
    whatsapp_link = f"https://wa.me/{business['whatsapp']}?text={whatsapp_msg.replace(' ', '%20')}"
    map_link = f"https://www.google.com/maps/search/?api=1&query={business.get('map_query','').replace(' ', '+')}"

    category_order = []
    category_counts = {}
    seen = set()
    for item in active_items:
        category = item.get("category", "Productos")
        category_counts[category] = category_counts.get(category, 0) + 1
        if category not in seen:
            category_order.append(category)
            seen.add(category)

    utility_badges = [str(value).strip() for value in business.get("utility_badges", []) if str(value).strip()]
    hero_highlights = [str(value).strip() for value in business.get("hero_highlights", []) if str(value).strip()]
    story_points = [str(value).strip() for value in business.get("story_points", []) if str(value).strip()]
    if not utility_badges:
        utility_badges = defaults["utility_badges"]
    if not hero_highlights:
        hero_highlights = defaults["hero_highlights"]
    if not story_points:
        story_points = defaults["story_points"]

    badge_rows = [f'<span class="utility-badge">{badge}</span>' for badge in utility_badges]
    hero_chip_rows = [f'<span class="chip">{chip}</span>' for chip in hero_highlights]
    story_rows = [f"<span>{point}</span>" for point in story_points]

    brand_initials = "".join(
        word[0].upper()
        for word in str(business.get("name", "")).split()
        if word and word.lower() not in {"panaderia", "de", "y"}
    )[:2] or "LC"

    brand_tagline = business.get("brand_tagline") or defaults["brand_tagline"]
    announcement_badge = business.get("announcement_badge") or defaults["announcement_badge"]
    announcement_text = business.get("announcement_text") or defaults["announcement_text"]
    announcement_cta_label = business.get("announcement_cta_label") or defaults["announcement_cta_label"]
    nav_label_home = business.get("nav_label_home") or defaults["nav_label_home"]
    nav_label_featured = business.get("nav_label_featured") or defaults["nav_label_featured"]
    nav_label_cakes = business.get("nav_label_cakes") or defaults["nav_label_cakes"]
    nav_label_story = business.get("nav_label_story") or defaults["nav_label_story"]
    nav_label_catalog = business.get("nav_label_catalog") or defaults["nav_label_catalog"]
    nav_label_contact = business.get("nav_label_contact") or defaults["nav_label_contact"]
    nav_label_faq = business.get("nav_label_faq") or defaults["nav_label_faq"]
    nav_cta_label = business.get("nav_cta_label") or defaults["nav_cta_label"]
    hero_badge = business.get("hero_badge") or defaults["hero_badge"]
    hero_primary_cta_label = business.get("hero_primary_cta_label") or defaults["hero_primary_cta_label"]
    hero_secondary_cta_label = business.get("hero_secondary_cta_label") or defaults["hero_secondary_cta_label"]
    hero_note_cta_label = business.get("hero_note_cta_label") or defaults["hero_note_cta_label"]
    hero_caption_title = business.get("hero_caption_title") or defaults["hero_caption_title"]
    hero_caption_text = business.get("hero_caption_text") or defaults["hero_caption_text"]
    hero_note_label = business.get("hero_note_label") or defaults["hero_note_label"]
    hero_note_title = business.get("hero_note_title") or defaults["hero_note_title"]
    hero_note_text = business.get("hero_note_text") or defaults["hero_note_text"]
    meta_label_address = business.get("meta_label_address") or defaults["meta_label_address"]
    meta_label_hours = business.get("meta_label_hours") or defaults["meta_label_hours"]
    meta_label_orders = business.get("meta_label_orders") or defaults["meta_label_orders"]
    featured_kicker = business.get("featured_kicker") or defaults["featured_kicker"]
    featured_title = business.get("featured_title") or defaults["featured_title"]
    featured_subtitle = business.get("featured_subtitle") or defaults["featured_subtitle"]
    cakes_kicker = business.get("cakes_kicker") or defaults["cakes_kicker"]
    cakes_title = business.get("cakes_title") or defaults["cakes_title"]
    cakes_subtitle = business.get("cakes_subtitle") or defaults["cakes_subtitle"]
    story_kicker = business.get("story_kicker") or defaults["story_kicker"]
    story_title = business.get("story_title") or defaults["story_title"]
    catalog_kicker = business.get("catalog_kicker") or defaults["catalog_kicker"]
    catalog_title = business.get("catalog_title") or defaults["catalog_title"]
    catalog_subtitle = business.get("catalog_subtitle") or defaults["catalog_subtitle"]
    catalog_placeholder = business.get("catalog_placeholder") or defaults["catalog_placeholder"]
    catalog_clear_label = business.get("catalog_clear_label") or defaults["catalog_clear_label"]
    catalog_empty_message = business.get("catalog_empty_message") or defaults["catalog_empty_message"]
    catalog_sort_label = business.get("catalog_sort_label") or defaults["catalog_sort_label"]
    catalog_results_label = business.get("catalog_results_label") or defaults["catalog_results_label"]
    contact_kicker = business.get("contact_kicker") or defaults["contact_kicker"]
    contact_title = business.get("contact_title") or defaults["contact_title"]
    contact_text = business.get("contact_text") or defaults["contact_text"]
    contact_primary_cta_label = business.get("contact_primary_cta_label") or defaults["contact_primary_cta_label"]
    contact_secondary_cta_label = business.get("contact_secondary_cta_label") or defaults["contact_secondary_cta_label"]
    faq_kicker = business.get("faq_kicker") or defaults["faq_kicker"]
    faq_title = business.get("faq_title") or defaults["faq_title"]
    footer_note = business.get("footer_note") or defaults["footer_note"]
    seo_title = business.get("seo_title") or defaults["seo_title"]
    seo_description = business.get("seo_description") or defaults["seo_description"]
    theme_background = safe_hex_color(business.get("theme_background"), defaults["theme_background"])
    theme_surface = safe_hex_color(business.get("theme_surface"), defaults["theme_surface"])
    theme_surface_strong = safe_hex_color(business.get("theme_surface_strong"), defaults["theme_surface_strong"])
    theme_text = safe_hex_color(business.get("theme_text"), defaults["theme_text"])
    theme_muted = safe_hex_color(business.get("theme_muted"), defaults["theme_muted"])
    theme_line = safe_hex_color(business.get("theme_line"), defaults["theme_line"])
    theme_soft = safe_hex_color(business.get("theme_soft"), defaults["theme_soft"])
    theme_accent = safe_hex_color(business.get("theme_accent"), defaults["theme_accent"])
    theme_accent_dark = safe_hex_color(business.get("theme_accent_dark"), defaults["theme_accent_dark"])
    show_announcement = as_bool(business.get("show_announcement"), defaults["show_announcement"])
    show_featured = as_bool(business.get("show_featured"), defaults["show_featured"])
    show_cakes = as_bool(business.get("show_cakes"), defaults["show_cakes"])
    show_story = as_bool(business.get("show_story"), defaults["show_story"])
    show_catalog = as_bool(business.get("show_catalog"), defaults["show_catalog"])
    show_contact = as_bool(business.get("show_contact"), defaults["show_contact"])
    show_faq = as_bool(business.get("show_faq"), defaults["show_faq"])
    show_category_shortcuts = as_bool(business.get("show_category_shortcuts"), defaults["show_category_shortcuts"])
    show_catalog_filters = as_bool(business.get("show_catalog_filters"), defaults["show_catalog_filters"])
    show_catalog_search = as_bool(business.get("show_catalog_search"), defaults["show_catalog_search"])
    show_category_boards = as_bool(business.get("show_category_boards"), defaults["show_category_boards"])
    show_whatsapp_float = as_bool(business.get("show_whatsapp_float"), defaults["show_whatsapp_float"])
    featured_limit = business.get("featured_limit", defaults["featured_limit"])
    try:
        featured_limit = max(1, min(12, int(featured_limit)))
    except Exception:
        featured_limit = defaults["featured_limit"]
    featured_items = [item for item in active_items if as_bool(item.get("featured"))]
    if not featured_items:
        featured_items = active_items
    featured = featured_items[:featured_limit]
    editor_enabled = edit_mode and can_edit
    editor_payload = {k: v for k, v in business.items() if k != "client_password"}
    editor_json = safe_json_for_html(editor_payload)
    body_class = ' class="edit-mode"' if editor_enabled else ""

    def edit_spot(section, label):
        if not editor_enabled:
            return ""
        return f'<button class="edit-spot" type="button" data-editor-open="{section}">Editar {label}</button>'

    if editor_enabled:
        edit_toolbar = f"""
  <div class="visual-editor-bar">
    <div class="visual-editor-inner">
      <div class="visual-editor-copy">
        <strong>Editor visual</strong>
        <span>Haz clic en una seccion para cambiarla sin salir de la pagina.</span>
      </div>
      <div class="visual-editor-actions">
        <button class="visual-btn ghost" type="button" id="openAdvancedEditor">Diseno y secciones</button>
        <button class="visual-btn primary" type="button" id="pageEditorSave">Guardar cambios</button>
        <a class="visual-btn ghost" href="/site/{business['slug']}">Ver publicada</a>
        <a class="visual-btn ghost" href="/admin?slug={business['slug']}">Panel clasico</a>
      </div>
    </div>
  </div>
  <div class="visual-editor-drawer" id="visualEditorDrawer" aria-hidden="true">
    <div class="visual-editor-backdrop" id="visualEditorBackdrop"></div>
    <aside class="visual-editor-panel">
      <div class="visual-editor-head">
        <div>
          <small>Modo WordPress</small>
          <h3 id="editorPanelTitle">Editor visual</h3>
          <p id="editorPanelHint">Selecciona una seccion de la pagina para editarla.</p>
        </div>
        <button class="visual-btn ghost" type="button" id="editorCloseBtn">Cerrar</button>
      </div>
      <div class="visual-editor-nav" id="editorPanelNav"></div>
      <div class="visual-editor-body" id="editorPanelBody"></div>
      <div class="visual-editor-foot">
        <span id="editorPanelStatus">Los cambios se guardan manualmente.</span>
        <div class="visual-editor-actions">
          <button class="visual-btn ghost" type="button" id="editorCancelBtn">Cancelar</button>
          <button class="visual-btn primary" type="button" id="editorSaveBtn">Guardar</button>
        </div>
      </div>
    </aside>
  </div>
        """
        top_tools_edit_link = f'<a class="tool-btn" href="/site/{business["slug"]}">Salir del editor</a>'
    elif can_edit:
        edit_toolbar = ""
        top_tools_edit_link = f'<a class="tool-btn" href="/site/{business["slug"]}?edit=1">Abrir editor visual</a>'
    elif standalone:
        edit_toolbar = ""
        top_tools_edit_link = ""
    else:
        edit_toolbar = ""
        top_tools_edit_link = f'<a class="tool-btn" href="/client-login?slug={business["slug"]}">Editar contenido</a>'

    filter_buttons = ['<button class="catalog-filter active" type="button" data-filter="all">Todo</button>']
    category_shortcuts = []
    for category in category_order:
        count = category_counts.get(category, 0)
        label = "producto" if count == 1 else "productos"
        category_shortcuts.append(
            f"""
            <button class="category-shortcut" type="button" data-filter="{category}">
              <strong>{category}</strong>
              <span>{count} {label}</span>
            </button>
            """
        )
        filter_buttons.append(
            f'<button class="catalog-filter" type="button" data-filter="{category}">{category}</button>'
        )

    catalog_cards = []
    for index, item in enumerate(active_items, start=1):
        item_index = item.get("_index", index - 1)
        search_blob = " ".join(
            [
                str(item.get("name", "")),
                str(item.get("description", "")),
                str(item.get("category", "")),
                str(item.get("badge", "")),
                str(item.get("search_terms", "")),
            ]
        ).lower()
        item_message = f"Hola, quiero pedir {item.get('name', '')} en {business['name']}."
        item_link = f"https://wa.me/{business['whatsapp']}?text={item_message.replace(' ', '%20')}"
        item_edit = (
            f'<button class="edit-spot" type="button" data-editor-open="catalog" data-editor-item-index="{item_index}">Editar producto</button>'
            if editor_enabled
            else ""
        )
        catalog_cards.append(
            f"""
            <article class="catalog-card rise {'editable-block' if editor_enabled else ''}" data-search="{search_blob}" data-name="{str(item.get('name','')).lower()}" data-price="{str(item.get('price',''))}" data-category="{item.get('category','Productos')}" data-editor-section="catalog" data-editor-item-index="{item_index}" style="animation-delay:{0.04 * index:.2f}s">
              {item_edit}
              <div class="catalog-image" style="background-image:url('{item.get('image', default_product_image(item))}')"></div>
              <div class="catalog-copy">
                <span class="catalog-category">{item.get('category','Productos')}</span>
                {'<span class="catalog-badge">' + str(item.get('badge', '')) + '</span>' if str(item.get('badge', '')).strip() else ''}
                <h3>{item.get('name','')}</h3>
                <p>{item.get('description','')}</p>
                <div class="catalog-foot">
                  <strong>$ {item.get('price','')}</strong>
                  <a href="{item_link}" class="catalog-link" target="_blank" rel="noopener noreferrer">{nav_cta_label}</a>
                </div>
              </div>
            </article>
            """
        )

    featured_cards = []
    labels = ["Favorito del dia", "Mas pedido", "Recien hecho", "Recomendado"]
    for index, item in enumerate(featured):
        item_index = item.get("_index", index)
        item_message = f"Hola, quiero pedir {item.get('name', '')} en {business['name']}."
        item_link = f"https://wa.me/{business['whatsapp']}?text={item_message.replace(' ', '%20')}"
        item_edit = (
            f'<button class="edit-spot" type="button" data-editor-open="catalog" data-editor-item-index="{item_index}">Editar producto</button>'
            if editor_enabled
            else ""
        )
        badge_label = str(item.get("badge", "")).strip() or labels[index % len(labels)]
        featured_cards.append(
            f"""
            <article class="product-card rise {'editable-block' if editor_enabled else ''}" data-editor-section="catalog" data-editor-item-index="{item_index}" style="animation-delay:{0.1 + (index * 0.08):.2f}s">
              {item_edit}
              <div class="product-image" style="background-image:url('{item.get('image', default_product_image(item))}')"></div>
              <span class="product-badge">{badge_label}</span>
              <h3>{item.get('name','')}</h3>
              <p>{item.get('description','')}</p>
              <div class="product-meta">
                <small>{item.get('category','Productos')}</small>
                <div class="product-meta-right">
                  <strong>$ {item.get('price','')}</strong>
                  <a href="{item_link}" target="_blank" rel="noopener noreferrer">{nav_cta_label}</a>
                </div>
              </div>
            </article>
            """
        )

    menu_sections = []
    for category in category_order:
        category_items = [item for item in active_items if item.get("category", "Productos") == category]
        rows = []
        for item in category_items:
            rows.append(
                f"""
                <article class="menu-item">
                  <div class="menu-thumb" style="background-image:url('{item.get('image', default_product_image(item))}')"></div>
                  <div class="menu-copy">
                    <h4>{item.get('name','')}</h4>
                    <p>{item.get('description','')}</p>
                    <small>{item.get('category','Productos')}</small>
                  </div>
                  <strong>$ {item.get('price','')}</strong>
                </article>
                """
            )
        menu_sections.append(
            f"""
            <section class="menu-board">
              <small>Del horno a tu mesa</small>
              <h3>{category}</h3>
              {''.join(rows)}
            </section>
            """
        )

    faq_rows = []
    for row in business.get("faq", []):
        faq_rows.append(
            f"""
            <article class="faq-card">
              <h4>{row.get('q','')}</h4>
              <p>{row.get('a','')}</p>
            </article>
            """
        )

    cake_slides = []
    for index, image_url in enumerate(business.get("cake_gallery", []), start=1):
        slide_edit = (
            f'<button class="edit-spot" type="button" data-editor-open="cakes" data-editor-gallery-index="{index - 1}">Editar foto</button>'
            if editor_enabled
            else ""
        )
        cake_slides.append(
            f"""
            <article class="cake-slide {'editable-block' if editor_enabled else ''}" data-editor-section="cakes" data-editor-gallery-index="{index - 1}" style="background-image:url('{image_url}')">
              {slide_edit}
              <div class="cake-overlay">
                <small>Tortas y celebraciones</small>
                <strong>Encargo {index}</strong>
              </div>
            </article>
            """
        )

    nav_links = [f'<a href="#inicio">{nav_label_home}</a>']
    if show_featured and featured_cards:
        nav_links.append(f'<a href="#destacados">{nav_label_featured}</a>')
    if show_cakes and cake_slides:
        nav_links.append(f'<a href="#tortas">{nav_label_cakes}</a>')
    if show_story:
        nav_links.append(f'<a href="#historia">{nav_label_story}</a>')
    if show_catalog:
        nav_links.append(f'<a href="#catalogo">{nav_label_catalog}</a>')
    if show_contact:
        nav_links.append(f'<a href="#contacto">{nav_label_contact}</a>')
    if show_faq and faq_rows:
        nav_links.append(f'<a href="#faq">{nav_label_faq}</a>')

    announcement_html = ""
    if show_announcement:
        announcement_link = "#catalogo" if show_catalog else whatsapp_link
        announcement_html = f"""
  <div class="utility editable-block" data-editor-section="navigation">
    {edit_spot("navigation", "franja superior")}
    <div class="utility-inner">
      <div class="utility-badges">{''.join(badge_rows)}</div>
      <div class="utility-side">
        <div class="utility-copy">
          <strong>{announcement_badge}</strong>
          <span>{announcement_text}</span>
        </div>
        <a class="utility-link" href="{announcement_link}">{announcement_cta_label}</a>
      </div>
    </div>
  </div>
        """

    featured_html = ""
    if show_featured and featured_cards:
        featured_html = f"""
  <section class="section editable-block" id="destacados" data-editor-section="featured">
    {edit_spot("featured", "destacados")}
    <div class="panel">
      <span class="section-kicker">{featured_kicker}</span>
      <h2 class="section-title">{featured_title}</h2>
      <p class="section-sub">{featured_subtitle}</p>
      <div class="featured-grid">{''.join(featured_cards)}</div>
    </div>
  </section>
        """

    cakes_html = ""
    if show_cakes and cake_slides:
        cakes_html = f"""
  <section class="section editable-block" id="tortas" data-editor-section="cakes">
    {edit_spot("cakes", "tortas")}
    <div class="panel">
      <div class="carousel-head">
        <div>
          <span class="section-kicker">{cakes_kicker}</span>
          <h2 class="section-title">{cakes_title}</h2>
          <p class="section-sub">{cakes_subtitle}</p>
        </div>
        <div class="carousel-controls">
          <button class="carousel-btn" type="button" id="cakesPrev">Anterior</button>
          <button class="carousel-btn" type="button" id="cakesNext">Siguiente</button>
        </div>
      </div>
      <div class="cake-carousel" id="cakeCarousel">{''.join(cake_slides)}</div>
    </div>
  </section>
        """

    story_html = ""
    if show_story:
        story_html = f"""
  <section class="section editable-block" id="historia" data-editor-section="story">
    {edit_spot("story", "nosotros")}
    <div class="story-grid">
      <article class="story-photo rise"></article>
      <article class="story-copy rise" style="animation-delay:.08s">
        <span class="section-kicker">{story_kicker}</span>
        <h2 class="section-title">{story_title}</h2>
        <p>{business.get('about_text','')}</p>
        <div class="story-points">{''.join(story_rows)}</div>
      </article>
    </div>
  </section>
        """

    category_shortcuts_html = f'<div class="category-scroller">{"".join(category_shortcuts)}</div>' if show_category_shortcuts and category_shortcuts else ""
    filter_buttons_html = f'<div class="catalog-filters">{"".join(filter_buttons)}</div>' if show_catalog_filters and len(filter_buttons) > 1 else ""
    search_toolbar_html = ""
    if show_catalog_search:
        search_toolbar_html = f"""
          <div class="search-wrap">
            <input id="catalogSearch" class="catalog-search" type="text" placeholder="{catalog_placeholder}" />
            <button class="catalog-clear" type="button" id="catalogClear">{catalog_clear_label}</button>
          </div>
        """
    category_boards_html = f'<div class="menu-grid" id="catalogBoards">{"".join(menu_sections)}</div>' if show_category_boards and menu_sections else ""

    catalog_html = ""
    if show_catalog:
        catalog_html = f"""
  <section class="section editable-block" id="catalogo" data-editor-section="catalog">
    {edit_spot("catalog", "catalogo")}
    <div class="panel">
      <span class="section-kicker">{catalog_kicker}</span>
      <h2 class="section-title">{catalog_title}</h2>
      <p class="section-sub">{catalog_subtitle}</p>
      <div class="catalog-shell">
        {category_shortcuts_html}
        <div class="catalog-toolbar {'is-simple' if not show_catalog_search else ''}">
          {search_toolbar_html}
          <div class="catalog-summary">
            <span><strong id="catalogCount">{len(active_items)}</strong> <span id="catalogResultsLabel">{catalog_results_label}</span></span>
            <label class="catalog-sort-wrap">
              <span>{catalog_sort_label}</span>
              <select id="catalogSort" class="catalog-sort">
                <option value="default">Recomendado</option>
                <option value="name-asc">Nombre A-Z</option>
                <option value="price-asc">Precio menor</option>
                <option value="price-desc">Precio mayor</option>
              </select>
            </label>
          </div>
        </div>
        {filter_buttons_html}
        <div class="catalog-grid" id="catalogGrid">{''.join(catalog_cards)}</div>
        <div class="catalog-empty" id="catalogEmpty">{catalog_empty_message}</div>
        {category_boards_html}
      </div>
    </div>
  </section>
        """

    contact_html = ""
    if show_contact:
        contact_html = f"""
  <section class="section editable-block" id="contacto" data-editor-section="contact">
    {edit_spot("contact", "contacto")}
    <div class="panel">
      <span class="section-kicker">{contact_kicker}</span>
      <h2 class="section-title">{contact_title}</h2>
      <p class="section-sub">{contact_text}</p>
      <div class="contact-grid">
        <article class="contact-card">
          <div class="contact-list">
            <span><strong>Negocio:</strong> {business.get('name','')}</span>
            <span><strong>Ciudad:</strong> {business.get('city','')}</span>
            <span><strong>Direccion:</strong> {business.get('address','')}</span>
            <span><strong>Horario:</strong> {business.get('open_hours','')}</span>
            <span><strong>WhatsApp:</strong> +{business.get('whatsapp','')}</span>
          </div>
          <div class="contact-actions">
            <a class="btn primary" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">{contact_primary_cta_label}</a>
            <a class="btn ghost" href="{map_link}" target="_blank" rel="noopener noreferrer">{contact_secondary_cta_label}</a>
          </div>
        </article>
        <article class="schedule-card">
          <small>{announcement_badge}</small>
          <h3>{business.get('hero_subtitle','')}</h3>
          <p>{contact_text}</p>
          <p><strong>Nota:</strong> {business.get('order_note','')}</p>
        </article>
      </div>
    </div>
  </section>
        """

    faq_html = ""
    if show_faq and faq_rows:
        faq_html = f"""
  <section class="section editable-block" id="faq" data-editor-section="faq">
    {edit_spot("faq", "preguntas")}
    <div class="panel">
      <span class="section-kicker">{faq_kicker}</span>
      <h2 class="section-title">{faq_title}</h2>
      <div class="faq-grid">{''.join(faq_rows)}</div>
    </div>
  </section>
        """

    whatsapp_float_html = ""
    if show_whatsapp_float:
        whatsapp_float_html = f'<a class="whatsapp-float" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">{nav_cta_label}</a>'

    top_tools_html = ""
    if not standalone:
        top_tools_html = f"""
  <div class="top-tools">
    <a class="tool-btn" href="/">Volver al sistema</a>
    {top_tools_edit_link}
  </div>
        """

    hero_image = business.get("hero_image") or defaults["hero_image"]
    second_image = business.get("hero_secondary_image") or defaults["hero_secondary_image"]
    story_image = business.get("story_image") or defaults["story_image"]

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{seo_title}</title>
  <meta name="description" content="{seo_description}" />
  <meta property="og:title" content="{seo_title}" />
  <meta property="og:description" content="{seo_description}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="{hero_image}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {{
      --bg: {theme_background};
      --paper: {theme_surface};
      --paper-strong: {theme_surface_strong};
      --ink: {theme_text};
      --muted: {theme_muted};
      --line: {theme_line};
      --cocoa: {theme_text};
      --caramel: {theme_accent};
      --caramel-dark: {theme_accent_dark};
      --cream: {theme_soft};
      --olive: #495b4b;
      --max: min(1180px, 92%);
      --radius: 22px;
      --shadow: 0 24px 50px rgba(43, 28, 20, 0.12);
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      font-family: "Manrope", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at 0% 0%, #f7e2cc 0%, transparent 34%),
        radial-gradient(circle at 100% 0%, #efe4d7 0%, transparent 38%),
        var(--bg);
      line-height: 1.58;
    }}
    .rise {{ animation: rise .85s ease both; }}
    @keyframes rise {{
      from {{ opacity: 0; transform: translateY(18px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}
    .utility {{
      border-bottom: 1px solid rgba(227,207,188,.9);
      background: rgba(255,250,243,.82);
      backdrop-filter: blur(8px);
    }}
    .utility-inner, .top-tools, .nav, .hero, .section, .footer {{
      width: var(--max);
      margin-inline: auto;
    }}
    .utility-inner {{
      min-height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      padding: 8px 0;
    }}
    .utility-badges {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .utility-badge {{
      display: inline-flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,246,236,.95);
      border: 1px solid var(--line);
      color: #5f4a3d;
      font-size: .76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
    }}
    .utility-note {{
      color: var(--muted);
      font-size: .86rem;
      font-weight: 700;
      text-transform: none;
      letter-spacing: 0;
    }}
    .utility-side {{
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }}
    .utility-copy {{
      display: grid;
      gap: 2px;
      text-align: right;
    }}
    .utility-copy strong {{
      color: var(--caramel-dark);
      font-size: .76rem;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }}
    .utility-copy span {{
      color: var(--muted);
      font-size: .82rem;
      font-weight: 700;
    }}
    .utility-link {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: #fff;
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
      padding: 10px 14px;
      border-radius: 999px;
      font-size: .78rem;
      font-weight: 800;
      box-shadow: 0 10px 18px rgba(43, 28, 20, .12);
      white-space: nowrap;
    }}
    .top-tools {{
      margin-top: 18px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }}
    .tool-btn, .btn {{
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      border-radius: 999px;
    }}
    .tool-btn {{
      padding: 9px 12px;
      background: rgba(255,255,255,.75);
      border: 1px solid var(--line);
      color: #43362d;
      font-size: .8rem;
    }}
    .nav-wrap {{
      position: sticky;
      top: 0;
      z-index: 60;
      padding-top: 10px;
      background: linear-gradient(to bottom, rgba(245,237,226,.96), rgba(245,237,226,.78));
      backdrop-filter: blur(10px);
    }}
    .nav {{
      position: relative;
      min-height: 78px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border: 1px solid rgba(227,207,188,.95);
      background: rgba(255,250,243,.92);
      border-radius: 24px;
      padding: 14px 18px;
      box-shadow: 0 18px 34px rgba(43, 28, 20, 0.08);
    }}
    .brand {{
      color: inherit;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }}
    .brand-mark {{
      width: 54px;
      height: 54px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
      color: #fff;
      font-family: "Fraunces", serif;
      font-size: 1rem;
      box-shadow: 0 16px 28px rgba(184,103,54,.24);
      flex-shrink: 0;
    }}
    .brand-copy {{
      display: grid;
      gap: 2px;
      min-width: 0;
    }}
    .brand-copy small {{
      color: var(--caramel-dark);
      font-size: .68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .14em;
    }}
    .brand strong {{
      font-family: "Fraunces", serif;
      font-size: clamp(1.4rem, 2vw, 1.9rem);
      line-height: .98;
      letter-spacing: -.03em;
    }}
    .brand-copy span {{
      font-size: .8rem;
      font-weight: 700;
      color: var(--muted);
    }}
    .menu-toggle {{
      display: none;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--cocoa);
      border-radius: 999px;
      padding: 10px 14px;
      font-weight: 800;
      cursor: pointer;
    }}
    .nav-panel {{
      display: flex;
      align-items: center;
      gap: 18px;
      margin-left: auto;
    }}
    .nav-links {{
      display: flex;
      align-items: center;
      gap: 6px;
      color: #58493f;
      font-size: .83rem;
      font-weight: 800;
      background: rgba(242,229,212,.72);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 6px;
    }}
    .nav-links a {{
      color: inherit;
      text-decoration: none;
      padding: 10px 14px;
      border-radius: 999px;
      transition: background .22s ease, color .22s ease;
    }}
    .nav-links a:hover {{
      background: rgba(255,255,255,.86);
      color: var(--cocoa);
    }}
    .nav-cta {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-weight: 800;
      padding: 12px 16px;
      color: #fff;
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
      box-shadow: 0 10px 22px rgba(184,103,54,.28);
      border-radius: 14px;
      font-size: .84rem;
      white-space: nowrap;
    }}
    .hero {{
      display: grid;
      grid-template-columns: 1fr 1.05fr;
      gap: 14px;
      margin-top: 18px;
    }}
    .hero-copy {{
      background: var(--paper-strong);
      border: 1px solid var(--line);
      border-radius: 28px;
      box-shadow: var(--shadow);
      padding: 34px;
    }}
    .eyebrow {{
      display: inline-block;
      color: var(--caramel-dark);
      font-size: .74rem;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}
    h1 {{
      font-family: "Fraunces", serif;
      font-size: clamp(2.5rem, 5vw, 4.8rem);
      line-height: .9;
      letter-spacing: -.04em;
      max-width: 10ch;
      margin-bottom: 12px;
    }}
    .hero-copy p {{
      color: var(--muted);
      max-width: 54ch;
      margin-bottom: 18px;
    }}
    .hero-actions {{
      display: flex;
      gap: 9px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }}
    .btn {{
      padding: 11px 15px;
      border-radius: 12px;
      border: 1px solid transparent;
      font-size: .85rem;
    }}
    .btn.primary {{
      color: #fff;
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
    }}
    .btn.ghost {{
      color: #33271f;
      background: #fff;
      border-color: var(--line);
    }}
    .hero-chips {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }}
    .chip {{
      border-radius: 999px;
      padding: 7px 10px;
      background: var(--cream);
      border: 1px solid var(--line);
      color: #57463b;
      font-size: .75rem;
      font-weight: 800;
    }}
    .hero-meta {{
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      font-size: .9rem;
      color: #5f5147;
    }}
    .hero-meta strong {{ color: var(--ink); }}
    .meta-card {{
      padding: 16px;
      border-radius: 20px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.75);
    }}
    .meta-card small {{
      display: inline-block;
      margin-bottom: 6px;
      color: var(--caramel-dark);
      font-size: .72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }}
    .hero-visual {{
      display: grid;
      grid-template-columns: 1fr .44fr;
      gap: 12px;
    }}
    .hero-photo {{
      min-height: 560px;
      border-radius: 28px;
      overflow: hidden;
      position: relative;
      box-shadow: var(--shadow);
      background: #ddd center/cover no-repeat url('{hero_image}');
    }}
    .hero-photo::after {{
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(32,20,14,.58), rgba(32,20,14,.12));
    }}
    .hero-caption {{
      position: absolute;
      left: 20px;
      right: 20px;
      bottom: 18px;
      z-index: 1;
      color: #fff7ed;
    }}
    .hero-caption strong {{
      display: block;
      font-family: "Fraunces", serif;
      font-size: 1.42rem;
      margin-bottom: 4px;
    }}
    .hero-caption span {{
      font-size: .84rem;
      color: rgba(255,247,237,.88);
    }}
    .hero-stack {{
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 12px;
    }}
    .mini-photo {{
      min-height: 270px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: var(--shadow);
      background: #ddd center/cover no-repeat url('{second_image}');
    }}
    .note-card {{
      border-radius: 22px;
      border: 1px solid var(--line);
      background: linear-gradient(145deg, #fff5ea, #f3e6d6);
      padding: 18px;
      box-shadow: 0 18px 34px rgba(43, 28, 20, 0.08);
    }}
    .note-card small {{
      display: inline-block;
      margin-bottom: 7px;
      color: var(--caramel-dark);
      font-size: .72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .1em;
    }}
    .note-card h2 {{
      font-family: "Fraunces", serif;
      font-size: 1.45rem;
      line-height: .95;
      margin-bottom: 8px;
    }}
    .note-card p {{
      color: var(--muted);
      font-size: .88rem;
      margin-bottom: 12px;
    }}
    .section {{
      margin-top: 14px;
    }}
    .panel {{
      border-radius: 24px;
      border: 1px solid var(--line);
      background: var(--paper-strong);
      box-shadow: 0 18px 34px rgba(43, 28, 20, 0.08);
      padding: 24px;
    }}
    .panel.dark {{
      background: linear-gradient(160deg, #3c251a 0%, #2d1a13 100%);
      border-color: #6c4939;
      color: #f7eee4;
    }}
    .section-title {{
      font-family: "Fraunces", serif;
      font-size: clamp(2rem, 4vw, 3.2rem);
      line-height: .94;
      letter-spacing: -.03em;
      margin-bottom: 8px;
    }}
    .section-kicker {{
      display: inline-block;
      margin-bottom: 10px;
      color: var(--caramel-dark);
      font-size: .74rem;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }}
    .section-sub {{
      color: var(--muted);
      margin-bottom: 16px;
      max-width: 56ch;
    }}
    .panel.dark .section-sub {{
      color: rgba(247,238,228,.78);
    }}
    .featured-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }}
    .catalog-shell {{
      display: grid;
      gap: 16px;
    }}
    .category-scroller {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
    }}
    .category-shortcut {{
      text-align: left;
      padding: 16px;
      border-radius: 20px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(252,244,235,.9));
      cursor: pointer;
      color: inherit;
    }}
    .category-shortcut strong {{
      display: block;
      margin-bottom: 4px;
      font-size: .95rem;
    }}
    .category-shortcut span {{
      color: var(--muted);
      font-size: .82rem;
      font-weight: 700;
    }}
    .category-shortcut.active {{
      border-color: transparent;
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
      color: #fff;
      box-shadow: 0 12px 24px rgba(184,103,54,.24);
    }}
    .category-shortcut.active span {{
      color: rgba(255,255,255,.82);
    }}
    .catalog-toolbar {{
      display: grid;
      grid-template-columns: 1.2fr .8fr;
      gap: 12px;
      align-items: center;
    }}
    .catalog-toolbar.is-simple {{
      grid-template-columns: 1fr;
    }}
    .search-wrap {{
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
    }}
    .catalog-search {{
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 14px 16px;
      font-size: .92rem;
      background: #fff;
      color: var(--ink);
      box-shadow: inset 0 1px 0 rgba(0,0,0,.02);
    }}
    .catalog-clear {{
      border: 1px solid var(--line);
      background: #fff;
      color: var(--cocoa);
      border-radius: 999px;
      padding: 0 14px;
      font-size: .82rem;
      font-weight: 800;
      cursor: pointer;
    }}
    .catalog-summary {{
      color: var(--muted);
      font-size: .84rem;
      text-align: right;
      font-weight: 700;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      align-items: center;
    }}
    .catalog-summary strong {{
      color: var(--cocoa);
      font-size: 1rem;
    }}
    .catalog-sort-wrap {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }}
    .catalog-sort-wrap span {{
      font-size: .78rem;
      color: var(--muted);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }}
    .catalog-sort {{
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      border-radius: 999px;
      padding: 10px 12px;
      font-size: .8rem;
      font-weight: 800;
    }}
    .catalog-filters {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .catalog-filter {{
      border: 1px solid var(--line);
      background: #fff;
      color: #4d3d33;
      border-radius: 999px;
      padding: 10px 12px;
      font-size: .8rem;
      font-weight: 800;
      cursor: pointer;
      transition: background .22s ease, color .22s ease, border-color .22s ease;
    }}
    .catalog-filter.active {{
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
      color: #fff;
      border-color: transparent;
    }}
    .catalog-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 12px;
    }}
    .catalog-card {{
      display: flex;
      flex-direction: column;
      border-radius: 20px;
      border: 1px solid var(--line);
      background: #fff;
      box-shadow: 0 14px 28px rgba(43, 28, 20, 0.06);
      overflow: hidden;
    }}
    .catalog-image {{
      height: 180px;
      background-size: cover;
      background-position: center;
    }}
    .catalog-copy {{
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      flex: 1;
    }}
    .catalog-category {{
      display: inline-block;
      width: fit-content;
      border-radius: 999px;
      background: var(--cream);
      border: 1px solid var(--line);
      color: #6f5543;
      padding: 6px 9px;
      font-size: .68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }}
    .catalog-badge {{
      display: inline-block;
      width: fit-content;
      border-radius: 999px;
      background: rgba(184,103,54,.12);
      color: var(--caramel-dark);
      padding: 5px 9px;
      font-size: .68rem;
      font-weight: 900;
      letter-spacing: .04em;
    }}
    .catalog-copy h3 {{
      font-size: 1rem;
      line-height: 1.2;
    }}
    .catalog-copy p {{
      color: var(--muted);
      font-size: .86rem;
      flex: 1;
    }}
    .catalog-foot {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-top: 2px;
    }}
    .catalog-foot strong {{
      color: var(--caramel-dark);
      font-size: .95rem;
    }}
    .catalog-link {{
      text-decoration: none;
      color: var(--cocoa);
      background: #fff6ec;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px 11px;
      font-size: .78rem;
      font-weight: 800;
    }}
    .catalog-empty {{
      display: none;
      border: 1px dashed var(--line);
      border-radius: 18px;
      padding: 20px;
      text-align: center;
      color: var(--muted);
      background: #fffaf4;
    }}
    .carousel-head {{
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }}
    .carousel-controls {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .carousel-btn {{
      border: 1px solid var(--line);
      background: #fff;
      color: #4a3b31;
      border-radius: 999px;
      padding: 10px 13px;
      font-size: .8rem;
      font-weight: 800;
      cursor: pointer;
    }}
    .cake-carousel {{
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(260px, 32%);
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      padding-bottom: 2px;
    }}
    .cake-carousel::-webkit-scrollbar {{
      display: none;
    }}
    .cake-slide {{
      min-height: 360px;
      border-radius: 22px;
      overflow: hidden;
      position: relative;
      background-size: cover;
      background-position: center;
      scroll-snap-align: start;
      box-shadow: var(--shadow);
    }}
    .cake-slide::after {{
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(34,22,16,.66), rgba(34,22,16,.08));
    }}
    .cake-overlay {{
      position: absolute;
      left: 18px;
      right: 18px;
      bottom: 16px;
      z-index: 1;
      color: #fff7ef;
    }}
    .cake-overlay small {{
      display: inline-block;
      margin-bottom: 6px;
      font-size: .72rem;
      text-transform: uppercase;
      letter-spacing: .12em;
      font-weight: 800;
      color: rgba(255,247,239,.84);
    }}
    .cake-overlay strong {{
      display: block;
      font-family: "Fraunces", serif;
      font-size: 1.6rem;
      line-height: .95;
    }}
    .product-card {{
      border-radius: 18px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, #fff9f2 0%, #ffffff 100%);
      padding: 16px;
      box-shadow: 0 14px 28px rgba(43, 28, 20, 0.06);
    }}
    .product-image {{
      height: 180px;
      border-radius: 14px;
      background-size: cover;
      background-position: center;
      margin-bottom: 12px;
      box-shadow: inset 0 -40px 60px rgba(0,0,0,.08);
    }}
    .product-badge {{
      display: inline-block;
      margin-bottom: 10px;
      border-radius: 999px;
      padding: 6px 9px;
      background: var(--cream);
      border: 1px solid var(--line);
      color: #725544;
      font-size: .68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }}
    .product-card h3 {{
      font-size: 1.05rem;
      margin-bottom: 5px;
    }}
    .product-card p {{
      color: var(--muted);
      font-size: .88rem;
      margin-bottom: 12px;
      min-height: 52px;
    }}
    .product-meta {{
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
    }}
    .product-meta small {{
      color: #7b6658;
      font-size: .78rem;
      font-weight: 700;
    }}
    .product-meta strong {{
      color: var(--caramel-dark);
      font-size: .96rem;
    }}
    .product-meta-right {{
      display: grid;
      justify-items: end;
      gap: 4px;
    }}
    .product-meta-right a {{
      text-decoration: none;
      color: var(--cocoa);
      font-size: .78rem;
      font-weight: 800;
    }}
    .story-grid {{
      display: grid;
      grid-template-columns: .94fr 1.06fr;
      gap: 14px;
      align-items: stretch;
    }}
    .story-photo {{
      min-height: 360px;
      border-radius: 24px;
      box-shadow: var(--shadow);
      background: #ddd center/cover no-repeat url('{story_image}');
    }}
    .story-copy {{
      border-radius: 24px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, #fff9f2 0%, #fffdf9 100%);
      padding: 24px;
    }}
    .story-copy p {{
      color: var(--muted);
      margin-bottom: 14px;
    }}
    .story-points {{
      display: grid;
      gap: 10px;
    }}
    .story-points span {{
      border-left: 3px solid var(--caramel);
      padding-left: 10px;
      color: #4e3d33;
      font-size: .88rem;
      font-weight: 700;
    }}
    .menu-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }}
    .menu-board {{
      border-radius: 18px;
      border: 1px solid rgba(255,245,234,.18);
      background:
        linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01)),
        #3d251a;
      padding: 16px;
      box-shadow: 0 20px 36px rgba(43, 28, 20, 0.18);
    }}
    .menu-board small {{
      display: inline-block;
      color: rgba(247,238,228,.72);
      font-size: .68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .1em;
      margin-bottom: 5px;
    }}
    .menu-board h3 {{
      font-family: "Fraunces", serif;
      font-size: 1.32rem;
      color: #fff5ea;
      margin-bottom: 10px;
    }}
    .menu-item {{
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,245,234,.12);
    }}
    .menu-item:last-child {{
      border-bottom: none;
    }}
    .menu-thumb {{
      width: 74px;
      height: 74px;
      flex-shrink: 0;
      border-radius: 14px;
      background-size: cover;
      background-position: center;
      border: 1px solid rgba(255,245,234,.18);
    }}
    .menu-copy h4 {{
      font-size: .92rem;
      color: #fff5ea;
      margin-bottom: 2px;
    }}
    .menu-copy p {{
      color: rgba(255,245,234,.74);
      font-size: .82rem;
      max-width: 24ch;
      margin-bottom: 4px;
    }}
    .menu-copy small {{
      display: inline-block;
      color: rgba(255,216,186,.82);
      font-size: .7rem;
      text-transform: uppercase;
      letter-spacing: .08em;
      font-weight: 800;
    }}
    .menu-item strong {{
      color: #ffd8ba;
      white-space: nowrap;
      font-size: .9rem;
    }}
    .contact-grid {{
      display: grid;
      grid-template-columns: 1fr .86fr;
      gap: 14px;
    }}
    .contact-card, .schedule-card, .faq-card {{
      border-radius: 18px;
      border: 1px solid var(--line);
      padding: 18px;
    }}
    .contact-card {{
      background: #fff;
    }}
    .schedule-card {{
      background: linear-gradient(145deg, #f4e6d6, #efe1d2);
    }}
    .contact-list {{
      display: grid;
      gap: 8px;
      color: #594c41;
      font-size: .92rem;
    }}
    .contact-list strong {{ color: var(--ink); }}
    .contact-actions {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 14px;
    }}
    .schedule-card small {{
      display: inline-block;
      margin-bottom: 7px;
      color: var(--caramel-dark);
      font-size: .72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .1em;
    }}
    .schedule-card h3 {{
      font-family: "Fraunces", serif;
      font-size: 1.4rem;
      line-height: .96;
      margin-bottom: 8px;
    }}
    .schedule-card p {{
      color: #5f5147;
      margin-bottom: 10px;
      font-size: .88rem;
    }}
    .faq-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }}
    .faq-card {{
      background: #fff;
    }}
    .faq-card h4 {{
      font-size: .95rem;
      margin-bottom: 6px;
    }}
    .faq-card p {{
      color: var(--muted);
      font-size: .86rem;
    }}
    .footer {{
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      color: #6e5b4c;
      font-size: .82rem;
      margin-top: 12px;
      margin-bottom: 28px;
    }}
    .whatsapp-float {{
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 80;
      color: #fff;
      text-decoration: none;
      border-radius: 999px;
      padding: 13px 16px;
      background: linear-gradient(145deg, #20b26e, #148952);
      font-size: .85rem;
      font-weight: 800;
      box-shadow: 0 18px 30px rgba(20,137,82,.26);
    }}
    body.edit-mode {{
      padding-top: 84px;
    }}
    .visual-editor-bar {{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 140;
      background: rgba(41, 28, 21, .94);
      color: #fff5ea;
      border-bottom: 1px solid rgba(255,255,255,.08);
      backdrop-filter: blur(10px);
    }}
    .visual-editor-inner {{
      width: min(1280px, 94%);
      margin: 0 auto;
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 12px 0;
      flex-wrap: wrap;
    }}
    .visual-editor-copy {{
      display: grid;
      gap: 4px;
    }}
    .visual-editor-copy strong {{
      font-size: .95rem;
      letter-spacing: .04em;
      text-transform: uppercase;
    }}
    .visual-editor-copy span {{
      color: rgba(255,245,234,.78);
      font-size: .86rem;
    }}
    .visual-editor-actions {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }}
    .visual-btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 999px;
      padding: 10px 14px;
      font-size: .82rem;
      font-weight: 800;
      cursor: pointer;
      color: inherit;
      background: rgba(255,255,255,.08);
    }}
    .visual-btn.primary {{
      border-color: transparent;
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
      color: #fff;
    }}
    .visual-btn.ghost {{
      background: rgba(255,255,255,.06);
      color: #fff5ea;
    }}
    .editable-block {{
      position: relative;
    }}
    body.edit-mode .editable-block {{
      outline: 2px dashed transparent;
      outline-offset: 8px;
      transition: outline-color .18s ease, transform .18s ease;
    }}
    body.edit-mode .editable-block:hover {{
      outline-color: rgba(184,103,54,.58);
    }}
    .edit-spot {{
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 30;
      border: none;
      border-radius: 999px;
      padding: 9px 12px;
      background: rgba(41, 28, 21, .9);
      color: #fff5ea;
      font-size: .78rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 12px 20px rgba(41, 28, 21, .18);
      opacity: 0;
      transform: translateY(-4px);
      transition: opacity .18s ease, transform .18s ease;
    }}
    body.edit-mode .editable-block:hover .edit-spot,
    body.edit-mode .editable-block .edit-spot:focus-visible {{
      opacity: 1;
      transform: translateY(0);
    }}
    .visual-editor-drawer {{
      position: fixed;
      inset: 0;
      z-index: 150;
      pointer-events: none;
      opacity: 0;
      transition: opacity .22s ease;
    }}
    .visual-editor-drawer.is-open {{
      pointer-events: auto;
      opacity: 1;
    }}
    .visual-editor-backdrop {{
      position: absolute;
      inset: 0;
      background: rgba(26, 17, 12, .28);
    }}
    .visual-editor-panel {{
      position: absolute;
      top: 0;
      right: 0;
      width: min(460px, 100%);
      height: 100%;
      background: #fffdf9;
      border-left: 1px solid var(--line);
      box-shadow: -24px 0 50px rgba(43, 28, 20, .14);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform .22s ease;
    }}
    .visual-editor-drawer.is-open .visual-editor-panel {{
      transform: translateX(0);
    }}
    .visual-editor-head,
    .visual-editor-foot {{
      padding: 18px;
      border-bottom: 1px solid var(--line);
      background: #fffaf4;
    }}
    .visual-editor-head {{
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }}
    .visual-editor-head small {{
      display: inline-block;
      margin-bottom: 5px;
      color: var(--caramel-dark);
      font-size: .72rem;
      text-transform: uppercase;
      letter-spacing: .12em;
      font-weight: 800;
    }}
    .visual-editor-head h3 {{
      font-family: "Fraunces", serif;
      font-size: 1.5rem;
      line-height: .95;
      margin-bottom: 4px;
    }}
    .visual-editor-head p,
    .visual-editor-foot span {{
      color: var(--muted);
      font-size: .86rem;
    }}
    .visual-editor-nav {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 14px 18px 0;
    }}
    .visual-editor-tab {{
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: .78rem;
      font-weight: 800;
      cursor: pointer;
    }}
    .visual-editor-tab.is-active {{
      color: #fff;
      border-color: transparent;
      background: linear-gradient(145deg, var(--caramel), var(--caramel-dark));
      box-shadow: 0 10px 18px rgba(43, 28, 20, .12);
    }}
    .visual-editor-body {{
      flex: 1;
      overflow: auto;
      padding: 18px;
      display: grid;
      gap: 12px;
    }}
    .editor-field {{
      display: grid;
      gap: 6px;
    }}
    .editor-field label {{
      font-size: .82rem;
      font-weight: 800;
      color: #503d31;
    }}
    .editor-field input,
    .editor-field textarea,
    .editor-field select {{
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 11px 12px;
      font: inherit;
      background: #fff;
      color: var(--ink);
    }}
    .editor-field textarea {{
      min-height: 92px;
      resize: vertical;
    }}
    .editor-toggle {{
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 12px;
    }}
    .editor-toggle span {{
      font-size: .82rem;
      font-weight: 800;
      color: #503d31;
    }}
    .editor-toggle input[type="checkbox"] {{
      width: 20px;
      height: 20px;
      accent-color: var(--caramel);
    }}
    .editor-color-row {{
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 10px;
      align-items: center;
    }}
    .editor-color-row input[type="color"] {{
      padding: 4px;
      min-height: 46px;
    }}
    .editor-group {{
      border: 1px solid var(--line);
      border-radius: 18px;
      background: #fff;
      padding: 14px;
      display: grid;
      gap: 10px;
    }}
    .editor-group h4 {{
      font-size: .95rem;
    }}
    .editor-rows {{
      display: grid;
      gap: 10px;
    }}
    .editor-row-card {{
      border: 1px solid var(--line);
      border-radius: 16px;
      background: #fffdf9;
      padding: 12px;
      display: grid;
      gap: 10px;
    }}
    .editor-row-card.is-focus {{
      border-color: var(--caramel);
      box-shadow: 0 0 0 3px rgba(184,103,54,.14);
    }}
    .editor-row-actions {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .editor-row-actions button {{
      border: 1px solid var(--line);
      background: #fff;
      color: var(--cocoa);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: .78rem;
      font-weight: 800;
      cursor: pointer;
    }}
    .editor-add-btn {{
      border: 1px dashed var(--line);
      background: #fff7ee;
      color: var(--cocoa);
      border-radius: 14px;
      padding: 11px 12px;
      font-size: .82rem;
      font-weight: 800;
      cursor: pointer;
    }}
    .editor-image-wrap {{
      display: grid;
      gap: 8px;
    }}
    .editor-image-preview {{
      width: 100%;
      min-height: 160px;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: #f2e6d8 center/cover no-repeat;
      overflow: hidden;
      position: relative;
    }}
    .editor-image-preview.is-empty {{
      display: grid;
      place-items: center;
      color: var(--muted);
      font-size: .82rem;
      text-align: center;
      padding: 20px;
      background-image: linear-gradient(135deg, rgba(184,103,54,.08), rgba(65,39,28,.05));
    }}
    .editor-upload-inline {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }}
    .editor-upload-inline input[type="file"] {{
      width: auto;
      max-width: 100%;
      border: 1px dashed var(--line);
      border-radius: 12px;
      padding: 8px;
      background: #fff8f0;
      font-size: .8rem;
    }}
    .editor-inline-help {{
      color: var(--muted);
      font-size: .78rem;
    }}
    @media (max-width: 980px) {{
      .hero,
      .story-grid,
      .contact-grid {{
        grid-template-columns: 1fr;
      }}
      .hero-meta {{
        grid-template-columns: 1fr;
      }}
      .catalog-toolbar {{
        grid-template-columns: 1fr;
      }}
      .catalog-summary {{
        text-align: left;
        justify-content: flex-start;
      }}
      .hero-visual {{
        grid-template-columns: 1fr;
      }}
      .hero-photo {{
        min-height: 420px;
      }}
      .hero-stack {{
        grid-template-columns: 1fr 1fr;
        grid-template-rows: none;
      }}
      .cake-carousel {{
        grid-auto-columns: minmax(260px, 68%);
      }}
    }}
    @media (max-width: 920px) {{
      .menu-toggle {{
        display: inline-flex;
      }}
      .nav {{
        border-radius: 24px;
      }}
      .nav-panel {{
        display: none;
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 10px);
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        padding: 14px;
        border-radius: 22px;
        border: 1px solid var(--line);
        background: rgba(255,250,243,.98);
        box-shadow: 0 18px 34px rgba(43, 28, 20, 0.1);
      }}
      .nav-panel.is-open {{
        display: flex;
      }}
      .nav-links {{
        flex-direction: column;
        align-items: stretch;
        border-radius: 18px;
      }}
      .nav-cta {{
        width: 100%;
        justify-content: center;
      }}
    }}
    @media (max-width: 760px) {{
      body.edit-mode {{
        padding-top: 112px;
      }}
      .utility-copy {{
        text-align: left;
      }}
      .utility-side {{
        justify-content: flex-start;
      }}
      .hero-copy,
      .panel,
      .story-copy,
      .contact-card,
      .schedule-card,
      .note-card {{
        padding: 18px;
      }}
      .hero-stack {{
        grid-template-columns: 1fr;
      }}
      .search-wrap {{
        grid-template-columns: 1fr;
      }}
      .carousel-head {{
        flex-direction: column;
        align-items: flex-start;
      }}
      .cake-carousel {{
        grid-auto-columns: 88%;
      }}
      .brand {{
        max-width: calc(100% - 82px);
      }}
      .menu-item {{
        align-items: flex-start;
      }}
      .menu-thumb {{
        width: 64px;
        height: 64px;
      }}
      .footer {{
        flex-direction: column;
      }}
      .visual-editor-panel {{
        width: 100%;
      }}
    }}
  </style>
</head>
<body{body_class}>
  {edit_toolbar}
  {announcement_html}
  {top_tools_html}

  <div class="nav-wrap editable-block" data-editor-section="brand">
    {edit_spot("brand", "marca")}
    <nav class="nav">
      <a class="brand" href="#inicio">
        <span class="brand-mark">{brand_initials}</span>
        <span class="brand-copy">
          <small>{brand_tagline}</small>
          <strong>{business['name']}</strong>
          <span>{business.get('city','')}</span>
        </span>
      </a>
      <button class="menu-toggle" type="button" id="menuToggle" aria-expanded="false" aria-controls="navPanel">Menu</button>
      <div class="nav-panel" id="navPanel">
        <div class="nav-links">{''.join(nav_links)}</div>
        <a class="nav-cta" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">{nav_cta_label}</a>
      </div>
    </nav>
  </div>

  <header class="hero editable-block" id="inicio" data-editor-section="hero">
    {edit_spot("hero", "hero")}
    <section class="hero-copy rise">
      <span class="eyebrow">{hero_badge}</span>
      <h1>{business['hero_title']}</h1>
      <p>{business.get('short_description', business.get('hero_subtitle',''))}</p>
      <div class="hero-actions">
        <a class="btn primary" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">{hero_primary_cta_label}</a>
        <a class="btn ghost" href="{map_link}" target="_blank" rel="noopener noreferrer">{hero_secondary_cta_label}</a>
      </div>
      <div class="hero-chips">{''.join(hero_chip_rows)}</div>
      <div class="hero-meta">
        <article class="meta-card">
          <small>{meta_label_address}</small>
          <strong>{business.get('address','')}</strong>
        </article>
        <article class="meta-card">
          <small>{meta_label_hours}</small>
          <strong>{business.get('open_hours','')}</strong>
        </article>
        <article class="meta-card">
          <small>{meta_label_orders}</small>
          <strong>{business.get('order_note','')}</strong>
        </article>
      </div>
    </section>

    <section class="hero-visual rise" style="animation-delay:.08s">
      <article class="hero-photo">
        <div class="hero-caption">
          <strong>{hero_caption_title}</strong>
          <span>{hero_caption_text}</span>
        </div>
      </article>
      <div class="hero-stack">
        <article class="mini-photo"></article>
        <article class="note-card">
          <small>{hero_note_label}</small>
          <h2>{hero_note_title}</h2>
          <p>{hero_note_text}</p>
          <a class="btn primary" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">{hero_note_cta_label}</a>
        </article>
      </div>
    </section>
  </header>

  {featured_html}
  {cakes_html}
  {story_html}
  {catalog_html}
  {contact_html}
  {faq_html}

  <footer class="footer">
    <span>{business['name']} - {business.get('city','')}</span>
    <span>{footer_note}</span>
  </footer>

  {whatsapp_float_html}
  <script>
    const menuToggle = document.getElementById('menuToggle');
    const navPanel = document.getElementById('navPanel');
    const navLinks = [...document.querySelectorAll('.nav-links a')];
    const catalogSearch = document.getElementById('catalogSearch');
    const catalogGrid = document.getElementById('catalogGrid');
    const catalogBoards = document.getElementById('catalogBoards');
    const catalogCount = document.getElementById('catalogCount');
    const catalogEmpty = document.getElementById('catalogEmpty');
    const catalogClear = document.getElementById('catalogClear');
    const catalogSort = document.getElementById('catalogSort');
    const catalogFilters = [...document.querySelectorAll('.catalog-filter')];
    const categoryShortcuts = [...document.querySelectorAll('.category-shortcut')];
    const catalogCards = [...document.querySelectorAll('.catalog-card')];
    let activeFilter = 'all';
    const visualEditEnabled = {str(editor_enabled).lower()};
    const initialBusinessData = {editor_json};
    let draftBusiness = visualEditEnabled ? JSON.parse(JSON.stringify(initialBusinessData)) : null;
    let activeEditorSection = null;
    let activeEditorMeta = {{}};
    let hasUnsavedChanges = false;
    const editorDrawer = document.getElementById('visualEditorDrawer');
    const editorBackdrop = document.getElementById('visualEditorBackdrop');
    const editorBody = document.getElementById('editorPanelBody');
    const editorTitle = document.getElementById('editorPanelTitle');
    const editorHint = document.getElementById('editorPanelHint');
    const editorStatus = document.getElementById('editorPanelStatus');
    const editorCloseBtn = document.getElementById('editorCloseBtn');
    const editorCancelBtn = document.getElementById('editorCancelBtn');
    const editorSaveBtn = document.getElementById('editorSaveBtn');
    const openAdvancedEditor = document.getElementById('openAdvancedEditor');
    const pageEditorSave = document.getElementById('pageEditorSave');
    const editorNav = document.getElementById('editorPanelNav');
    const editableBlocks = visualEditEnabled ? [...document.querySelectorAll('[data-editor-section]')] : [];
    const saveKeys = [
      'name',
      'category',
      'city',
      'address',
      'open_hours',
      'order_note',
      'whatsapp',
      'hero_title',
      'short_description',
      'hero_subtitle',
      'about_text',
      'map_query',
      'brand_tagline',
      'announcement_badge',
      'announcement_text',
      'announcement_cta_label',
      'hero_badge',
      'nav_label_home',
      'nav_label_featured',
      'nav_label_cakes',
      'nav_label_story',
      'nav_label_catalog',
      'nav_label_contact',
      'nav_label_faq',
      'nav_cta_label',
      'utility_badges',
      'hero_highlights',
      'hero_image',
      'hero_secondary_image',
      'hero_primary_cta_label',
      'hero_secondary_cta_label',
      'hero_note_cta_label',
      'hero_caption_title',
      'hero_caption_text',
      'hero_note_label',
      'hero_note_title',
      'hero_note_text',
      'meta_label_address',
      'meta_label_hours',
      'meta_label_orders',
      'story_image',
      'story_kicker',
      'story_title',
      'story_points',
      'featured_kicker',
      'featured_title',
      'featured_subtitle',
      'cakes_kicker',
      'cakes_title',
      'cakes_subtitle',
      'cake_gallery',
      'catalog_kicker',
      'catalog_title',
      'catalog_subtitle',
      'catalog_placeholder',
      'catalog_clear_label',
      'catalog_empty_message',
      'catalog_sort_label',
      'catalog_results_label',
      'contact_kicker',
      'contact_title',
      'contact_text',
      'contact_primary_cta_label',
      'contact_secondary_cta_label',
      'faq_kicker',
      'faq_title',
      'footer_note',
      'seo_title',
      'seo_description',
      'show_announcement',
      'show_featured',
      'show_cakes',
      'show_story',
      'show_catalog',
      'show_contact',
      'show_faq',
      'show_category_shortcuts',
      'show_catalog_filters',
      'show_catalog_search',
      'show_category_boards',
      'show_whatsapp_float',
      'featured_limit',
      'theme_preset',
      'theme_background',
      'theme_surface',
      'theme_surface_strong',
      'theme_text',
      'theme_muted',
      'theme_line',
      'theme_soft',
      'theme_accent',
      'theme_accent_dark',
      'faq',
      'items_label',
      'items'
    ];

    if (menuToggle && navPanel) {{
      menuToggle.addEventListener('click', () => {{
        const isOpen = navPanel.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }});
      navLinks.forEach((link) => {{
        link.addEventListener('click', () => {{
          navPanel.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }});
      }});
    }}

    function applyCatalogFilters() {{
      const term = (catalogSearch?.value || '').trim().toLowerCase();
      let visible = 0;

      catalogCards.forEach((card) => {{
        const searchText = card.dataset.search || '';
        const category = card.dataset.category || '';
        const matchesSearch = !term || searchText.includes(term);
        const matchesFilter = activeFilter === 'all' || category === activeFilter;
        const show = matchesSearch && matchesFilter;
        card.style.display = show ? 'flex' : 'none';
        if (show) {{
          visible += 1;
        }}
      }});

      if (catalogCount) {{
        catalogCount.textContent = String(visible);
      }}
      if (catalogEmpty) {{
        catalogEmpty.style.display = visible === 0 ? 'block' : 'none';
      }}
      if (catalogBoards) {{
        const hasInteractiveFiltering = Boolean(term) || activeFilter !== 'all';
        catalogBoards.style.display = hasInteractiveFiltering ? 'none' : 'grid';
      }}
    }}

    function parsePriceValue(rawValue) {{
      const cleaned = String(rawValue || '')
        .replace(/cotizar/ig, '')
        .replace(/\\s+/g, '')
        .replace(/\\./g, '')
        .replace(',', '.')
        .replace(/[^\\d.-]/g, '');
      const parsed = Number.parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }}

    function applyCatalogSort() {{
      if (!catalogGrid || !catalogSort) {{
        return;
      }}
      const direction = catalogSort.value || 'default';
      const sorted = [...catalogCards].sort((a, b) => {{
        if (direction === 'name-asc') {{
          return (a.dataset.name || '').localeCompare(b.dataset.name || '', 'es');
        }}
        if (direction === 'price-asc') {{
          return parsePriceValue(a.dataset.price) - parsePriceValue(b.dataset.price);
        }}
        if (direction === 'price-desc') {{
          return parsePriceValue(b.dataset.price) - parsePriceValue(a.dataset.price);
        }}
        return Number(a.dataset.editorItemIndex || '0') - Number(b.dataset.editorItemIndex || '0');
      }});
      sorted.forEach((card) => catalogGrid.appendChild(card));
    }}

    function syncFilterState() {{
      catalogFilters.forEach((item) => item.classList.toggle('active', (item.dataset.filter || 'all') === activeFilter));
      categoryShortcuts.forEach((item) => item.classList.toggle('active', (item.dataset.filter || 'all') === activeFilter && activeFilter !== 'all'));
    }}

    function setFilter(nextFilter) {{
      activeFilter = nextFilter || 'all';
      syncFilterState();
      applyCatalogSort();
      applyCatalogFilters();
    }}

    if (catalogSearch) {{
      catalogSearch.addEventListener('input', applyCatalogFilters);
    }}

    if (catalogClear) {{
      catalogClear.addEventListener('click', () => {{
        if (catalogSearch) {{
          catalogSearch.value = '';
        }}
        setFilter('all');
      }});
    }}

    catalogFilters.forEach((button) => {{
      button.addEventListener('click', () => setFilter(button.dataset.filter || 'all'));
    }});

    categoryShortcuts.forEach((button) => {{
      button.addEventListener('click', () => setFilter(button.dataset.filter || 'all'));
    }});

    if (catalogSort) {{
      catalogSort.addEventListener('change', () => {{
        applyCatalogSort();
        applyCatalogFilters();
      }});
    }}

    syncFilterState();
    applyCatalogSort();
    applyCatalogFilters();

    const cakeCarousel = document.getElementById('cakeCarousel');
    const cakesPrev = document.getElementById('cakesPrev');
    const cakesNext = document.getElementById('cakesNext');

    if (cakeCarousel && cakesPrev && cakesNext) {{
      const scrollAmount = () => Math.max(280, Math.floor(cakeCarousel.clientWidth * 0.82));

      cakesPrev.addEventListener('click', () => {{
        cakeCarousel.scrollBy({{ left: -scrollAmount(), behavior: 'smooth' }});
      }});

      cakesNext.addEventListener('click', () => {{
        cakeCarousel.scrollBy({{ left: scrollAmount(), behavior: 'smooth' }});
      }});
    }}

    function escapeHtml(value) {{
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }}

    const sectionConfigs = {{
      brand: {{
        title: 'Marca y negocio',
        hint: 'Controla nombre, ubicacion, datos de contacto y textos base de la marca.',
        fields: [
          {{ key: 'name', label: 'Nombre del negocio', type: 'text' }},
          {{ key: 'brand_tagline', label: 'Subtitulo de marca', type: 'text' }},
          {{ key: 'city', label: 'Ciudad', type: 'text' }},
          {{ key: 'address', label: 'Direccion', type: 'text' }},
          {{ key: 'open_hours', label: 'Horario', type: 'text' }},
          {{ key: 'whatsapp', label: 'WhatsApp', type: 'text' }},
          {{ key: 'order_note', label: 'Nota de pedidos', type: 'text' }},
          {{ key: 'map_query', label: 'Texto del mapa', type: 'text' }},
          {{ key: 'utility_badges', label: 'Etiquetas superiores', type: 'list' }},
          {{ key: 'footer_note', label: 'Texto final del footer', type: 'text' }}
        ]
      }},
      navigation: {{
        title: 'Navegacion y botones',
        hint: 'Cambia la franja superior, nombres del menu y textos de los botones principales.',
        fields: [
          {{ key: 'announcement_badge', label: 'Etiqueta superior', type: 'text' }},
          {{ key: 'announcement_text', label: 'Texto superior', type: 'textarea' }},
          {{ key: 'announcement_cta_label', label: 'Boton superior', type: 'text' }},
          {{ key: 'nav_label_home', label: 'Menu inicio', type: 'text' }},
          {{ key: 'nav_label_featured', label: 'Menu destacados', type: 'text' }},
          {{ key: 'nav_label_cakes', label: 'Menu tortas', type: 'text' }},
          {{ key: 'nav_label_story', label: 'Menu nosotros', type: 'text' }},
          {{ key: 'nav_label_catalog', label: 'Menu catalogo', type: 'text' }},
          {{ key: 'nav_label_contact', label: 'Menu contacto', type: 'text' }},
          {{ key: 'nav_label_faq', label: 'Menu FAQ', type: 'text' }},
          {{ key: 'nav_cta_label', label: 'Boton principal del menu', type: 'text' }},
          {{ key: 'hero_primary_cta_label', label: 'Boton principal del hero', type: 'text' }},
          {{ key: 'hero_secondary_cta_label', label: 'Boton secundario del hero', type: 'text' }},
          {{ key: 'hero_note_cta_label', label: 'Boton del bloque lateral', type: 'text' }},
          {{ key: 'contact_primary_cta_label', label: 'Boton de contacto', type: 'text' }},
          {{ key: 'contact_secondary_cta_label', label: 'Boton del mapa', type: 'text' }},
          {{ key: 'meta_label_address', label: 'Etiqueta direccion', type: 'text' }},
          {{ key: 'meta_label_hours', label: 'Etiqueta horario', type: 'text' }},
          {{ key: 'meta_label_orders', label: 'Etiqueta pedidos', type: 'text' }}
        ]
      }},
      appearance: {{
        title: 'Apariencia',
        hint: 'Personaliza colores generales para adaptar la web a cada negocio sin tocar codigo.',
        fields: [
          {{ key: 'theme_preset', label: 'Paleta base', type: 'select', options: [
            {{ value: 'artesanal', label: 'Artesanal calido' }},
            {{ value: 'premium', label: 'Premium cafe' }},
            {{ value: 'claro', label: 'Claro elegante' }}
          ] }},
          {{ key: 'theme_background', label: 'Fondo general', type: 'color' }},
          {{ key: 'theme_surface', label: 'Fondo de paneles', type: 'color' }},
          {{ key: 'theme_surface_strong', label: 'Fondo claro intenso', type: 'color' }},
          {{ key: 'theme_text', label: 'Color de texto', type: 'color' }},
          {{ key: 'theme_muted', label: 'Texto secundario', type: 'color' }},
          {{ key: 'theme_line', label: 'Bordes', type: 'color' }},
          {{ key: 'theme_soft', label: 'Color suave', type: 'color' }},
          {{ key: 'theme_accent', label: 'Color principal', type: 'color' }},
          {{ key: 'theme_accent_dark', label: 'Color principal oscuro', type: 'color' }}
        ]
      }},
      layout: {{
        title: 'Secciones y estructura',
        hint: 'Activa u oculta bloques completos para crear versiones mas simples o mas completas.',
        fields: [
          {{ key: 'featured_limit', label: 'Cantidad de destacados', type: 'number' }},
          {{ key: 'show_announcement', label: 'Mostrar franja superior', type: 'toggle' }},
          {{ key: 'show_featured', label: 'Mostrar destacados', type: 'toggle' }},
          {{ key: 'show_cakes', label: 'Mostrar tortas', type: 'toggle' }},
          {{ key: 'show_story', label: 'Mostrar nosotros', type: 'toggle' }},
          {{ key: 'show_catalog', label: 'Mostrar catalogo', type: 'toggle' }},
          {{ key: 'show_contact', label: 'Mostrar contacto', type: 'toggle' }},
          {{ key: 'show_faq', label: 'Mostrar FAQ', type: 'toggle' }},
          {{ key: 'show_category_shortcuts', label: 'Mostrar accesos por categoria', type: 'toggle' }},
          {{ key: 'show_catalog_filters', label: 'Mostrar filtros del catalogo', type: 'toggle' }},
          {{ key: 'show_catalog_search', label: 'Mostrar buscador', type: 'toggle' }},
          {{ key: 'show_category_boards', label: 'Mostrar vitrina por categorias', type: 'toggle' }},
          {{ key: 'show_whatsapp_float', label: 'Mostrar boton flotante', type: 'toggle' }}
        ]
      }},
      hero: {{
        title: 'Portada principal',
        hint: 'Edita el mensaje principal, imagenes y llamados a la accion de la portada.',
        fields: [
          {{ key: 'hero_badge', label: 'Frase corta superior', type: 'text' }},
          {{ key: 'hero_title', label: 'Titulo principal', type: 'text' }},
          {{ key: 'short_description', label: 'Descripcion corta', type: 'textarea' }},
          {{ key: 'hero_subtitle', label: 'Subtitulo', type: 'textarea' }},
          {{ key: 'hero_highlights', label: 'Etiquetas del hero', type: 'list' }},
          {{ key: 'hero_image', label: 'Imagen principal (URL)', type: 'url' }},
          {{ key: 'hero_secondary_image', label: 'Imagen secundaria (URL)', type: 'url' }},
          {{ key: 'hero_caption_title', label: 'Titulo sobre imagen', type: 'text' }},
          {{ key: 'hero_caption_text', label: 'Texto sobre imagen', type: 'textarea' }},
          {{ key: 'hero_note_label', label: 'Etiqueta del bloque lateral', type: 'text' }},
          {{ key: 'hero_note_title', label: 'Titulo del bloque lateral', type: 'text' }},
          {{ key: 'hero_note_text', label: 'Texto del bloque lateral', type: 'textarea' }}
        ]
      }},
      featured: {{
        title: 'Seccion destacados',
        hint: 'Ajusta el texto de la seccion y decide cuales productos se marcan como destacados desde cada tarjeta.',
        fields: [
          {{ key: 'featured_kicker', label: 'Etiqueta superior', type: 'text' }},
          {{ key: 'featured_title', label: 'Titulo', type: 'text' }},
          {{ key: 'featured_subtitle', label: 'Texto', type: 'textarea' }}
        ]
      }},
      cakes: {{
        title: 'Tortas y galeria',
        hint: 'Muestra encargos especiales, tortas y trabajos personalizados.',
        fields: [
          {{ key: 'cakes_kicker', label: 'Etiqueta superior', type: 'text' }},
          {{ key: 'cakes_title', label: 'Titulo', type: 'text' }},
          {{ key: 'cakes_subtitle', label: 'Texto', type: 'textarea' }}
        ]
      }},
      story: {{
        title: 'Nosotros',
        hint: 'Cuenta la historia del negocio y refuerza la confianza con imagen y puntos clave.',
        fields: [
          {{ key: 'story_kicker', label: 'Etiqueta superior', type: 'text' }},
          {{ key: 'story_title', label: 'Titulo', type: 'text' }},
          {{ key: 'about_text', label: 'Historia', type: 'textarea' }},
          {{ key: 'story_points', label: 'Puntos clave', type: 'list' }},
          {{ key: 'story_image', label: 'Imagen de la historia (URL)', type: 'url' }}
        ]
      }},
      catalog: {{
        title: 'Catalogo y productos',
        hint: 'Edita textos del catalogo, buscador, mensajes y cada producto de forma independiente.',
        fields: [
          {{ key: 'catalog_kicker', label: 'Etiqueta superior', type: 'text' }},
          {{ key: 'catalog_title', label: 'Titulo del catalogo', type: 'text' }},
          {{ key: 'catalog_subtitle', label: 'Texto del catalogo', type: 'textarea' }},
          {{ key: 'catalog_placeholder', label: 'Texto del buscador', type: 'text' }},
          {{ key: 'catalog_clear_label', label: 'Texto del boton limpiar', type: 'text' }},
          {{ key: 'catalog_empty_message', label: 'Mensaje sin resultados', type: 'textarea' }},
          {{ key: 'catalog_sort_label', label: 'Etiqueta de ordenar', type: 'text' }},
          {{ key: 'catalog_results_label', label: 'Texto del contador', type: 'text' }},
          {{ key: 'items_label', label: 'Etiqueta del listado', type: 'text' }}
        ]
      }},
      contact: {{
        title: 'Contacto',
        hint: 'Ajusta el cierre comercial y los llamados a accion finales.',
        fields: [
          {{ key: 'contact_kicker', label: 'Etiqueta superior', type: 'text' }},
          {{ key: 'contact_title', label: 'Titulo', type: 'text' }},
          {{ key: 'contact_text', label: 'Texto', type: 'textarea' }}
        ]
      }},
      faq: {{
        title: 'Preguntas frecuentes',
        hint: 'Agrega y organiza dudas comunes para quitar friccion antes del pedido.',
        fields: [
          {{ key: 'faq_kicker', label: 'Etiqueta superior', type: 'text' }},
          {{ key: 'faq_title', label: 'Titulo', type: 'text' }}
        ]
      }},
      seo: {{
        title: 'SEO y buscadores',
        hint: 'Define como se presenta la pagina en Google y en la pestana del navegador.',
        fields: [
          {{ key: 'seo_title', label: 'Titulo SEO', type: 'text' }},
          {{ key: 'seo_description', label: 'Descripcion SEO', type: 'textarea' }}
        ]
      }}
    }};

    const sectionOrder = ['brand', 'navigation', 'appearance', 'layout', 'hero', 'featured', 'cakes', 'story', 'catalog', 'contact', 'faq', 'seo'];
    const themePresets = {{
      artesanal: {{
        theme_background: '#f5ede2',
        theme_surface: '#fffaf3',
        theme_surface_strong: '#fffdf9',
        theme_text: '#2b1c14',
        theme_muted: '#6d594b',
        theme_line: '#e3cfbc',
        theme_soft: '#f2e5d4',
        theme_accent: '#b86736',
        theme_accent_dark: '#964d22'
      }},
      premium: {{
        theme_background: '#efe3d6',
        theme_surface: '#fff6ee',
        theme_surface_strong: '#fffdf8',
        theme_text: '#241711',
        theme_muted: '#70584a',
        theme_line: '#dac2b0',
        theme_soft: '#ead7c6',
        theme_accent: '#8f4f2f',
        theme_accent_dark: '#5f311d'
      }},
      claro: {{
        theme_background: '#f4efe8',
        theme_surface: '#ffffff',
        theme_surface_strong: '#fffdfb',
        theme_text: '#302118',
        theme_muted: '#716156',
        theme_line: '#ddd1c4',
        theme_soft: '#f1e6d8',
        theme_accent: '#c1733f',
        theme_accent_dark: '#99552a'
      }}
    }};

    function applyThemePreset(presetKey) {{
      const preset = themePresets[presetKey];
      if (!preset || !draftBusiness) {{
        return;
      }}
      Object.entries(preset).forEach(([key, value]) => {{
        draftBusiness[key] = value;
      }});
      draftBusiness.theme_preset = presetKey;
    }}

    function renderEditorNav(activeKey) {{
      if (!editorNav) {{
        return;
      }}
      editorNav.innerHTML = sectionOrder
        .filter((key) => sectionConfigs[key])
        .map((key) => `
          <button class="visual-editor-tab ${{key === activeKey ? 'is-active' : ''}}" type="button" data-editor-jump="${{key}}">
            ${{sectionConfigs[key].title}}
          </button>
        `)
        .join('');
    }}

    function renderField(field) {{
      const rawValue = draftBusiness?.[field.key];
      const value = field.type === 'list' ? (Array.isArray(rawValue) ? rawValue.join('\\n') : '') : String(rawValue ?? '');
      const common = `data-field="${{field.key}}" data-type="${{field.type}}"`;
      if (field.type === 'textarea' || field.type === 'list') {{
        return `
          <div class="editor-field">
            <label>${{field.label}}</label>
            <textarea ${{common}}>${{escapeHtml(value)}}</textarea>
          </div>
        `;
      }}
      if (field.type === 'url') {{
        const hasImage = value.length > 0;
        return `
          <div class="editor-field">
            <label>${{field.label}}</label>
            <div class="editor-image-wrap">
              <div class="editor-image-preview ${{hasImage ? '' : 'is-empty'}}" style="${{hasImage ? 'background-image:url(' + escapeHtml(value) + ')' : ''}}">
                ${{hasImage ? '' : 'Aun no hay imagen cargada'}}
              </div>
              <input type="url" value="${{escapeHtml(value)}}" ${{common}} />
              <div class="editor-upload-inline">
                <input type="file" accept="image/*" data-upload-field="${{field.key}}" />
                <span class="editor-inline-help">Tambien puedes subirla desde tu computador.</span>
              </div>
            </div>
          </div>
        `;
      }}
      if (field.type === 'select') {{
        const options = (field.options || []).map((option) => `
          <option value="${{escapeHtml(option.value)}}" ${{String(option.value) === value ? 'selected' : ''}}>${{escapeHtml(option.label)}}</option>
        `).join('');
        return `
          <div class="editor-field">
            <label>${{field.label}}</label>
            <select ${{common}}>${{options}}</select>
          </div>
        `;
      }}
      if (field.type === 'toggle') {{
        const checked = ['true', '1', 'yes', 'si', 'on'].includes(String(rawValue).toLowerCase());
        return `
          <label class="editor-field editor-toggle">
            <span>${{field.label}}</span>
            <input type="checkbox" ${{common}} ${{checked ? 'checked' : ''}} />
          </label>
        `;
      }}
      if (field.type === 'color') {{
        const safeValue = /^#[0-9a-fA-F]{{6}}$/.test(value) ? value : '#b86736';
        return `
          <div class="editor-field">
            <label>${{field.label}}</label>
            <div class="editor-color-row">
              <input type="color" value="${{safeValue}}" ${{common}} />
              <input type="text" value="${{safeValue}}" data-color-text="${{field.key}}" />
            </div>
          </div>
        `;
      }}
      const inputType = field.type === 'number' ? 'number' : (field.type === 'url' ? 'url' : 'text');
      return `
        <div class="editor-field">
          <label>${{field.label}}</label>
          <input type="${{inputType}}" value="${{escapeHtml(value)}}" ${{common}} />
        </div>
      `;
    }}

    function renderItemsEditor(focusIndex = null) {{
      const rows = (draftBusiness?.items || []).map((item, index) => `
        <div class="editor-row-card ${{focusIndex === index ? 'is-focus' : ''}}" data-item-index="${{index}}">
          <div class="editor-field">
            <label>Nombre</label>
            <input class="item-name" value="${{escapeHtml(item.name || '')}}" />
          </div>
          <div class="editor-field">
            <label>Descripcion</label>
            <textarea class="item-description">${{escapeHtml(item.description || '')}}</textarea>
          </div>
          <div class="editor-field">
            <label>Precio</label>
            <input class="item-price" value="${{escapeHtml(item.price || '')}}" />
          </div>
          <div class="editor-field">
            <label>Categoria</label>
            <input class="item-category" value="${{escapeHtml(item.category || '')}}" />
          </div>
          <div class="editor-field">
            <label>Badge o sello</label>
            <input class="item-badge" value="${{escapeHtml(item.badge || '')}}" />
          </div>
          <div class="editor-field">
            <label>Palabras clave para buscar</label>
            <input class="item-search-terms" value="${{escapeHtml(item.search_terms || '')}}" />
          </div>
          <div class="editor-field">
            <label>Imagen (URL)</label>
            <input class="item-image" value="${{escapeHtml(item.image || '')}}" />
          </div>
          <div class="editor-image-wrap">
            <div class="editor-image-preview ${{item.image ? '' : 'is-empty'}}" style="${{item.image ? 'background-image:url(' + escapeHtml(item.image) + ')' : ''}}">
              ${{item.image ? '' : 'Sin imagen'}}
            </div>
            <div class="editor-upload-inline">
              <input class="item-upload" type="file" accept="image/*" />
              <span class="editor-inline-help">Sube una imagen para este producto.</span>
            </div>
          </div>
          <div class="editor-field">
            <label>Estado</label>
            <select class="item-status">
              <option value="active" ${{item.status === 'active' ? 'selected' : ''}}>Activo</option>
              <option value="inactive" ${{item.status === 'inactive' ? 'selected' : ''}}>Inactivo</option>
            </select>
          </div>
          <label class="editor-field editor-toggle">
            <span>Mostrar en destacados</span>
            <input class="item-featured" type="checkbox" ${{item.featured ? 'checked' : ''}} />
          </label>
          <div class="editor-row-actions">
            <button type="button" data-editor-action="item-up">Subir</button>
            <button type="button" data-editor-action="item-down">Bajar</button>
            <button type="button" data-editor-action="item-duplicate">Duplicar</button>
            <button type="button" data-editor-action="item-remove">Eliminar</button>
          </div>
        </div>
      `).join('');

      return `
        <div class="editor-group">
          <h4>Productos</h4>
          <div class="editor-rows">${{rows}}</div>
          <button class="editor-add-btn" type="button" data-editor-action="item-add">Agregar producto</button>
        </div>
      `;
    }}

    function renderGalleryEditor(focusIndex = null) {{
      const rows = (draftBusiness?.cake_gallery || []).map((imageUrl, index) => `
        <div class="editor-row-card ${{focusIndex === index ? 'is-focus' : ''}}" data-gallery-index="${{index}}">
          <div class="editor-image-wrap">
            <div class="editor-image-preview ${{imageUrl ? '' : 'is-empty'}}" style="${{imageUrl ? 'background-image:url(' + escapeHtml(imageUrl) + ')' : ''}}">
              ${{imageUrl ? '' : 'Sin imagen'}}
            </div>
            <div class="editor-field">
              <label>URL de la imagen</label>
              <input class="gallery-image" value="${{escapeHtml(imageUrl || '')}}" />
            </div>
            <div class="editor-upload-inline">
              <input class="gallery-upload" type="file" accept="image/*" />
              <span class="editor-inline-help">Tambien puedes subir una foto desde tu equipo.</span>
            </div>
          </div>
          <div class="editor-row-actions">
            <button type="button" data-editor-action="gallery-up">Subir</button>
            <button type="button" data-editor-action="gallery-down">Bajar</button>
            <button type="button" data-editor-action="gallery-remove">Eliminar</button>
          </div>
        </div>
      `).join('');

      return `
        <div class="editor-group">
          <h4>Galeria de tortas</h4>
          <div class="editor-rows">${{rows}}</div>
          <button class="editor-add-btn" type="button" data-editor-action="gallery-add">Agregar foto</button>
        </div>
      `;
    }}

    function renderFaqEditor(focusIndex = null) {{
      const rows = (draftBusiness?.faq || []).map((item, index) => `
        <div class="editor-row-card ${{focusIndex === index ? 'is-focus' : ''}}" data-faq-index="${{index}}">
          <div class="editor-field">
            <label>Pregunta</label>
            <input class="faq-q" value="${{escapeHtml(item.q || '')}}" />
          </div>
          <div class="editor-field">
            <label>Respuesta</label>
            <textarea class="faq-a">${{escapeHtml(item.a || '')}}</textarea>
          </div>
          <div class="editor-row-actions">
            <button type="button" data-editor-action="faq-up">Subir</button>
            <button type="button" data-editor-action="faq-down">Bajar</button>
            <button type="button" data-editor-action="faq-remove">Eliminar</button>
          </div>
        </div>
      `).join('');

      return `
        <div class="editor-group">
          <h4>Preguntas y respuestas</h4>
          <div class="editor-rows">${{rows}}</div>
          <button class="editor-add-btn" type="button" data-editor-action="faq-add">Agregar pregunta</button>
        </div>
      `;
    }}

    function markDirty(nextState = true) {{
      hasUnsavedChanges = nextState;
      if (editorStatus) {{
        editorStatus.textContent = nextState ? 'Tienes cambios sin guardar.' : 'Los cambios se guardan manualmente.';
      }}
      if (pageEditorSave) {{
        pageEditorSave.textContent = nextState ? 'Guardar cambios pendientes' : 'Guardar cambios';
      }}
    }}

    async function uploadImageFile(file) {{
      if (!file || !draftBusiness) {{
        return null;
      }}
      const dataUrl = await new Promise((resolve, reject) => {{
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
        reader.readAsDataURL(file);
      }});

      const response = await fetch('/api/upload/' + draftBusiness.slug, {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ filename: file.name, data_url: dataUrl }})
      }});

      const payload = await response.json().catch(() => ({{}}));
      if (!response.ok || !payload.url) {{
        throw new Error(payload.error || 'No se pudo subir la imagen.');
      }}
      return payload.url;
    }}

    function renderEditor(section, meta = {{}}) {{
      const config = sectionConfigs[section];
      if (!config || !editorBody) {{
        return;
      }}
      renderEditorNav(section);
      editorTitle.textContent = config.title;
      editorHint.textContent = config.hint;
      let html = '';
      if (config.fields.length) {{
        html += `<div class="editor-group">${{config.fields.map(renderField).join('')}}</div>`;
      }}
      if (section === 'catalog') {{
        html += renderItemsEditor(meta.itemIndex ?? null);
      }}
      if (section === 'cakes') {{
        html += renderGalleryEditor(meta.galleryIndex ?? null);
      }}
      if (section === 'faq') {{
        html += renderFaqEditor(meta.faqIndex ?? null);
      }}
      editorBody.innerHTML = html;
      const focusSelector =
        meta.itemIndex !== undefined ? `[data-item-index="${{meta.itemIndex}}"]` :
        meta.galleryIndex !== undefined ? `[data-gallery-index="${{meta.galleryIndex}}"]` :
        meta.faqIndex !== undefined ? `[data-faq-index="${{meta.faqIndex}}"]` :
        '';
      if (focusSelector) {{
        const target = editorBody.querySelector(focusSelector);
        if (target) {{
          target.scrollIntoView({{ block: 'nearest', behavior: 'smooth' }});
        }}
      }}
    }}

    function persistBasicFields() {{
      if (!editorBody || !draftBusiness) {{
        return;
      }}
      editorBody.querySelectorAll('[data-field]').forEach((field) => {{
        const key = field.dataset.field;
        const type = field.dataset.type;
        if (type === 'list') {{
          draftBusiness[key] = field.value.split('\\n').map((line) => line.trim()).filter(Boolean);
        }} else if (type === 'toggle') {{
          draftBusiness[key] = Boolean(field.checked);
        }} else if (type === 'number') {{
          draftBusiness[key] = field.value.trim() === '' ? 0 : Number(field.value);
        }} else {{
          draftBusiness[key] = field.value.trim();
        }}
      }});
    }}

    function collectItemsFromEditor() {{
      if (!editorBody) {{
        return draftBusiness.items || [];
      }}
      return [...editorBody.querySelectorAll('[data-item-index]')].map((card) => {{
        return {{
          name: card.querySelector('.item-name')?.value.trim() || '',
          description: card.querySelector('.item-description')?.value.trim() || '',
          price: card.querySelector('.item-price')?.value.trim() || '',
          category: card.querySelector('.item-category')?.value.trim() || 'Productos',
          badge: card.querySelector('.item-badge')?.value.trim() || '',
          search_terms: card.querySelector('.item-search-terms')?.value.trim() || '',
          image: card.querySelector('.item-image')?.value.trim() || '',
          status: card.querySelector('.item-status')?.value || 'active',
          featured: card.querySelector('.item-featured')?.checked || false
        }};
      }}).filter((item) => item.name.length > 0);
    }}

    function collectGalleryFromEditor() {{
      if (!editorBody) {{
        return draftBusiness.cake_gallery || [];
      }}
      return [...editorBody.querySelectorAll('[data-gallery-index]')]
        .map((card) => card.querySelector('.gallery-image')?.value.trim() || '')
        .filter((value) => value.length > 0);
    }}

    function collectFaqFromEditor() {{
      if (!editorBody) {{
        return draftBusiness.faq || [];
      }}
      return [...editorBody.querySelectorAll('[data-faq-index]')].map((card) => {{
        return {{
          q: card.querySelector('.faq-q')?.value.trim() || '',
          a: card.querySelector('.faq-a')?.value.trim() || ''
        }};
      }}).filter((item) => item.q.length > 0 && item.a.length > 0);
    }}

    function persistCurrentSection() {{
      if (!activeEditorSection || !draftBusiness) {{
        return;
      }}
      persistBasicFields();
      if (activeEditorSection === 'catalog') {{
        draftBusiness.items = collectItemsFromEditor();
      }}
      if (activeEditorSection === 'cakes') {{
        draftBusiness.cake_gallery = collectGalleryFromEditor();
      }}
      if (activeEditorSection === 'faq') {{
        draftBusiness.faq = collectFaqFromEditor();
      }}
    }}

    function openVisualEditor(section, meta = {{}}) {{
      if (!visualEditEnabled || !editorDrawer) {{
        return;
      }}
      persistCurrentSection();
      activeEditorSection = section;
      activeEditorMeta = meta;
      renderEditor(section, meta);
      markDirty(hasUnsavedChanges);
      editorDrawer.classList.add('is-open');
      editorDrawer.setAttribute('aria-hidden', 'false');
    }}

    function closeVisualEditor() {{
      if (!editorDrawer) {{
        return;
      }}
      persistCurrentSection();
      editorDrawer.classList.remove('is-open');
      editorDrawer.setAttribute('aria-hidden', 'true');
    }}

    function moveRow(list, index, direction) {{
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= list.length) {{
        return list;
      }}
      const clone = [...list];
      const [row] = clone.splice(index, 1);
      clone.splice(nextIndex, 0, row);
      return clone;
    }}

    async function saveVisualEditor() {{
      if (!visualEditEnabled || !draftBusiness) {{
        return;
      }}
      persistCurrentSection();
      editorStatus.textContent = 'Guardando cambios...';
      const payload = {{}};
      saveKeys.forEach((key) => {{
        payload[key] = draftBusiness[key];
      }});
      const response = await fetch('/api/business/' + draftBusiness.slug, {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify(payload)
      }});

      if (response.ok) {{
        markDirty(false);
        editorStatus.textContent = 'Cambios guardados. Recargando vista...';
        window.location.reload();
        return;
      }}

      if (response.status === 401) {{
        editorStatus.textContent = 'Tu sesion vencio. Vuelve a entrar.';
      }} else if (response.status === 403) {{
        editorStatus.textContent = 'No tienes permiso para editar este negocio.';
      }} else {{
        editorStatus.textContent = 'No se pudo guardar. Revisa los campos y vuelve a intentar.';
      }}
    }}

    if (visualEditEnabled) {{
      window.addEventListener('beforeunload', (event) => {{
        if (!hasUnsavedChanges) {{
          return;
        }}
        event.preventDefault();
        event.returnValue = '';
      }});

      editableBlocks.forEach((block) => {{
        block.addEventListener('click', (event) => {{
          if (event.defaultPrevented) {{
            return;
          }}
          const explicitTrigger = event.target.closest('[data-editor-open]');
          const clickedInteractive = event.target.closest('a, button, input, textarea, select');
          if (clickedInteractive && !explicitTrigger) {{
            return;
          }}
          event.preventDefault();
          event.stopPropagation();
          const section = explicitTrigger?.dataset.editorOpen || block.dataset.editorSection;
          const meta = {{}};
          const itemIndex = explicitTrigger?.dataset.editorItemIndex || block.dataset.editorItemIndex;
          const galleryIndex = explicitTrigger?.dataset.editorGalleryIndex || block.dataset.editorGalleryIndex;
          const faqIndex = explicitTrigger?.dataset.editorFaqIndex || block.dataset.editorFaqIndex;
          if (itemIndex !== undefined && itemIndex !== null && itemIndex !== '') {{
            meta.itemIndex = Number(itemIndex);
          }}
          if (galleryIndex !== undefined && galleryIndex !== null && galleryIndex !== '') {{
            meta.galleryIndex = Number(galleryIndex);
          }}
          if (faqIndex !== undefined && faqIndex !== null && faqIndex !== '') {{
            meta.faqIndex = Number(faqIndex);
          }}
          if (section) {{
            openVisualEditor(section, meta);
          }}
        }});
      }});

      if (editorBackdrop) {{
        editorBackdrop.addEventListener('click', closeVisualEditor);
      }}
      if (editorCloseBtn) {{
        editorCloseBtn.addEventListener('click', closeVisualEditor);
      }}
      if (editorCancelBtn) {{
        editorCancelBtn.addEventListener('click', closeVisualEditor);
      }}
      if (editorSaveBtn) {{
        editorSaveBtn.addEventListener('click', saveVisualEditor);
      }}
      if (pageEditorSave) {{
        pageEditorSave.addEventListener('click', saveVisualEditor);
      }}
      if (openAdvancedEditor) {{
        openAdvancedEditor.addEventListener('click', () => openVisualEditor('appearance'));
      }}
      if (editorNav) {{
        editorNav.addEventListener('click', (event) => {{
          const button = event.target.closest('[data-editor-jump]');
          if (!button) {{
            return;
          }}
          openVisualEditor(button.dataset.editorJump || 'brand');
        }});
      }}

      if (editorBody) {{
        editorBody.addEventListener('input', (event) => {{
          const target = event.target;
          if (target?.matches('[data-color-text]')) {{
            const key = target.dataset.colorText;
            const colorInput = editorBody.querySelector(`[data-field="${{key}}"][data-type="color"]`);
            if (colorInput && /^#[0-9a-fA-F]{{6}}$/.test(target.value.trim())) {{
              colorInput.value = target.value.trim();
            }}
          }}
          if (target?.matches('[data-field][data-type="color"]')) {{
            const key = target.dataset.field;
            const textInput = editorBody.querySelector(`[data-color-text="${{key}}"]`);
            if (textInput) {{
              textInput.value = target.value;
            }}
          }}
          persistCurrentSection();
          markDirty(true);
        }});

        editorBody.addEventListener('click', (event) => {{
          const action = event.target.closest('[data-editor-action]');
          if (!action || !draftBusiness) {{
            return;
          }}
          persistCurrentSection();
          const row = action.closest('[data-item-index], [data-faq-index], [data-gallery-index]');
          if (action.dataset.editorAction === 'item-add') {{
            draftBusiness.items = [...(draftBusiness.items || []), {{ name: '', description: '', price: '', category: draftBusiness.items_label || 'Productos', badge: '', search_terms: '', image: '', status: 'active', featured: false }}];
            markDirty(true);
            renderEditor('catalog', {{ itemIndex: draftBusiness.items.length - 1 }});
            return;
          }}
          if (action.dataset.editorAction === 'gallery-add') {{
            draftBusiness.cake_gallery = [...(draftBusiness.cake_gallery || []), ''];
            markDirty(true);
            renderEditor('cakes', {{ galleryIndex: draftBusiness.cake_gallery.length - 1 }});
            return;
          }}
          if (action.dataset.editorAction === 'faq-add') {{
            draftBusiness.faq = [...(draftBusiness.faq || []), {{ q: '', a: '' }}];
            markDirty(true);
            renderEditor('faq', {{ faqIndex: draftBusiness.faq.length - 1 }});
            return;
          }}
          if (row?.dataset.itemIndex) {{
            const index = Number(row.dataset.itemIndex);
            if (action.dataset.editorAction === 'item-remove') {{
              draftBusiness.items = draftBusiness.items.filter((_, itemIndex) => itemIndex !== index);
            }}
            if (action.dataset.editorAction === 'item-up') {{
              draftBusiness.items = moveRow(draftBusiness.items, index, -1);
            }}
            if (action.dataset.editorAction === 'item-down') {{
              draftBusiness.items = moveRow(draftBusiness.items, index, 1);
            }}
            if (action.dataset.editorAction === 'item-duplicate') {{
              const clone = JSON.parse(JSON.stringify(draftBusiness.items[index] || {{}}));
              draftBusiness.items = [...draftBusiness.items.slice(0, index + 1), clone, ...draftBusiness.items.slice(index + 1)];
            }}
            markDirty(true);
            renderEditor('catalog', {{ itemIndex: Math.max(0, index) }});
            return;
          }}
          if (row?.dataset.galleryIndex) {{
            const index = Number(row.dataset.galleryIndex);
            if (action.dataset.editorAction === 'gallery-remove') {{
              draftBusiness.cake_gallery = draftBusiness.cake_gallery.filter((_, galleryItemIndex) => galleryItemIndex !== index);
            }}
            if (action.dataset.editorAction === 'gallery-up') {{
              draftBusiness.cake_gallery = moveRow(draftBusiness.cake_gallery, index, -1);
            }}
            if (action.dataset.editorAction === 'gallery-down') {{
              draftBusiness.cake_gallery = moveRow(draftBusiness.cake_gallery, index, 1);
            }}
            markDirty(true);
            renderEditor('cakes', {{ galleryIndex: Math.max(0, index - (action.dataset.editorAction === 'gallery-remove' ? 1 : 0)) }});
            return;
          }}
          if (row?.dataset.faqIndex) {{
            const index = Number(row.dataset.faqIndex);
            if (action.dataset.editorAction === 'faq-remove') {{
              draftBusiness.faq = draftBusiness.faq.filter((_, faqIndex) => faqIndex !== index);
            }}
            if (action.dataset.editorAction === 'faq-up') {{
              draftBusiness.faq = moveRow(draftBusiness.faq, index, -1);
            }}
            if (action.dataset.editorAction === 'faq-down') {{
              draftBusiness.faq = moveRow(draftBusiness.faq, index, 1);
            }}
            markDirty(true);
            renderEditor('faq', {{ faqIndex: Math.max(0, index) }});
          }}
        }});

        editorBody.addEventListener('change', async (event) => {{
          const target = event.target;
          if (!target) {{
            return;
          }}

          if (target.matches('[data-field="theme_preset"]')) {{
            applyThemePreset(target.value);
            markDirty(true);
            renderEditor('appearance', activeEditorMeta);
            return;
          }}

          if (target.dataset.uploadField && target.files?.[0]) {{
            try {{
              editorStatus.textContent = 'Subiendo imagen...';
              const imageUrl = await uploadImageFile(target.files[0]);
              const fieldInput = editorBody.querySelector(`[data-field="${{target.dataset.uploadField}}"]`);
              if (fieldInput) {{
                fieldInput.value = imageUrl;
              }}
              persistBasicFields();
              markDirty(true);
              renderEditor(activeEditorSection, activeEditorMeta);
            }} catch (error) {{
              editorStatus.textContent = error.message || 'No se pudo subir la imagen.';
            }}
            return;
          }}

          const itemCard = target.closest('[data-item-index]');
          if (target.classList.contains('item-upload') && itemCard && target.files?.[0]) {{
            try {{
              editorStatus.textContent = 'Subiendo imagen del producto...';
              const imageUrl = await uploadImageFile(target.files[0]);
              const itemIndex = Number(itemCard.dataset.itemIndex);
              persistCurrentSection();
              draftBusiness.items[itemIndex].image = imageUrl;
              markDirty(true);
              renderEditor('catalog', {{ itemIndex }});
            }} catch (error) {{
              editorStatus.textContent = error.message || 'No se pudo subir la imagen.';
            }}
            return;
          }}

          const galleryCard = target.closest('[data-gallery-index]');
          if (target.classList.contains('gallery-upload') && galleryCard && target.files?.[0]) {{
            try {{
              editorStatus.textContent = 'Subiendo imagen de torta...';
              const imageUrl = await uploadImageFile(target.files[0]);
              const galleryIndex = Number(galleryCard.dataset.galleryIndex);
              persistCurrentSection();
              draftBusiness.cake_gallery[galleryIndex] = imageUrl;
              markDirty(true);
              renderEditor('cakes', {{ galleryIndex }});
            }} catch (error) {{
              editorStatus.textContent = error.message || 'No se pudo subir la imagen.';
            }}
          }}
        }});
      }}
    }}
  </script>
</body>
</html>"""


def bakery_site_html(business, edit_mode=False, can_edit=False):
    return render_bakery_page_v2(business, edit_mode=edit_mode, can_edit=can_edit)

    active_items = [i for i in business.get("items", []) if i.get("status", "active") == "active"]
    featured = active_items[:6]

    categories = sorted({i.get("category", "Productos") for i in active_items})
    category_blocks = []
    for cat in categories:
        cat_items = [i for i in active_items if i.get("category", "Productos") == cat]
        item_rows = []
        for item in cat_items:
            item_rows.append(
                f"""
                <article class="menu-item">
                  <div>
                    <h4>{item.get('name','')}</h4>
                    <p>{item.get('description','')}</p>
                  </div>
                  <strong>$ {item.get('price','')}</strong>
                </article>
                """
            )
        category_blocks.append(
            f"""
            <section class="menu-block">
              <h3>{cat}</h3>
              {''.join(item_rows)}
            </section>
            """
        )

    featured_cards = []
    for item in featured:
        featured_cards.append(
            f"""
            <article class="featured-card">
              <span>{item.get('category','Productos')}</span>
              <h3>{item.get('name','')}</h3>
              <p>{item.get('description','')}</p>
              <strong>$ {item.get('price','')}</strong>
            </article>
            """
        )

    faq_rows = []
    for row in business.get("faq", []):
        faq_rows.append(
            f"""
            <article class="faq-card">
              <h4>{row.get('q','')}</h4>
              <p>{row.get('a','')}</p>
            </article>
            """
        )

    whatsapp_msg = f"Hola, quiero hacer un pedido en {business['name']}."
    whatsapp_link = f"https://wa.me/{business['whatsapp']}?text={whatsapp_msg.replace(' ', '%20')}"
    map_link = f"https://www.google.com/maps/search/?api=1&query={business.get('map_query','').replace(' ', '+')}"

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{business['name']}</title>
  <meta name="description" content="{business.get('short_description', business.get('hero_subtitle',''))}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {{
      --bg: #f7f4ef;
      --paper: #fffdf9;
      --ink: #1f1a16;
      --muted: #6c5f54;
      --line: #e7dacb;
      --accent: #a55027;
      --accent-dark: #7f3c1b;
      --olive: #365140;
      --radius: 18px;
      --max: min(1180px, 92%);
      --shadow: 0 20px 44px rgba(31, 26, 22, 0.12);
    }}

    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      font-family: "Inter", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at 0% -10%, #f8e9d8 0%, transparent 38%),
        radial-gradient(circle at 100% 0%, #e9f1e7 0%, transparent 34%),
        var(--bg);
      line-height: 1.58;
    }}

    .container {{ width: var(--max); margin: 0 auto; }}

    .top-tools {{
      width: var(--max);
      margin: 20px auto 10px;
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }}
    .tool-btn {{
      text-decoration: none;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 9px 12px;
      color: #3d352e;
      font-size: .82rem;
      font-weight: 700;
      background: #fff;
    }}

    .nav-wrap {{
      position: sticky;
      top: 0;
      z-index: 60;
      background: rgba(255, 253, 249, .88);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--line);
    }}
    .nav {{
      width: var(--max);
      margin: 0 auto;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }}
    .brand {{
      display: inline-flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      line-height: 1;
    }}
    .brand strong {{
      font-family: "Cormorant Garamond", serif;
      font-size: 1.7rem;
      font-weight: 700;
      letter-spacing: .01em;
    }}
    .brand span {{
      font-size: .7rem;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 3px;
      font-weight: 700;
    }}
    .nav-links {{ display: flex; gap: 18px; font-size: .84rem; font-weight: 700; }}
    .nav-links a {{ text-decoration: none; color: #4f463f; }}
    .nav-links a:hover {{ color: var(--accent-dark); }}
    .nav-cta {{
      text-decoration: none;
      color: #fff;
      background: linear-gradient(145deg, var(--accent), var(--accent-dark));
      border-radius: 999px;
      padding: 10px 14px;
      font-size: .82rem;
      font-weight: 800;
    }}

    .hero {{
      width: var(--max);
      margin: 22px auto 0;
      display: grid;
      grid-template-columns: 1.05fr .95fr;
      gap: 14px;
    }}
    .hero-main {{
      border: 1px solid var(--line);
      border-radius: 22px;
      padding: 34px;
      background: var(--paper);
      box-shadow: var(--shadow);
    }}
    .eyebrow {{
      display: inline-block;
      font-size: .7rem;
      text-transform: uppercase;
      letter-spacing: .14em;
      color: #7a5a45;
      font-weight: 800;
      margin-bottom: 12px;
    }}
    h1 {{
      font-family: "Cormorant Garamond", serif;
      font-size: clamp(2.2rem, 5.2vw, 4.4rem);
      line-height: .92;
      margin-bottom: 10px;
      max-width: 12ch;
    }}
    .hero-main p {{ color: var(--muted); max-width: 58ch; margin-bottom: 16px; }}
    .hero-actions {{ display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }}
    .btn {{
      text-decoration: none;
      border-radius: 11px;
      padding: 10px 13px;
      font-size: .86rem;
      font-weight: 800;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .btn.primary {{ color: #fff; background: linear-gradient(145deg, var(--accent), var(--accent-dark)); }}
    .btn.ghost {{ color: #322a24; background: #fff; border-color: var(--line); }}

    .hero-meta {{ display: grid; gap: 7px; font-size: .9rem; color: #5f5349; }}
    .hero-meta strong {{ color: #2a221d; }}

    .hero-side {{
      border-radius: 22px;
      border: 1px solid #26362d;
      padding: 26px;
      color: #edf1eb;
      background: linear-gradient(160deg, #25392c 0%, #1e3125 70%);
      box-shadow: var(--shadow);
      position: relative;
      overflow: hidden;
    }}
    .hero-side::after {{
      content: "";
      position: absolute;
      right: -56px;
      bottom: -56px;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,.18), transparent 70%);
    }}
    .hero-side h2 {{
      font-family: "Cormorant Garamond", serif;
      font-size: 2.3rem;
      line-height: .94;
      margin-bottom: 10px;
      max-width: 14ch;
    }}
    .hero-side p {{ color: #cbd6cc; margin-bottom: 12px; max-width: 34ch; }}
    .hero-side ul {{ display: grid; gap: 8px; }}
    .hero-side li {{ list-style: none; font-size: .85rem; color: #d8e2d9; }}

    .section {{ width: var(--max); margin: 14px auto 0; }}
    .panel {{
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 22px;
      background: var(--paper);
      box-shadow: 0 14px 28px rgba(31, 26, 22, .08);
    }}
    .section-title {{
      font-family: "Cormorant Garamond", serif;
      font-size: clamp(1.9rem, 4vw, 3rem);
      line-height: .95;
      margin-bottom: 7px;
    }}
    .section-sub {{ color: var(--muted); margin-bottom: 14px; }}

    .featured-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }}
    .featured-card {{
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px;
      background: #fff;
    }}
    .featured-card span {{ font-size: .72rem; color: #786a5f; font-weight: 700; display: inline-block; margin-bottom: 4px; }}
    .featured-card h3 {{ font-size: 1.02rem; margin-bottom: 4px; }}
    .featured-card p {{ color: var(--muted); font-size: .88rem; margin-bottom: 8px; }}
    .featured-card strong {{ color: #7f3d1e; }}

    .menu-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; }}
    .menu-block {{ border: 1px solid var(--line); border-radius: 14px; background: #fff; padding: 12px; }}
    .menu-block h3 {{ font-size: 1.02rem; margin-bottom: 8px; color: #2a241f; }}
    .menu-item {{
      display: flex;
      justify-content: space-between;
      gap: 10px;
      border: 1px solid #eee3d6;
      border-radius: 10px;
      padding: 9px;
      margin-bottom: 8px;
      background: #fffcf8;
    }}
    .menu-item h4 {{ font-size: .9rem; margin-bottom: 2px; }}
    .menu-item p {{ color: var(--muted); font-size: .82rem; }}
    .menu-item strong {{ color: #7f3d1e; white-space: nowrap; }}

    .contact-grid {{ display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }}
    .contact-list {{ display: grid; gap: 6px; color: #5d5249; font-size: .92rem; }}
    .contact-list strong {{ color: #2a231d; }}

    .faq-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }}
    .faq-card {{ border: 1px solid var(--line); border-radius: 13px; background: #fff; padding: 12px; }}
    .faq-card h4 {{ font-size: .92rem; margin-bottom: 4px; }}
    .faq-card p {{ color: var(--muted); font-size: .85rem; }}

    .footer {{ width: var(--max); margin: 12px auto 30px; text-align: center; color: var(--muted); font-size: .83rem; }}

    @media (max-width: 900px) {{
      .hero {{ grid-template-columns: 1fr; }}
      .contact-grid {{ grid-template-columns: 1fr; }}
    }}
    @media (max-width: 760px) {{
      .nav-links {{ display: none; }}
      .hero-main, .hero-side, .panel {{ padding: 18px; }}
    }}
  </style>
</head>
<body>
  <div class="top-tools">
    <a class="tool-btn" href="/">Volver al sistema</a>
    <a class="tool-btn" href="/client-login?slug={business['slug']}">Editar contenido</a>
  </div>

  <div class="nav-wrap">
    <nav class="nav">
      <a class="brand" href="#inicio">
        <strong>{business['name']}</strong>
        <span>Panaderia artesanal</span>
      </a>
      <div class="nav-links">
        <a href="#destacados">Destacados</a>
        <a href="#catalogo">Catalogo</a>
        <a href="#contacto">Contacto</a>
        <a href="#faq">FAQ</a>
      </div>
      <a class="nav-cta" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">Pedir por WhatsApp</a>
    </nav>
  </div>

  <header class="hero" id="inicio">
    <section class="hero-main">
      <span class="eyebrow">Panaderia en Colombia</span>
      <h1>{business['hero_title']}</h1>
      <p>{business.get('short_description', business.get('hero_subtitle',''))}</p>
      <div class="hero-actions">
        <a class="btn primary" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">Hacer pedido</a>
        <a class="btn ghost" href="{map_link}" target="_blank" rel="noopener noreferrer">Como llegar</a>
      </div>
      <div class="hero-meta">
        <span><strong>Ciudad:</strong> {business.get('city','')}</span>
        <span><strong>Direccion:</strong> {business.get('address','')}</span>
        <span><strong>Horario:</strong> {business.get('open_hours','')}</span>
        <span><strong>Pedidos:</strong> {business.get('order_note','')}</span>
      </div>
    </section>

    <aside class="hero-side">
      <h2>Pan fresco todos los dias</h2>
      <p>{business.get('about_text','')}</p>
      <ul>
        <li>Atencion cercana para el barrio</li>
        <li>Productos del dia y pedidos por WhatsApp</li>
        <li>Precios claros y listos para compartir</li>
      </ul>
    </aside>
  </header>

  <section class="section" id="destacados">
    <div class="panel">
      <h2 class="section-title">Productos destacados</h2>
      <p class="section-sub">Selecciones recomendadas para desayuno, onces y pedidos familiares.</p>
      <div class="featured-grid">{''.join(featured_cards)}</div>
    </div>
  </section>

  <section class="section" id="catalogo">
    <div class="panel">
      <h2 class="section-title">Catalogo por categorias</h2>
      <p class="section-sub">Visualiza rapido lo que tenemos disponible hoy.</p>
      <div class="menu-grid">{''.join(category_blocks)}</div>
    </div>
  </section>

  <section class="section" id="contacto">
    <div class="panel">
      <h2 class="section-title">Informacion del negocio</h2>
      <div class="contact-grid">
        <div class="contact-list">
          <span><strong>Nombre:</strong> {business.get('name','')}</span>
          <span><strong>Ciudad:</strong> {business.get('city','')}</span>
          <span><strong>Direccion:</strong> {business.get('address','')}</span>
          <span><strong>Horario:</strong> {business.get('open_hours','')}</span>
          <span><strong>WhatsApp:</strong> +{business.get('whatsapp','')}</span>
        </div>
        <div class="hero-actions">
          <a class="btn primary" href="{whatsapp_link}" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
          <a class="btn ghost" href="{map_link}" target="_blank" rel="noopener noreferrer">Abrir ubicacion</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="faq">
    <div class="panel">
      <h2 class="section-title">Preguntas frecuentes</h2>
      <div class="faq-grid">{''.join(faq_rows)}</div>
    </div>
  </section>

  <p class="footer">{business['name']} - {business.get('city','')} - Sitio web comercial para negocios locales en Colombia.</p>
</body>
</html>"""


def owner_login_html(error_msg=""):
    msg = f"<p class='alert'>{error_msg}</p>" if error_msg else ""
    body = f"""
    <section class=\"card\" style=\"max-width:540px;margin:20px auto\">
      <h1>Acceso administrador</h1>
      <p class=\"muted\" style=\"margin-bottom:12px\">Este acceso te permite editar todos los negocios.</p>
      {msg}
      <form method=\"post\" action=\"/login\">
        <div class=\"field\">
          <label>Contrasena de administrador</label>
          <input type=\"password\" name=\"password\" required />
        </div>
        <div class=\"row\">
          <button class=\"btn\" type=\"submit\">Entrar</button>
          <a class=\"btn ghost\" href=\"/\">Volver</a>
        </div>
      </form>
    </section>
    """
    return html_layout("Login admin", body)


def client_login_html(error_msg="", selected_slug=None):
    data = load_data()
    options = []
    for b in data.get("businesses", []):
        sel = "selected" if selected_slug == b["slug"] else ""
        options.append(f"<option value=\"{b['slug']}\" {sel}>{b['name']}</option>")

    msg = f"<p class='alert'>{error_msg}</p>" if error_msg else ""
    body = f"""
    <section class=\"card\" style=\"max-width:620px;margin:20px auto\">
      <h1>Acceso cliente</h1>
      <p class=\"muted\" style=\"margin-bottom:12px\">Cada cliente entra directo al editor visual de su negocio.</p>
      {msg}
      <form method=\"post\" action=\"/client-login\">
        <div class=\"field\">
          <label>Negocio</label>
          <select name=\"slug\" required>{''.join(options)}</select>
        </div>
        <div class=\"field\">
          <label>Contrasena del cliente</label>
          <input type=\"password\" name=\"password\" required />
        </div>
        <div class=\"row\">
          <button class=\"btn\" type=\"submit\">Entrar</button>
          <a class=\"btn ghost\" href=\"/\">Volver</a>
        </div>
      </form>
    </section>
    """
    return html_layout("Login cliente", body)


def admin_html(selected_slug=None, role="owner", fixed_slug=None):
    data = load_data()
    businesses = data.get("businesses", [])

    if not businesses:
        return html_layout("Admin", "<p>No hay negocios cargados.</p>")

    selected = businesses[0]
    if role == "client" and fixed_slug:
        for b in businesses:
            if b.get("slug") == fixed_slug:
                selected = b
                break
    elif selected_slug:
        for b in businesses:
            if b.get("slug") == selected_slug:
                selected = b
                break

    options = []
    for b in businesses:
        sel = "selected" if b["slug"] == selected["slug"] else ""
        options.append(f"<option value=\"{b['slug']}\" {sel}>{b['name']}</option>")

    items_json = json.dumps(selected.get("items", []), ensure_ascii=False)
    cake_gallery_value = "\n".join(selected.get("cake_gallery", []))
    utility_badges_value = "\n".join(selected.get("utility_badges", []))
    hero_highlights_value = "\n".join(selected.get("hero_highlights", []))
    story_points_value = "\n".join(selected.get("story_points", []))
    faq_json = json.dumps(selected.get("faq", []), ensure_ascii=False)
    role_label = "Administrador" if role == "owner" else "Cliente"

    if role == "owner":
        selector_html = f"""
      <div class=\"field\">
        <label>Negocio</label>
        <select id=\"businessSelector\">{''.join(options)}</select>
      </div>
        """
        selector_js = """
      const selector = document.getElementById('businessSelector');
      selector.addEventListener('change', () => {
        window.location.href = '/admin?slug=' + selector.value;
      });
        """
    else:
        selector_html = f"""
      <div class=\"field\">
        <label>Negocio asignado</label>
        <input value=\"{selected['name']}\" readonly />
      </div>
        """
        selector_js = ""

    body = f"""
    <div class=\"top\">
      <div>
        <h1>Panel de administracion</h1>
        <p class=\"muted\">Rol activo: <strong>{role_label}</strong>. Edita textos, fotos, preguntas frecuentes, productos y mensajes clave sin tocar codigo.</p>
      </div>
      <div class=\"row\">
        <a class=\"btn ghost\" href=\"/\">Inicio</a>
        <a class=\"btn ghost\" href=\"/logout\">Cerrar sesion</a>
      </div>
    </div>

    <section class=\"card\">
      {selector_html}

      <div class=\"field\">
        <label>Nombre</label>
        <input id=\"name\" value=\"{selected['name']}\" />
      </div>

      <div class=\"field\">
        <label>Categoria</label>
        <input id=\"category\" value=\"{selected['category']}\" />
      </div>

      <div class=\"field\">
        <label>Ciudad</label>
        <input id=\"city\" value=\"{selected['city']}\" />
      </div>

      <div class=\"field\">
        <label>Direccion</label>
        <input id=\"address\" value=\"{selected.get('address','')}\" />
      </div>

      <div class=\"field\">
        <label>Horario</label>
        <input id=\"open_hours\" value=\"{selected.get('open_hours','')}\" />
      </div>

      <div class=\"field\">
        <label>Nota de pedidos o citas</label>
        <input id=\"order_note\" value=\"{selected.get('order_note','')}\" />
      </div>

      <div class=\"field\">
        <label>WhatsApp (solo numeros, ej 573007561667)</label>
        <input id=\"whatsapp\" value=\"{selected['whatsapp']}\" />
      </div>

      <div class=\"field\">
        <label>Titulo principal</label>
        <input id=\"hero_title\" value=\"{selected['hero_title']}\" />
      </div>

      <div class=\"field\">
        <label>Descripcion corta (Hero)</label>
        <textarea id=\"short_description\">{selected.get('short_description','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Subtitulo</label>
        <textarea id=\"hero_subtitle\">{selected['hero_subtitle']}</textarea>
      </div>

      <div class=\"field\">
        <label>Sobre nosotros</label>
        <textarea id=\"about_text\">{selected.get('about_text','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Consulta de mapa (ej: Panaderia Belalcazar, Caldas)</label>
        <input id=\"map_query\" value=\"{selected.get('map_query','')}\" />
      </div>

      <div class=\"field\">
        <label>Subtitulo de marca</label>
        <input id=\"brand_tagline\" value=\"{selected.get('brand_tagline','')}\" />
      </div>

      <div class=\"field\">
        <label>Frase corta superior (Hero badge)</label>
        <input id=\"hero_badge\" value=\"{selected.get('hero_badge','')}\" />
      </div>

      <div class=\"field\">
        <label>Etiquetas superiores (una por linea)</label>
        <textarea id=\"utility_badges\">{utility_badges_value}</textarea>
      </div>

      <div class=\"field\">
        <label>Etiquetas del hero (una por linea)</label>
        <textarea id=\"hero_highlights\">{hero_highlights_value}</textarea>
      </div>

      <div class=\"field\">
        <label>Imagen principal del hero (URL)</label>
        <input id=\"hero_image\" value=\"{selected.get('hero_image','')}\" />
      </div>

      <div class=\"field\">
        <label>Imagen secundaria del hero (URL)</label>
        <input id=\"hero_secondary_image\" value=\"{selected.get('hero_secondary_image','')}\" />
      </div>

      <div class=\"field\">
        <label>Titulo sobre la imagen principal</label>
        <input id=\"hero_caption_title\" value=\"{selected.get('hero_caption_title','')}\" />
      </div>

      <div class=\"field\">
        <label>Texto sobre la imagen principal</label>
        <textarea id=\"hero_caption_text\">{selected.get('hero_caption_text','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Etiqueta del bloque lateral</label>
        <input id=\"hero_note_label\" value=\"{selected.get('hero_note_label','')}\" />
      </div>

      <div class=\"field\">
        <label>Titulo del bloque lateral</label>
        <input id=\"hero_note_title\" value=\"{selected.get('hero_note_title','')}\" />
      </div>

      <div class=\"field\">
        <label>Texto del bloque lateral</label>
        <textarea id=\"hero_note_text\">{selected.get('hero_note_text','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Imagen de la historia / nosotros (URL)</label>
        <input id=\"story_image\" value=\"{selected.get('story_image','')}\" />
      </div>

      <div class=\"field\">
        <label>Titulo de la seccion nosotros</label>
        <input id=\"story_title\" value=\"{selected.get('story_title','')}\" />
      </div>

      <div class=\"field\">
        <label>Puntos clave de la historia (uno por linea)</label>
        <textarea id=\"story_points\">{story_points_value}</textarea>
      </div>

      <div class=\"field\">
        <label>Titulo de destacados</label>
        <input id=\"featured_title\" value=\"{selected.get('featured_title','')}\" />
      </div>

      <div class=\"field\">
        <label>Texto de destacados</label>
        <textarea id=\"featured_subtitle\">{selected.get('featured_subtitle','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Titulo de tortas</label>
        <input id=\"cakes_title\" value=\"{selected.get('cakes_title','')}\" />
      </div>

      <div class=\"field\">
        <label>Texto de tortas</label>
        <textarea id=\"cakes_subtitle\">{selected.get('cakes_subtitle','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Galeria de tortas (una URL por linea)</label>
        <textarea id=\"cake_gallery\">{cake_gallery_value}</textarea>
      </div>

      <div class=\"field\">
        <label>Titulo del catalogo</label>
        <input id=\"catalog_title\" value=\"{selected.get('catalog_title','')}\" />
      </div>

      <div class=\"field\">
        <label>Texto del catalogo</label>
        <textarea id=\"catalog_subtitle\">{selected.get('catalog_subtitle','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Texto del buscador del catalogo</label>
        <input id=\"catalog_placeholder\" value=\"{selected.get('catalog_placeholder','')}\" />
      </div>

      <div class=\"field\">
        <label>Titulo de contacto</label>
        <input id=\"contact_title\" value=\"{selected.get('contact_title','')}\" />
      </div>

      <div class=\"field\">
        <label>Texto de contacto</label>
        <textarea id=\"contact_text\">{selected.get('contact_text','')}</textarea>
      </div>

      <div class=\"field\">
        <label>Texto final del footer</label>
        <input id=\"footer_note\" value=\"{selected.get('footer_note','')}\" />
      </div>

      <div class=\"field\">
        <label>Preguntas frecuentes</label>
        <div id=\"faqEditor\"></div>
        <button class=\"btn ghost\" type=\"button\" id=\"addFaqBtn\" style=\"margin-top:8px\">Agregar pregunta</button>
      </div>

      <div class=\"field\">
        <label>Etiqueta de listado (Productos o Servicios)</label>
        <input id=\"items_label\" value=\"{selected['items_label']}\" />
      </div>

      <div class=\"field\">
        <label>Items ({selected['items_label']})</label>
        <div id=\"itemsEditor\"></div>
        <button class=\"btn ghost\" type=\"button\" id=\"addItemBtn\" style=\"margin-top:8px\">Agregar item</button>
      </div>

      <div class=\"row\">
        <button class=\"btn\" id=\"saveBtn\">Guardar cambios</button>
        <a class=\"btn ghost\" href=\"/site/{selected['slug']}?edit=1\" target=\"_blank\">Editor visual</a>
        <a class=\"btn ghost\" id=\"previewBtn\" href=\"/site/{selected['slug']}\" target=\"_blank\">Vista previa</a>
      </div>
      <p class=\"footer\" id=\"status\">Edita y guarda. Usa estado activo/inactivo para mostrar u ocultar productos.</p>
    </section>

    <script>
      {selector_js}
      const initialItems = {items_json};
      const initialFaq = {faq_json};
      const itemsEditor = document.getElementById('itemsEditor');
      const faqEditor = document.getElementById('faqEditor');
      const addItemBtn = document.getElementById('addItemBtn');
      const addFaqBtn = document.getElementById('addFaqBtn');
      const saveBtn = document.getElementById('saveBtn');
      const previewBtn = document.getElementById('previewBtn');
      const status = document.getElementById('status');

      function itemRowHtml(item = {{ name: '', description: '', price: '', category: '', status: 'active', image: '', badge: '', search_terms: '', featured: false }}) {{
        return `
          <div class="card" style="margin-bottom:8px;padding:10px">
            <div class="field">
              <label>Nombre</label>
              <input class="item-name" value="${{item.name || ''}}" />
            </div>
            <div class="field">
              <label>Descripcion</label>
              <input class="item-description" value="${{item.description || ''}}" />
            </div>
            <div class="field">
              <label>Precio</label>
              <input class="item-price" value="${{item.price || ''}}" />
            </div>
            <div class="field">
              <label>Categoria</label>
              <input class="item-category" value="${{item.category || ''}}" />
            </div>
            <div class="field">
              <label>Badge o sello</label>
              <input class="item-badge" value="${{item.badge || ''}}" />
            </div>
            <div class="field">
              <label>Palabras clave de busqueda</label>
              <input class="item-search-terms" value="${{item.search_terms || ''}}" />
            </div>
            <div class="field">
              <label>Imagen (URL)</label>
              <input class="item-image" value="${{item.image || ''}}" />
            </div>
            <div class="field">
              <label>Estado</label>
              <select class="item-status">
                <option value="active" ${{item.status === 'active' ? 'selected' : ''}}>Activo</option>
                <option value="inactive" ${{item.status === 'inactive' ? 'selected' : ''}}>Inactivo</option>
              </select>
            </div>
            <div class="field">
              <label>Mostrar en destacados</label>
              <input class="item-featured" type="checkbox" ${{item.featured ? 'checked' : ''}} />
            </div>
            <div class="row">
              <button type="button" class="btn ghost item-up">Subir</button>
              <button type="button" class="btn ghost item-down">Bajar</button>
              <button type="button" class="btn ghost item-remove">Eliminar</button>
            </div>
          </div>
        `;
      }}

      function renderItems(items) {{
        itemsEditor.innerHTML = items.map((item) => itemRowHtml(item)).join('');
        bindRemoveEvents();
      }}

      function faqRowHtml(item = {{ q: '', a: '' }}) {{
        return `
          <div class="card" style="margin-bottom:8px;padding:10px">
            <div class="field">
              <label>Pregunta</label>
              <input class="faq-q" value="${{item.q || ''}}" />
            </div>
            <div class="field">
              <label>Respuesta</label>
              <textarea class="faq-a">${{item.a || ''}}</textarea>
            </div>
            <div class="row">
              <button type="button" class="btn ghost faq-up">Subir</button>
              <button type="button" class="btn ghost faq-down">Bajar</button>
              <button type="button" class="btn ghost faq-remove">Eliminar</button>
            </div>
          </div>
        `;
      }}

      function renderFaq(items) {{
        faqEditor.innerHTML = items.map((item) => faqRowHtml(item)).join('');
        bindFaqEvents();
      }}

      function bindRemoveEvents() {{
        itemsEditor.querySelectorAll('.item-remove').forEach((btn) => {{
          btn.addEventListener('click', () => {{
            btn.closest('.card').remove();
          }});
        }});
        itemsEditor.querySelectorAll('.item-up').forEach((btn) => {{
          btn.addEventListener('click', () => {{
            const card = btn.closest('.card');
            const prev = card.previousElementSibling;
            if (prev) {{
              itemsEditor.insertBefore(card, prev);
            }}
          }});
        }});
        itemsEditor.querySelectorAll('.item-down').forEach((btn) => {{
          btn.addEventListener('click', () => {{
            const card = btn.closest('.card');
            const next = card.nextElementSibling;
            if (next) {{
              itemsEditor.insertBefore(next, card);
            }}
          }});
        }});
      }}

      function bindFaqEvents() {{
        faqEditor.querySelectorAll('.faq-remove').forEach((btn) => {{
          btn.addEventListener('click', () => {{
            btn.closest('.card').remove();
          }});
        }});
        faqEditor.querySelectorAll('.faq-up').forEach((btn) => {{
          btn.addEventListener('click', () => {{
            const card = btn.closest('.card');
            const prev = card.previousElementSibling;
            if (prev) {{
              faqEditor.insertBefore(card, prev);
            }}
          }});
        }});
        faqEditor.querySelectorAll('.faq-down').forEach((btn) => {{
          btn.addEventListener('click', () => {{
            const card = btn.closest('.card');
            const next = card.nextElementSibling;
            if (next) {{
              faqEditor.insertBefore(next, card);
            }}
          }});
        }});
      }}

      function collectItems() {{
        const blocks = [...itemsEditor.querySelectorAll('.card')];
        return blocks
          .map((block) => {{
            const name = block.querySelector('.item-name').value.trim();
            const description = block.querySelector('.item-description').value.trim();
            const price = block.querySelector('.item-price').value.trim();
            const category = block.querySelector('.item-category').value.trim() || 'Productos';
            const badge = block.querySelector('.item-badge').value.trim();
            const search_terms = block.querySelector('.item-search-terms').value.trim();
            const image = block.querySelector('.item-image').value.trim();
            const status = block.querySelector('.item-status').value;
            const featured = block.querySelector('.item-featured').checked;
            return {{ name, description, price, category, badge, search_terms, image, status, featured }};
          }})
          .filter((item) => item.name.length > 0);
      }}

      function collectFaq() {{
        const blocks = [...faqEditor.querySelectorAll('.card')];
        return blocks
          .map((block) => {{
            const q = block.querySelector('.faq-q').value.trim();
            const a = block.querySelector('.faq-a').value.trim();
            return {{ q, a }};
          }})
          .filter((item) => item.q.length > 0 && item.a.length > 0);
      }}

      addItemBtn.addEventListener('click', () => {{
        itemsEditor.insertAdjacentHTML('beforeend', itemRowHtml());
        bindRemoveEvents();
      }});

      addFaqBtn.addEventListener('click', () => {{
        faqEditor.insertAdjacentHTML('beforeend', faqRowHtml());
        bindFaqEvents();
      }});

      renderItems(initialItems);
      renderFaq(initialFaq);

      saveBtn.addEventListener('click', async () => {{
        const payload = {{
          name: document.getElementById('name').value,
          category: document.getElementById('category').value,
          city: document.getElementById('city').value,
          address: document.getElementById('address').value,
          open_hours: document.getElementById('open_hours').value,
          order_note: document.getElementById('order_note').value,
          whatsapp: document.getElementById('whatsapp').value,
          hero_title: document.getElementById('hero_title').value,
          short_description: document.getElementById('short_description').value,
          hero_subtitle: document.getElementById('hero_subtitle').value,
          about_text: document.getElementById('about_text').value,
          map_query: document.getElementById('map_query').value,
          brand_tagline: document.getElementById('brand_tagline').value,
          hero_badge: document.getElementById('hero_badge').value,
          utility_badges: document.getElementById('utility_badges').value.split('\\n').map((line) => line.trim()).filter(Boolean),
          hero_highlights: document.getElementById('hero_highlights').value.split('\\n').map((line) => line.trim()).filter(Boolean),
          hero_image: document.getElementById('hero_image').value.trim(),
          hero_secondary_image: document.getElementById('hero_secondary_image').value.trim(),
          hero_caption_title: document.getElementById('hero_caption_title').value,
          hero_caption_text: document.getElementById('hero_caption_text').value,
          hero_note_label: document.getElementById('hero_note_label').value,
          hero_note_title: document.getElementById('hero_note_title').value,
          hero_note_text: document.getElementById('hero_note_text').value,
          story_image: document.getElementById('story_image').value.trim(),
          story_title: document.getElementById('story_title').value,
          story_points: document.getElementById('story_points').value.split('\\n').map((line) => line.trim()).filter(Boolean),
          featured_title: document.getElementById('featured_title').value,
          featured_subtitle: document.getElementById('featured_subtitle').value,
          cakes_title: document.getElementById('cakes_title').value,
          cakes_subtitle: document.getElementById('cakes_subtitle').value,
          cake_gallery: document.getElementById('cake_gallery').value.split('\\n').map((line) => line.trim()).filter(Boolean),
          catalog_title: document.getElementById('catalog_title').value,
          catalog_subtitle: document.getElementById('catalog_subtitle').value,
          catalog_placeholder: document.getElementById('catalog_placeholder').value,
          contact_title: document.getElementById('contact_title').value,
          contact_text: document.getElementById('contact_text').value,
          footer_note: document.getElementById('footer_note').value,
          faq: collectFaq(),
          items_label: document.getElementById('items_label').value,
          items: collectItems()
        }};

        if (!/^\\d{{10,15}}$/.test(payload.whatsapp)) {{
          status.textContent = 'WhatsApp invalido. Usa solo numeros, ejemplo 573001112233.';
          return;
        }}

        const slug = '{selected['slug']}';
        const res = await fetch('/api/business/' + slug, {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify(payload)
        }});

        if (res.ok) {{
          status.textContent = 'Guardado con exito.';
          previewBtn.href = '/site/' + slug;
        }} else if (res.status === 403) {{
          status.textContent = 'No tienes permiso para editar este negocio.';
        }} else if (res.status === 401) {{
          status.textContent = 'Tu sesion vencio. Entra de nuevo.';
        }} else {{
          status.textContent = 'No se pudo guardar. Revisa los datos.';
        }}
      }});
    </script>
    """

    return html_layout("Panel Admin", body)


class Handler(BaseHTTPRequestHandler):
    def _get_session(self):
        cleanup_sessions()
        cookies = parse_cookie(self.headers.get("Cookie"))
        token = cookies.get(SESSION_COOKIE)
        if not token:
            return None

        info = SESSIONS.get(token)
        if not info:
            return None

        if info.get("expires", 0) < time.time():
            del SESSIONS[token]
            return None

        return info

    def _send_html(self, html, status=HTTPStatus.OK, cookie=None):
        encoded = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(encoded)

    def _send_json(self, payload, status=HTTPStatus.OK, cookie=None):
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(encoded)

    def _send_bytes(self, content, content_type, status=HTTPStatus.OK):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def _redirect(self, location, cookie=None):
        self.send_response(HTTPStatus.FOUND)
        self.send_header("Location", location)
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path.startswith("/uploads/"):
            relative = path.removeprefix("/uploads/")
            target = (UPLOADS_DIR / relative).resolve()
            try:
                target.relative_to(UPLOADS_DIR.resolve())
            except Exception:
                self._send_html(html_layout("No encontrado", "<h1>Archivo no encontrado</h1>"), HTTPStatus.NOT_FOUND)
                return

            if not target.exists() or not target.is_file():
                self._send_html(html_layout("No encontrado", "<h1>Archivo no encontrado</h1>"), HTTPStatus.NOT_FOUND)
                return

            content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
            self._send_bytes(target.read_bytes(), content_type)
            return

        if path == "/":
            self._send_html(home_html())
            return

        if path == "/login":
            self._send_html(owner_login_html())
            return

        if path == "/client-login":
            slug = qs.get("slug", [None])[0]
            self._send_html(client_login_html(selected_slug=slug))
            return

        if path == "/logout":
            cookies = parse_cookie(self.headers.get("Cookie"))
            token = cookies.get(SESSION_COOKIE)
            if token and token in SESSIONS:
                del SESSIONS[token]
            self._redirect("/", cookie=f"{SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly")
            return

        if path == "/admin":
            session = self._get_session()
            if not session:
                self._redirect("/login")
                return

            if session.get("role") == "owner":
                slug = qs.get("slug", [None])[0]
                self._send_html(admin_html(slug, role="owner"))
                return

            if session.get("role") == "client":
                self._send_html(admin_html(role="client", fixed_slug=session.get("slug")))
                return

            self._redirect("/login")
            return

        if path.startswith("/site/"):
            slug = path.split("/site/", 1)[1]
            session = self._get_session()
            wants_edit = qs.get("edit", ["0"])[0] in {"1", "true", "yes"}
            can_edit = session_can_edit_business(session, slug)

            if wants_edit and not can_edit:
                login_path = "/login" if session and session.get("role") == "owner" else f"/client-login?slug={slug}"
                self._redirect(login_path)
                return

            page = site_html(slug, edit_mode=wants_edit and can_edit, can_edit=can_edit)
            if page:
                self._send_html(page)
            else:
                self._send_html(html_layout("No encontrado", "<h1>Negocio no encontrado</h1>"), HTTPStatus.NOT_FOUND)
            return

        self._send_html(html_layout("No encontrado", "<h1>Ruta no encontrada</h1>"), HTTPStatus.NOT_FOUND)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)

        if path == "/login":
            data = load_data()
            form = parse_qs(raw.decode("utf-8", errors="ignore"))
            password = form.get("password", [""])[0]
            if password == data.get("admin", {}).get("owner_password"):
                token = create_session("owner")
                self._redirect("/admin", cookie=f"{SESSION_COOKIE}={token}; Path=/; Max-Age={SESSION_TTL_SECONDS}; HttpOnly")
            else:
                self._send_html(owner_login_html("Contrasena incorrecta."), HTTPStatus.UNAUTHORIZED)
            return

        if path == "/client-login":
            form = parse_qs(raw.decode("utf-8", errors="ignore"))
            slug = form.get("slug", [""])[0]
            password = form.get("password", [""])[0]
            business, _ = find_business(slug)
            if business and password == business.get("client_password"):
                token = create_session("client", slug=slug)
                self._redirect(f"/site/{slug}?edit=1", cookie=f"{SESSION_COOKIE}={token}; Path=/; Max-Age={SESSION_TTL_SECONDS}; HttpOnly")
            else:
                self._send_html(client_login_html("Datos incorrectos.", selected_slug=slug), HTTPStatus.UNAUTHORIZED)
            return

        if path.startswith("/api/upload/"):
            session = self._get_session()
            if not session:
                self._send_json({"error": "No autorizado"}, HTTPStatus.UNAUTHORIZED)
                return

            slug = path.split("/api/upload/", 1)[1]
            if not session_can_edit_business(session, slug):
                self._send_json({"error": "No permitido"}, HTTPStatus.FORBIDDEN)
                return

            try:
                payload = json.loads(raw.decode("utf-8"))
            except Exception:
                self._send_json({"error": "JSON invalido"}, HTTPStatus.BAD_REQUEST)
                return

            try:
                url = upload_file_from_data_url(slug, payload.get("filename", ""), payload.get("data_url", ""))
            except ValueError as exc:
                self._send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
                return

            self._send_json({"ok": True, "url": url})
            return

        if not path.startswith("/api/business/"):
            self._send_json({"error": "Ruta no encontrada"}, HTTPStatus.NOT_FOUND)
            return

        session = self._get_session()
        if not session:
            self._send_json({"error": "No autorizado"}, HTTPStatus.UNAUTHORIZED)
            return

        slug = path.split("/api/business/", 1)[1]

        if session.get("role") == "client" and session.get("slug") != slug:
            self._send_json({"error": "No permitido"}, HTTPStatus.FORBIDDEN)
            return

        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            self._send_json({"error": "JSON invalido"}, HTTPStatus.BAD_REQUEST)
            return

        business, data = find_business(slug)
        if not business:
            self._send_json({"error": "Negocio no encontrado"}, HTTPStatus.NOT_FOUND)
            return

        updated_business = dict(business)
        updated_business.update(payload)
        updated_business["slug"] = slug
        core_required = [
            "name",
            "category",
            "city",
            "address",
            "open_hours",
            "order_note",
            "whatsapp",
            "hero_title",
            "short_description",
            "hero_subtitle",
            "about_text",
            "map_query",
            "items_label",
            "items",
        ]
        if any(str(updated_business.get(key, "")).strip() == "" for key in core_required if key != "items"):
            self._send_json({"error": "Faltan campos obligatorios"}, HTTPStatus.BAD_REQUEST)
            return

        if not isinstance(updated_business.get("items"), list):
            self._send_json({"error": "Items debe ser una lista"}, HTTPStatus.BAD_REQUEST)
            return

        if not isinstance(updated_business.get("cake_gallery"), list):
            self._send_json({"error": "La galeria de tortas debe ser una lista"}, HTTPStatus.BAD_REQUEST)
            return

        for list_field in ["utility_badges", "hero_highlights", "story_points"]:
            if not isinstance(updated_business.get(list_field), list):
                self._send_json({"error": f"{list_field} debe ser una lista"}, HTTPStatus.BAD_REQUEST)
                return

        if not isinstance(updated_business.get("faq"), list):
            self._send_json({"error": "FAQ debe ser una lista"}, HTTPStatus.BAD_REQUEST)
            return

        whatsapp = str(updated_business.get("whatsapp", "")).strip()
        if not whatsapp.isdigit() or not (10 <= len(whatsapp) <= 15):
            self._send_json({"error": "WhatsApp invalido"}, HTTPStatus.BAD_REQUEST)
            return

        updated_business["whatsapp"] = whatsapp

        for bool_field in [
            "show_announcement",
            "show_featured",
            "show_cakes",
            "show_story",
            "show_catalog",
            "show_contact",
            "show_faq",
            "show_category_shortcuts",
            "show_catalog_filters",
            "show_catalog_search",
            "show_category_boards",
            "show_whatsapp_float",
        ]:
            updated_business[bool_field] = as_bool(updated_business.get(bool_field), False)

        try:
            updated_business["featured_limit"] = max(1, min(12, int(updated_business.get("featured_limit", 4))))
        except Exception:
            updated_business["featured_limit"] = 4

        for color_field in [
            "theme_background",
            "theme_surface",
            "theme_surface_strong",
            "theme_text",
            "theme_muted",
            "theme_line",
            "theme_soft",
            "theme_accent",
            "theme_accent_dark",
        ]:
            value = str(updated_business.get(color_field, "")).strip()
            if value and not is_hex_color(value):
                self._send_json({"error": f"{color_field} debe usar color HEX como #b86736"}, HTTPStatus.BAD_REQUEST)
                return

        for image_field in ["hero_image", "hero_secondary_image", "story_image"]:
            value = str(updated_business.get(image_field, "")).strip()
            if value and not is_valid_image_reference(value):
                self._send_json({"error": f"{image_field} debe usar una URL valida"}, HTTPStatus.BAD_REQUEST)
                return

        for image_url in updated_business.get("cake_gallery", []):
            value = str(image_url).strip()
            if value and not is_valid_image_reference(value):
                self._send_json({"error": "La galeria de tortas debe usar URLs validas"}, HTTPStatus.BAD_REQUEST)
                return

        for row in updated_business.get("faq", []):
            if not isinstance(row, dict):
                self._send_json({"error": "FAQ invalido"}, HTTPStatus.BAD_REQUEST)
                return
            question = str(row.get("q", "")).strip()
            answer = str(row.get("a", "")).strip()
            if not question or not answer:
                self._send_json({"error": "Cada pregunta frecuente debe tener pregunta y respuesta"}, HTTPStatus.BAD_REQUEST)
                return

        for item in updated_business.get("items", []):
            if not isinstance(item, dict):
                self._send_json({"error": "Item invalido"}, HTTPStatus.BAD_REQUEST)
                return

            name = str(item.get("name", "")).strip()
            price = str(item.get("price", "")).strip()
            status = str(item.get("status", "active")).strip().lower()
            image = str(item.get("image", "")).strip()
            item["badge"] = str(item.get("badge", "")).strip()
            item["search_terms"] = str(item.get("search_terms", "")).strip()
            item["featured"] = as_bool(item.get("featured"), False)
            item["category"] = str(item.get("category", "")).strip() or updated_business.get("items_label", "Productos")

            if not name:
                self._send_json({"error": "Cada item debe tener nombre"}, HTTPStatus.BAD_REQUEST)
                return

            if status not in {"active", "inactive"}:
                self._send_json({"error": "Estado invalido en item"}, HTTPStatus.BAD_REQUEST)
                return

            # Acepta precios numericos con punto o palabra Cotizar.
            price_ok = (
                price.lower() == "cotizar"
                or all(ch.isdigit() or ch in "., " for ch in price)
            )
            if not price_ok:
                self._send_json({"error": "Precio invalido en item"}, HTTPStatus.BAD_REQUEST)
                return

            if image and not is_valid_image_reference(image):
                self._send_json({"error": "La imagen debe ser una URL valida"}, HTTPStatus.BAD_REQUEST)
                return

            if not image:
                item["image"] = default_product_image(item)

        for b in data["businesses"]:
            if b.get("slug") == slug:
                keep_password = b.get("client_password", "cliente123")
                b.update(updated_business)
                b["client_password"] = keep_password
                break

        save_data(data)
        self._send_json({"ok": True})


if __name__ == "__main__":
    data = load_data()
    save_data(data)
    ensure_uploads_dir()

    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Sistema iniciado en http://{HOST}:{PORT}")
    print("Admin (dueno): /login")
    print("Clientes: /client-login")
    print("Contrasena admin por defecto: andres2026")
    server.serve_forever()
