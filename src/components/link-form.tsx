"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function LinkFormLink({ isMembership = false }: { isMembership?: boolean }) {
  const [fullUrl, setFullUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const path = isMembership ? "/membership" : "/form";

  useEffect(() => {
    setFullUrl(`${window.location.protocol}//${window.location.host}${path}`);
  }, [path]);

  const copyLink = async () => {
    if (!fullUrl) {
      alert(" URL is not available yet!");
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy link");
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">
        {isMembership ? "Copy New Life Membership link" : "Copy Data Update Form link"}
      </h2>
      <div className="flex w-full gap-2">
        <input
          type="text"
          value={fullUrl}
          readOnly
          disabled
          className="w-full p-2 border border-gray-400 rounded-lg bg-gray-100 text-gray-700"
        />
        <Button
          variant="default"
          size="lg"
          onClick={copyLink}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
