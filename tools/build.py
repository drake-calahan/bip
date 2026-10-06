import re, os, json
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd=lambda p: open(os.path.join(root,p),encoding='utf-8').read()
body=rd('src/body.html')
eng=rd('src/engine.js').replace("if (typeof module !== 'undefined') module.exports","// export Node").split('// export Node')[0]
ball=rd('src/ball.js').split("if (typeof module !== 'undefined')")[0]
lev=rd('src/levels.js').split("if (typeof module !== 'undefined')")[0]
app_files=['app-core.js','app-home.js','app-game.js','app-ball.js','app-sandbox.js','app-main.js']
app='\n'.join(rd('src/'+n) for n in app_files)
app="(function () {\n'use strict';\n"+app+"\n})();"
page=body.replace('/*@ENGINE@*/',eng).replace('/*@BALL@*/',ball).replace('/*@LEVELS@*/',lev).replace('/*@APP@*/',app)
os.makedirs(os.path.join(root,'.artifact'),exist_ok=True)
open(os.path.join(root,'.artifact/bip.html'),'w',encoding='utf-8').write(page)


# ---------- Version installable (PWA) ----------
head = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#EAF3F3">
<meta name="description" content="Bip le robot : un jeu pour initier les enfants de 5 à 7 ans à la programmation et aux petites machines, avec des blocs.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Bip">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-180.png">
<style>:root{color-scheme:light;padding-block:env(safe-area-inset-top,0px) env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
'''
tail = '''
<script>
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
</script>
</body>
</html>
'''
open(os.path.join(root,'index.html'),'w',encoding='utf-8').write(head+page+tail)
manifest = {
  "name": "Bip le robot", "short_name": "Bip", "lang": "fr",
  "description": "Programme le petit robot Bip, construis des machines et prépare le grand pique-nique. Initiation à l'algorithmique pour les 5-7 ans.",
  "start_url": "./", "scope": "./", "id": "./",
  "display": "standalone", "display_override": ["fullscreen", "standalone"], "orientation": "any",
  "background_color": "#EAF3F3", "theme_color": "#EAF3F3",
  "categories": ["education", "kids", "games"],
  "icons": [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "icons/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
    {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
open(os.path.join(root,'manifest.webmanifest'),'w',encoding='utf-8').write(json.dumps(manifest, ensure_ascii=False, indent=2))
print('pwa ok')
