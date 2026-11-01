#!/usr/bin/env python3
"""Mở từng trang trong docs/ bằng Chrome headless, ghi lỗi console và chụp ảnh."""
import sys, pathlib, asyncio
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).parent / "docs"
OUT = pathlib.Path("/tmp/claude-0/shots"); OUT.mkdir(parents=True, exist_ok=True)

async def run(pages, width, dark, actions):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = await b.new_context(viewport={"width": width, "height": 900}, color_scheme="dark" if dark else "light", device_scale_factor=1)
        await ctx.route(lambda u: not u.startswith("file:"), lambda r: r.abort())
        for name in pages:
            pg = await ctx.new_page()
            errs = []
            pg.on("console", lambda m, e=errs: e.append(m.text) if m.type == "error" and "net::" not in m.text else None)
            pg.on("pageerror", lambda ex, e=errs: e.append("PAGEERROR " + str(ex)))
            await pg.goto((ROOT / name).as_uri())
            await pg.wait_for_timeout(1500)
            for a in actions.get(name, []):
                try:
                    await pg.evaluate(a)
                except Exception as ex:
                    errs.append("ACTION " + str(ex))
                await pg.wait_for_timeout(1200)
            ovf = await pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            tag = name.replace("/", "_").replace(".html", "") + f"_{width}{'d' if dark else ''}"
            await pg.screenshot(path=str(OUT / f"{tag}.png"), full_page=False)
            print(f"{name} w={width} dark={dark} overflow={ovf} errors={errs[:5]}")
            await pg.close()
        await b.close()

if __name__ == "__main__":
    args = sys.argv[1:]
    width = 1280; dark = False
    if "--mobile" in args: width = 400; args.remove("--mobile")
    if "--dark" in args: dark = True; args.remove("--dark")
    pages = args or ["index.html"] + sorted("bai/" + f.name for f in (ROOT / "bai").glob("*.html"))
    asyncio.run(run(pages, width, dark, {}))
