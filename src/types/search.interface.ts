import type { ContextMenuTargetType } from './context-menu.interface';

export type SearchResults = ISearchResult | null;
export type SearchResult = ISearchResult;

export type SearchReducerAction =
  | { type: 'SHOW_RESULTS'; keyword: string; results: SearchResult[] }
  | { type: 'SHOW_NO_RESULTS_MSG'; keyword: string }
  | { type: 'CLOSE' };

export type SearchState = {
  show: boolean;
  keyword: string;
  results: SearchResult[];
};

export interface ISearchResult {
  id: string;
  bucket_id: string;
  name: string;
  type: ContextMenuTargetType;
  owner: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
  path: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
}
