import { useState } from 'react';
import { Task } from '../types';

/**
 * Search state hook.
 */
export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | Task['type']>('all');

  return {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
  };
}
