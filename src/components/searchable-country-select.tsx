'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CountryCodeOption } from '@/core/entities/enums/country-codes.enum'

interface SearchableCountrySelectProps {
  value: string
  onChange: (value: string) => void
  options: CountryCodeOption[]
  placeholder?: string
  className?: string
  dir?: 'ltr' | 'rtl'
}

export const SearchableCountrySelect: React.FC<SearchableCountrySelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select country',
  className = '',
  dir = 'ltr',
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Find the selected option
  const selectedOption = options.find((option) => option.value === value)

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options

    const query = searchQuery.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query) ||
        option.country?.toLowerCase().includes(query) 
    )
  }, [options, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full h-11 justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          dir={dir}
        >
          {selectedOption ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedOption.flag}</span>
              <span className="font-semibold">{selectedOption.value}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0"
        align="start"
        dir={dir}
        style={{ zIndex: 99999 }}
      >
        <Command dir={dir}>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              dir={dir}
            />
          </div>
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? '' : currentValue)
                  setOpen(false)
                  setSearchQuery('')
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{option.flag}</span>
                  <span className="font-medium">{option.value}</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {option.country}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}