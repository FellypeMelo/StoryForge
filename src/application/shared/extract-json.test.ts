import { describe, it, expect } from "vitest";
import { extractJson } from "./extract-json";

describe("extractJson", () => {
  it("parseia JSON limpo (objeto)", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("parseia JSON limpo (array)", () => {
    expect(extractJson("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("remove preâmbulo antes do objeto", () => {
    const text = "No explanations, just JSON.\n\n{\"isValid\": true, \"reason\": \"ok\"}";
    expect(extractJson(text)).toEqual({ isValid: true, reason: "ok" });
  });

  it("remove texto após o objeto", () => {
    const text = '{"a":1}\n\nEspero que ajude!';
    expect(extractJson(text)).toEqual({ a: 1 });
  });

  it("remove cerca markdown ```json", () => {
    const text = 'Aqui está:\n```json\n{"a":1}\n```\nfim';
    expect(extractJson(text)).toEqual({ a: 1 });
  });

  it("remove cerca markdown ``` sem linguagem", () => {
    const text = "```\n[{\"x\":1}]\n```";
    expect(extractJson(text)).toEqual([{ x: 1 }]);
  });

  it("respeita chaves dentro de strings", () => {
    const text = 'preâmbulo {"msg":"contém } e { literais","n":2} rabo';
    expect(extractJson(text)).toEqual({ msg: "contém } e { literais", n: 2 });
  });

  it("respeita aspas escapadas dentro de strings", () => {
    const text = '{"q":"ele disse \\"oi\\" e saiu"}';
    expect(extractJson(text)).toEqual({ q: 'ele disse "oi" e saiu' });
  });

  it("extrai objeto aninhado completo", () => {
    const text = 'lixo antes {"a":{"b":[1,2,{"c":3}]}} lixo depois';
    expect(extractJson(text)).toEqual({ a: { b: [1, 2, { c: 3 }] } });
  });

  it("prefere array quando aparece antes do objeto", () => {
    const text = 'resposta: [{"protagonist":"X"}] e um {objeto} solto';
    expect(extractJson(text)).toEqual([{ protagonist: "X" }]);
  });

  it("lança erro claro quando não há JSON", () => {
    expect(() => extractJson("sem json aqui")).toThrow(/Nenhum JSON/i);
  });

  it("lança erro quando o JSON está truncado", () => {
    expect(() => extractJson('{"a":1')).toThrow();
  });
});

import { asText, asTextArray } from "./extract-json";

describe("asText", () => {
  it("string passa direto", () => expect(asText("oi")).toBe("oi"));
  it("array vira texto juntado", () => expect(asText(["a", "b"])).toBe("a b"));
  it("null/undefined viram vazio", () => {
    expect(asText(null)).toBe("");
    expect(asText(undefined)).toBe("");
  });
  it("número vira string", () => expect(asText(42)).toBe("42"));
  it("objeto concatena valores", () => expect(asText({ a: "x", b: "y" })).toBe("x y"));
});

describe("asTextArray", () => {
  it("array de strings passa", () => expect(asTextArray(["a", "b"])).toEqual(["a", "b"]));
  it("string única vira array de um", () => expect(asTextArray("solo")).toEqual(["solo"]));
  it("vazio vira array vazio", () => expect(asTextArray(null)).toEqual([]));
});
