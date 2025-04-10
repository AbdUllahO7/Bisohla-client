'use client'
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CarConditionTableProps {
  carSections: Array<{ id: string; name: string }>;
  conditionTypes: Array<{ value: string; label: string; colorClass: string }>;
  damages: Record<string, string>;
  isStatusSelected: (sectionId: string, conditionTypeValue: string) => boolean;
  onSectionStatusChange: (sectionId: string, conditionTypeValue: string) => void;
  labels: {
    carSectionName: string;
  };
  groupedSections?: Array<{ label: string; options: Array<{ value: string; label: string }> }>;
}

/**
 * Car condition table component for selecting condition status for different car sections
 */
const CarConditionTable: React.FC<CarConditionTableProps> = ({
  carSections,
  conditionTypes,
  damages,
  isStatusSelected,
  onSectionStatusChange,
  labels,
  groupedSections
}) => {
  const [filter, setFilter] = useState("all");
  
  // Filter car sections based on selected group
  const filteredSections = filter === "all" 
    ? carSections 
    : carSections.filter(section => {
        // Map group names to section prefixes for filtering
        if (filter === "front") {
          return section.id.includes("front");
        } else if (filter === "rear") {
          return section.id.includes("rear");
        } else if (filter === "left") {
          return section.id.includes("left");
        } else if (filter === "right") {
          return section.id.includes("right");
        } else if (filter === "roof") {
          return section.id === "roof";
        } else if (filter === "glass") {
          return section.id.includes("window") || section.id.includes("windshield");
        } else if (filter === "wheels") {
          return section.id.includes("wheel");
        }
        return true;
      });

  return (
    <div className="w-full overflow-x-auto p-4">
      {/* Filter by section groups */}
      {groupedSections && (
        <div className="mb-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[280px] text-primary">
              <SelectValue placeholder="Filter by section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {groupedSections.map(group => (
                <SelectItem 
                  key={group.label} 
                  value={group.label.toLowerCase().split(' ')[0]}
                >
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Car Condition Table */}
      <Table className="min-w-[800px] w-full text-center">
        <TableHeader>
          <TableRow className="text-center hover:bg-transparent border-gray-200 border-1">
            {/* Table Heads */}
            <TableHead className="min-w-[150px] text-start">{labels.carSectionName}</TableHead>
            {conditionTypes.map((conditionType) => (
              <TableHead key={conditionType.value} className="min-w-[160px]">
                <div className={`${conditionType.colorClass} text-white justify-center font-bold py-2 rounded-3xl flex gap-2 items-center mx-auto text-sm md:text-base`}>
                  <Circle size={20} className="text-primary" />
                  {conditionType.label}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSections.map((section) => (
            <TableRow
              key={section.id}
              className="text-center text-primary hover:bg-transparent border-gray-300 hover:bg-background group duration-300"
            >
              <TableCell className="font-medium text-sm md:text-base text-start">{section.name}</TableCell>
              {conditionTypes.map((conditionType) => (
                <TableCell key={`${section.id}-${conditionType.value}`}>
                  <Checkbox 
                    id={`${conditionType.value}-${section.id}`} 
                    className="rounded-full text-primary h-5 w-5"
                    checked={isStatusSelected(section.id, conditionType.value)}
                    onCheckedChange={() => onSectionStatusChange(section.id, conditionType.value)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(CarConditionTable);