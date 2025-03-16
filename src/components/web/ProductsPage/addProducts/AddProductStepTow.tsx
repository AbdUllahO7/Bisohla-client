import React, { useState } from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale, useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";

interface BoxState {
    price?: string;
    currency?: string;
    selectedColor: string;
    selectedGazType: string;
    selectedAdditional?: string;
}

const AddProductStepTwo: React.FC = () => {
    const t = useTranslations("addProduct");
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";

    // Separate states for each box
    const [box1, setBox1] = useState<BoxState>({ price: "", currency: "", selectedColor: "", selectedGazType: "", selectedAdditional: "" });
    const [box2, setBox2] = useState<BoxState>({ selectedColor: "", selectedGazType: "" });
    const [box3, setBox3] = useState<BoxState>({ selectedColor: "", selectedGazType: "" });

    const handleChange = (index: number, field: keyof BoxState, value: string) => {
        if (index === 0) {
            setBox1(prevState => ({ ...prevState, [field]: value }));
        } else if (index === 1) {
            setBox2(prevState => ({ ...prevState, [field]: value }));
        } else if (index === 2) {
            setBox3(prevState => ({ ...prevState, [field]: value }));
        }
    };

    const colorOptions = [
        { value: "red", label: t('enteredData.stepTow.color.options.red'), hex: "#FF0000" },
        { value: "green", label: t('enteredData.stepTow.color.options.green'), hex: "#008000" },
        { value: "yellow", label: t('enteredData.stepTow.color.options.yellow'), hex: "#FFD700" },
        { value: "blue", label: t('enteredData.stepTow.color.options.blue'), hex: "#0000FF" },
    ];

    const gazTypeOptions = [
        { value: "petrol", label: t('enteredData.stepTow.gaz.options.petrol') },
        { value: "diesel", label: t('enteredData.stepTow.gaz.options.diesel') },
        { value: "electric", label: t('enteredData.stepTow.gaz.options.electric') },
        { value: "hybrid", label: t('enteredData.stepTow.gaz.options.hybrid') },
    ];

    const currencyOptions = [
        { value: "usd", label: t('enteredData.stepTow.price.options.usd') },
        { value: "eur", label: t('enteredData.stepTow.price.options.eur') },
        { value: "try", label: t('enteredData.stepTow.price.options.try') },
        { value: "gbp", label: t('enteredData.stepTow.price.options.gbp') },
    ];

    const additionalOptions = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" }
    ];

    const boxes = [
        { ...box1, hasPriceAndCurrency: true },
        { ...box2, hasPriceAndCurrency: false },
        { ...box3, hasPriceAndCurrency: false }
    ];

    const carFeatures = Array(24).fill("Car Features");


    return (
        <Box className="" variant="column">
                <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center" variant="row" dir={direction}>
                <Box className="bg-gray-100 px-5 py-5 w-full flex justify-center">
                    <Text className="font-bold text-primary">
                        {direction === "ltr" ? "Car Information" : "معلومات السيارة"}
                    </Text>
                </Box>

                {boxes.map((box, index) => (
                    <Box key={index} className="justify-start items-start min-w-[400px] px-5 py-5 gap-5" variant="column">
                        {box.hasPriceAndCurrency && (
                            <Box className="flex gap-2 w-full max-w-sm">
                                <Box variant="column" className="justify-start items-start">
                                    <Text className="font-bold text-primary">{direction === "ltr" ? "Price" : "السعر"}</Text>
                                    <Input
                                        type="text"
                                        value={box.price || ""}
                                        onChange={(e) => handleChange(index, "price", e.target.value)}
                                        placeholder={direction === "ltr" ? "Enter price" : "أدخل السعر"}
                                        className="min-w-[200px]"
                                    />
                                </Box>
                                <Box variant="column" className="justify-start items-start">
                                    <Text className="font-bold text-primary">{direction === "ltr" ? "Currency" : "العملة"}</Text>
                                    <Select
                                        value={box.currency || ""}
                                        onValueChange={(value) => handleChange(index, "currency", value)}
                                        dir={direction}
                                    >
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder={direction === "ltr" ? "Select a currency" : "اختر العملة"} />
                                        </SelectTrigger>
                                        <SelectContent className="w-[150px] bg-primary" dir={direction}>
                                            <SelectGroup>
                                                <SelectLabel>{direction === "ltr" ? "Currencies" : "العملات"}</SelectLabel>
                                                {currencyOptions.map((currencyOption) => (
                                                    <SelectItem key={currencyOption.value} value={currencyOption.value}>
                                                        {currencyOption.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Box>
                            </Box>
                        )}
                        <Box className="gap-2 justify-start items-start w-full" variant="column">
                            <Text className="font-bold text-primary">{direction === "ltr" ? "Color" : "اللون"}</Text>
                            <Select
                                value={box.selectedColor}
                                onValueChange={(value) => handleChange(index, "selectedColor", value)}
                                dir={direction}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={direction === "ltr" ? "Select a Color" : "اختر اللون"} />
                                </SelectTrigger>
                                <SelectContent className="w-full bg-primary">
                                    <SelectGroup>
                                        <SelectLabel className="text-white font-bold">{direction === "ltr" ? "Colors" : "الألوان"}</SelectLabel>
                                        {colorOptions.map((color) => (
                                            <SelectItem key={color.value} value={color.value} className="flex items-center justify-start gap-2">
                                                <span className="w-3 h-3 rounded-full inline-block mr-1 ml-1" style={{ backgroundColor: color.hex }} />
                                                {color.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Box>
                        <Box className="gap-2 justify-start items-start w-full" variant="column">
                            <Text className="font-medium text-gray-700">{direction === "ltr" ? "Gaz Type" : "نوع الغاز"}</Text>
                            <Select
                                value={box.selectedGazType}
                                onValueChange={(value) => handleChange(index, "selectedGazType", value)}
                                dir={direction}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={direction === "ltr" ? "Select a Gaz Type" : "اختر نوع الغاز"} />
                                </SelectTrigger>
                                <SelectContent className="w-full bg-primary">
                                    <SelectGroup>
                                        <SelectLabel>{direction === "ltr" ? "Gaz Types" : "أنواع الغاز"}</SelectLabel>
                                        {gazTypeOptions.map((gazType) => (
                                            <SelectItem key={gazType.value} value={gazType.value}>{gazType.label}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            
                        </Box>
                        {box.hasPriceAndCurrency && (
                            <Box className="gap-2 justify-start items-start w-full mt-5" variant="column">
                                <Text className="font-bold text-primary">{direction === "ltr" ? "Additional Option" : "خيار إضافي"}</Text>
                                <Select
                                    value={box.selectedAdditional || ""}
                                    onValueChange={(value) => handleChange(index, "selectedAdditional", value)}
                                    dir={direction}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent className="w-full bg-primary">
                                        <SelectGroup>
                                            {additionalOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Box>
                        )}
                    </Box>
                ))}
                

                </Box>
                <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center" variant="column" dir={direction}>
                    <Box className="bg-gray-100 px-5 py-5 w-full flex justify-center">
                        <Text className="font-bold text-primary">
                        {direction === "ltr" ? "Car Features" : "ميزات السيارة"}
                        </Text>
                    </Box>
  
                        <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center">
                            {Array(4).fill().map((_, colIndex) => (
                            <Box key={colIndex} className="justify-start items-start min-w-[300px] px-5 py-5 gap-5" variant="column">
                                {carFeatures.slice(colIndex * 6, (colIndex + 1) * 6).map((feature, index) => (
                                <Box key={index} className="">
                                    <Checkbox id={`feature-${colIndex}-${index}`} />
                                    <label
                                    htmlFor={`feature-${colIndex}-${index}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline"
                                    >
                                    {direction === "ltr" ? feature : "ميزات السيارة"}
                                    </label>
                                </Box>
                                ))}
                            </Box>
                            ))}
                        </Box>
                </Box>
                <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center" variant="column" dir={direction}>
                    <Box className="bg-gray-100 px-5 py-5 w-full flex justify-center">
                        <Text className="font-bold text-primary">
                        {direction === "ltr" ? "Car Features" : "ميزات السيارة"}
                        </Text>
                    </Box>
                        <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center">
                            {Array(4).fill().map((_, colIndex) => (
                            <Box key={colIndex} className="justify-start items-start min-w-[300px] px-5 py-5 gap-5" variant="column">
                                {carFeatures.slice(colIndex * 6, (colIndex + 1) * 6).map((feature, index) => (
                                <Box key={index} className="">
                                    <Checkbox id={`feature-${colIndex}-${index}`} />
                                    <label
                                    htmlFor={`feature-${colIndex}-${index}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline"
                                    >
                                    {direction === "ltr" ? feature : "ميزات السيارة"}
                                    </label>
                                </Box>
                                ))}
                            </Box>
                            ))}
                        </Box>
                </Box>

        </Box>
    );
};

export default AddProductStepTwo;