# Katkı Sağlamak

Bu bir kişisel portfolyo projesidir, açık katkıya kapalı. Ama:

- **Bug bulduysan:** Issue aç, ekran görüntüsü ekle.
- **Senaryo önerisi varsa:** Issue aç, MITRE technique'lerini belirt.
- **Fork edip kendi versiyonunu yapmak istersen:** MIT lisansı, buyur.

## Geliştirme

```bash
git clone https://github.com/yatuk/soc-simulation.git
cd soc-simulation/frontend
npm install
npm run dev
```

## Commit Formatı

Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

## Kod Standartları

- UI metinleri Türkçe, kod/değişken/commit mesajları İngilizce
- `any` yasak. Gerekirse `unknown` + type guard
- Tüm public component'lerin prop tipi olsun
- Component başına max 250 satır, dosya başına max 3 component
- Tailwind class'ları veya CSS modülleri, inline style yok
- `import.meta.env.BASE_URL` kullan, hardcoded path yazma
