// Renders a JSON-LD <script>. Structured data is read by both search engines
// (rich results) and AI answer engines (GEO) to extract facts from the page.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe inside a script tag; escape '<' defensively.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
