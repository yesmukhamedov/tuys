import type { JsonLdDocument, JsonLdEdge, JsonLdEntry, JsonLdNode, JsonLdPhone } from "@/lib/types";

export type GraphIndex = {
  nodes: JsonLdNode[];
  edges: JsonLdEdge[];
  phones: JsonLdPhone[];
  nodesById: Record<string, JsonLdNode>;
  edgesByKind: Record<string, JsonLdEdge[]>;
  phonesByNodeId: Record<string, JsonLdPhone[]>;
};

const isType = <T extends JsonLdEntry>(entry: JsonLdEntry, type: string): entry is T =>
  entry["@type"] === type;

export function buildGraphIndex(document?: JsonLdDocument | null): GraphIndex {
  const nodes: JsonLdNode[] = [];
  const edges: JsonLdEdge[] = [];
  const phones: JsonLdPhone[] = [];

  const nodesById: Record<string, JsonLdNode> = {};
  const edgesByKind: Record<string, JsonLdEdge[]> = {};
  const phonesByNodeId: Record<string, JsonLdPhone[]> = {};

  if (!document) {
    return { nodes, edges, phones, nodesById, edgesByKind, phonesByNodeId };
  }

  for (const entry of document["@graph"] ?? []) {
    if (isType<JsonLdNode>(entry, "Node")) {
      nodes.push(entry);
      nodesById[entry["@id"]] = entry;
    } else if (isType<JsonLdEdge>(entry, "Edge")) {
      edges.push(entry);
      const kind = entry.kind ?? "Unknown";
      edgesByKind[kind] = edgesByKind[kind] ?? [];
      edgesByKind[kind].push(entry);
    } else if (isType<JsonLdPhone>(entry, "Phone")) {
      phones.push(entry);
      if (entry.node) {
        phonesByNodeId[entry.node] = phonesByNodeId[entry.node] ?? [];
        phonesByNodeId[entry.node].push(entry);
      }
    }
  }

  return { nodes, edges, phones, nodesById, edgesByKind, phonesByNodeId };
}

export function getRelationEdges(edges: JsonLdEdge[]) {
  return edges.filter((edge) => edge.kind === "Relation");
}

export function getEdgesByNode(edges: JsonLdEdge[], nodeId: string) {
  return edges.filter((edge) => edge.from === nodeId || edge.to === nodeId);
}

export function getIncomingRelations(edges: JsonLdEdge[], nodeId: string) {
  return edges.filter((edge) => edge.kind === "Relation" && edge.to === nodeId);
}

export function getOutgoingRelations(edges: JsonLdEdge[], nodeId: string) {
  return edges.filter((edge) => edge.kind === "Relation" && edge.from === nodeId);
}

export function getCategories(edges: JsonLdEdge[], nodeId: string) {
  return edges.filter((edge) => edge.kind === "Category" && edge.to === nodeId);
}

export function getNotes(edges: JsonLdEdge[], nodeId: string) {
  return edges.filter((edge) => edge.kind === "Note" && edge.from === nodeId);
}
