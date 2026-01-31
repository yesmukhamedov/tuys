import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  JsonLdDocument,
  PublicGraphPostRequest,
  PublicValuesPatchRequest,
} from "@/lib/types";

const DEFAULT_BASE_URL = "http://localhost:8080";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
}

async function parseErrorResponse(response: Response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { error?: string };
    return parsed.error ?? text;
  } catch {
    return text;
  }
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await parseErrorResponse(response);
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function getGraph(
  params?: Record<string, string>
): Promise<JsonLdDocument> {
  const baseUrl = getBaseUrl();
  const url = new URL("/public/graph", baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  return requestJson<JsonLdDocument>(url.toString(), {
    headers: {
      Accept: "application/ld+json",
    },
  });
}

export async function postGraph(
  payload: PublicGraphPostRequest
): Promise<JsonLdDocument> {
  const baseUrl = getBaseUrl();
  return requestJson<JsonLdDocument>(`${baseUrl}/public/graph`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/ld+json",
    },
    body: JSON.stringify(payload),
  });
}

export async function patchValues(
  payload: PublicValuesPatchRequest
): Promise<JsonLdDocument> {
  const baseUrl = getBaseUrl();
  return requestJson<JsonLdDocument>(`${baseUrl}/public/values`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/ld+json",
    },
    body: JSON.stringify(payload),
  });
}

export const graphQueryKey = ["graph"] as const;

export function useGraphQuery() {
  return useQuery({
    queryKey: graphQueryKey,
    queryFn: () => getGraph(),
  });
}

export function usePostGraphMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postGraph,
    onSuccess: (data) => {
      queryClient.setQueryData(graphQueryKey, data);
    },
  });
}

export function usePatchValuesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchValues,
    onSuccess: (data) => {
      queryClient.setQueryData(graphQueryKey, data);
    },
  });
}
