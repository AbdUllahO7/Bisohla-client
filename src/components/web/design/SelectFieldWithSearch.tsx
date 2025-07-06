"use client"

import React, { useState, useMemo } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface SelectFieldWithSearchProps {
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (field: string, value: string) => void
  onBlur?: (field: string, value: string) => void
  name: string
  placeholder: string
  label?: string
  className?: string
  SelectTriggerStyle?: string
  required?: boolean
  error?: string
}

const SelectFieldWithSearch: React.FC<SelectFieldWithSearchProps> = ({
  options,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  label,
  className,
  SelectTriggerStyle,
  required = false,
  error,
  
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // Find the selected option label
  const selectedOption = options.find((option) => option.value === value)

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    onChange(name, selectedValue)
    if (onBlur) onBlur(name, selectedValue)
    setOpen(false)
    setSearchTerm("")
  }

  // Handle blur event
  const handleBlur = () => {
    if (onBlur) onBlur(name, value)
    setSearchTerm("")
  }

  // Prevent Enter key from closing the popover
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  return (
    <div className={cn("w-full  ", className)}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) handleBlur()
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left hover:text-primary text-primary  bg-white hover:bg-transparent",
              error ? "border-red-500" : "",
              SelectTriggerStyle
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className=" bg-white shadow-lg border-primary-light" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <div className="relative">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className="w-full pr-10 pl-8 py-2 text-sm border-b text-primary border-white rounded-t-md focus:ring-0"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
          <Command>
            <CommandList className="max-h-[200px] overflow-auto bg-white">
              <CommandEmpty>No results found</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer text-primary hover:bg-primary-light"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default SelectFieldWithSearch