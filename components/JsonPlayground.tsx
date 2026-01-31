"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { JsonLdDocument } from "@/lib/types";

export type JsonPlaygroundProps<TPayload> = {
  title: string;
  description: string;
  initialPayload: TPayload;
  onSubmit: (payload: TPayload) => Promise<JsonLdDocument>;
};

export default function JsonPlayground<TPayload>({
  title,
  description,
  initialPayload,
  onSubmit,
}: JsonPlaygroundProps<TPayload>) {
  const [value, setValue] = useState(() => JSON.stringify(initialPayload, null, 2));
  const [response, setResponse] = useState<JsonLdDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(value) as TPayload;
      const result = await onSubmit(parsed);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="font-mono text-xs"
          rows={10}
        />
        <Button onClick={handleSend} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {response ? (
          <details className="rounded-md border border-border bg-muted/30 p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Response JSON-LD
            </summary>
            <pre className="mt-3 overflow-auto text-xs">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}
