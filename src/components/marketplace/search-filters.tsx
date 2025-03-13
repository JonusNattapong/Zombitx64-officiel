'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  initialSearch?: string;
  initialCategory?: string;
  categories: string[];
}

export function SearchFilters({ initialSearch, initialCategory, categories }: SearchFiltersProps) {
  const handleSearchChange = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('search', value);
    url.searchParams.delete('page');
    window.location.href = url.toString();
  };

  const handleCategoryChange = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', value);
    url.searchParams.delete('page');
    window.location.href = url.toString();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Search products..."
        className="max-w-sm"
        defaultValue={initialSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <Select
        defaultValue={initialCategory}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="max-w-[200px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category.toLowerCase()}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 