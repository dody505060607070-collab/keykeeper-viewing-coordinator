import { describe, it, expect } from "vitest";
import { pdfItemsToText } from "./pdf-text";
import { parseEjarContract } from "./ejar-parser";

// عناصر pdf.js تأتي بترتيب بصري (يسار ← يمين) وكل عنصر بترتيبه المنطقي
const visual = (s: string) =>
  s.split("|").map((str) => ({ str, dir: str === " " ? "ltr" : "rtl", width: str === " " ? 3 : 4 }));

describe("قراءة الأسماء العربية من ملف العقد", () => {
  it("«حسام الدين» لا تتحول إلى «حسااملدين»", () => {
    const items = [
      { str: "Name", dir: "ltr", width: 19 },
      { str: " ", dir: "ltr", width: 300 },
      ...visual("ﻦ|ﻳ|ﺪ|ﻟ|م ا|ﺎ|ﺴ|ﺣ"),
    ];
    expect(pdfItemsToText(items)).toBe("Name  حسام الدين");
  });
  it("كلمتان منفصلتان بمسافة تبقيان بالترتيب الصحيح", () => {
    expect(pdfItemsToText(visual("ﻲ|ﻟ|وا| |ﺮ|ﻫ|ﺎ|ﻣ"))).toBe("ماهر والي");
  });
});

const sample = [
  "Contract Data     بيانات العقد     1",
  "Contract No.     10000000001 / 1-0     :  رقم سجل العقد",
  "Tenancy End Date     2026-11-12     تاريخ نهاية مدة الإيجار:     Tenancy Start Date     2025-11-13     تاريخ بداية مدة الإيجار:",
  "Lessor Data     بيانات المؤجّر     2",
  "Name     فهد بن علي النمير     :  الاسم",
  "ID No.     1000000001     :  رقم الهوية",
  "Tenant Data     بيانات المستأجر     4",
  "Company",
  "name/Founder",
  "ورشة سالم",
  "لصيانة السيارات",
  ":  اسم الشركة/المؤسسة     CR No.     1131000000     رقم السجل التجاري:",
  "Email     test@gmail.c",
  "om     :  البريد الإلكتروني",
  "Property Data     بيانات العقار     8",
  "National Address     بريدة     ،     52379     ، الريان ،     7997     حسن الاهدل ،     ،     4527     :  العنوان الوطني",
  "Number of Rent",
  "Payments:     2     عدد دفعات الإيجار:",
].join("\n");

describe("تحليل عقد إيجار بنص مرتب", () => {
  const p = parseEjarContract(sample)!;
  it("اسم المالك كامل", () => expect(p.owner_name).toBe("فهد بن علي النمير"));
  it("اسم المنشأة الممتد على سطرين", () => expect(p.tenant_name).toBe("ورشة سالم لصيانة السيارات"));
  it("البريد المقسوم على سطرين", () => expect(p.tenant_email).toBe("test@gmail.com"));
  it("الحي من العنوان الوطني", () => expect(p.district).toBe("الريان"));
  it("عدد الدفعات من تسمية مقسومة", () => expect(p.payments_count).toBe(2));
  it("رقم العقد وتواريخه", () => {
    expect(p.contract_number).toBe("10000000001");
    expect(p.start_date).toBe("2025-11-13");
    expect(p.end_date).toBe("2026-11-12");
  });
});
