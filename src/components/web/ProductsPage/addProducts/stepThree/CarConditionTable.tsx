'use client'
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CarConditionTableProps } from "./types";

const CarConditionTable: React.FC<CarConditionTableProps> = ({
  carSections = [],
  conditionTypes = [],
  damages = {},
  isStatusSelected = () => false,
  onSectionStatusChange = () => {},
  labels = { carSectionName: "Car Section" },
  groupedSections = []
}) => {
  if (carSections.length === 0 || conditionTypes.length === 0) {
    return <div className="p-4 text-center">No car condition data available</div>;
  }

  return (
    <div className="w-full overflow-x-auto p-1 sm:p-2 md:p-4">
      {/* Car Condition Table */}
      <Table className="w-full text-center table-fixed">
        <TableHeader>
          <TableRow className="text-center hover:bg-transparent border-gray-200 border-1">
            {/* Table Heads */}
            <TableHead className="w-20 sm:w-28 md:w-36 lg:w-40 text-start sticky left-0 bg-background z-10 shadow-sm">
              <span className="text-xs sm:text-sm md:text-base">{labels.carSectionName}</span>
            </TableHead>
            {conditionTypes.map((conditionType) => (
              <TableHead key={conditionType.value} className="w-16 sm:w-20 md:w-28 lg:w-32">
                <div className={`${conditionType.colorClass} text-white justify-center font-bold py-1 sm:py-2 rounded-md sm:rounded-3xl flex gap-1 items-center mx-auto text-xs sm:text-sm md:text-base px-1 sm:px-2`}>
                  <Circle size={12} className="text-primary hidden sm:inline" />
                  <span className="truncate max-w-full text-xs sm:text-sm">{conditionType.label}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {carSections.map((section) => (
            <TableRow
              key={section.id}
              className="text-center text-primary hover:bg-transparent border-gray-300 hover:bg-background duration-300"
            >
              <TableCell className="font-medium text-xs sm:text-sm md:text-base text-start sticky left-0 bg-background z-10 shadow-sm truncate">
                <span className="truncate block">{section.name}</span>
              </TableCell>
              {conditionTypes.map((conditionType) => (
                <TableCell key={`${section.id}-${conditionType.value}`} className="p-1 sm:p-2 md:p-4">
                  <div className="flex justify-center">
                    <Checkbox
                      id={`${conditionType.value}-${section.id}`}
                      className="rounded-full text-primary h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5"
                      checked={isStatusSelected(section.id, conditionType.value)}
                      onCheckedChange={() => onSectionStatusChange(section.id, conditionType.value)}
                    />
                  </div>
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