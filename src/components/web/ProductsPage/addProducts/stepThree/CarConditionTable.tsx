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
    <div className="w-full overflow-x-auto p-4">
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
          {carSections.map((section) => (
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