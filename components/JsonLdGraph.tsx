"use client";

import "@xyflow/react/dist/style.css";

import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useMemo } from "react";

import { buildGraphIndex, getRelationEdges } from "@/lib/jsonld";
import { layoutGraph } from "@/lib/layout";
import type { JsonLdDocument } from "@/lib/types";

export type JsonLdGraphProps = {
  document?: JsonLdDocument | null;
  onSelectNode: (id: string | null) => void;
};

export default function JsonLdGraph({ document, onSelectNode }: JsonLdGraphProps) {
  const { nodes, edges } = useMemo(() => buildGraphIndex(document), [document]);

  const { flowNodes, flowEdges } = useMemo(() => {
    const nodeItems: Node[] = nodes.map((node) => ({
      id: node["@id"],
      data: { label: node.value ?? node["@id"] },
      position: { x: 0, y: 0 },
      style: {
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        padding: 12,
        background: "#fff",
        width: 200,
      },
    }));

    const relationEdges = getRelationEdges(edges).filter(
      (edge) => edge.from && edge.to
    );
    const edgeItems: Edge[] = relationEdges.map((edge) => ({
      id: edge["@id"],
      source: edge.from as string,
      target: edge.to as string,
      label: edge.value ?? edge.kind ?? "Relation",
      animated: true,
    }));

    const layoutedNodes = layoutGraph(nodeItems, edgeItems);
    return { flowNodes: layoutedNodes, flowEdges: edgeItems };
  }, [nodes, edges]);

  return (
    <div className="h-full w-full rounded-lg border border-border bg-white">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
      >
        <Background gap={18} size={1} />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
