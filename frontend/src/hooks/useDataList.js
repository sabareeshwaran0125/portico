import { useState, useMemo } from 'react';

/**
 * A custom hook to handle search, filtering, and pagination for any list.
 * @param {Array} initialData - The raw dataset
 * @param {Function} searchFilterFn - A function(item, searchQuery, filterState) that returns true if item matches
 * @param {Object} defaultFilterState - Initial filter state (e.g., { status: 'ALL' })
 * @param {Number} pageSize - Items per page
 */
export default function useDataList(initialData = [], searchFilterFn, defaultFilterState = {}, pageSize = 10) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState(defaultFilterState);
  const [currentPage, setCurrentPage] = useState(1);

  // When search or filter changes, reset to page 1
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return initialData.filter(item => searchFilterFn(item, searchQuery.toLowerCase(), filterState));
  }, [initialData, searchQuery, filterState, searchFilterFn]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const nextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    filterState,
    setFilterState: handleFilterChange,
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    totalItems: filteredData.length
  };
}
