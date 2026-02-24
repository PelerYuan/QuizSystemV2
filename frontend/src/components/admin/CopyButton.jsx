import { useState, useRef } from "react";

function CopyButton(content = "COPY", text = "") {
  const [copied, setCopied] = useState(false);
  const [timeRef, setTimeRef] = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);
      if (timeRef.current) {
        clearTimeout(timeRef.current);
        timeRef.current = setTimeout(() => {
          setCopied(false);
        }, 1200);
      }

      alert("Copied!");
    } catch (e) {
      alert("Copy failed (permission denied).");
    }
  };

  return (
    <button className="copy-btn" type="button" onClick={copy}>
      {copied ? "COPIED!" : content}
    </button>
  );
}

export default CopyButton;