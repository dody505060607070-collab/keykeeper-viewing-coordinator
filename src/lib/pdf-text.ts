// يحوّل عناصر نص pdf.js إلى نص مقروء بترتيب صحيح للعربية.
// pdf.js يُخرج العناصر بترتيب بصري (من اليسار لليمين)، بينما كل عنصر عربي
// مكتوب بترتيبه المنطقي. لذا نعكس ترتيب العناصر داخل كل مقطع عربي فقط،
// ونترك التسميات الإنجليزية والأرقام المستقلة كما هي.

export type PdfTextItem = { str: string; dir?: string; width?: number; hasEOL?: boolean };

const AR = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const NEUTRAL = /^[\s:،,.()\-/]*$/;
/** مسافة بين كلمات داخل الجملة نفسها (وليس فاصل أعمدة). */
const WORD_GAP = 6;

const isArabic = (it: PdfTextItem) => it.dir === "rtl" || AR.test(it.str);

export function pdfItemsToText(items: PdfTextItem[]): string {
  const out: string[] = [];
  let i = 0;
  while (i < items.length) {
    const it = items[i]!;
    if (!isArabic(it)) {
      out.push(it.str);
      if (it.hasEOL) out.push("\n");
      i += 1;
      continue;
    }
    // اجمع مقطعًا عربيًا متصلًا: عناصر عربية + فواصل قصيرة/علامات بينها + أرقام ملتصقة
    const run: PdfTextItem[] = [];
    let j = i;
    while (j < items.length) {
      const cur = items[j]!;
      if (isArabic(cur)) {
        run.push(cur);
        j += 1;
        if (cur.hasEOL) break;
        continue;
      }
      const narrow = (cur.width ?? 0) <= WORD_GAP;
      const neutral = NEUTRAL.test(cur.str) && (cur.str.trim() !== "" || narrow);
      // تابع فقط إذا كان بعد الفاصل عنصر عربي آخر
      if (neutral && !cur.hasEOL) {
        let k = j + 1;
        while (k < items.length && NEUTRAL.test(items[k]!.str) && (items[k]!.width ?? 0) <= WORD_GAP && !items[k]!.hasEOL) k += 1;
        if (k < items.length && isArabic(items[k]!)) {
          run.push(...items.slice(j, k));
          j = k;
          continue;
        }
      }
      break;
    }
    const text = run
      .slice()
      .reverse()
      .map((r) => (r.str.trim() === "" ? " " : r.str))
      .join("")
      .replace(/[ \t]+/g, " ")
      .trim();
    out.push(text);
    if (run[run.length - 1]?.hasEOL) out.push("\n");
    i = j;
  }
  // نفصل العناصر بمسافتين لتبقى حدود التسمية/القيمة واضحة للمحلّل
  return out
    .join("  ")
    .replace(/ *\n */g, "\n")
    .normalize("NFKC")
    // علامات التشكيل تخرج كعناصر منفصلة وتفصل الكلمة؛ نحذفها (شقَّة ← شقة)
    .replace(/ *[\u064B-\u0652\u0670] */g, "")
    .trim();
}
