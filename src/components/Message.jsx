import { useEffect, useRef, useState } from "react";
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp, User } from "lucide-react";
import "./Message.css";

function useCopy(getText) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      // Clipboard can be blocked by the browser; fail quietly.
    }
  }
  return [copied, copy];
}

const SAFE_URL = /^(https?:\/\/|mailto:)/i;

function renderInline(text) {
  const pattern = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/g;
  const out = [];
  let last = 0;
  let key = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];

    if (token.startsWith("`")) {
      out.push(<code key={key++} className="message__inline-code">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      out.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      out.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else {
      const parts = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (parts && SAFE_URL.test(parts[2])) {
        out.push(
          <a key={key++} className="message__link" href={parts[2]} target="_blank" rel="noopener noreferrer">
            {parts[1]}
          </a>
        );
      } else {
        out.push(token);
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const isFence = (l) => /^```/.test(l);
const isHeading = (l) => /^#{1,3}\s+/.test(l);
const isBullet = (l) => /^\s*[-*]\s+/.test(l);
const isNumbered = (l) => /^\s*\d+\.\s+/.test(l);
const isBlockStart = (l) => isFence(l) || isHeading(l) || isBullet(l) || isNumbered(l);

function parseBlocks(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isFence(line)) {
      const lang = line.replace(/^```/, "").trim();
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", lang, text: code.join("\n") });
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    if (isHeading(line)) {
      const m = line.match(/^(#{1,3})\s+(.*)$/);
      blocks.push({ type: "heading", level: m[1].length, text: m[2] });
      i++;
      continue;
    }

    if (isBullet(line) || isNumbered(line)) {
      const ordered = isNumbered(line);
      const test = ordered ? isNumbered : isBullet;
      const strip = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      const items = [];
      while (i < lines.length && test(lines[i])) {
        items.push(lines[i].replace(strip, ""));
        i++;
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join("\n") });
  }
  return blocks;
}

function CodeBlock({ code, language }) {
  const [copied, copy] = useCopy(() => code);

  return (
    <div className="message__code">
      <div className="message__code-bar">
        <span className="message__code-lang">{language || "code"}</span>
        <button
          type="button"
          className="message__code-copy"
          onClick={copy}
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="message__pre" tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RichText({ content }) {
  return (
    <>
      {parseBlocks(content).map((block, i) => {
        switch (block.type) {
          case "code":
            return <CodeBlock key={i} code={block.text} language={block.lang} />;
          case "heading": {
            const Tag = `h${block.level + 2}`;
            return <Tag key={i} className="message__heading">{renderInline(block.text)}</Tag>;
          }
          case "ul":
            return (
              <ul key={i} className="message__list">
                {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="message__list">
                {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
              </ol>
            );
          default:
            return <p key={i} className="message__p">{renderInline(block.text)}</p>;
        }
      })}
    </>
  );
}

export default function Message({
  role = "assistant",
  content,
  text,
  showActions = true,
  onRegenerate,
  onFeedback,
}) {
  const isUser = role === "user";
  const body = content ?? text ?? "";
  const [feedback, setFeedback] = useState(null);
  const [copied, copy] = useCopy(() => body);

  function handleFeedback(type) {
    const next = feedback === type ? null : type;
    setFeedback(next);
    onFeedback?.(next);
  }

  if (isUser) {
    return (
      <article className="message message--user" aria-label="Your message">
        <div className="message__avatar message__avatar--user" aria-hidden="true">
          <User size={16} />
        </div>
        <div className="message__bubble">{body}</div>
      </article>
    );
  }

  return (
    <article className="message message--assistant" aria-label="Beymon AI message">
      <svg className="message__avatar message__avatar--ai" viewBox="0 0 80 80" aria-hidden="true">
        <rect width="80" height="80" rx="20" fill="#4F46E5" />
        <path d="M28 20 V58" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 20 H42 a9 9 0 0 1 0 18 H28" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 38 H46 a9 9 0 0 1 0 18 H28" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="64" cy="16" r="5" fill="#2DD4BF" />
      </svg>

      <div className="message__main">
        <div className="message__content">
          <RichText content={body} />
        </div>

        {showActions && (
          <div className="message__actions" role="group" aria-label="Response actions">
            <button
              type="button"
              className="message__action"
              onClick={copy}
              aria-label={copied ? "Response copied" : "Copy response"}
              title="Copy response"
            >
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="message__action"
              onClick={() => handleFeedback("like")}
              aria-label="Good response"
              aria-pressed={feedback === "like"}
              title="Good response"
            >
              <ThumbsUp size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="message__action"
              onClick={() => handleFeedback("dislike")}
              aria-label="Bad response"
              aria-pressed={feedback === "dislike"}
              title="Bad response"
            >
              <ThumbsDown size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="message__action"
              onClick={onRegenerate}
              aria-label="Regenerate response"
              title="Regenerate response"
            >
              <RefreshCw size={16} aria-hidden="true" />
            </button>
            <span className="message__sr" role="status">
              {copied ? "Response copied to clipboard" : ""}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}