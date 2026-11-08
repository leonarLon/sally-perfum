// @vitest-environment node
import { describe, expect, it } from "vitest";
import { detectImageType } from "./upload-images.mjs";

describe("validação de upload por assinatura binária (grupo 18)", () => {
  it("reconhece JPEG, PNG e WebP pelos magic bytes", () => {
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))?.mime).toBe("image/jpeg");
    expect(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))?.mime).toBe("image/png");
    expect(detectImageType(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP")]))?.mime).toBe("image/webp");
  });

  it("rejeita HTML/SVG/script disfarçado de imagem", () => {
    expect(detectImageType(Buffer.from("<html><script>alert(1)</script>"))).toBeNull();
    expect(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">'))).toBeNull();
    expect(detectImageType(Buffer.from("GIF89a"))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
  });
});
