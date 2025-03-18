"use client";
import React, { useState } from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";
import { Textarea } from "@/components/ui/textarea";
import { useLocale, useTranslations } from "next-intl";
import SelectableList from "./SelectableList"; // Import the separate component
import { useCarMakes } from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions";

interface Option {
    value: string;
    label: string;
}

const AddProductStepOne: React.FC = () => {
    const t = useTranslations("addProduct");
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";

    const { data } = useCarMakes({ page : 1 });
    console.log(data)

    // Consolidated state
    const [selectedOptions, setSelectedOptions] = useState({
        marka: "",
        model: "",
        year: "",
    });

    const carMarka: Option[] = [
        { value: "toyota", label: t("enteredData.stepOne.branda.options.productMarka.toyota") },
        { value: "honda", label: t("enteredData.stepOne.branda.options.productMarka.honda") },
        { value: "ford", label: t("enteredData.stepOne.branda.options.productMarka.ford") },
        { value: "bmw", label: t("enteredData.stepOne.branda.options.productMarka.bmw") },
        { value: "mercedes", label: t("enteredData.stepOne.branda.options.productMarka.mercedes") },
        { value: "audi", label: t("enteredData.stepOne.branda.options.productMarka.audi") },
        { value: "nissan", label: t("enteredData.stepOne.branda.options.productMarka.nissan") },
        { value: "chevrolet", label: t("enteredData.stepOne.branda.options.productMarka.chevrolet") },
    ];

    const carModel: Option[] = [
        { value: "sedan", label: t("enteredData.stepOne.model.options.sedan") },
        { value: "suv", label: t("enteredData.stepOne.model.options.suv") },
        { value: "truck", label: t("enteredData.stepOne.model.options.truck") },
        { value: "coupe", label: t("enteredData.stepOne.model.options.coupe") },
    ];

    const madeYear: Option[] = [
        { value: "2020", label: t("enteredData.stepOne.madeYear.options.2020") },
        { value: "2021", label: t("enteredData.stepOne.madeYear.options.2021") },
        { value: "2022", label: t("enteredData.stepOne.madeYear.options.2022") },
        { value: "2023", label: t("enteredData.stepOne.madeYear.options.2023") },
        { value: "2024", label: t("enteredData.stepOne.madeYear.options.2024") },
    ];

    // Function to update selected options
    const handleSelectChange = (type: keyof typeof selectedOptions, value: string) => {
        setSelectedOptions((prev) => ({ ...prev, [type]: value }));
    };

    return (
        <Box className="w-full justify-start items-center bg-white rounded-lg flex-wrap xs:justify-center" variant="row" dir={direction}>
        {/* Select Car Brand */}
        <SelectableList title={t("enteredData.stepOne.branda.title")} type="marka" options={carMarka} selectedValue={selectedOptions.marka} direction={direction} onSelect={handleSelectChange} />

        {/* Select Car Model */}
        <SelectableList title={t("enteredData.stepOne.model.title")} type="model" options={carModel} selectedValue={selectedOptions.model} direction={direction} onSelect={handleSelectChange} />

        {/* Select Made Year */}
        <SelectableList title={t("enteredData.stepOne.madeYear.title")} type="year" options={madeYear} selectedValue={selectedOptions.year} direction={direction} onSelect={handleSelectChange} />

        {/* Story of Car */}
        <Box className="min-w-[250px] py-5" variant="column">
            <Text className="text-primary font-bold text-xl border-b border-primary-foreground pb-2">{direction === "ltr" ? "Story of car" : "قصة السيارة"}</Text>
            <Textarea className="px-5 border-gray-100" placeholder={direction === "ltr" ? "Write your message here " : "اكتب رسالتك هنا"} id="message-2" cols={20} rows={17} />
        </Box>
        </Box>
    );
};

export default AddProductStepOne;
