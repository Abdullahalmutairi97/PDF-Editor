/**
 * Minimal raw PDF object writer used to build small "stamp" documents
 * (page-number overlays, image watermarks) without any external PDF
 * library. Byte offsets are computed exactly from the serialized object
 * buffers, so the resulting xref table is always valid.
 */
export class PdfWriter {
  private objects: Buffer[] = [Buffer.alloc(0)]; // index 0 is unused (object numbers start at 1)

  /** Adds a plain (non-stream) object and returns its object number. */
  addObject(dict: string): number {
    const n = this.objects.length;
    this.objects.push(Buffer.from(`${n} 0 obj\n${dict}\nendobj\n`, "latin1"));
    return n;
  }

  /** Adds a stream object (dict must NOT include /Length; it is added automatically). */
  addStream(dict: string, data: Buffer): number {
    const n = this.objects.length;
    const fullDict = `${dict.replace(/>>\s*$/, "")} /Length ${data.length} >>`;
    const header = Buffer.from(`${n} 0 obj\n${fullDict}\nstream\n`, "latin1");
    const footer = Buffer.from(`\nendstream\nendobj\n`, "latin1");
    this.objects.push(Buffer.concat([header, data, footer]));
    return n;
  }

  /** Reserves an object number that can be referenced before its content is known (e.g. the Pages tree). */
  reserveObject(): number {
    const n = this.objects.length;
    this.objects.push(Buffer.alloc(0));
    return n;
  }

  /** Fills in a previously reserved object number with its final (non-stream) content. */
  setObject(n: number, dict: string): void {
    this.objects[n] = Buffer.from(`${n} 0 obj\n${dict}\nendobj\n`, "latin1");
  }

  serialize(catalogObjNum: number): Buffer {
    const head = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1");
    const offsets: number[] = [0];
    const body: Buffer[] = [];
    let offset = head.length;

    for (let i = 1; i < this.objects.length; i++) {
      offsets.push(offset);
      body.push(this.objects[i]);
      offset += this.objects[i].length;
    }

    const xrefOffset = offset;
    let xref = `xref\n0 ${this.objects.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < this.objects.length; i++) {
      xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${this.objects.length} /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.concat([head, ...body, Buffer.from(xref, "latin1"), Buffer.from(trailer, "latin1")]);
  }
}

export function escapePdfString(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
