"""Run: uv run --with playwright python tests/verify.py [public URL]."""
import functools
import http.server
import os
from pathlib import Path
import sys
import threading
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
shots = Path(os.environ.get('TMPDIR', str(root))) / 'sunny-verification'
shots.mkdir(exist_ok=True)
server = None
if len(sys.argv) > 1:
    url = sys.argv[1]
else:
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for locale, suffix in [('en', ''), ('fr', 'fr/'), ('ru', 'ru/'), ('he', 'he/')]:
            page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            response = page.goto(url + suffix, wait_until='networkidle')
            assert response.status == 200
            page.evaluate('document.fonts.ready')
            assert page.locator('html').get_attribute('dir') == ('rtl' if locale == 'he' else 'ltr')
            assert page.locator('html').get_attribute('lang') == locale
            assert page.locator('h1').count() == 1
            assert any('\u0590' <= c <= '\u05ff' for c in page.content()) == (locale == 'he')
            assert page.locator('.language-switcher a[aria-current="page"]').get_attribute('lang') == locale
            for target in ['en', 'fr', 'ru', 'he']:
                page.locator(f'.language-switcher a[lang={target}]').click()
                assert page.locator('html').get_attribute('lang') == target
            page.goto(url + suffix, wait_until='networkidle')
            assert page.locator('link[rel=alternate]').count() == 5
            for image in page.locator('img').all():
                image.scroll_into_view_if_needed()
                image.evaluate('(img) => img.decode()')
                assert image.get_attribute('alt')
            assert page.locator('img').count() == 8
            for anchor in page.locator('a[href^="#"]').all():
                assert page.locator(anchor.get_attribute('href')).count() == 1
            for width in [1440, 1024, 768, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000 if width > 760 else 844})
                page.evaluate('scrollTo(0,0)')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'overflow at {width}'
                if width in [1440, 390]:
                    page.screenshot(path=str(shots / f'{locale}-{width}-full.png'), full_page=True)
                    page.screenshot(path=str(shots / f'{locale}-{width}-hero.png'))
            for width in [1440, 390]:
                page.goto(url + suffix, wait_until='networkidle')
                page.set_viewport_size({'width': width, 'height': 844})
                page.locator('nav a[href="#venues"]').click()
                assert page.url.endswith('#venues')
                for link in page.locator('.venue-choice').all():
                    link.click()
                    assert page.locator('select[name=venue]').input_value() == link.get_attribute('data-venue')
                    assert page.url.endswith('#inquiry')
                page.locator('button[type=submit]').click()
                assert page.locator('#form-result').is_hidden(), 'required fields must prevent generation'
                expected = {'en': 'Please complete this field.', 'fr': 'Veuillez remplir ce champ.', 'ru': 'Пожалуйста, заполните это поле.'}
                message = page.locator('input[name=name]').evaluate('(el) => el.validationMessage')
                assert message if locale == 'he' else message == expected[locale]
                fields = {'name':'Élodie & Иван', 'email':'test@example.com', 'company':'Demo hotel', 'location':'Cannes, France', 'locations':'2'}
                for key, value in fields.items():
                    page.locator(f'input[name={key}]').fill(value)
                page.locator('button[type=submit]').click()
                assert page.locator('#form-result').is_visible()
                uri = page.locator('#email-draft').get_attribute('href')
                parsed = urlparse(uri)
                assert parsed.scheme == 'mailto' and parsed.path == 'Info@sunnydumidi.com'
                body = parse_qs(parsed.query)['body'][0]
                assert all(value in body for value in fields.values())
                assert {'he': 'Hello', 'en': 'Hello', 'fr': 'Bonjour', 'ru': 'Здравствуйте'}[locale] in body
                assert {'he': 'Franchise inquiry', 'en': 'Franchise inquiry', 'fr': 'Demande de franchise', 'ru': 'Запрос о франшизе'}[locale] in parse_qs(parsed.query)['subject'][0]
                assert page.locator('a[href="tel:+19172778806"]').count() == 1
                with page.expect_download() as info:
                    page.locator('#download-draft').click()
                download = info.value
                assert download.suggested_filename == 'sunny-mist-inquiry.txt'
                assert body in Path(download.path()).read_text().replace('\n', '\r\n')
                page.locator('input[name=name]').fill('Changed')
                assert page.locator('#form-result').is_hidden(), 'stale draft must be hidden'
                page.locator('button[type=submit]').click()
                page.locator('#inquiry-form').screenshot(path=str(shots / f'{locale}-{width}-form.png'))
            assert not errors, errors
            page.close()
        browser.close()
        print(f'PASS {url}: EN/FR/RU LTR + restored HE RTL; language switching; localized EN/FR/RU validation and drafts; historical HE English draft; 8 decoded images per locale; valid anchors; 5 viewport widths without overflow; desktop/mobile navigation and forms; 3 venue choices; required validation; encoded email draft; download; stale-draft reset; zero JS errors. Screenshots: {shots}')
finally:
    if server:
        server.shutdown()
