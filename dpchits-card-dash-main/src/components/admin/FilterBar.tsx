import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, CalendarIcon, Download, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface FilterBarProps {
  filters: {
    search: string;
    dateRange: { from: Date | null; to: Date | null };
    frequency: string;
  };
  onFiltersChange: (filters: any) => void;
  expanded?: boolean;
}

export const FilterBar = ({ filters, onFiltersChange, expanded = false }: FilterBarProps) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFrequencyChange = (value: string) => {
    onFiltersChange({ ...filters, frequency: value });
  };

  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    onFiltersChange({ ...filters, dateRange: range });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      dateRange: { from: null, to: null },
      frequency: "all"
    });
  };

  const handleExport = () => {
    // In a real app, this would export the filtered data
    alert("Exporting filtered data... (Feature coming soon)");
  };

  return (
    <div className={`space-y-4 ${expanded ? 'p-4 bg-muted/20 rounded-lg' : ''}`}>
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or invoice..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Frequency Filter */}
        <div className="min-w-[150px] space-y-2">
          <label className="text-sm font-medium">Frequency</label>
          <Select value={filters.frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="All frequencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <div className="min-w-[200px] space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from || undefined}
                selected={{
                  from: filters.dateRange.from || undefined,
                  to: filters.dateRange.to || undefined,
                }}
                onSelect={(range) => handleDateRangeChange({
                  from: range?.from || null,
                  to: range?.to || null
                })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleClearFilters} size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
        <Button variant="secondary" onClick={handleExport} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
};