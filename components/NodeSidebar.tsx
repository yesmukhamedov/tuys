"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCategories,
  getIncomingRelations,
  getNotes,
  getOutgoingRelations,
} from "@/lib/jsonld";
import type { GraphIndex } from "@/lib/jsonld";

export type NodeSidebarProps = {
  index: GraphIndex;
  selectedNodeId: string | null;
};

export default function NodeSidebar({ index, selectedNodeId }: NodeSidebarProps) {
  if (!selectedNodeId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Node Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Select a node to see details.
        </CardContent>
      </Card>
    );
  }

  const node = index.nodesById[selectedNodeId];
  const phones = index.phonesByNodeId[selectedNodeId] ?? [];
  const categories = getCategories(index.edges, selectedNodeId);
  const notes = getNotes(index.edges, selectedNodeId);
  const incoming = getIncomingRelations(index.edges, selectedNodeId);
  const outgoing = getOutgoingRelations(index.edges, selectedNodeId);

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>Node Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Node</p>
          <p className="text-lg font-semibold">{node?.value ?? selectedNodeId}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Phones</p>
          {phones.length === 0 ? (
            <p className="text-muted-foreground">No phones linked.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {phones.map((phone) => (
                <li key={phone["@id"]}>
                  {phone.value ?? phone.digits ?? phone["@id"]}
                  {phone.pattern ? ` (${phone.pattern})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Public Categories</p>
          {categories.length === 0 ? (
            <p className="text-muted-foreground">No categories.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {categories.map((edge) => (
                <li key={edge["@id"]}>{edge.value ?? edge["@id"]}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Private Notes</p>
          {notes.length === 0 ? (
            <p className="text-muted-foreground">No notes.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {notes.map((edge) => (
                <li key={edge["@id"]}>{edge.value ?? edge["@id"]}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Relations</p>
          <div className="space-y-2">
            <div>
              <p className="font-medium">Incoming</p>
              {incoming.length === 0 ? (
                <p className="text-muted-foreground">No incoming relations.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-4">
                  {incoming.map((edge) => (
                    <li key={edge["@id"]}>
                      {edge.value ?? edge["@id"]} from {edge.from}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="font-medium">Outgoing</p>
              {outgoing.length === 0 ? (
                <p className="text-muted-foreground">No outgoing relations.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-4">
                  {outgoing.map((edge) => (
                    <li key={edge["@id"]}>
                      {edge.value ?? edge["@id"]} to {edge.to}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
