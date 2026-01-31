"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import JsonLdGraph from "@/components/JsonLdGraph";
import NodeSidebar from "@/components/NodeSidebar";
import { Button } from "@/components/ui/button";
import { buildGraphIndex } from "@/lib/jsonld";
import { useGraphQuery } from "@/lib/api";

export default function HomePage() {
  const { data, isLoading, error, refetch } = useGraphQuery();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const index = useMemo(() => buildGraphIndex(data), [data]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">Rumor Graph</h1>
          <p className="text-sm text-muted-foreground">Live view of the public rumor graph.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Link
            href="/public"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Public API
          </Link>
        </div>
      </header>

      <main className="flex flex-1 gap-4 p-6">
        <section className="flex-1 space-y-4">
          {isLoading ? (
            <div className="flex h-[600px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">Loading graph...</p>
            </div>
          ) : error ? (
            <div className="flex h-[600px] items-center justify-center rounded-lg border border-destructive/40 bg-destructive/5">
              <p className="text-sm text-destructive">
                {(error as Error).message || "Failed to load graph."}
              </p>
            </div>
          ) : (
            <div className="h-[600px]">
              <JsonLdGraph document={data} onSelectNode={setSelectedNodeId} />
            </div>
          )}
        </section>
        <aside className="w-full max-w-sm">
          <NodeSidebar index={index} selectedNodeId={selectedNodeId} />
        </aside>
      </main>
    </div>
  );
}
