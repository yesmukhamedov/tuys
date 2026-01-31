export type JsonLdContext = Record<string, unknown>;

export type JsonLdEntry = {
  "@id": string;
  "@type": string;
  value?: string;
  [key: string]: unknown;
};

export type JsonLdDocument = {
  "@context"?: JsonLdContext;
  "@graph": JsonLdEntry[];
};

export type NodePublicForm = {
  id?: string;
  value: string;
  effectiveAt?: string;
};

export type NodeValueForm = {
  id: string;
  value: string;
  effectiveAt?: string;
};

export type EdgePublicForm = {
  id?: string;
  kind: "Relation" | "Category" | "Note";
  from?: string;
  to?: string;
  value?: string;
  effectiveAt?: string;
};

export type EdgeValueForm = {
  id: string;
  value: string;
  effectiveAt?: string;
};

export type PhonePublicForm = {
  id?: string;
  node: string;
  pattern?: string;
  digits?: string;
  value?: string;
  effectiveAt?: string;
};

export type PublicGraphPostRequest = {
  nodes?: NodePublicForm[];
  edges?: EdgePublicForm[];
  phones?: PhonePublicForm[];
};

export type PublicValuesPatchRequest = {
  nodeValues?: NodeValueForm[];
  edgeValues?: EdgeValueForm[];
};

export type JsonLdNode = JsonLdEntry & {
  "@type": "Node";
  value?: string;
};

export type JsonLdEdge = JsonLdEntry & {
  "@type": "Edge";
  kind?: "Relation" | "Category" | "Note";
  from?: string;
  to?: string;
  value?: string;
};

export type JsonLdPhone = JsonLdEntry & {
  "@type": "Phone";
  node?: string;
  pattern?: string;
  digits?: string;
  value?: string;
};
