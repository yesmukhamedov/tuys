"use client";

import Link from "next/link";

import JsonPlayground from "@/components/JsonPlayground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatchValuesMutation, usePostGraphMutation } from "@/lib/api";
import type { PublicGraphPostRequest, PublicValuesPatchRequest } from "@/lib/types";

const graphExample: PublicGraphPostRequest = {
  nodes: [
    { value: "Ayan", effectiveAt: "2024-01-15T09:00:00Z" },
    { value: "Mira", effectiveAt: "2024-01-15T09:00:00Z" },
  ],
  edges: [
    {
      kind: "Relation",
      from: "node:1",
      to: "node:2",
      value: "parent",
      effectiveAt: "2024-01-15T09:00:00Z",
    },
  ],
  phones: [
    {
      node: "node:1",
      pattern: "KZ",
      value: "+7 (777) 000-0000",
      effectiveAt: "2024-01-15T09:00:00Z",
    },
  ],
};

const valuesExample: PublicValuesPatchRequest = {
  nodeValues: [
    { id: "node:1", value: "Ayan K.", effectiveAt: "2024-02-01T09:00:00Z" },
  ],
  edgeValues: [
    { id: "edge:10", value: "guardian", effectiveAt: "2024-02-01T09:00:00Z" },
  ],
};

export default function PublicPage() {
  const postGraphMutation = usePostGraphMutation();
  const patchValuesMutation = usePatchValuesMutation();

  return (
    <div className="min-h-screen space-y-8 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Public API</h1>
          <p className="text-sm text-muted-foreground">
            Submit new graph data or patch values using the public endpoints.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Back to graph
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ul className="list-disc space-y-2 pl-4">
              <li>
                <strong>Node</strong> — Person or entity represented in the graph.
              </li>
              <li>
                <strong>Edge</strong> — Relation, Category, or Note connecting nodes.
              </li>
              <li>
                <strong>Phone</strong> — Phone number attached to a node.
              </li>
            </ul>
            <p className="text-muted-foreground">
              Values are versioned. Use <code>effectiveAt</code> to indicate when the value becomes
              active.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payload examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                PublicGraphPostRequest
              </p>
              <pre className="mt-2 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
                {JSON.stringify(graphExample, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                PublicValuesPatchRequest
              </p>
              <pre className="mt-2 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
                {JSON.stringify(valuesExample, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <JsonPlayground
          title="POST /public/graph"
          description="Submit new nodes, edges, and phones to the public graph."
          initialPayload={graphExample}
          onSubmit={(payload) => postGraphMutation.mutateAsync(payload)}
        />
        <JsonPlayground
          title="PATCH /public/values"
          description="Patch values for existing nodes and edges."
          initialPayload={valuesExample}
          onSubmit={(payload) => patchValuesMutation.mutateAsync(payload)}
        />
      </section>
    </div>
  );
}
