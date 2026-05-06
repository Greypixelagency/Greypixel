import { FC, useState, ChangeEvent } from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { FilterState } from './types';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export const Filters: FC<FiltersProps> = ({ filters, onFilterChange, className = '' }) => {
  const clearFilters = () => {
    onFilterChange({ search: '', dateFrom: '', dateTo: '', module: 'all' });
  };

  return (
    <div className={`bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients, names..."
            value={filters.search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
        </div>

        {/* Date From */}
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange({ ...filters, dateFrom: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange({ ...filters, dateTo: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
        </div>

        {/* Module Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filters.module}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onFilterChange({ ...filters, module: e.target.value as FilterState['module'] })}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all cursor-pointer"
          >
            <option value="all">All Modules</option>
            <option value="invoices">Invoices</option>
            <option value="contracts">Contracts</option>
            <option value="quotations">Quotations</option>
            <option value="clients">Clients</option>
            <option value="expenses">Expenses</option>
            <option value="hosting">Hosting</option>
            <option value="pipeline">Pipeline</option>
          </select>
        </div>
      </div>

      {/* Active Filters & Clear */}
      {(filters.search || filters.dateFrom || filters.dateTo || filters.module !== 'all') && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.search && (
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700">
              {filters.search}
              <button
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.dateFrom && (
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700">
              From: {filters.dateFrom}
              <button
                onClick={() => onFilterChange({ ...filters, dateFrom: '' })}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.dateTo && (
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700">
              To: {filters.dateTo}
              <button
                onClick={() => onFilterChange({ ...filters, dateTo: '' })}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.module !== 'all' && (
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700">
              {filters.module}
              <button
                onClick={() => onFilterChange({ ...filters, module: 'all' })}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 underline ml-auto"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

