'use client';

interface LegalContentRendererProps {
  content: string;
}

/**
 * Renderiza texto legal com formatação markdown-like.
 * Reconhece: **títulos**, - listas, parágrafos, linhas em branco.
 */
export function LegalContentRenderer({ content }: LegalContentRendererProps) {
  return (
    <div className="prose prose-invert prose-neutral max-w-none">
      {content.split('\n').map((paragraph, index) => {
        const trimmed = paragraph.trim();

        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <h3 key={index} className="text-lg font-bold text-white mt-6 mb-3">
              {trimmed.replace(/\*\*/g, '')}
            </h3>
          );
        }

        if (trimmed.startsWith('- ')) {
          return (
            <li key={index} className="text-neutral-300 ml-4 mb-2">
              {trimmed.replace(/^- /, '')}
            </li>
          );
        }

        if (trimmed === '') {
          return <br key={index} />;
        }

        return (
          <p key={index} className="text-neutral-300 leading-relaxed mb-4">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
